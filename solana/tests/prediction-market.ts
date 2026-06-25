import * as anchor from "@coral-xyz/anchor";
import { Program, BN, web3 } from "@coral-xyz/anchor";
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram, Keypair } from "@solana/web3.js";
import { expect } from "chai";

describe("prediction-market", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PredictionMarket as Program;
  const creator = provider.wallet.publicKey;
  const fixtureId = new BN(12345);
  const threshold = new BN(3);

  let marketPda: PublicKey;
  let marketBump: number;

  function deriveMarketPda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("market"),
        creator.toBuffer(),
        fixtureId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );
  }

  function deriveParticipantPda(market: PublicKey, wallet: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("participant"),
        market.toBuffer(),
        wallet.toBuffer(),
      ],
      program.programId
    );
  }

  it("initializes a market", async () => {
    [marketPda, marketBump] = deriveMarketPda();

    await program.methods
      .initializeMarket({
        fixtureId,
        marketType: { totalGoalsOverUnder: {} },
        threshold,
      })
      .accounts({
        creator,
        market: marketPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const market = await program.account.market.fetch(marketPda);
    expect(market.fixtureId.toString()).to.equal(fixtureId.toString());
    expect(market.status).to.deep.equal({ open: {} });
    expect(market.bump).to.equal(marketBump);
  });

  it("locks the market", async () => {
    await program.methods
      .lockMarket()
      .accounts({
        creator,
        market: marketPda,
      })
      .rpc();

    const market = await program.account.market.fetch(marketPda);
    expect(market.status).to.deep.equal({ locked: {} });
  });

  it("unlocks for testing (lock then open is not possible — recreate)", async () => {
    // In practice, just lock and settle. No re-open.
    // For this test, unlock state manually is not allowed by the contract.
    // We'll just verify the lock worked above.
  });

  it("settles the market", async () => {
    // Relock for this test — actually the market is already locked
    // Create a fresh market for full flow test
    const fixtureId2 = new BN(67890);
    const [market2] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), creator.toBuffer(), fixtureId2.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    await program.methods
      .initializeMarket({
        fixtureId: fixtureId2,
        marketType: { totalGoalsOverUnder: {} },
        threshold: new BN(3),
      })
      .accounts({
        creator,
        market: market2,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .lockMarket()
      .accounts({ creator, market: market2 })
      .rpc();

    const merkleRoot = Array(32).fill(0);
    await program.methods
      .settleMarket({
        winnerSide: { over: {} },
        merkleRoot,
      })
      .accounts({ creator, market: market2 })
      .rpc();

    const settled = await program.account.market.fetch(market2);
    expect(settled.status).to.deep.equal({ settled: {} });
    expect(settled.winnerSide).to.deep.equal({ over: {} });
  });

  it("full flow: join, lock, settle, claim", async () => {
    const joiner = Keypair.generate();

    // Airdrop SOL to joiner
    const sig = await provider.connection.requestAirdrop(
      joiner.publicKey,
      10 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig);

    // Create a market
    const fixtureId3 = new BN(99999);
    const [market3] = deriveMarketPda();
    // Actually need unique per-creator-per-fixture, let's use a new creator
    // Or just reuse the existing one — same creator, new fixture
    const [market3pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), creator.toBuffer(), fixtureId3.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    await program.methods
      .initializeMarket({
        fixtureId: fixtureId3,
        marketType: { totalGoalsOverUnder: {} },
        threshold: new BN(3),
      })
      .accounts({
        creator,
        market: market3pda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Join as OVER
    const [partPda] = deriveParticipantPda(market3pda, joiner.publicKey);
    const stakeAmount = new BN(1 * LAMPORTS_PER_SOL);

    await program.methods
      .joinMarket({
        side: { over: {} },
        amount: stakeAmount,
      })
      .accounts({
        participantWallet: joiner.publicKey,
        market: market3pda,
        participant: partPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([joiner])
      .rpc();

    const part = await program.account.participant.fetch(partPda);
    expect(part.side).to.deep.equal({ over: {} });
    expect(part.amount.eq(stakeAmount)).to.be.true;
    expect(part.claimed).to.be.false;

    // Lock
    await program.methods
      .lockMarket()
      .accounts({ creator, market: market3pda })
      .rpc();

    // Settle
    const merkleRoot = Array(32).fill(0);
    await program.methods
      .settleMarket({
        winnerSide: { over: {} },
        merkleRoot,
      })
      .accounts({ creator, market: market3pda })
      .rpc();

    const settled = await program.account.market.fetch(market3pda);
    expect(settled.status).to.deep.equal({ settled: {} });

    // Claim
    const balanceBefore = await provider.connection.getBalance(joiner.publicKey);
    await program.methods
      .claimPayout()
      .accounts({
        claimer: joiner.publicKey,
        market: market3pda,
        participant: partPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([joiner])
      .rpc();

    const partAfter = await program.account.participant.fetch(partPda);
    expect(partAfter.claimed).to.be.true;

    const balanceAfter = await provider.connection.getBalance(joiner.publicKey);
    // Should have gained ~1 SOL (2x payout minus rent for the participant account)
    expect(balanceAfter > balanceBefore).to.be.true;
  });
});
