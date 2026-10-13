const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RailMatteAgreementRegistry", function () {
  let registry;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("RailMatteAgreementRegistry");
    registry = await Factory.deploy();
    await registry.waitForDeployment();
  });

  it("should deploy with 0 total agreements", async function () {
    expect(await registry.totalAgreements()).to.equal(0);
  });

  it("should record a valid privacy-preserving agreement commitment and emit event", async function () {
    const exchangeId = ethers.id("exchange-uuid-101");
    // Off-chain salted hash simulation
    const nonce = "0x" + "a".repeat(64);
    const commitmentHash = ethers.solidityPackedKeccak256(
      ["bytes32", "bytes32", "bytes32"],
      [await registry.PROTOCOL_DOMAIN(), exchangeId, nonce]
    );

    const tx = await registry.connect(user1).recordAgreement(commitmentHash, exchangeId);
    const receipt = await tx.wait();

    // Verify event
    await expect(tx)
      .to.emit(registry, "AgreementCommitted")
      .withArgs(commitmentHash, exchangeId, user1.address, (await ethers.provider.getBlock(receipt.blockNumber)).timestamp);

    // Verify existence check
    expect(await registry.isAgreementCommitted(commitmentHash)).to.be.true;
    expect(await registry.totalAgreements()).to.equal(1);

    // Verify getter
    const record = await registry.getAgreement(commitmentHash);
    expect(record.exchangeId).to.equal(exchangeId);
    expect(record.recorder).to.equal(user1.address);
    expect(record.exists).to.be.true;
    expect(record.recordedAt).to.be.gt(0);
  });

  it("should revert if commitmentHash is zero bytes", async function () {
    const zeroBytes32 = ethers.ZeroHash;
    const exchangeId = ethers.id("exchange-uuid-102");

    await expect(
      registry.connect(user1).recordAgreement(zeroBytes32, exchangeId)
    ).to.be.revertedWithCustomError(registry, "InvalidCommitmentHash");
  });

  it("should revert if exchangeId is zero bytes", async function () {
    const commitmentHash = ethers.id("valid-hash");
    const zeroBytes32 = ethers.ZeroHash;

    await expect(
      registry.connect(user1).recordAgreement(commitmentHash, zeroBytes32)
    ).to.be.revertedWithCustomError(registry, "InvalidExchangeId");
  });

  it("should prevent duplicate commitment registrations", async function () {
    const exchangeId = ethers.id("exchange-uuid-103");
    const commitmentHash = ethers.id("unique-salted-commitment-103");

    await registry.connect(user1).recordAgreement(commitmentHash, exchangeId);

    // Second attempt with exact same commitment hash should revert
    await expect(
      registry.connect(user2).recordAgreement(commitmentHash, exchangeId)
    ).to.be.revertedWithCustomError(registry, "AgreementAlreadyExists").withArgs(commitmentHash);
  });

  it("should return exists=false for unrecorded commitment query", async function () {
    const unknownHash = ethers.id("non-existent-hash");
    expect(await registry.isAgreementCommitted(unknownHash)).to.be.false;

    const record = await registry.getAgreement(unknownHash);
    expect(record.exists).to.be.false;
    expect(record.recordedAt).to.equal(0);
  });
});
