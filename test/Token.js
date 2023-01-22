const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 18);
};

describe("Token", () => {
  let token;

  beforeEach(async () => {
    // Create a JS instance of deployed Token contract
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("THS Token", "THST", 1000000);
  });

  describe("Deployment", () => {
    const name = "THS Token";
    const symbol = "THST";
    const decimals = 18;
    const totalSupply = 1000000;

    it("Returns the correct name", async () => {
      expect(await token.name()).to.equal(name);
    });

    it("Returns the correct symbol", async () => {
      expect(await token.symbol()).to.equal(symbol);
    });

    it("Returns the correct decimal", async () => {
      expect(await token.decimals()).to.equal(decimals);
    });

    it("Returns the correct supply", async () => {
      expect(await token.totalSupply()).to.equal(tokens(totalSupply));
    });
  });
});
