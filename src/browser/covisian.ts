import { OutgoingHttpHeaders } from 'http';
import { ZeroTierAPI, ZeroTierAPIOptions } from "../base/api.js";
import { ZeroTierClient } from "../base/client.js";
import { ZeroTierController } from "../base/controller.js";
import { BrowserHTTPClient } from './http.js';

export * from "../base/api.js";
export * from "../base/rules.js";
export * from "../base/types.js";
export * from '../base/utils.js';
export * from "./http.js";

export interface CovisianZeroTierAPIOptions extends Partial<ZeroTierAPIOptions> {
  signature?: string;
  httpClient?: BrowserHTTPClient;
}

export class CovisianZeroTierAPI extends ZeroTierAPI {
  constructor(protected browserOpts: CovisianZeroTierAPIOptions = {}) {
    super({ ...browserOpts, httpClient: browserOpts?.httpClient ?? new BrowserHTTPClient()});
  }

  protected async getRequestHeaders(method: string, path: string, body?: any): Promise<any> {
    const headers: OutgoingHttpHeaders = {};
    if (this.browserOpts.signature) {
      headers["X-ZT1-Signature"] = this.browserOpts.signature;
    } else if (this.secret) {
      headers["X-ZT1-Auth"] = await this.secret;
    }
    if (body) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  }
}

export class CovisianZeroTierClient extends ZeroTierClient<CovisianZeroTierAPI> {
  constructor(opts?: CovisianZeroTierAPIOptions);
  constructor(api?: CovisianZeroTierAPI);
  constructor(optsOrAPI?: CovisianZeroTierAPIOptions | CovisianZeroTierAPI) {
    super(optsOrAPI instanceof CovisianZeroTierAPI ? optsOrAPI : new CovisianZeroTierAPI({ ...optsOrAPI, httpClient: new BrowserHTTPClient() }));
  }
}

export class CovisianZeroTierController extends ZeroTierController<CovisianZeroTierAPI> {
  constructor(opts?: CovisianZeroTierAPIOptions);
  constructor(api?: CovisianZeroTierAPI);
  constructor(optsOrAPI?: CovisianZeroTierAPIOptions | CovisianZeroTierAPI) {
    super(optsOrAPI instanceof CovisianZeroTierAPI ? optsOrAPI : new CovisianZeroTierAPI({ ...optsOrAPI, httpClient: new BrowserHTTPClient() }));
  }
}
