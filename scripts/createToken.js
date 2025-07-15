const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const factoryAddress = process.env.FACTORY_ADDRESS;
  if (!factoryAddress) {
    throw new Error("FACTORY_ADDRESS not set in .env");
  }

  const factory = await hre.ethers.getContractAt("TokenFactory", factoryAddress);
  const tx = await factory.createMemeToken(
    "MemeToken",
    "MEME",
    "Example meme token",
    "https://example.com/meme.png",
    { value: hre.ethers.parseEther("0.0001") }
  );
  await tx.wait();
  const tokenAddr = await factory.memeTokenAddresses(0);
  console.log("Created token at:", tokenAddr);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
