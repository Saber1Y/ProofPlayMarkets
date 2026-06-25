import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fixtureId = searchParams.get("fixtureId");

  const baseUrl = process.env.TXLINE_BASE_URL;
  const jwt = process.env.TXLINE_JWT;
  const apiToken = process.env.TXLINE_API_TOKEN;

  if (!baseUrl || !jwt || !apiToken) {
    return new Response("TxLINE not configured", { status: 500 });
  }

  const url = `${baseUrl}/api/scores/stream${
    fixtureId ? `?fixture_id=${fixtureId}` : ""
  }`;

  const txlineRes = await fetch(url, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "X-Api-Token": apiToken,
    },
  });

  if (!txlineRes.ok) {
    return new Response(`TxLINE stream error: ${txlineRes.status}`, {
      status: txlineRes.status,
    });
  }

  return new Response(txlineRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
