require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const MAINNET_RPC = process.env.ETHEREUM_MAINNET_RPC || "";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const config = {
  solidity: "0.8.26",
  networks: {
    hardhat: {}
  }
};

if (MAINNET_RPC) {
  config.networks.hardhat.forking = { url: MAINNET_RPC };
}

if (SEPOLIA_RPC_URL) {
  config.networks.sepolia = {
    url: SEPOLIA_RPC_URL,
    accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
  };
}

module.exports = config;

