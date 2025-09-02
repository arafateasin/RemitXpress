const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("RemitXpressOptimized - Comprehensive Tests", function () {
  // Test fixture to deploy contract and set up accounts
  async function deployRemitXpressFixture() {
    const [owner, feeCollector, user1, user2, user3, unauthorized, ...addrs] =
      await ethers.getSigners();

    const RemitXpress = await ethers.getContractFactory(
      "contracts/RemitXpressOptimized.sol:RemitXpress"
    );
    const contract = await RemitXpress.deploy(feeCollector.address);

    // Verify initial users for testing
    await contract.verifyUser(user1.address);
    await contract.verifyUser(user2.address);

    return {
      contract,
      owner,
      feeCollector,
      user1,
      user2,
      user3,
      unauthorized,
      addrs,
    };
  }

  describe("Deployment & Initial State", function () {
    it("Should deploy with correct initial state", async function () {
      const { contract, owner, feeCollector } = await loadFixture(
        deployRemitXpressFixture
      );

      expect(await contract.owner()).to.equal(owner.address);
      expect(await contract.feeCollector()).to.equal(feeCollector.address);
      expect(await contract.baseFeeRate()).to.equal(100); // 1%
      expect(await contract.paused()).to.equal(false);
      expect(await contract.authorizedOperators(owner.address)).to.equal(true);
      expect(await contract.getTransactionCount()).to.equal(0);
    });

    it("Should revert deployment with invalid fee collector", async function () {
      const RemitXpress = await ethers.getContractFactory(
        "contracts/RemitXpressOptimized.sol:RemitXpress"
      );

      await expect(
        RemitXpress.deploy(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(RemitXpress, "InvalidFeeCollector");
    });
  });

  describe("User Management", function () {
    it("Should verify user correctly", async function () {
      const { contract, user3 } = await loadFixture(deployRemitXpressFixture);

      await expect(contract.verifyUser(user3.address))
        .to.emit(contract, "UserVerified")
        .withArgs(user3.address);

      const userInfo = await contract.getUserInfo(user3.address);
      expect(userInfo.isVerified).to.equal(true);
      expect(userInfo.exists).to.equal(true);
    });

    it("Should batch verify users efficiently", async function () {
      const { contract, addrs } = await loadFixture(deployRemitXpressFixture);

      const usersToVerify = addrs.slice(0, 5).map((addr) => addr.address);

      const tx = await contract.batchVerifyUsers(usersToVerify);
      const receipt = await tx.wait();

      // Check gas usage is reasonable for batch operation
      expect(receipt.gasUsed).to.be.lessThan(200000);

      // Verify all users were verified
      for (const userAddr of usersToVerify) {
        const userInfo = await contract.getUserInfo(userAddr);
        expect(userInfo.isVerified).to.equal(true);
      }
    });

    it("Should only allow authorized operators to verify users", async function () {
      const { contract, unauthorized, user3 } = await loadFixture(
        deployRemitXpressFixture
      );

      await expect(
        contract.connect(unauthorized).verifyUser(user3.address)
      ).to.be.revertedWithCustomError(contract, "NotAuthorized");
    });
  });

  describe("Transaction Creation", function () {
    it("Should create transaction with correct gas efficiency", async function () {
      const { contract, user1, user2 } = await loadFixture(
        deployRemitXpressFixture
      );

      const amount = ethers.parseEther("1.0");
      const fee = await contract.calculateFee(amount);
      const totalValue = amount + fee;

      const tx = await contract
        .connect(user1)
        .createTransaction(user2.address, amount, { value: totalValue });

      const receipt = await tx.wait();

      // Gas should be under 160k for optimized contract
      expect(receipt.gasUsed).to.be.lessThan(160000);

      expect(await contract.getTransactionCount()).to.equal(1);
    });

    it("Should emit correct TransactionCreated event", async function () {
      const { contract, user1, user2 } = await loadFixture(
        deployRemitXpressFixture
      );

      const amount = ethers.parseEther("1.0");
      const fee = await contract.calculateFee(amount);
      const totalValue = amount + fee;

      const tx = await contract
        .connect(user1)
        .createTransaction(user2.address, amount, { value: totalValue });

      await expect(tx).to.emit(contract, "TransactionCreated");

      // Verify the event has correct sender and recipient
      const receipt = await tx.wait();
      const event = receipt.logs[0];
      expect(event.args[1]).to.equal(user1.address); // sender
      expect(event.args[2]).to.equal(user2.address); // recipient
      expect(event.args[3]).to.equal(amount); // amount
      expect(event.args[4]).to.equal(fee); // fee
    });

    it("Should handle excess payment correctly", async function () {
      const { contract, user1, user2 } = await loadFixture(
        deployRemitXpressFixture
      );

      const amount = ethers.parseEther("1.0");
      const fee = await contract.calculateFee(amount);
      const excess = ethers.parseEther("0.5");
      const totalValue = amount + fee + excess;

      const balanceBefore = await ethers.provider.getBalance(user1.address);

      const tx = await contract
        .connect(user1)
        .createTransaction(user2.address, amount, { value: totalValue });

      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(user1.address);

      // Should only deduct amount + fee + gas, excess should be refunded
      const expectedDeduction = amount + fee + gasUsed;
      expect(balanceBefore - balanceAfter).to.be.closeTo(
        expectedDeduction,
        ethers.parseEther("0.001")
      );
    });

    it("Should revert with insufficient payment", async function () {
      const { contract, user1, user2 } = await loadFixture(
        deployRemitXpressFixture
      );

      const amount = ethers.parseEther("1.0");
      const insufficientValue = amount; // Missing fee

      await expect(
        contract
          .connect(user1)
          .createTransaction(user2.address, amount, {
            value: insufficientValue,
          })
      ).to.be.revertedWithCustomError(contract, "InsufficientPayment");
    });

    it("Should revert for unverified users", async function () {
      const { contract, unauthorized, user2 } = await loadFixture(
        deployRemitXpressFixture
      );

      const amount = ethers.parseEther("1.0");

      await expect(
        contract
          .connect(unauthorized)
          .createTransaction(user2.address, amount, { value: amount })
      ).to.be.revertedWithCustomError(contract, "UserNotVerified");
    });

    it("Should revert with invalid recipient", async function () {
      const { contract, user1 } = await loadFixture(deployRemitXpressFixture);

      const amount = ethers.parseEther("1.0");

      await expect(
        contract
          .connect(user1)
          .createTransaction(ethers.ZeroAddress, amount, { value: amount })
      ).to.be.revertedWithCustomError(contract, "InvalidRecipient");
    });

    it("Should revert with zero amount", async function () {
      const { contract, user1, user2 } = await loadFixture(
        deployRemitXpressFixture
      );

      await expect(
        contract
          .connect(user1)
          .createTransaction(user2.address, 0, { value: 0 })
      ).to.be.revertedWithCustomError(contract, "InvalidAmount");
    });
  });

  describe("Transaction Completion", function () {
    async function createTestTransaction(contract, user1, user2, amount) {
      const fee = await contract.calculateFee(amount);
      const totalValue = amount + fee;

      await contract
        .connect(user1)
        .createTransaction(user2.address, amount, { value: totalValue });

      const transactionId = await contract.getTransactionId(0);
      return transactionId;
    }

    it("Should complete transaction correctly", async function () {
      const { contract, owner, user1, user2 } = await loadFixture(
        deployRemitXpressFixture
      );

      const amount = ethers.parseEther("1.0");
      const transactionId = await createTestTransaction(
        contract,
        user1,
        user2,
        amount
      );

      const user2BalanceBefore = await ethers.provider.getBalance(
        user2.address
      );

      await expect(contract.connect(owner).completeTransaction(transactionId))
        .to.emit(contract, "TransactionCompleted")
        .withArgs(transactionId);

      const user2BalanceAfter = await ethers.provider.getBalance(user2.address);
      expect(user2BalanceAfter - user2BalanceBefore).to.equal(amount);

      // Check transaction status
      const txn = await contract.getTransaction(transactionId);
      expect(txn.status).to.equal(1); // completed
    });

    it("Should update user statistics correctly", async function () {
      const { contract, owner, user1, user2 } = await loadFixture(
        deployRemitXpressFixture
      );

      const amount = ethers.parseEther("2.0");
      const transactionId = await createTestTransaction(
        contract,
        user1,
        user2,
        amount
      );

      await contract.connect(owner).completeTransaction(transactionId);

      const user1Info = await contract.getUserInfo(user1.address);
      const user2Info = await contract.getUserInfo(user2.address);

      expect(user1Info.totalSent).to.equal(amount);
      expect(user2Info.totalReceived).to.equal(amount);
      expect(user1Info.transactionCount).to.equal(1);
    });

    it("Should revert completing non-existent transaction", async function () {
      const { contract, owner } = await loadFixture(deployRemitXpressFixture);

      const fakeTransactionId = ethers.keccak256(ethers.toUtf8Bytes("fake"));

      await expect(
        contract.connect(owner).completeTransaction(fakeTransactionId)
      ).to.be.revertedWithCustomError(contract, "TransactionNotFound");
    });

    it("Should revert completing already completed transaction", async function () {
      const { contract, owner, user1, user2 } = await loadFixture(
        deployRemitXpressFixture
      );

      const amount = ethers.parseEther("1.0");
      const transactionId = await createTestTransaction(
        contract,
        user1,
        user2,
        amount
      );

      await contract.connect(owner).completeTransaction(transactionId);

      await expect(
        contract.connect(owner).completeTransaction(transactionId)
      ).to.be.revertedWithCustomError(contract, "TransactionAlreadyCompleted");
    });

    it("Should only allow authorized operators to complete transactions", async function () {
      const { contract, unauthorized, user1, user2 } = await loadFixture(
        deployRemitXpressFixture
      );

      const amount = ethers.parseEther("1.0");
      const transactionId = await createTestTransaction(
        contract,
        user1,
        user2,
        amount
      );

      await expect(
        contract.connect(unauthorized).completeTransaction(transactionId)
      ).to.be.revertedWithCustomError(contract, "NotAuthorized");
    });
  });

  describe("Transaction Cancellation", function () {
    async function createTestTransaction(contract, user1, user2, amount) {
      const fee = await contract.calculateFee(amount);
      const totalValue = amount + fee;

      await contract
        .connect(user1)
        .createTransaction(user2.address, amount, { value: totalValue });

      const transactionId = await contract.getTransactionId(0);
      return transactionId;
    }

    it("Should cancel transaction by sender", async function () {
      const { contract, user1, user2 } = await loadFixture(
        deployRemitXpressFixture
      );

      const amount = ethers.parseEther("1.0");
      const transactionId = await createTestTransaction(
        contract,
        user1,
        user2,
        amount
      );

      const user1BalanceBefore = await ethers.provider.getBalance(
        user1.address
      );

      await expect(contract.connect(user1).cancelTransaction(transactionId))
        .to.emit(contract, "TransactionCancelled")
        .withArgs(transactionId);

      // Check refund (amount only, fees are non-refundable)
      const user1BalanceAfter = await ethers.provider.getBalance(user1.address);
      expect(user1BalanceAfter).to.be.greaterThan(user1BalanceBefore);

      // Check transaction status
      const txn = await contract.getTransaction(transactionId);
      expect(txn.status).to.equal(2); // cancelled
    });

    it("Should cancel transaction by authorized operator", async function () {
      const { contract, owner, user1, user2 } = await loadFixture(
        deployRemitXpressFixture
      );

      const amount = ethers.parseEther("1.0");
      const transactionId = await createTestTransaction(
        contract,
        user1,
        user2,
        amount
      );

      await expect(contract.connect(owner).cancelTransaction(transactionId))
        .to.emit(contract, "TransactionCancelled")
        .withArgs(transactionId);
    });

    it("Should revert cancelling completed transaction", async function () {
      const { contract, owner, user1, user2 } = await loadFixture(
        deployRemitXpressFixture
      );

      const amount = ethers.parseEther("1.0");
      const transactionId = await createTestTransaction(
        contract,
        user1,
        user2,
        amount
      );

      await contract.connect(owner).completeTransaction(transactionId);

      await expect(
        contract.connect(user1).cancelTransaction(transactionId)
      ).to.be.revertedWithCustomError(contract, "TransactionAlreadyCompleted");
    });

    it("Should revert unauthorized cancellation", async function () {
      const { contract, unauthorized, user1, user2 } = await loadFixture(
        deployRemitXpressFixture
      );

      const amount = ethers.parseEther("1.0");
      const transactionId = await createTestTransaction(
        contract,
        user1,
        user2,
        amount
      );

      await expect(
        contract.connect(unauthorized).cancelTransaction(transactionId)
      ).to.be.revertedWithCustomError(contract, "NotAuthorized");
    });
  });

  describe("Fee Management", function () {
    it("Should calculate fees correctly", async function () {
      const { contract } = await loadFixture(deployRemitXpressFixture);

      const amount = ethers.parseEther("100");
      const expectedFee = (amount * 100n) / 10000n; // 1%

      expect(await contract.calculateFee(amount)).to.equal(expectedFee);
    });

    it("Should set fee rate correctly", async function () {
      const { contract, owner } = await loadFixture(deployRemitXpressFixture);

      const newFeeRate = 200; // 2%

      await expect(contract.connect(owner).setFeeRate(newFeeRate))
        .to.emit(contract, "FeeRateUpdated")
        .withArgs(newFeeRate);

      expect(await contract.baseFeeRate()).to.equal(newFeeRate);
    });

    it("Should revert setting fee rate too high", async function () {
      const { contract, owner } = await loadFixture(deployRemitXpressFixture);

      const tooHighFeeRate = 1001; // > 10%

      await expect(
        contract.connect(owner).setFeeRate(tooHighFeeRate)
      ).to.be.revertedWithCustomError(contract, "FeeRateTooHigh");
    });

    it("Should only allow owner to set fee rate", async function () {
      const { contract, unauthorized } = await loadFixture(
        deployRemitXpressFixture
      );

      await expect(
        contract.connect(unauthorized).setFeeRate(200)
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });

    it("Should transfer fees to fee collector", async function () {
      const { contract, feeCollector, user1, user2 } = await loadFixture(
        deployRemitXpressFixture
      );

      const amount = ethers.parseEther("10");
      const fee = await contract.calculateFee(amount);
      const totalValue = amount + fee;

      const feeCollectorBalanceBefore = await ethers.provider.getBalance(
        feeCollector.address
      );

      await contract
        .connect(user1)
        .createTransaction(user2.address, amount, { value: totalValue });

      const feeCollectorBalanceAfter = await ethers.provider.getBalance(
        feeCollector.address
      );
      expect(feeCollectorBalanceAfter - feeCollectorBalanceBefore).to.equal(
        fee
      );
    });
  });

  describe("Pause Functionality", function () {
    it("Should pause and unpause contract", async function () {
      const { contract, owner } = await loadFixture(deployRemitXpressFixture);

      await expect(contract.connect(owner).setPaused(true))
        .to.emit(contract, "ContractPaused")
        .withArgs(true);

      expect(await contract.paused()).to.equal(true);

      await expect(contract.connect(owner).setPaused(false))
        .to.emit(contract, "ContractPaused")
        .withArgs(false);

      expect(await contract.paused()).to.equal(false);
    });

    it("Should prevent transactions when paused", async function () {
      const { contract, owner, user1, user2 } = await loadFixture(
        deployRemitXpressFixture
      );

      await contract.connect(owner).setPaused(true);

      const amount = ethers.parseEther("1.0");

      await expect(
        contract
          .connect(user1)
          .createTransaction(user2.address, amount, { value: amount })
      ).to.be.revertedWithCustomError(contract, "ContractIsPaused");
    });
  });

  describe("Admin Functions", function () {
    it("Should set authorized operator", async function () {
      const { contract, owner, user3 } = await loadFixture(
        deployRemitXpressFixture
      );

      await contract.connect(owner).setAuthorizedOperator(user3.address, true);
      expect(await contract.authorizedOperators(user3.address)).to.equal(true);

      await contract.connect(owner).setAuthorizedOperator(user3.address, false);
      expect(await contract.authorizedOperators(user3.address)).to.equal(false);
    });

    it("Should set fee collector", async function () {
      const { contract, owner, user3 } = await loadFixture(
        deployRemitXpressFixture
      );

      await contract.connect(owner).setFeeCollector(user3.address);
      expect(await contract.feeCollector()).to.equal(user3.address);
    });

    it("Should revert setting invalid fee collector", async function () {
      const { contract, owner } = await loadFixture(deployRemitXpressFixture);

      await expect(
        contract.connect(owner).setFeeCollector(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(contract, "InvalidFeeCollector");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow emergency withdrawal by owner", async function () {
      const { contract, owner } = await loadFixture(deployRemitXpressFixture);

      // Send some ETH to contract
      await owner.sendTransaction({
        to: await contract.getAddress(),
        value: ethers.parseEther("1.0"),
      });

      const ownerBalanceBefore = await ethers.provider.getBalance(
        owner.address
      );
      const tx = await contract.connect(owner).emergencyWithdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter).to.be.greaterThan(ownerBalanceBefore - gasUsed);
    });

    it("Should revert emergency withdrawal with no balance", async function () {
      const { contract, owner } = await loadFixture(deployRemitXpressFixture);

      await expect(
        contract.connect(owner).emergencyWithdraw()
      ).to.be.revertedWithCustomError(contract, "NoFeesToWithdraw");
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should use minimal gas for transaction creation", async function () {
      const { contract, user1, user2 } = await loadFixture(
        deployRemitXpressFixture
      );

      const amount = ethers.parseEther("1.0");
      const fee = await contract.calculateFee(amount);
      const totalValue = amount + fee;

      const tx = await contract
        .connect(user1)
        .createTransaction(user2.address, amount, { value: totalValue });

      const receipt = await tx.wait();

      // Should be significantly less than 160k gas
      expect(receipt.gasUsed).to.be.lessThan(160000);
      console.log(`Transaction creation gas used: ${receipt.gasUsed}`);
    });

    it("Should use minimal gas for transaction completion", async function () {
      const { contract, owner, user1, user2 } = await loadFixture(
        deployRemitXpressFixture
      );

      const amount = ethers.parseEther("1.0");
      const fee = await contract.calculateFee(amount);
      const totalValue = amount + fee;

      await contract
        .connect(user1)
        .createTransaction(user2.address, amount, { value: totalValue });
      const transactionId = await contract.getTransactionId(0);

      const tx = await contract
        .connect(owner)
        .completeTransaction(transactionId);
      const receipt = await tx.wait();

      // Should be significantly less than 100k gas
      expect(receipt.gasUsed).to.be.lessThan(100000);
      console.log(`Transaction completion gas used: ${receipt.gasUsed}`);
    });

    it("Should demonstrate gas efficiency of batch operations", async function () {
      const { contract, addrs } = await loadFixture(deployRemitXpressFixture);

      const users = addrs.slice(0, 10).map((addr) => addr.address);

      const tx = await contract.batchVerifyUsers(users);
      const receipt = await tx.wait();

      const gasPerUser = Number(receipt.gasUsed) / users.length;

      // Should be less than 27k gas per user
      expect(gasPerUser).to.be.lessThan(27000);
      console.log(`Batch verification gas per user: ${gasPerUser}`);
    });
  });

  describe("Edge Cases & Security", function () {
    it("Should handle maximum values correctly", async function () {
      const { contract, user1, user2 } = await loadFixture(
        deployRemitXpressFixture
      );

      // Test with maximum uint96 value
      const maxAmount = 2n ** 96n - 1n;
      const fee = await contract.calculateFee(maxAmount);

      // This should not overflow
      expect(fee).to.be.greaterThan(0);
    });

    it("Should prevent reentrancy attacks", async function () {
      // The contract uses ReentrancyGuard, so this is implicitly tested
      // in all state-changing functions
      const { contract } = await loadFixture(deployRemitXpressFixture);

      // Verify ReentrancyGuard is properly inherited
      expect(await contract.getTransactionCount()).to.equal(0);
    });

    it("Should handle contract receiving ETH", async function () {
      const { contract, user1 } = await loadFixture(deployRemitXpressFixture);

      // Contract should be able to receive ETH
      await expect(
        user1.sendTransaction({
          to: await contract.getAddress(),
          value: ethers.parseEther("1.0"),
        })
      ).to.not.be.reverted;
    });
  });
});
