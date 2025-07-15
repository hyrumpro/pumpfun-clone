# PumpFun Clone - Meme Token Factory

This project contains a Solidity smart contract that mimics the behaviour of the popular **pump.fun** style token factory. It lets anyone create a meme token with a few parameters and automatically handles bonding curve sales and liquidity on Uniswap V2.

## Features
- Create custom ERC‑20 meme tokens with a name, symbol and metadata
- Bonding curve pricing so tokens become more expensive as supply increases
- Automatic Uniswap V2 liquidity provision once the funding goal is reached
- Fee collection and withdrawal by the contract owner

## Prerequisites
- Node.js 20+
- npm
- A funded wallet/private key to deploy contracts
- RPC endpoints for Ethereum mainnet (for forking) and Sepolia testnet

Create a `.env` file based on the provided `.env.example`. These values are
optional for local testing but required when deploying to Sepolia or using mainnet
forking:

```bash
ETHEREUM_MAINNET_RPC=<mainnet rpc url>
SEPOLIA_RPC_URL=<sepolia rpc url>
PRIVATE_KEY=<deployer private key>
FACTORY_ADDRESS=<address after deployment>
```

## Installation
Install dependencies with:

```bash
npm install
```

## Compile & Test
Contracts target Solidity 0.8.26. Hardhat will try to download the compiler if it
can't be found locally. This repository already includes the `solc` dependency,
so compilation works offline.

Compile contracts with:

```bash
npx hardhat compile
```

Run the Hardhat test suite:

```bash
npx hardhat test
```

## Deployment
A simple deployment script is provided in `scripts/deploy.js`.
Ensure your `.env` contains `SEPOLIA_RPC_URL` and `PRIVATE_KEY`, then deploy the
`TokenFactory` contract to Sepolia using:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Alternatively, you can use Hardhat Ignition:

```bash
npx hardhat ignition deploy TokenFactoryModule --network sepolia
```

After deployment, note the address printed in the console. You can interact with the factory to create new meme tokens and allow users to buy them.

An example script `scripts/createToken.js` shows how to create a token once the
factory is deployed. Set `FACTORY_ADDRESS` in your `.env` and run:

```bash
npx hardhat run scripts/createToken.js --network sepolia
```

## License
MIT
