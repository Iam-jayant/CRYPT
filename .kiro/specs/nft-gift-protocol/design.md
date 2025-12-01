# Design Document: NFT Gift Protocol

## Overview

The NFT Gift Protocol is a fully decentralized gifting platform built on Ethereum-compatible blockchains. The system combines smart contracts for NFT minting and token custody, IPFS for decentralized storage, AI art generation, and a Web3 frontend. The architecture prioritizes decentralization, using only free and open-source technologies.

### Technology Stack

- **Smart Contracts**: Solidity (ERC-721, ERC-20 interactions)
- **Blockchain**: Ethereum-compatible networks (Ethereum mainnet, Polygon, Base, or Arbitrum)
- **Decentralized Storage**: IPFS via web3.storage (free tier) or Pinata (free tier)
- **AI Art Generation**: Stable Diffusion via Hugging Face Inference API (free tier) or local generation
- **Frontend**: React + ethers.js/viem for Web3 interactions
- **Wallet Integration**: RainbowKit or Web3Modal (supports MetaMask, WalletConnect, etc.)
- **Email Delivery**: Web3Forms (free) or EmailJS (free tier) for claim link delivery
- **Development**: Hardhat or Foundry for smart contract development

## Architecture

### System Components

```
┌────────────────────────────────────────────────────────────┐
│                        Frontend (React)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Create Gift  │  │  Marketplace │  │   Liquidate  │      │
│  │     Card     │  │              │  │   Gift Card  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────────────────────────────────────┘
                            │
                            ├─── Wallet Integration (RainbowKit)
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  GiftCardNFT │    │  Marketplace │    │  AI Art Gen  │
│   Contract   │    │   Contract   │    │  (HuggingF)  │
│  (ERC-721)   │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │     IPFS     │
                    │ (web3.storage│
                    │  or Pinata)  │
                    └──────────────┘
```

## Components and Interfaces

### 1. Smart Contracts

#### GiftCardNFT Contract (ERC-721)

Primary contract that manages gift card NFTs with embedded token vaults.

```solidity
interface IGiftCardNFT {
    struct TokenVault {
        address tokenAddress;  // ERC-20 token contract
        uint256 amount;        // Token amount held
        bool liquidated;       // Liquidation status
    }
    
    // Minting and creation
    function createGiftCard(
        string memory metadataURI,
        address tokenAddress,
        uint256 tokenAmount
    ) external returns (uint256 tokenId);
    
    // Liquidation
    function liquidate(uint256 tokenId) external;
    
    // View functions
    function getVaultContents(uint256 tokenId) external view returns (TokenVault memory);
    function getMetadataURI(uint256 tokenId) external view returns (string memory);
    
    // Events
    event GiftCardCreated(uint256 indexed tokenId, address indexed creator, address tokenAddress, uint256 amount);
    event GiftCardLiquidated(uint256 indexed tokenId, address indexed owner, uint256 amount);
}
```

**Key Features:**
- Inherits from OpenZeppelin's ERC721URIStorage
- Stores token vault data in mapping: `mapping(uint256 => TokenVault) private vaults`
- Requires token approval before minting (user must approve contract to transfer tokens)
- Validates ERC-20 token contracts using IERC20 interface
- Prevents double liquidation with `liquidated` flag

#### Marketplace Contract

Handles listing and trading of both artist designs and minted gift cards.

```solidity
interface IMarketplace {
    struct ArtistListing {
        uint256 listingId;
        address artist;
        string ipfsHash;       // Artwork stored on IPFS
        uint256 price;         // Price in native currency (ETH/MATIC)
        bool active;
    }
    
    struct GiftCardListing {
        uint256 listingId;
        uint256 tokenId;       // GiftCardNFT token ID
        address seller;
        uint256 price;
        bool active;
    }
    
    // Artist listings
    function createArtistListing(string memory ipfsHash, uint256 price) external returns (uint256);
    function purchaseArtistDesign(uint256 listingId) external payable returns (string memory);
    function cancelArtistListing(uint256 listingId) external;
    
    // Gift card secondary market
    function listGiftCard(uint256 tokenId, uint256 price) external returns (uint256);
    function purchaseGiftCard(uint256 listingId) external payable;
    function cancelGiftCardListing(uint256 listingId) external;
    
    // View functions
    function getArtistListings() external view returns (ArtistListing[] memory);
    function getGiftCardListings() external view returns (GiftCardListing[] memory);
    
    // Events
    event ArtistListingCreated(uint256 indexed listingId, address indexed artist, uint256 price);
    event ArtistDesignPurchased(uint256 indexed listingId, address indexed buyer, address indexed artist);
    event GiftCardListed(uint256 indexed listingId, uint256 indexed tokenId, uint256 price);
    event GiftCardSold(uint256 indexed listingId, uint256 indexed tokenId, address buyer);
}
```

