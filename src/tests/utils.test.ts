import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { generateSignature } from '../node/covisian.js';

chai.use(chaiAsPromised);

describe('Utils', () => {

  before(async () => {
    if (!process.env.ZT_PRIVATE_KEY) {
      throw new Error('ZT_PRIVATE_KEY must be set');
    }
  });

  describe('generateSignature', () => {

    it('should throw an error if an no secret is provided', async () => {
      await expect(generateSignature('', [])).to.be.rejectedWith('Missing VPN secret');
    });

    it('should throw an error if an invalid secret is provided', async () => {
      await expect(generateSignature('aabbcc', [])).to.be.rejectedWith('child process exited with code 1');
    });

    it('should fail if zerotier-idtool is not installed', async () => {
      const path_backup = process.env.PATH;
      process.env.PATH = '';
      await expect(generateSignature(process.env.ZT_PRIVATE_KEY!, [])).to.be.rejectedWith('spawn zerotier-idtool ENOENT');
      process.env.PATH = path_backup;
    });
      
    it('should generate a valid signature', async () => {
      const signature = await generateSignature(process.env.ZT_PRIVATE_KEY!, ['8056c2e21c000001']);
      expect(signature).to.match(/^[0-9a-f]{11}:[0-9a-f]{16}:[0-9a-f]{192}$/);
    });

  });

});
