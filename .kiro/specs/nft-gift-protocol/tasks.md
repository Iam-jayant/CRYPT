# Implementation Plan

## Overview
This implementation plan breaks down the NFT Gift Protocol into incremental coding tasks. Each task builds on previous work, starting with smart contracts, then backend services, and finally the frontend interface.

## Tasks

- [-] 1. Set up project structure and development environment



  - Initialize Hardhat project for smart contract development
  - Set up React + Vite frontend project with TypeScript
  - Configure ethers.js/viem for Web3 interactions
  - Install OpenZeppelin contracts and RainbowKit dependencies
  - Create environment configuration files for contract addresses and API keys
  - _Requirements: 1.1, 6.4, 7.1_

- [ ] 2. Implement GiftCardNFT smart contract
  - Create Solidity contract inheriting from ERC721URIStorage and ReentrancyGuard
  - Implement TokenVault struct to store token address, amount, and liquidation status
  - Write createGiftCard function that accepts metadata URI, token address, and amount
  - Add token transfer logic using SafeERC20 to move tokens into contract custody
  - Implement liquidate function that transfers vault tokens to NFT owner and marks as liquidated
  - Write getVaultContents and getMetadataURI view functions
  - Add events for GiftCardCreated and GiftCardLiquidated
  - _Requirements: 1.3, 1.4, 3.1, 3.2, 3.3, 3.4, 8.2, 8.3, 8.4_

- [ ] 2.1 Write unit tests for GiftCardNFT contract
  - Test gift card creation with token deposits
  - Test liquidation flow and token transfers
  - Test authorization (only owner can liquidate)
  - Test double liquidation prevention
  - Test with multiple ERC-20 token types
  - _Requirements: 1.3, 1.4, 3.2, 3.3, 8.2, 8.3_

- [ ] 3. Implement Marketplace smart contract
  - Create contract with ArtistListing and GiftCardListing structs
  - Implement createArtistListing function to store IPFS hash and price
  - Write purchaseArtistDesign function with payment transfer to artist
  - Implement listGiftCard function that escrows NFT in contract
  - Write purchaseGiftCard function that transfers NFT and payment
  - Add cancelArtistListing and cancelGiftCardListing functions
  - Implement view functions to retrieve active listings
  - Add events for all marketplace actions
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 3.1 Write unit tests for Marketplace contract
  - Test artist listing creation and purchase flow
  - Test gift card listing and secondary sale
  - Test payment distribution to artists and sellers
  - Test listing cancellation
  - Test authorization checks
  - _Requirements: 4.2, 4.3, 4.4, 5.1, 5.2_

- [ ] 4. Create IPFS service module
  - Set up web3.storage client with API key configuration
  - Implement uploadImage function that accepts File/Blob and returns CID
  - Write uploadMetadata function that creates JSON and uploads to IPFS
  - Implement fetchMetadata function to retrieve JSON from IPFS by CID
  - Write fetchImage function to retrieve images from IPFS gateway
  - Add error handling for upload failures and timeouts
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ] 5. Implement AI art generation service
  - Create service module for Hugging Face API integration
  - Implement generateArt function that calls Stable Diffusion API
  - Write enhancePrompt function to add gift card styling to user prompts
  - Add loading state handling for model cold-start delays
  - Implement error handling for API failures and rate limits
  - Return generated image as Blob for IPFS upload
  - _Requirements: 1.2_

- [ ] 6. Set up wallet integration with RainbowKit
  - Configure RainbowKit with Polygon Mumbai testnet only
  - Set up wagmi config with HTTP transport for Mumbai testnet
  - Create WalletProvider component wrapping the app
  - Implement useAccount hook usage for wallet connection state
  - Add automatic network switching to Mumbai if user is on wrong network
  - Display connected wallet address and MATIC balance in UI
  - Add warning banner if user tries to connect to mainnet or other networks
  - _Requirements: 1.1, 7.1, 7.2, 7.3, 7.4, 7.5_
  - _Note: Only Polygon Mumbai testnet is supported_

- [ ] 7. Build gift card creation page
  - Create React component with form for AI prompt input
  - Integrate AI art generation service with loading indicator
  - Add token selection dropdown with testnet ERC-20 tokens (mock USDC, mock DAI, etc.)
  - Include option for custom testnet ERC-20 address input
  - Implement amount input with balance validation using token contract
  - Display generated artwork preview
  - Add optional recipient email input field
  - Implement mint button that calls createGiftCard contract function
  - Upload artwork to IPFS and create metadata JSON
  - Show transaction confirmation and NFT details after minting
  - Add helper text indicating testnet tokens only
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.5_