**Key Features:**
- Separate listing types for artist designs vs. minted gift cards
- Escrow mechanism: contract holds NFT during listing
- Direct payment to artists/sellers (no platform fees in MVP)
- Requires NFT approval before listing

### 2. Frontend Application

#### Page Structure

1. **Home/Landing Page**
   - Overview of the protocol
   - Connect wallet button
   - Navigation to create, marketplace, and my gifts

2. **Create Gift Card Page**
   - AI art generation interface (text prompt input)
   - Option to select from marketplace designs
   - Token selection (dropdown + custom ERC-20 address input)
   - Amount input with balance validation
   - Preview generated artwork
   - Send via email option (recipient email input)
   - Mint button

3. **Marketplace Page**
   - Two tabs: "Artist Designs" and "Gift Cards"
   - Grid view of listings with images
   - Filter/sort options (price, date)
   - Purchase flow with wallet confirmation

4. **My Gifts Page**
   - Display owned gift cards
   - Show vault contents (token type, amount, liquidation status)
   - Liquidate button
   - List for sale button

5. **Claim Page**
   - Accessed via email link with token parameter
   - Display gift card preview
   - Connect wallet to claim
   - Transfer NFT to connected wallet

#### Wallet Integration

Using RainbowKit configured for Polygon Mumbai testnet only:

```typescript
interface WalletConfig {
    chains: [polygonMumbai];
    transports: {
        [polygonMumbai.id]: http('https://rpc-mumbai.maticvigil.com'),
    };
}
```

**Supported Wallets:**
- MetaMask
- WalletConnect (mobile wallets)
- Coinbase Wallet
- Rainbow Wallet

**Network Enforcement:**
- App will only work on Mumbai testnet (Chain ID: 80001)
- Automatic network switching prompt if user is on wrong network

### 3. IPFS Storage Layer

#### Storage Strategy

Using web3.storage (free, decentralized, built on IPFS and Filecoin):

**Metadata Structure:**
```json
{
    "name": "Gift Card #123",
    "description": "A unique AI-generated gift card",
    "image": "ipfs://QmX...",
    "attributes": [
        {
            "trait_type": "Token Type",
            "value": "USDC"
        },
        {
            "trait_type": "Token Amount",
            "value": "100"
        },
        {
            "trait_type": "Creation Date",
            "value": "2025-12-01"
        },
        {
            "trait_type": "Artist",
            "value": "0x..." 
        }
    ],
    "vault": {
        "tokenAddress": "0x...",
        "amount": "100000000",
        "liquidated": false
    }
}
```

**Upload Flow:**
1. Generate or select artwork
2. Upload image to IPFS → get image CID
3. Create metadata JSON with image CID
4. Upload metadata to IPFS → get metadata CID
5. Use metadata CID as tokenURI in NFT contract

#### Implementation

```typescript
interface IPFSService {
    uploadImage(file: File): Promise<string>;  // Returns IPFS CID
    uploadMetadata(metadata: object): Promise<string>;
    fetchMetadata(cid: string): Promise<object>;
    fetchImage(cid: string): Promise<Blob>;
}
```

### 4. AI Art Generation

#### Approach: Hugging Face Inference API (Free Tier)

Using Stable Diffusion via Hugging Face's free inference API with the `stabilityai/stable-diffusion-2-1` model.

**API Details:**
- Endpoint: `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1`
- Authentication: Free API token (sign up at huggingface.co)
- Rate Limit: Generous free tier, model loads on-demand
- No cost, no credit card required

