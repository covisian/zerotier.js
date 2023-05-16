import { OutgoingHttpHeaders } from 'http';
import { ZeroTierClient } from "../base/client.js";
import { ZeroTierController } from "../base/controller.js";
import { NodeZeroTierAPI, NodeZeroTierAPIOptions } from './api.js';
import { NodeHTTPClient } from './http.js';

export * from "../base/api.js";
export * from "../base/rules.js";
export * from "../base/types.js";
export * from '../base/utils.js';
export * from "./api.js";
export * from "./http.js";

export interface CovisianZeroTierAPIOptions extends NodeZeroTierAPIOptions {
  signature?: string;
}

export class CovisianZeroTierAPI extends NodeZeroTierAPI {

  constructor(protected nodeOpts: CovisianZeroTierAPIOptions = {}) {
    super(nodeOpts);
  }

  protected async getRequestHeaders(method: string, path: string, body?: any): Promise<any> {
    const headers: OutgoingHttpHeaders = {};
    if (this.nodeOpts.signature) {
      headers["X-ZT1-Signature"] = this.nodeOpts.signature;
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
    super(optsOrAPI instanceof CovisianZeroTierAPI ? optsOrAPI : new CovisianZeroTierAPI({ ...optsOrAPI, httpClient: new NodeHTTPClient() }));
  }
}

export class CovisianZeroTierController extends ZeroTierController<CovisianZeroTierAPI> {
  constructor(opts?: CovisianZeroTierAPIOptions);
  constructor(api?: CovisianZeroTierAPI);
  constructor(optsOrAPI?: CovisianZeroTierAPIOptions | CovisianZeroTierAPI) {
    super(optsOrAPI instanceof CovisianZeroTierAPI ? optsOrAPI : new CovisianZeroTierAPI({ ...optsOrAPI, httpClient: new NodeHTTPClient() }));
  }
}
