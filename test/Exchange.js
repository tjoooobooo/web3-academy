const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 18);
};

describe("Exchange", () => {
  let deployer, feeAccount, exchange, token1, token2, user1, user2;

  const feePercent = 10;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    feeAccount = accounts[1];
    user1 = accounts[2];
    user2 = accounts[3];

    const Exchange = await ethers.getContractFactory("Exchange");
    exchange = await Exchange.deploy(feeAccount.address, feePercent);

    const Token = await ethers.getContractFactory("Token");
    token1 = await Token.deploy("My Token", "MT", 1000000);
    token2 = await Token.deploy("My second Token", "MST", 1000000);

    await token1.connect(deployer).transfer(user1.address, tokens(100));
  });

  describe("Deployment", () => {
    it("Tracks the fee account", async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address);
    });

    it("Tracks the fee percent", async () => {
      expect(await exchange.feePercent()).to.equal(feePercent);
    });
  });

  describe("Deposit Tokens", () => {
    let receipt;
    let amount = tokens(10);

    beforeEach(async () => {
      // Approve Tokens
      await token1.connect(user1).approve(exchange.address, amount);
      // Deposit Tokens
      const transaction = await exchange
        .connect(user1)
        .depositToken(token1.address, amount);
      receipt = await transaction.wait();
    });

    it("Tracks the token deposit", async () => {
      // Ensure the tokens were transferred to the exchange
      expect(await token1.balanceOf(exchange.address)).to.equal(amount);
      expect(await token1.balanceOf(user1.address)).to.equal(tokens(90));
      // Expect exchange keeps track of the deposits
      expect(await exchange.tokens(token1.address, user1.address)).to.equal(
        amount
      );
    });

    it("Emits a Deposit Event", async () => {
      const event = receipt.events[1];

      expect(event.event).to.equal("Deposit");
      const args = event.args;

      expect(args._token).to.equal(token1.address);
      expect(args._user).to.equal(user1.address);
      expect(args._amount).to.equal(amount);
      expect(args._balance).to.equal(amount);
    });
  });

  describe("Checking Balances", () => {
    let amount = tokens(1);

    beforeEach(async () => {
      await token1.connect(user1).approve(exchange.address, amount);
      await exchange.connect(user1).depositToken(token1.address, amount);
    });

    it("Returns user balance", async () => {
      expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(
        amount
      );
    });
  });

  describe("Withdrawing Tokens", () => {
    let receipt;
    let amount = tokens(10);

    beforeEach(async () => {
      // Approve Tokens
      await token1.connect(user1).approve(exchange.address, amount);
      // Deposit Tokens
      await exchange.connect(user1).depositToken(token1.address, amount);

      const transaction = await exchange
        .connect(user1)
        .withdrawToken(token1.address, amount);
      receipt = await transaction.wait();
    });

    it("Withdraws tokens", async () => {
      // Ensure the tokens were transferred to the user
      expect(await token1.balanceOf(exchange.address)).to.equal(0);
      expect(await token1.balanceOf(user1.address)).to.equal(tokens(100));
      // Expect exchange keeps track of the withdrawal
      expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(
        0
      );
    });

    it("Emits a Withdraw Event", async () => {
      const event = receipt.events[1];

      expect(event.event).to.equal("Withdraw");
      const args = event.args;

      expect(args._token).to.equal(token1.address);
      expect(args._user).to.equal(user1.address);
      expect(args._amount).to.equal(amount);
      expect(args._balance).to.equal(0);
    });
  });

  describe("Making Orders", () => {
    let receipt;
    let amount = tokens(1);

    describe("Successful Orders", () => {
      beforeEach(async () => {
        await token1.connect(user1).approve(exchange.address, amount);
        await exchange.connect(user1).depositToken(token1.address, amount);

        const transaction = await exchange
          .connect(user1)
          .makeOrder(token2.address, amount, token1.address, amount);

        receipt = await transaction.wait();
      });

      it("Count Orders", async () => {
        expect(await exchange.orderCount()).to.equal(1);
      });

      it("It instantiates and stores the orders correctly", async () => {
        const orderId = 1;
        const {
          id,
          user,
          tokenGet,
          amountGet,
          tokenGive,
          amountGive,
          timestamp,
        } = { ...(await exchange.orders(orderId)) };

        expect(id).to.equal(1);
        expect(user).to.equal(user1.address);
        expect(tokenGet).to.equal(token2.address);
        expect(amountGet).to.equal(amount);
        expect(tokenGive).to.equal(token1.address);
        expect(amountGive).to.equal(amount);
        expect(timestamp).to.be.at.least(1);
      });

      it("Emits an order event", () => {
        const event = receipt.events[0];
        expect(event.event).to.equal("Order");

        const args = event.args;

        expect(args._id).to.equal(1);
        expect(args._user).to.equal(user1.address);
        expect(args._tokenGet).to.equal(token2.address);
        expect(args._amountGet).to.equal(amount);
        expect(args._tokenGive).to.equal(token1.address);
        expect(args._amountGive).to.equal(amount);
        expect(args._timestamp).to.be.at.least(1);
      });
    });

    describe("Failing Orders", () => {
      it("Reject order if user has insufficient balance", async () => {
        await expect(
          exchange
            .connect(user1)
            .makeOrder(token2.address, amount, token1.address, amount)
        ).to.be.revertedWith("Insufficient balance");
      });

      it("Rejects if amount that user receives does not allow for a fee of integer type (in smallest denomination)", async () => {
        await token1.connect(user1).approve(exchange.address, amount);
        await exchange.connect(user1).depositToken(token1.address, amount);

        await expect(
          exchange
            .connect(user1)
            .makeOrder(token2.address, 42, token1.address, amount)
        ).to.be.revertedWith(
          "Invalid value for _amountGet.  Must be multiple of 100"
        );
      });
    });
  });

  describe("Order Actions", () => {
    let amount = tokens(1);

    beforeEach(async () => {
      // user1 deposit orders
      await token1.connect(user1).approve(exchange.address, amount);
      await exchange.connect(user1).depositToken(token1.address, amount);
      // user1 makes order
      await exchange
        .connect(user1)
        .makeOrder(token2.address, amount, token1.address, amount);

      // deployer gives 100 T2 tokens to user2
      await token2.connect(deployer).transfer(user2.address, tokens(100));

      // user2 deposits 2 T2 Tokens
      await token2.connect(user2).approve(exchange.address, tokens(2));
      await exchange.connect(user2).depositToken(token2.address, tokens(2));
    });

    describe("Canceling Orders", () => {
      describe("Successfull Cancellations", () => {
        let receipt;

        beforeEach(async () => {
          // user1 cancels order
          const transaction = await exchange.connect(user1).cancelOrder(1);
          receipt = await transaction.wait();
        });

        it("Updates cancelled orders", async () => {
          expect(await exchange.orderCancelled(1)).to.equal(true);
        });

        it("Emits canceled event", async () => {
          const event = receipt.events[0];

          expect(event.event).to.equal("Cancel");
          const args = event.args;

          expect(args._id).to.equal(1);
          expect(args._user).to.equal(user1.address);
          expect(args._tokenGet).to.equal(token2.address);
          expect(args._amountGet).to.equal(amount);
          expect(args._tokenGive).to.equal(token1.address);
          expect(args._amountGive).to.equal(amount);
          expect(args._timestamp).to.be.at.least(1);
        });
      });

      describe("Failing Cancellations", () => {
        it("Rejects invalid order ids", async () => {
          const invalidOrderId = 42;

          await expect(
            exchange.connect(user1).cancelOrder(invalidOrderId)
          ).to.be.revertedWith("Invalid order id");
        });

        it("Rejects unauthorized cancellations", async () => {
          await expect(
            exchange.connect(user2).cancelOrder(1)
          ).to.be.revertedWith("Unauthorized");
        });
      });
    });

    describe("Filling Orders", () => {
      describe("Successfull Trades", () => {
        let receipt;

        beforeEach(async () => {
          // user2 fills order
          const transaction = await exchange.connect(user2).fillOrder(1);

          receipt = await transaction.wait();
        });

        it("Executes the trade and charges fees", async () => {
          // T1 (tokenGive)
          expect(
            await exchange.balanceOf(token1.address, user1.address)
          ).to.be.equal(0);
          expect(
            await exchange.balanceOf(token1.address, user2.address)
          ).to.be.equal(tokens(1));
          expect(
            await exchange.balanceOf(token1.address, feeAccount.address)
          ).to.be.equal(0);

          // T2 (tokenGet)
          expect(
            await exchange.balanceOf(token2.address, user1.address)
          ).to.be.equal(tokens(1));
          expect(
            await exchange.balanceOf(token2.address, user2.address)
          ).to.be.equal(tokens(0.9));
          expect(
            await exchange.balanceOf(token2.address, feeAccount.address)
          ).to.be.equal(tokens(0.1));
        });

        it("Updates filled orders", async () => {
          expect(await exchange.orderFilled(1)).to.be.equal(true);
        });

        it("Emit a Trade Event", async () => {
          const event = receipt.events[0];

          expect(event.event).to.equal("Trade");

          const args = event.args;

          expect(args._id).to.equal(1);
          expect(args._user).to.equal(user2.address);
          expect(args._tokenGet).to.equal(token2.address);
          expect(args._amountGet).to.equal(amount);
          expect(args._tokenGive).to.equal(token1.address);
          expect(args._amountGive).to.equal(amount);
          expect(args._creator).to.equal(user1.address);
          expect(args._timestamp).to.be.at.least(1);
        });
      });

      describe("Failing Trades", () => {
        it("Reject invalid order ids", async () => {
          await expect(
            exchange.connect(user1).fillOrder(42)
          ).to.be.revertedWith("Invalid order id");
        });

        it("Rejects if user doesn't have enough funds to fill the order", async () => {
          await exchange
            .connect(user2)
            .withdrawToken(token2.address, tokens(1));

          await expect(exchange.connect(user2).fillOrder(1)).to.be.revertedWith(
            "Insufficient balance"
          );
        });

        it("Rejects already filled orders", async () => {
          await exchange.connect(user2).fillOrder(1);

          await expect(exchange.connect(user2).fillOrder(1)).to.be.revertedWith(
            "Order was already filled"
          );
        });
        it("Rejects cancelled orders", async () => {
          await exchange.connect(user1).cancelOrder(1);

          await expect(exchange.connect(user1).fillOrder(1)).to.be.revertedWith(
            "Order was cancelled"
          );
        });
      });
    });
  });
});
