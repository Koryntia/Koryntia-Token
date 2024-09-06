import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"; // Add this line

describe("Token", function () {
  async function deployTokenFixture() {
    const [owner, otherAccount] = await hre.viem.getWalletClients();
    const initialSupply = parseEther("1000");
    const token = await hre.viem.deployContract("Token", ["KoryntiaToken", "KRT", initialSupply, owner.account.address]);

    const publicClient = await hre.viem.getPublicClient();

    return { token, initialSupply, owner, otherAccount, publicClient };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      expect(await token.read.owner()).to.equal(getAddress(owner.account.address));
    });

    it("Should assign the initial supply to the owner", async function () {
      const { token, initialSupply, owner } = await loadFixture(deployTokenFixture);
      expect(await token.read.balanceOf([owner.account.address])).to.equal(initialSupply);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployTokenFixture);
      const transferAmount = parseEther("100");

      await token.write.transfer([otherAccount.account.address, transferAmount]);
      expect(await token.read.balanceOf([otherAccount.account.address])).to.equal(transferAmount);
      expect(await token.read.balanceOf([owner.account.address])).to.equal(parseEther("900"));
    });

    it("Should fail if sender doesnt have enough tokens", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployTokenFixture);
      const transferAmount = parseEther("1100");

      await expect(token.write.transfer([owner.account.address, transferAmount], { account: otherAccount.account })).to.be.rejectedWith("ERC20InsufficientBalance");
    });

    it("Should transfer with approval", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployTokenFixture);
      const transferAmount = parseEther("100");

      await token.write.approve([otherAccount.account.address, transferAmount], { account: owner.account });
      await token.write.transferFrom([owner.account.address, otherAccount.account.address, transferAmount], { account: otherAccount.account });

      expect(await token.read.balanceOf([otherAccount.account.address])).to.equal(transferAmount);
      expect(await token.read.balanceOf([owner.account.address])).to.equal(parseEther("900"));
    });

    it("Should let owner transfer ownership", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployTokenFixture);

      await token.write.transferOwnership([otherAccount.account.address], { account: owner.account });
      expect(await token.read.owner()).to.equal(getAddress(otherAccount.account.address));
    });

    it("Should approval works", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployTokenFixture);
      const approvalAmount = parseEther("100");

      await token.write.approve([otherAccount.account.address, approvalAmount], { account: owner.account });
      expect(await token.read.allowance([owner.account.address, otherAccount.account.address])).to.equal(approvalAmount);
    });

    it("Should transfer from works", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployTokenFixture);
      const transferAmount = parseEther("100");

      await token.write.approve([otherAccount.account.address, transferAmount], { account: owner.account });
      await token.write.transferFrom([owner.account.address, otherAccount.account.address, transferAmount], { account: otherAccount.account });

      expect(await token.read.balanceOf([otherAccount.account.address])).to.equal(transferAmount);
      expect(await token.read.balanceOf([owner.account.address])).to.equal(parseEther("900"));
    });
  });
});