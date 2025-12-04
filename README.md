# NFT Gift Protocol

## Overview

Digital gifting is often impersonal. Sending a crypto transaction feels like a bank transfer, and traditional gift cards are restrictive and centralized.

This project solves that problem by combining AI-generated art with cryptocurrency. It allows users to create unique, personalized NFTs that act as **"wrapping paper" for value**. You can embed ERC-20 tokens (like USDC) inside these NFTs. The recipient receives a digital collectible that they can choose to keep or **liquidate** to access the funds inside.

This project was built to explore the intersection of **art and finance**, ensuring that digital gifts have both emotional and monetary value.

---

## How It Works

The core of this protocol is the **Vault Pattern**.

1. **Creation**
   When you create a gift card, you provide a text prompt (e.g., *"A cyberpunk birthday cake"*). The system generates an image using AI and uploads it to IPFS.

2. **Minting**
   The smart contract mints an NFT to the recipient. At the same time, it transfers your specified amount of tokens (like USDC) into the contract's vault.

3. **Storage**
   The contract maps those tokens specifically to that NFT's ID.

4. **Liquidation**
   Only the current owner of the NFT can call the liquidation function. This burns the "gift" status (or the NFT itself, depending on configuration) and releases the funds to the owner's wallet.

---

## Features

* **AI Art Generation**: Generates unique artwork on the fly using Stable Diffusion.
* **Embedded Value**: NFTs hold real ERC-20 tokens securely.
* **Decentralized Storage**: All metadata and images are stored on IPFS for permanence.
* **Marketplace**: A secondary market where users can list and trade their gift cards.
* **Testnet Ready**: Fully deployed and tested on the Polygon Amoy network.

---

## Technology Stack

* **Frontend**: React, TypeScript, Vite, Tailwind CSS
* **Smart Contracts**: Solidity, Hardhat
* **Web3 Integration**: RainbowKit, Wagmi, Viem
* **Storage**: IPFS (via web3.storage)
* **AI**: Hugging Face Inference API

---

## Getting Started

Follow these steps to run the project locally.

---

## Prerequisites

* Node.js (v18 or higher)
* A Web3 wallet (like MetaMask)
* Test MATIC for the Polygon Amoy network

---

## Installation

1. Clone the repository.

2. Install root dependencies:

   ```bash
   npm install
   ```

3. Navigate to the frontend directory and install dependencies:

   ```bash
   cd frontend
   npm install
   ```

---

## Configuration

You need to set up your environment variables.

### Backend `.env` (Root Directory)

Create a `.env` file in the root directory. You can copy `.env.example` if it exists. You will need:

* `AMOY_RPC_URL` – RPC endpoint for Polygon Amoy
* `PRIVATE_KEY` – Your wallet private key (for deploying contracts)

### Frontend `.env`

Create a `.env` file in the `frontend` directory. You will need:

* `VITE_WALLETCONNECT_PROJECT_ID` – From WalletConnect
* `VITE_HUGGINGFACE_API_KEY` – For AI generation
* `VITE_WEB3_STORAGE_TOKEN` – For IPFS uploads

---

## Running the Application

### Compile Contracts

```bash
npm run compile
```

### Deploy to Testnet

```bash
npm run deploy:amoy
```

> **Note:**
> This script deploys:
>
> * Mock USDC/DAI tokens
> * GiftCardNFT contract
> * Marketplace contract
>
> All deployed addresses will be logged to the console.

---

### Update Frontend Config

Copy the deployed contract addresses into your `frontend/.env` file.

---

### Start Frontend

```bash
npm run frontend:dev
```

The application will run at:

```
http://localhost:5173
```

---

## Architecture

The project consists of three core smart contracts:

* **GiftCardNFT.sol**
  Handles NFT minting and the token vault logic.

* **Marketplace.sol**
  Enables listing and purchasing of gift cards and design templates.

* **MockERC20.sol**
  Used to mint fake USDC and DAI tokens for testing on the testnet.

---

## License

This project is open source and available under the **M
