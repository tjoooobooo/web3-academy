const { ethers } = require("hardhat");

async function main() {
  // Fetch contract to deploy
  const tokenContract = await ethers.getContractFactory("Token");


  // Deploy the contract
  const deployedTokenContract = await tokenContract.deploy();

  console.log(`Token contract deployed at: ${deployedTokenContract.address}`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
