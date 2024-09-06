import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Presale", function () {
    async function deployPresaleFixture() {
        const [owner, buyer] = await hre.viem.getWalletClients();
        const initialSupply = parseEther("1000000");
        const price = parseEther("0.1"); // 0.1 paymentToken per token

        const token = await hre.viem.deployContract("Token", ["TestToken", "TTK", initialSupply, owner.account.address]);
        const paymentToken = await hre.viem.deployContract("Token", ["PaymentToken", "PTK", initialSupply, owner.account.address]);

        const presale = await hre.viem.deployContract("Presale", [token.address, paymentToken.address, price, owner.account.address]);

        // Transfer tokens to the Presale contract
        const presaleTokens = parseEther("500000"); // Ensure sufficient tokens
        await token.write.transfer([presale.address, presaleTokens], { account: owner.account.address });

        const publicClient = await hre.viem.getPublicClient();

        return { token, paymentToken, presale, owner, buyer, publicClient, price, presaleTokens };
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { presale, owner } = await loadFixture(deployPresaleFixture);
            expect(await presale.read.owner()).to.equal(getAddress(owner.account.address));
        });
    });

    describe("Buy Tokens", function () {
        it("Should allow buying tokens", async function () {
            const { token, paymentToken, presale, buyer, owner, price } = await loadFixture(deployPresaleFixture);
            const buyAmount = parseEther("100");
            const cost = (BigInt(buyAmount) * BigInt(price)) / BigInt(1e18);

            // Transfer payment tokens to buyer
            await paymentToken.write.transfer([buyer.account.address, cost], { account: owner.account.address });

            // Approve presale contract to spend buyer's payment tokens
            await paymentToken.write.approve([presale.address, cost], { account: buyer.account.address });

            // Ensure presale contract has enough tokens
            const presaleTokenBalance = await token.read.balanceOf([presale.address]);
            if (presaleTokenBalance < buyAmount) {
                const additionalTokens = buyAmount - presaleTokenBalance;
                await token.write.transfer([presale.address, additionalTokens], { account: owner.account.address });
            }

            // Check initial balances
            const initialBuyerTokenBalance = await token.read.balanceOf([buyer.account.address]);
            const initialPresaleTokenBalance = await token.read.balanceOf([presale.address]);
            const initialPresalePaymentBalance = await paymentToken.read.balanceOf([presale.address]);

            // Buy tokens
            try {
                await presale.write.buy([buyAmount], { account: buyer.account.address });
            } catch (error) {
                console.error("Error during buy:", error);
                throw error;
            }

            // Check final balances
            const finalBuyerTokenBalance = await token.read.balanceOf([buyer.account.address]);
            const finalPresaleTokenBalance = await token.read.balanceOf([presale.address]);
            const finalPresalePaymentBalance = await paymentToken.read.balanceOf([presale.address]);

            expect(finalBuyerTokenBalance).to.equal(initialBuyerTokenBalance + buyAmount);
            expect(finalPresalePaymentBalance).to.equal(initialPresalePaymentBalance + cost);
            expect(finalPresaleTokenBalance).to.equal(initialPresaleTokenBalance - buyAmount);
        });
    });

    describe("Withdrawals", function () {
        it("Should allow the owner to withdraw payments", async function () {
            const { token, paymentToken, presale, owner, buyer, price } = await loadFixture(deployPresaleFixture);
            
            // Simulate a purchase
            const buyAmount = parseEther("100");
            const cost = (BigInt(buyAmount) * BigInt(price)) / BigInt(1e18);
            await paymentToken.write.transfer([buyer.account.address, cost], { account: owner.account.address });
            await paymentToken.write.approve([presale.address, cost], { account: buyer.account.address });
            await presale.write.buy([buyAmount], { account: buyer.account.address });

            const initialOwnerBalance = await paymentToken.read.balanceOf([owner.account.address]);
            const initialPresaleBalance = await paymentToken.read.balanceOf([presale.address]);

            // Ensure presale contract has enough tokens
            const presaleTokenBalance = await token.read.balanceOf([presale.address]);
            if (presaleTokenBalance < buyAmount) {
                const additionalTokens = buyAmount - presaleTokenBalance;
                await token.write.transfer([presale.address, additionalTokens], { account: owner.account.address });
            }

            // Withdraw payments
            await presale.write.withdrawPayments({ account: owner.account.address });

            // Check balances
            expect(await paymentToken.read.balanceOf([owner.account.address])).to.equal(initialOwnerBalance + initialPresaleBalance);
            expect(await paymentToken.read.balanceOf([presale.address])).to.equal(0n);
        });

        it("Should allow the owner to withdraw unsold tokens", async function () {
            const { token, presale, owner, presaleTokens } = await loadFixture(deployPresaleFixture);
            const initialOwnerBalance = await token.read.balanceOf([owner.account.address]);

            // Withdraw unsold tokens
            await presale.write.withdrawTokens({ account: owner.account.address });

            // Check balances
            expect(await token.read.balanceOf([owner.account.address])).to.equal(initialOwnerBalance + presaleTokens);
            expect(await token.read.balanceOf([presale.address])).to.equal(0n);
        });
    });
});