import { NextResponse } from "next/server";
import { initTxLINE } from "@/lib/txline/client";

export async function POST() {
  const baseUrl = process.env.TXLINE_BASE_URL;
  const jwt = process.env.TXLINE_JWT;
  const apiToken = process.env.TXLINE_API_TOKEN;

  if (!baseUrl || !jwt || !apiToken) {
    return NextResponse.json(
      { error: "TxLINE credentials not configured in environment" },
      { status: 500 }
    );
  }

  initTxLINE({ baseUrl, jwt, apiToken });

  return NextResponse.json({ ok: true });
}