**Generation Flow:**
```typescript
interface AIArtGenerator {
    generateArt(prompt: string): Promise<Blob>;
    enhancePrompt(userPrompt: string): string;  // Add gift card styling
}

// Implementation
async function generateArt(prompt: string): Promise<Blob> {
    const enhancedPrompt = enhancePrompt(prompt);
    const response = await fetch(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: enhancedPrompt }),
        }
    );
    return await response.blob();
}
```

**Prompt Enhancement:**
User input: "birthday celebration"
Enhanced: "birthday celebration, gift card design, vibrant colors, festive, digital art, high quality, centered composition"

**Note:** The free tier may have initial loading time when the model is cold-starting. The frontend should show a loading indicator during generation (typically 10-30 seconds).

### 5. Email Delivery System

#### Claim Link Generation

```typescript
interface ClaimService {
    generateClaimLink(tokenId: string, recipientEmail: string): Promise<string>;
    sendClaimEmail(email: string, claimLink: string, previewImage: string): Promise<void>;
    validateClaimToken(token: string): Promise<{ tokenId: string, valid: boolean }>;
}
```

**Claim Link Structure:**
```
https://giftprotocol.app/claim?token=<encrypted_tokenId>
```

**Email Service:**
Using EmailJS (free tier: 200 emails/month) or Web3Forms:

**Email Template:**
- Gift card preview image
- Sender message (optional)
- Claim button/link
- Instructions for wallet connection
- Expiry notice (optional)

**Security:**
- One-time use tokens
- Token expiry (optional, 30 days)
- Verify NFT ownership before allowing claim

## Data Models

### On-Chain Data

```solidity
// GiftCardNFT Contract Storage
struct TokenVault {
    address tokenAddress;
    uint256 amount;
    bool liquidated;
}

mapping(uint256 => TokenVault) private _vaults;
mapping(uint256 => string) private _tokenURIs;  // IPFS CID

// Marketplace Contract Storage
struct ArtistListing {
    uint256 listingId;
    address artist;
    string ipfsHash;
    uint256 price;
    bool active;
}

struct GiftCardListing {
    uint256 listingId;
    uint256 tokenId;
    address seller;
    uint256 price;
    bool active;
}

mapping(uint256 => ArtistListing) private _artistListings;
mapping(uint256 => GiftCardListing) private _giftCardListings;
```

### Off-Chain Data (IPFS)

**NFT Metadata (JSON):**
- Standard ERC-721 metadata format
- Extended with vault information
- Stored on IPFS, referenced by CID in contract

**Artist Listing Data:**
- Artwork image (PNG/JPG)
- Artist description (optional)
- License terms (optional)

### Frontend State

```typescript
interface GiftCard {
    tokenId: string;
    owner: string;
    metadataURI: string;
    metadata: NFTMetadata;
    vault: {
        tokenAddress: string;
        tokenSymbol: string;
        amount: string;
        liquidated: boolean;
    };
}

interface MarketplaceListing {
    listingId: string;
    type: 'artist' | 'giftcard';
    price: string;
    seller: string;
    imageUrl: string;
    // ... additional fields
}
```

## Error Handling

### Smart Contract Errors

```solidity
error InsufficientBalance();
error InvalidTokenAddress();
error NotTokenOwner();
error AlreadyLiquidated();
error InvalidListing();
error InsufficientPayment();
error TransferFailed();
```

**Error Handling Strategy:**
- Use custom errors (gas efficient)
- Emit events for all state changes
- Validate inputs with require statements
- Use ReentrancyGuard for token transfers

### Frontend Error Handling

**Categories:**
1. **Wallet Errors**
   - Not connected
   - Wrong network
   - Insufficient gas
   - User rejected transaction

2. **Contract Errors**
   - Transaction reverted
   - Insufficient token balance
   - Invalid token address

3. **IPFS Errors**
   - Upload failed
   - Fetch timeout
   - Invalid CID

4. **AI Generation Errors**
   - API rate limit
   - Generation failed
   - Invalid prompt

**User Feedback:**
- Toast notifications for errors
- Loading states during transactions
- Transaction confirmation modals
- Retry mechanisms for failed uploads

## Testing Strategy

### Smart Contract Testing

**Framework:** Hardhat with Chai/Mocha

**Test Categories:**

1. **Unit Tests**
   - GiftCardNFT minting with token deposits
   - Liquidation logic and token transfers
   - Marketplace listing creation and cancellation
   - Purchase flows with payment validation

