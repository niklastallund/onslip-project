import { API, nodeRequestHandler } from "@onslip/onslip-360-node-api";

// Initialize the SDK once per server process
API.initialize(nodeRequestHandler({ userAgent: "onslip-project/1.0.0" }));

const baseUrl = process.env.ONSLIP_BASE_URL;
const org = process.env.ONSLIP_ORG;
const key = process.env.ONSLIP_KEY;
const secret = process.env.ONSLIP_SECRET;

if (!baseUrl || !org || !key || !secret) {
  throw new Error(
    "Missing required Onslip environment variables. Please set ONSLIP_BASE_URL, ONSLIP_ORG, ONSLIP_KEY and ONSLIP_SECRET in your .env file."
  );
}

export const api = new API(baseUrl, org, key, secret);

export default api;