- [ ] 8. Implement email claim system
  - Create claim link generation service with tokenId encryption
  - Set up EmailJS or Web3Forms integration for sending emails
  - Write sendClaimEmail function with gift card preview and claim link
  - Create claim page component that parses URL token parameter
  - Display gift card preview on claim page
  - Implement wallet connection prompt for recipients
  - Add NFT transfer logic when recipient connects wallet
  - Validate claim token and prevent double claims
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 9. Build marketplace page for artist listings
  - Create marketplace component with tabs for "Artist Designs" and "Gift Cards"
  - Implement artist designs tab with grid layout
  - Fetch active artist listings from Marketplace contract
  - Display artwork previews loaded from IPFS
  - Add purchase button that calls purchaseArtistDesign with payment
  - Show transaction confirmation after purchase
  - Implement filter and sort options (price, date)
  - _Requirements: 4.3, 4.4, 4.5_

- [ ] 10. Build marketplace page for gift card secondary market
  - Implement gift cards tab in marketplace component
  - Fetch active gift card listings from Marketplace contract
  - Display gift card artwork and vault contents (token type, amount)
  - Show both purchase price and liquidation value
  - Add purchase button that calls purchaseGiftCard
  - Implement NFT transfer and payment flow
  - Show transaction confirmation with updated ownership
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 11. Create "My Gifts" page for owned gift cards
  - Build component to display user's owned GiftCardNFTs
  - Query blockchain for NFTs owned by connected wallet
  - Fetch and display metadata and artwork from IPFS for each NFT
  - Show vault contents (token type, symbol, amount, liquidation status)
  - Implement liquidate button that calls liquidate contract function
  - Add "List for Sale" button that opens listing modal
  - Create listing modal with price input and confirmation
  - Update UI after liquidation or listing
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1_

- [ ] 12. Implement artist listing creation flow
  - Create "List Your Art" page for artists
  - Add artwork upload interface (file input for images)
  - Upload artwork to IPFS and get CID
  - Add price input field in ETH/MATIC
  - Implement createArtistListing contract call with IPFS hash and price
  - Show confirmation and listing details after creation
  - Add "My Listings" section to view and manage artist's listings
  - _Requirements: 4.1, 4.2_

- [ ] 13. Add contract interaction utilities and error handling
  - Create utility functions for contract reads and writes
  - Implement transaction waiting and confirmation logic
  - Add error parsing for contract revert messages
  - Create toast notification system for user feedback
  - Implement loading states for all blockchain interactions
  - Add retry mechanisms for failed IPFS fetches
  - Handle wallet errors (not connected, wrong network, insufficient gas)
  - _Requirements: 7.3, 7.4_

- [ ] 14. Deploy contracts to Polygon Mumbai testnet and configure frontend
  - Compile smart contracts with optimization enabled
  - Deploy mock ERC-20 tokens (TestUSDC, TestDAI) to Mumbai testnet
  - Deploy GiftCardNFT contract to Mumbai testnet
  - Deploy Marketplace contract with GiftCardNFT address to Mumbai
  - Verify all contracts on PolygonScan Mumbai explorer
  - Update frontend environment variables with Mumbai contract addresses and RPC URL
  - Configure frontend to only support Mumbai testnet (hardcode chain ID 80001)
  - Add instructions for users to get test MATIC from Mumbai faucet
  - Test complete user flows on Mumbai with testnet tokens
  - _Requirements: All requirements (integration testing)_
  - _Note: This project uses Polygon Mumbai testnet exclusively - no mainnet deployment_

- [ ] 15. Create landing page and navigation
  - Build home/landing page with protocol overview
  - Add prominent banner indicating "Polygon Mumbai Testnet Only - No Real Tokens"
  - Include link to Mumbai MATIC faucet (https://faucet.polygon.technology/)
  - Add navigation menu with links to Create, Marketplace, My Gifts
  - Implement responsive design for mobile and desktop
  - Add wallet connection button in header
  - Display Mumbai network indicator and wallet address when connected
  - Create footer with links, protocol information, and Mumbai testnet disclaimer
  - _Requirements: 7.5_

- [ ] 16. Write integration tests for frontend flows
  - Test complete gift card creation flow with mocked wallet
  - Test marketplace purchase flow
  - Test liquidation flow
  - Test claim flow from email link
  - Test artist listing creation
  - _Requirements: All requirements_

