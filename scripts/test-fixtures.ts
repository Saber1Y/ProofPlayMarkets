import { initTxLINE, getFixtures, getScoreSnapshot } from "../src/lib/txline/client";

async function main() {
  initTxLINE({
    baseUrl: "http://txline-dev.txodds.com",
    jwt: process.env.TXLINE_JWT!,
    apiToken: process.env.TXLINE_API_TOKEN!,
  });

  console.log("Fetching fixtures...");
  const fixtures = await getFixtures();
  console.log(`Found ${fixtures.length} fixtures`);
  for (const f of fixtures.slice(0, 10)) {
    console.log(`  ${f.id}: ${f.home_team} vs ${f.away_team} [${f.status}] ${f.start_date}`);
  }

  if (fixtures.length > 0) {
    const fid = fixtures[0].id;
    console.log(`\nFetching score snapshot for fixture ${fid}...`);
    const score = await getScoreSnapshot(fid);
    console.log(`  Score: ${score.home_score} - ${score.away_score} (seq ${score.seq})`);
    console.log(`  Status: ${score.status}`);
    console.log(`  Stats:`, JSON.stringify(score.stats));
  }
}

main().catch(console.error);
