const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EvaluationAnchor", function () {
  let anchor;
  let owner;
  let judge;

  beforeEach(async function () {
    [owner, judge] = await ethers.getSigners();
    const EvaluationAnchor = await ethers.getContractFactory("EvaluationAnchor");
    anchor = await EvaluationAnchor.deploy();
    await anchor.waitForDeployment();
  });

  it("should deploy with deployer as owner", async function () {
    expect(await anchor.owner()).to.equal(owner.address);
  });

  it("should anchor an evaluation and emit EvaluationAnchored event", async function () {
    const dummyHash = ethers.keccak256(ethers.toUtf8Bytes("canonical-eval-json-sample"));
    const evalId = "eval-12345";

    const tx = await anchor.connect(judge).anchorEvaluation(dummyHash, evalId);
    await expect(tx)
      .to.emit(anchor, "EvaluationAnchored")
      .withArgs(dummyHash, evalId, (val) => val > 0, judge.address);

    const [exists, returnedEvalId, timestamp, anchoredBy] = await anchor.verifyEvaluation(dummyHash);
    expect(exists).to.be.true;
    expect(returnedEvalId).to.equal(evalId);
    expect(anchoredBy).to.equal(judge.address);
    expect(timestamp).to.be.greaterThan(0);
  });

  it("should retrieve evaluation by evaluationId", async function () {
    const dummyHash = ethers.keccak256(ethers.toUtf8Bytes("canonical-eval-json-2"));
    const evalId = "eval-99999";

    await anchor.anchorEvaluation(dummyHash, evalId);

    const [retrievedHash, timestamp, anchoredBy] = await anchor.getEvaluation(evalId);
    expect(retrievedHash).to.equal(dummyHash);
    expect(timestamp).to.be.greaterThan(0);
    expect(anchoredBy).to.equal(owner.address);
  });

  it("should prevent duplicate anchoring of the same hash", async function () {
    const dummyHash = ethers.keccak256(ethers.toUtf8Bytes("canonical-eval-duplicate"));
    const evalId = "eval-dup";

    await anchor.anchorEvaluation(dummyHash, evalId);
    await expect(anchor.anchorEvaluation(dummyHash, "eval-dup-2")).to.be.revertedWith(
      "Evaluation hash already anchored"
    );
  });

  it("should return false for unanchored hash", async function () {
    const randomHash = ethers.keccak256(ethers.toUtf8Bytes("random-unanchored"));
    const [exists] = await anchor.verifyEvaluation(randomHash);
    expect(exists).to.be.false;
  });
});