2. **Integration Tests**
   - End-to-end gift card creation and liquidation
   - Marketplace purchase with NFT transfer
   - Multiple token types (USDC, DAI, custom ERC-20)

3. **Security Tests**
   - Reentrancy attack prevention
   - Authorization checks (only owner can liquidate)
   - Double liquidation prevention
   - Invalid token address handling

**Test Coverage Target:** >90% for smart contracts

### Frontend Testing

**Framework:** Vitest + React Testing Library

**Test Categories:**

1. **Component Tests**
   - Wallet connection flow
   - Form validation (create gift card)
   - Marketplace listing display

2. **Integration Tests**
   - Complete gift card creation flow
   - Purchase flow with wallet interaction (mocked)
   - Claim flow from email link

3. **E2E Tests (Optional)**
   - Using Playwright with local testnet
   - Full user journeys

### Manual Testing Checklist

- [ ] Deploy contracts to testnet (Sepolia/Mumbai)
- [ ] Test with real wallet on testnet
- [ ] Verify IPFS uploads and retrieval
- [ ] Test AI art generation with various prompts
- [ ] Send test emails and verify claim links
- [ ] Test on mobile wallets via WalletConnect
- [ ] Verify gas costs are reasonable

## Deployment Strategy

### Smart Contracts

**Networks (Testnet Only):**
1. Local (Hardhat network) - development
2. Mumbai (Polygon testnet) - production deployment

**Note:** This project is designed exclusively for Polygon Mumbai testnet. No mainnet deployment is planned. All tokens used will be testnet MATIC and testnet ERC-20 tokens with no real value.

**Deployment Steps:**
1. Compile contracts with optimization
2. Deploy mock ERC-20 tokens for testing (TestUSDC, TestDAI) to Mumbai
3. Deploy GiftCardNFT contract to Mumbai testnet
4. Deploy Marketplace contract with GiftCardNFT address to Mumbai
5. Verify contracts on PolygonScan (Mumbai)
6. Update frontend with Mumbai contract addresses and RPC URLs
7. Document Mumbai faucet links for users to get test MATIC

### Frontend

**Hosting Options (Free & Decentralized):**
- **Fleek** (IPFS hosting with CI/CD)
- **Vercel** (free tier, Web2 but reliable)
- **Netlify** (free tier)

**Environment Configuration:**
```typescript
const config = {
    contracts: {
        giftCardNFT: process.env.VITE_GIFT_CARD_ADDRESS,
        marketplace: process.env.VITE_MARKETPLACE_ADDRESS,
    },
    ipfs: {
        gateway: 'https://w3s.link/ipfs/',
        apiKey: process.env.VITE_WEB3_STORAGE_KEY,
    },
    ai: {
        apiKey: process.env.VITE_HUGGINGFACE_KEY,
    },
};
```

## Security Considerations

1. **Smart Contract Security**
   - Use OpenZeppelin audited contracts
   - Implement ReentrancyGuard
   - Follow checks-effects-interactions pattern
   - Consider audit before mainnet (optional: free audits via Code4rena)

2. **Frontend Security**
   - Validate all user inputs
   - Sanitize email addresses
   - Use HTTPS for all API calls
   - Never expose private keys

3. **IPFS Security**
   - Verify content hashes match
   - Pin important content to prevent loss
   - Use content addressing for integrity

4. **Email Security**
   - Rate limit claim link generation
   - Implement token expiry
   - Verify ownership before transfer

## Performance Optimization

1. **Gas Optimization**
   - Batch operations where possible
   - Use events instead of storage for historical data
   - Optimize struct packing
   - Use uint256 for counters

2. **Frontend Performance**
   - Lazy load images from IPFS
   - Cache metadata locally
   - Use React.memo for expensive components
   - Implement pagination for marketplace

3. **IPFS Performance**
   - Use multiple gateways for redundancy
   - Implement retry logic
   - Cache frequently accessed content
   - Preload images on hover

## Future Enhancements (Out of Scope for MVP)

- Multi-chain support with bridge
- Batch gift card creation
- Recurring gifts (subscription model)
- Gift card templates and themes
- Social features (gift history, leaderboard)
- Mobile app (React Native)
- Gasless transactions (meta-transactions)
- Platform fees and revenue model
