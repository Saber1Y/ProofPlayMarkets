import * as fs from "fs";
import * as path from "path";
import { AnchorProvider, Program, Wallet, Idl } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

const idlPath = path.join(__dirname, "../target/idl/prediction_market.json");
const keypairPath = path.join(__dirname, "../target/deploy/prediction_market-keypair.json");

async function main() {
  const idl: Idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
  const programKeypairBytes = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
  const programKeypair = Keypair.fromSecretKey(new Uint8Array(programKeypairBytes));

  const connection = new Connection(process.env.ANCHOR_PROVIDER_URL || "http://localhost:8899");
  const wallet = Wallet.local();
  const provider = new AnchorProvider(connection, wallet, {});

  const program = new Program(idl, programKeypair.publicKey, provider);

  console.log("Deploying prediction_market...");
  console.log("Program ID:", programKeypair.publicKey.toBase58());

  // Deploy is handled by `anchor deploy`
  // This migration script can seed initial state if needed
  console.log("Migration complete");
}

main().catch(console.error);
