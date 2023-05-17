import { OutgoingHttpHeaders } from 'http';
import { ZeroTierClient as ZeroTierClientBase } from "../base/client.js";
import { ZeroTierController as ZeroTierControllerBase } from "../base/controller.js";
import { NodeZeroTierAPI as NodeZeroTierAPIBase, NodeZeroTierAPIOptions as NodeZeroTierAPIOptionsBase } from './api.js';
import { NodeHTTPClient } from './http.js';

export * from "../base/api.js";
export * from "../base/rules.js";
export * from "../base/types.js";
export * from '../base/utils.js';
export * from "./api.js";
export * from "./http.js";

export interface ZeroTierAPIOptions extends NodeZeroTierAPIOptionsBase {
  signature?: string;
}

export class ZeroTierAPI extends NodeZeroTierAPIBase {

  constructor(protected nodeOpts: ZeroTierAPIOptions = {}) {
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

export class ZeroTierClient extends ZeroTierClientBase<ZeroTierAPI> {
  constructor(opts?: ZeroTierAPIOptions);
  constructor(api?: ZeroTierAPI);
  constructor(optsOrAPI?: ZeroTierAPIOptions | ZeroTierAPI) {
    super(optsOrAPI instanceof ZeroTierAPI ? optsOrAPI : new ZeroTierAPI({ ...optsOrAPI, httpClient: new NodeHTTPClient() }));
  }
}

export class ZeroTierController extends ZeroTierControllerBase<ZeroTierAPI> {
  constructor(opts?: ZeroTierAPIOptions);
  constructor(api?: ZeroTierAPI);
  constructor(optsOrAPI?: ZeroTierAPIOptions | ZeroTierAPI) {
    super(optsOrAPI instanceof ZeroTierAPI ? optsOrAPI : new ZeroTierAPI({ ...optsOrAPI, httpClient: new NodeHTTPClient() }));
  }
}
