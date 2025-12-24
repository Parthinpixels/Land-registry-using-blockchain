const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LandRegistry", function () {
  let registry;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    registry = await LandRegistry.deploy();
    await registry.deploymentTransaction();
  });

  it("registers land and sets owner", async function () {
    const tx = await registry.connect(addr1).registerLand("Plot A", "Sector 1", 500);
    const receipt = await tx.wait();
    // get event args by querying storage
    const land = await registry.getLand(1);
    expect(land.owner).to.equal(addr1.address);
    expect(land.title).to.equal("Plot A");
  });

  it("transfers ownership only by owner", async function () {
    await registry.connect(addr1).registerLand("Plot B", "Sector 2", 300);
    await expect(registry.connect(addr2).transferOwnership(1, addr2.address)).to.be.reverted;
    await registry.connect(addr1).transferOwnership(1, addr2.address);
    const land = await registry.getLand(1);
    expect(land.owner).to.equal(addr2.address);
  });
});
