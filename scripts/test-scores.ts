import { initTxLINE, getFixtures, getScoreSnapshot } from "../src/lib/txline/client";

const jwt = "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3ODQ5OTY2ODgsInNlc3Npb25JZCI6IjQ3ZGZhMWFmLWUzNTYtNGUzNi1iZWFiLTY4YmIxY2VlMzNiMSIsInJvbGUiOiJndWVzdCIsIm1heWJlQ2xpZW50SXAiOiIxNS4xNTguNDQuMTY5In0.shzlvlQg897axddZB4pzbhNGXS9jwOco3cB3qYI67yw3GlxNZoeHZIvYVrKe3KDh5BWjW_FzeT-XLkMT5m1KKA";
const apiToken = "txoracle_api_52494cb9ef444bc2a5950430e75110b5";

initTxLINE({ baseUrl: "https://txline-dev.txodds.com", jwt, apiToken });

async function main() {
  // Get all fixtures from start
  const fixtures = await getFixtures();
  console.log(`Total fixtures (default): ${fixtures.length}`);

  // Check a few historical fixtures for score data
  const historicalIds = [17588224, 17588225, 17588226, 17588227, 17588228, 17588229];
  for (const fid of historicalIds) {
    const f = fixtures.find((x) => x.id === fid) || { homeTeam: "?", awayTeam: "?" };
    const snap = await getScoreSnapshot(fid).catch(() => null);
    if (snap) {
      console.log(`${fid} ${f.homeTeam} vs ${f.awayTeam}: ${JSON.stringify(snap).substring(0, 200)}`);
    } else {
      console.log(`${fid} ${f.homeTeam} vs ${f.awayTeam}: no data`);
    }
  }
}

main().catch(console.error);
