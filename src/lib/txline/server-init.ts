import { initTxLINE } from "./client";

let initialized = false;

export function ensureTxLINEInit() {
  if (initialized) return;
  const baseUrl = process.env.TXLINE_BASE_URL;
  const jwt = process.env.TXLINE_JWT;
  const apiToken = process.env.TXLINE_API_TOKEN;
  if (!baseUrl || !jwt || !apiToken) {
    throw new Error("TXLINE_BASE_URL, TXLINE_JWT, and TXLINE_API_TOKEN must be set");
  }
  initTxLINE({ baseUrl, jwt, apiToken });
  initialized = true;
}
