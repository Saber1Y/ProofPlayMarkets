import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import fs from "fs";
import path from "path";

const KEYPAIR_PATH = path.join(process.cwd(), "scripts", "txline-keypair.json");

async function getFreshCredentials() {
  // 1. Get guest JWT
  const jwtRes = await fetch("http://txline-dev.txodds.com/auth/guest/start", { method: "POST" });
  const { token: jwt } = await jwtRes.json() as { token: string };

  // 2. Load wallet and sign with existing subscription tx
  const secret = JSON.parse(fs.readFileSync(KEYPAIR_PATH, "utf-8"));
  const wallet = Keypair.fromSecretKey(new Uint8Array(secret));
  const txSig = "P6Gj95esdR4npAvGpCXpRVxz5y7c8L2YtbvmtQ8ndXfofLUzytCa7MXqDK4EgHJWSpq1eHEeRPW15kehgaf5e2v";

  const messageStr = `${txSig}::${jwt}`;
  const msg = new TextEncoder().encode(messageStr);
  const sig = nacl.sign.detached(msg, wallet.secretKey);
  const walletSignature = Buffer.from(sig).toString("base64");

  // 3. Activate
  const actRes = await fetch("https://txline-dev.txodds.com/api/token/activate", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({ txSig, walletSignature, leagues: [] }),
  });
  if (!actRes.ok) throw new Error(`Activation failed: ${await actRes.text()}`);
  const apiToken = await actRes.text();

  return { jwt, apiToken };
}

async function testFixtures(jwt: string, apiToken: string) {
  console.log("Testing fixtures endpoint...");
  const res = await fetch(
    "http://txline-dev.txodds.com/api/fixtures/snapshot",
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "X-Api-Token": apiToken,
      },
    }
  );
  console.log("Status:", res.status);
  if (!res.ok) {
    console.log("Body:", await res.text());
    return null;
  }
  return res.json();
}

async function testScores(jwt: string, apiToken: string, fixtureId: number) {
  console.log(`\nTesting scores snapshot for fixture ${fixtureId}...`);
  const res = await fetch(
    `http://txline-dev.txodds.com/api/scores/snapshot/${fixtureId}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "X-Api-Token": apiToken,
      },
    }
  );
  console.log("Status:", res.status);
  if (!res.ok) {
    console.log("Body:", await res.text());
    return null;
  }
  return res.json();
}

async function testValidation(jwt: string, apiToken: string) {
  console.log("\nTesting stat validation...");
  const res = await fetch(
    "http://txline-dev.txodds.com/api/scores/stat-validation",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
        "X-Api-Token": apiToken,
      },
      body: JSON.stringify({
        fixtureId: 17588322,
        seq: 1,
        statKey: 1,
      }),
    }
  );
  console.log("Status:", res.status);
  if (!res.ok) {
    console.log("Body:", await res.text());
    return null;
  }
  return res.json();
}

async function main() {
  console.log("Getting fresh credentials...");
  const { jwt, apiToken } = await getFreshCredentials();
  console.log("JWT:", jwt.substring(0, 50) + "...");
  console.log("API Token:", apiToken);

  // Store for later use
  console.log("\n\n── .env values ──");
  console.log(`TXLINE_BASE_URL=http://txline-dev.txodds.com`);
  console.log(`TXLINE_JWT=${jwt}`);
  console.log(`TXLINE_API_TOKEN=${apiToken}`);
  console.log("─────────────────\n");

  const fixtures = await testFixtures(jwt, apiToken);
  if (fixtures) {
    console.log(`Got ${fixtures.length} fixtures`);
    for (const f of fixtures.slice(0, 5)) {
      console.log(`  ${f.FixtureId}: ${f.Participant1} vs ${f.Participant2} [comp: ${f.Competition}]`);
    }

    if (fixtures.length > 0) {
      const score = await testScores(jwt, apiToken, fixtures[0].FixtureId);
      if (score) {
        console.log("Score data:", JSON.stringify(score, null, 2).substring(0, 300));
      }
    }
  }

  const validation = await testValidation(jwt, apiToken);
  if (validation) {
    console.log("Validation result:", JSON.stringify(validation, null, 2));
  }
}

main().catch(console.error);
