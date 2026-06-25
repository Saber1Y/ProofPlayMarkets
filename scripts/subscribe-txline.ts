import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, TransactionInstruction, Transaction, sendAndConfirmTransaction, SystemProgram } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import nacl from "tweetnacl";
import fs from "fs";
import path from "path";

// ── Config ─────────────────────────────────────────────────────
const PROGRAM_ID = new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J");
const TXL_MINT = new PublicKey("4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG");
const API_BASE = "https://txline-dev.txodds.com";
const API_BASE_ALT = "http://txline-dev.txodds.com";
const SOLANA_RPC = "https://api.devnet.solana.com";
const SERVICE_LEVEL_ID = 1; // 60s delay (free)
const WEEKS = 4;

// ── PDAs ────────────────────────────────────────────────────────
const [tokenTreasuryPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("token_treasury_v2")], PROGRAM_ID
);
const tokenTreasuryVault = getAssociatedTokenAddressSync(
  TXL_MINT, tokenTreasuryPda, true, TOKEN_2022_PROGRAM_ID
);
const [pricingMatrixPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("pricing_matrix")], PROGRAM_ID
);

// ── Instruction builder ─────────────────────────────────────────
const SUBSCRIBE_DISCRIMINATOR = Buffer.from([254, 28, 191, 138, 156, 179, 183, 53]);

function encodeSubscribeArgs(serviceLevelId: number, weeks: number): Buffer {
  const buf = Buffer.alloc(4);
  buf.writeUInt16LE(serviceLevelId, 0);
  buf.writeUInt8(weeks, 2);
  return buf;
}

// ── Keypair ─────────────────────────────────────────────────────
const KEYPAIR_PATH = path.join(process.cwd(), "scripts", "txline-keypair.json");

function loadOrCreateKeypair(): Keypair {
  if (fs.existsSync(KEYPAIR_PATH)) {
    const secret = JSON.parse(fs.readFileSync(KEYPAIR_PATH, "utf-8"));
    return Keypair.fromSecretKey(new Uint8Array(secret));
  }
  const kp = Keypair.generate();
  fs.writeFileSync(KEYPAIR_PATH, JSON.stringify(Array.from(kp.secretKey)));
  console.log("Created new keypair:", kp.publicKey.toBase58());
  return kp;
}

// ── Main ────────────────────────────────────────────────────────
async function main() {
  // 1. Guest JWT (try HTTPS first, fallback to HTTP)
  console.log("1. Getting guest JWT...");
  let jwtRes = await fetch(`${API_BASE}/auth/guest/start`, { method: "POST" }).catch(() => null);
  if (!jwtRes || !jwtRes.ok) {
    jwtRes = await fetch(`${API_BASE_ALT}/auth/guest/start`, { method: "POST" });
  }
  if (!jwtRes.ok) throw new Error(`JWT failed: ${await jwtRes.text()}`);
  const { token: jwt } = (await jwtRes.json()) as { token: string };
  console.log("   JWT obtained");

  // 2. Connect to Solana
  const connection = new Connection(SOLANA_RPC, "confirmed");
  const wallet = loadOrCreateKeypair();
  const pubkey = wallet.publicKey;

  const bal = await connection.getBalance(pubkey);
  console.log(`2. Wallet ${pubkey.toBase58()} balance: ${bal / LAMPORTS_PER_SOL} SOL`);
  if (bal < 0.001 * LAMPORTS_PER_SOL) {
    console.log("   WARNING: Low balance — fund with devnet SOL first");
    process.exit(1);
  }

  // 3. Ensure ATA exists
  const userTokenAccount = getAssociatedTokenAddressSync(TXL_MINT, pubkey, false, TOKEN_2022_PROGRAM_ID);
  const accountInfo = await connection.getAccountInfo(userTokenAccount);
  const createAtaIx = !accountInfo
    ? createAssociatedTokenAccountInstruction(pubkey, userTokenAccount, pubkey, TXL_MINT, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
    : null;

  // 4. Build subscribe instruction
  const data = Buffer.concat([SUBSCRIBE_DISCRIMINATOR, encodeSubscribeArgs(SERVICE_LEVEL_ID, WEEKS)]);
  const keys = [
    { pubkey, isSigner: true, isWritable: true },
    { pubkey: pricingMatrixPda, isSigner: false, isWritable: false },
    { pubkey: TXL_MINT, isSigner: false, isWritable: false },
    { pubkey: userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: tokenTreasuryVault, isSigner: false, isWritable: true },
    { pubkey: tokenTreasuryPda, isSigner: false, isWritable: false },
    { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];
  const ix = new TransactionInstruction({ programId: PROGRAM_ID, keys, data });

  // 5. Send subscription tx
  console.log(`3. Subscribing (serviceLevel=${SERVICE_LEVEL_ID}, weeks=${WEEKS})...`);
  const tx = new Transaction();
  if (createAtaIx) tx.add(createAtaIx);
  tx.add(ix);
  const txSig = await sendAndConfirmTransaction(connection, tx, [wallet], { commitment: "confirmed" });
  console.log("   Subscription tx:", txSig);

  // 6. Sign activation message (format: txSig:leagues:jwt)
  console.log("4. Activating API token...");
  const leagues: number[] = [];
  const messageStr = `${txSig}:${leagues.join(",")}:${jwt}`;
  const message = new TextEncoder().encode(messageStr);
  const sigBytes = nacl.sign.detached(message, wallet.secretKey);
  const walletSignature = Buffer.from(sigBytes).toString("base64");

  // 7. Activate (try HTTPS first)
  const baseUrls = [API_BASE, API_BASE_ALT];
  let apiToken: string | null = null;
  for (const base of baseUrls) {
    const actRes = await fetch(`${base}/api/token/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({ txSig, walletSignature, leagues }),
    });
    if (actRes.ok) {
      apiToken = await actRes.text();
      break;
    }
    console.log(`   ${base} returned ${actRes.status}`);
  }

  if (!apiToken) {
    console.error("   Activation failed on all endpoints");
    process.exit(1);
  }

  console.log("   API Token:", apiToken);

  // Print .env config
  console.log("\n── Add to .env ─────────────────────────────────");
  console.log(`TXLINE_BASE_URL=http://txline-dev.txodds.com`);
  console.log(`TXLINE_JWT=${jwt}`);
  console.log(`TXLINE_API_TOKEN=${apiToken}`);
  console.log("───────────────────────────────────────────────");
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
