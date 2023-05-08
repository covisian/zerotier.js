import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { CovisianZeroTierAPI, CovisianZeroTierClient, CovisianZeroTierController, ZeroTier } from './covisian.js';

chai.use(chaiAsPromised);

describe('CovisianZeroTierAPI', () => {
  before(async () => {
    if (!process.env.ZT_PRIVATE_KEY) {
      throw new Error('ZT_PRIVATE_KEY must be set');
    }
    if (!process.env.ZT_SECRET) {
      throw new Error('ZT_SECRET must be set');
    }
  });

  describe('Constructor', () => {

    it('should construct with the specified path and networks', async () => {
      const api = new CovisianZeroTierAPI({ credentialsPath: 'test', allowedNetworks: ['1234567890abcdef'] });
      expect((api as any).opts.credentialsPath).to.equal('test');
      expect((api as any).opts.allowedNetworks).to.deep.equal(['1234567890abcdef']);
      //expect((api as any).privateKey.to.be.rejectedWith('ENOENT: no such file or directory, open \'test/authtoken.secret\''));
    });

    it('should construct with the a private key and a list of networks read from the environment', async () => {
      if (!process.env.ZT_NETWORKS) {
        process.env.ZT_NETWORKS = '1234567890abcdef,aabbccddeeff0011';
      }
      const api = new CovisianZeroTierAPI();
      expect((api as any).opts.allowedNetworks).to.deep.equal(['1234567890abcdef', 'aabbccddeeff0011']);
      expect((api as any).privateKey).to.become('1234567890abcdef');
    });

    it('should fail to construct if the list of networks is missing', async () => {
      process.env.ZT_NETWORKS = ',';
      try {
        new CovisianZeroTierAPI();
        throw new Error('Expected an error');
      } catch (err: any) {
        expect(err.message).to.match(/Missing allowed networks/);
      }
    });

  });

  describe('Authentication', () => {

    it('should authenticate with a private key', async () => {
      process.env.ZT_NETWORKS = '1234567890abcdef';
      const api = new CovisianZeroTierAPI();
      const status: ZeroTier.Status = await api.invoke('get', '/status');
      expect(status.customVersion).to.equal('Covisian/1.0.0');
    });
    
  });

  describe('CovisianZeroTierClient', () => {
    let address: string;
    let testNetworkId1: string;
    let testNetworkId2: string;
  
    before(async () => {
      const client = new CovisianZeroTierClient();
      const controller = new CovisianZeroTierController();
      const status = await client.getStatus();
      address = status.address;

      testNetworkId1 = address + "fedef0";
      testNetworkId2 = address + "fedef1";

      const networks = await controller.getNetworks();
      if (networks.includes(testNetworkId1)) {
        await controller.deleteNetwork(testNetworkId1);
      }
      if (networks.includes(testNetworkId2)) {
        await controller.deleteNetwork(testNetworkId2);
      }

    });
  
    after(async () => {
      const controller = new CovisianZeroTierController();
      const networks = await controller.getNetworks();
      if (networks.includes(testNetworkId1)) {
        await controller.deleteNetwork(testNetworkId1);
      }
      if (networks.includes(testNetworkId2)) {
        await controller.deleteNetwork(testNetworkId2);
      }
    });

    it('should not be possible to join a network not in the allowed list', async () => {
      process.env.ZT_NETWORKS = testNetworkId1;
      const client = new CovisianZeroTierClient();
      await expect(client.joinNetwork(testNetworkId2)).to.be.rejectedWith('HTTP 403: Forbidden');
    });

    it('should be possible to join a network in the allowed list', async () => {
      process.env.ZT_NETWORKS = testNetworkId1;
      const client = new CovisianZeroTierClient();
      await expect(client.joinNetwork(testNetworkId1)).to.be.fulfilled;
    });

    it('should be possible to join a network in the allowed list using the secret', async () => {
      const privateKey_backup = process.env.ZT_PRIVATE_KEY;
      delete process.env.ZT_PRIVATE_KEY;
      process.env.ZT_NETWORKS = testNetworkId1;
      const client = new CovisianZeroTierClient();
      await expect(client.joinNetwork(testNetworkId1)).to.be.fulfilled;
      process.env.ZT_PRIVATE_KEY = privateKey_backup;
    });

  });

});