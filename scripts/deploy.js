const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const factory = await hre.ethers.deployContract("TokenFactory");
  await factory.waitForDeployment();
  console.log("TokenFactory deployed to:", factory.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
