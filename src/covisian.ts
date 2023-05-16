import { OutgoingHttpHeaders } from 'http';
import { NeedleHttpVerbs } from "needle";
import { ZeroTierAPI, ZeroTierAPIOptions } from "./api.js";
import { ZeroTierClient } from "./client.js";
import { ZeroTierController } from "./controller.js";

export * from './index.js';
export * from './utils.js';

export interface CovisianZeroTierAPIOptions extends ZeroTierAPIOptions {
  signature?: string;
}

export class CovisianZeroTierAPI extends ZeroTierAPI {
  constructor(protected opts: CovisianZeroTierAPIOptions = {}) {
    super(opts);
  }

  protected async getRequestHeaders(method: NeedleHttpVerbs, path: string, body?: any): Promise<OutgoingHttpHeaders> {
    const headers: OutgoingHttpHeaders = {};
    if (this.opts.signature) {
      headers["X-ZT1-Signature"] = this.opts.signature;
    } else if (this.secret) {
      headers["X-ZT1-Auth"] = await this.secret;
    }
    if (body) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  }
}

export class CovisianZeroTierClient extends ZeroTierClient {
  declare protected api: CovisianZeroTierAPI;

  constructor(optsOrAPI?: CovisianZeroTierAPIOptions | CovisianZeroTierAPI) {
    super(optsOrAPI instanceof CovisianZeroTierAPI ? optsOrAPI : new CovisianZeroTierAPI(optsOrAPI));
  }
}

export class CovisianZeroTierController extends ZeroTierController {
  declare protected api: CovisianZeroTierAPI;

  constructor(optsOrAPI?: CovisianZeroTierAPIOptions | CovisianZeroTierAPI) {
    super(optsOrAPI instanceof CovisianZeroTierAPI ? optsOrAPI : new CovisianZeroTierAPI(optsOrAPI));
  }
}