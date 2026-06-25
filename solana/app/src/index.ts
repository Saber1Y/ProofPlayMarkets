import {
  Program,
  AnchorProvider,
  Wallet,
  Idl,
  BN,
} from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { marketPda, participantPda } from "./types";

const PROGRAM_ID = new PublicKey("BJiVyh6tNT9yQYh1HLtZksDpVjkCJhCdjDBy8v5ocUkB");
const IDL: Idl = require("../../target/idl/prediction_market.json");

export class PredictionMarketSDK {
  program: Program;

  constructor(connection: Connection, wallet: Wallet) {
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    this.program = new Program(IDL, PROGRAM_ID, provider);
  }

  static localnet(wallet: Wallet) {
    return new PredictionMarketSDK(
      new Connection("http://localhost:8899"),
      wallet
    );
  }

  static devnet(wallet: Wallet) {
    return new PredictionMarketSDK(
      new Connection("https://api.devnet.solana.com"),
      wallet
    );
  }

  // ── Instructions ──

  async initializeMarket(
    fixtureId: number,
    marketType: "TOTAL_GOALS_OVER_UNDER" | "MATCH_WINNER",
    threshold: number
  ) {
    const marketTypeEnum =
      marketType === "TOTAL_GOALS_OVER_UNDER"
        ? { totalGoalsOverUnder: {} }
        : { matchWinner: {} };

    return this.program.methods
      .initializeMarket({
        fixtureId: new BN(fixtureId),
        marketType: marketTypeEnum,
        threshold: new BN(threshold),
      })
      .accounts({
        creator: this.program.provider.publicKey,
      })
      .rpc();
  }

  async joinMarket(
    fixtureId: number,
    creator: PublicKey,
    side: "OVER" | "UNDER" | "HOME" | "AWAY" | "DRAW",
    amountSol: number
  ) {
    const [market] = marketPda(PROGRAM_ID, creator, fixtureId);
    const sideEnum = { [side.toLowerCase()]: {} };

    return this.program.methods
      .joinMarket({
        side: sideEnum,
        amount: new BN(amountSol * LAMPORTS_PER_SOL),
      })
      .accounts({
        participantWallet: this.program.provider.publicKey,
        market,
      })
      .rpc();
  }

  async settleMarket(
    creator: Keypair,
    fixtureId: number,
    winnerSide: "OVER" | "UNDER" | "HOME" | "AWAY" | "DRAW",
    merkleRoot: number[]
  ) {
    const [market] = marketPda(PROGRAM_ID, creator.publicKey, fixtureId);
    const sideEnum = { [winnerSide.toLowerCase()]: {} };

    return this.program.methods
      .settleMarket({
        winnerSide: sideEnum,
        merkleRoot,
      })
      .accounts({
        creator: creator.publicKey,
        market,
      })
      .signers([creator])
      .rpc();
  }

  async claimPayout(creator: PublicKey, fixtureId: number) {
    const [market] = marketPda(PROGRAM_ID, creator, fixtureId);
    const [participant] = participantPda(
      PROGRAM_ID,
      market,
      this.program.provider.publicKey
    );

    return this.program.methods
      .claimPayout()
      .accounts({
        claimer: this.program.provider.publicKey,
        market,
        participant,
      })
      .rpc();
  }

  // ── Queries ──

  async fetchMarket(creator: PublicKey, fixtureId: number) {
    const [pda] = marketPda(PROGRAM_ID, creator, fixtureId);
    return this.program.account.market.fetch(pda);
  }

  async fetchParticipant(market: PublicKey, wallet: PublicKey) {
    const [pda] = participantPda(PROGRAM_ID, market, wallet);
    return this.program.account.participant.fetch(pda);
  }

  static pda = { market: marketPda, participant: participantPda };
}
