import { readFile } from "fs/promises";
import { OutgoingHttpHeaders } from 'http';
import { NeedleHttpVerbs } from "needle";
import { ZeroTierAPI, ZeroTierAPIOptions } from "./api.js";
import { ZeroTierClient } from "./client.js";
import { ZeroTierController } from "./controller.js";
import { generateSignature } from "./utils.js";

export * from './index.js';
export * from './utils.js';

export interface CovisianZeroTierAPIOptions extends ZeroTierAPIOptions {
  allowedNetworks?: string[];
}

export class CovisianZeroTierAPI extends ZeroTierAPI {
  protected privateKey?: Promise<string>;

  constructor(protected opts: CovisianZeroTierAPIOptions = {}) {
    super(opts);

    if (process.env.ZT_PRIVATE_KEY && process.env.ZT_NETWORKS) {
      this.privateKey = Promise.resolve(process.env.ZT_PRIVATE_KEY);
      this.opts.allowedNetworks = process.env.ZT_NETWORKS.split(",").filter(i => !!i);
      if (!this.opts.allowedNetworks.length) {
        throw new Error("Missing allowed networks");
      }
    } else if (opts.allowedNetworks) {
      this.privateKey = readFile(opts.credentialsPath!, "utf8");
    }
  }

  protected async getRequestHeaders(method: NeedleHttpVerbs, path: string, body?: any): Promise<OutgoingHttpHeaders> {
    const headers: OutgoingHttpHeaders = {};
    if (this.privateKey) {
      headers["X-ZT1-Signature"] = await generateSignature(await this.privateKey, this.opts.allowedNetworks!);
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
  constructor(protected api: CovisianZeroTierAPI = new CovisianZeroTierAPI()) {
    super(api);
  }
}

export class CovisianZeroTierController extends ZeroTierController {
  constructor(protected api: CovisianZeroTierAPI = new CovisianZeroTierAPI()) {
    super(api);
  }
}