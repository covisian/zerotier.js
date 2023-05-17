import { OutgoingHttpHeaders } from 'http';
import { ZeroTierAPI as ZeroTierAPIBase, ZeroTierAPIOptions as ZeroTierAPIOptionsBase } from "../base/api.js";
import { ZeroTierClient as ZeroTierClientBase } from "../base/client.js";
import { ZeroTierController as ZeroTierControllerBase } from "../base/controller.js";
import { BrowserHTTPClient } from './http.js';

export * from "../base/api.js";
export * from "../base/rules.js";
export * from "../base/types.js";
export * from "./http.js";

export interface ZeroTierAPIOptions extends Partial<ZeroTierAPIOptionsBase> {
  signature?: string;
  httpClient?: BrowserHTTPClient;
}

export class ZeroTierAPI extends ZeroTierAPIBase {
  constructor(protected browserOpts: ZeroTierAPIOptions = {}) {
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

export class ZeroTierClient extends ZeroTierClientBase<ZeroTierAPI> {
  constructor(opts?: ZeroTierAPIOptions);
  constructor(api?: ZeroTierAPI);
  constructor(optsOrAPI?: ZeroTierAPIOptions | ZeroTierAPI) {
    super(optsOrAPI instanceof ZeroTierAPI ? optsOrAPI : new ZeroTierAPI({ ...optsOrAPI, httpClient: new BrowserHTTPClient() }));
  }
}

export class ZeroTierController extends ZeroTierControllerBase<ZeroTierAPI> {
  constructor(opts?: ZeroTierAPIOptions);
  constructor(api?: ZeroTierAPI);
  constructor(optsOrAPI?: ZeroTierAPIOptions | ZeroTierAPI) {
    super(optsOrAPI instanceof ZeroTierAPI ? optsOrAPI : new ZeroTierAPI({ ...optsOrAPI, httpClient: new BrowserHTTPClient() }));
  }
}
