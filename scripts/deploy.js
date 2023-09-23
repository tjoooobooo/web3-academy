const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Preparing deployment...");

  // Fetch contract to deploy
  const tokenContract = await ethers.getContractFactory("Token");
  const exchangeContract = await ethers.getContractFactory("Exchange");

  // Fetch accounts
  const accounts = await ethers.getSigners();

  console.log(
    `Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`
  );

  console.log("starting deployment...");

  // Deploy the contract
  const MT = await tokenContract.deploy("My Token", "MT", 1000000);
  const mETH = await tokenContract.deploy("Mock Ether", "ME", 1000000);
  const mDAI = await tokenContract.deploy("Mock Dai", "MD", 1000000);

  console.log("deployed tokens...");

  const exchange = await exchangeContract.deploy(accounts[1].address, 10);

  console.log("deployed exchange...");

  const config = require("../src/config.json");

  console.log(`Exchange deployed at: ${exchange.address}`);
  console.log(`MT deployed at: ${MT.address}`);
  console.log(`mETH deployed at: ${mETH.address}`);
  console.log(`mDAI deployed at: ${mDAI.address}`);

  config["31337"].exchange.address = exchange.address;
  config["31337"].MT.address = MT.address;
  config["31337"].mETH.address = mETH.address;
  config["31337"].mDAI.address = mDAI.address;

  fs.writeFile("./src/config.json", JSON.stringify(config, null, 2), (err) => {
    if (err) {
      console.log('Failed to write updated data to file: ' + err.message);
      return;
    }
    console.log('config.json successfully updated!');
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
