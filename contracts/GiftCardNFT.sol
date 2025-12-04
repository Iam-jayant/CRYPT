// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GiftCardNFT
 * @dev ERC-721 NFT that holds ERC-20 tokens in a vault
 */
contract GiftCardNFT is ERC721URIStorage, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct TokenVault {
        address tokenAddress;
        uint256 amount;
        bool liquidated;
    }

    mapping(uint256 => TokenVault) private _vaults;
    uint256 private _tokenIdCounter;

    event GiftCardCreated(
        uint256 indexed tokenId,
        address indexed creator,
        address tokenAddress,
        uint256 amount
    );
    
    event GiftCardLiquidated(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 amount
    );

    error InsufficientBalance();
    error InvalidTokenAddress();
    error NotTokenOwner();
    error AlreadyLiquidated();
    error TransferFailed();

    constructor() ERC721("GiftCardNFT", "GIFT") Ownable(msg.sender) {}

    /**
     * @dev Creates a new gift card NFT with embedded tokens
     * @param metadataURI IPFS URI for NFT metadata
     * @param tokenAddress ERC-20 token contract address
     * @param tokenAmount Amount of tokens to deposit
     * @return tokenId The ID of the newly minted NFT
     */
    function createGiftCard(
        string memory metadataURI,
        address tokenAddress,
        uint256 tokenAmount
    ) external nonReentrant returns (uint256) {
        if (tokenAddress == address(0)) revert InvalidTokenAddress();
        if (tokenAmount == 0) revert InsufficientBalance();

        // Verify token contract
        IERC20 token = IERC20(tokenAddress);
        if (token.balanceOf(msg.sender) < tokenAmount) revert InsufficientBalance();

        // Transfer tokens to this contract
        token.safeTransferFrom(msg.sender, address(this), tokenAmount);

        // Mint NFT
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // Store vault data
        _vaults[tokenId] = TokenVault({
            tokenAddress: tokenAddress,
            amount: tokenAmount,
            liquidated: false
        });

        emit GiftCardCreated(tokenId, msg.sender, tokenAddress, tokenAmount);

        return tokenId;
    }

    /**
     * @dev Liquidates a gift card, transferring tokens to the owner
     * @param tokenId The ID of the gift card to liquidate
     */
    function liquidate(uint256 tokenId) external nonReentrant {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        
        TokenVault storage vault = _vaults[tokenId];
        if (vault.liquidated) revert AlreadyLiquidated();

        vault.liquidated = true;
        
        IERC20 token = IERC20(vault.tokenAddress);
        token.safeTransfer(msg.sender, vault.amount);

        emit GiftCardLiquidated(tokenId, msg.sender, vault.amount);
    }

    /**
     * @dev Returns the vault contents for a gift card
     * @param tokenId The ID of the gift card
     * @return vault The TokenVault struct
     */
    function getVaultContents(uint256 tokenId) external view returns (TokenVault memory) {
        return _vaults[tokenId];
    }

    /**
     * @dev Returns the metadata URI for a gift card
     * @param tokenId The ID of the gift card
     * @return The IPFS metadata URI
     */
    function getMetadataURI(uint256 tokenId) external view returns (string memory) {
        return tokenURI(tokenId);
    }

    /**
     * @dev Returns the total number of gift cards minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
}