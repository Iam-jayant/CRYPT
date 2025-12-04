// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Marketplace
 * @dev Marketplace for artist designs and gift card NFTs
 */
contract Marketplace is ReentrancyGuard, Ownable {
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

    IERC721 public giftCardNFT;
    
    mapping(uint256 => ArtistListing) private _artistListings;
    mapping(uint256 => GiftCardListing) private _giftCardListings;
    
    uint256 private _artistListingCounter;
    uint256 private _giftCardListingCounter;

    event ArtistListingCreated(
        uint256 indexed listingId,
        address indexed artist,
        uint256 price
    );
    
    event ArtistDesignPurchased(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed artist
    );
    
    event GiftCardListed(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        uint256 price
    );
    
    event GiftCardSold(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address buyer
    );

    event ListingCancelled(uint256 indexed listingId, string listingType);

    error InvalidListing();
    error InsufficientPayment();
    error NotSeller();
    error TransferFailed();
    error NotApproved();

    constructor(address _giftCardNFT) Ownable(msg.sender) {
        giftCardNFT = IERC721(_giftCardNFT);
    }

    /**
     * @dev Creates a new artist listing
     * @param ipfsHash IPFS hash of the artwork
     * @param price Price in wei
     * @return listingId The ID of the created listing
     */
    function createArtistListing(
        string memory ipfsHash,
        uint256 price
    ) external returns (uint256) {
        if (bytes(ipfsHash).length == 0) revert InvalidListing();
        if (price == 0) revert InvalidListing();

        uint256 listingId = _artistListingCounter++;
        
        _artistListings[listingId] = ArtistListing({
            listingId: listingId,
            artist: msg.sender,
            ipfsHash: ipfsHash,
            price: price,
            active: true
        });

        emit ArtistListingCreated(listingId, msg.sender, price);
        
        return listingId;
    }

    /**
     * @dev Purchases an artist design
     * @param listingId The ID of the listing to purchase
     * @return ipfsHash The IPFS hash of the purchased design
     */
    function purchaseArtistDesign(uint256 listingId) 
        external 
        payable 
        nonReentrant 
        returns (string memory) 
    {
        ArtistListing storage listing = _artistListings[listingId];
        
        if (!listing.active) revert InvalidListing();
        if (msg.value < listing.price) revert InsufficientPayment();

        listing.active = false;

        // Transfer payment to artist
        (bool success, ) = listing.artist.call{value: msg.value}("");
        if (!success) revert TransferFailed();

        emit ArtistDesignPurchased(listingId, msg.sender, listing.artist);

        return listing.ipfsHash;
    }

    /**
     * @dev Cancels an artist listing
     * @param listingId The ID of the listing to cancel
     */
    function cancelArtistListing(uint256 listingId) external {
        ArtistListing storage listing = _artistListings[listingId];
        
        if (listing.artist != msg.sender) revert NotSeller();
        if (!listing.active) revert InvalidListing();

        listing.active = false;

        emit ListingCancelled(listingId, "artist");
    }

    /**
     * @dev Lists a gift card NFT for sale
     * @param tokenId The ID of the NFT to list
     * @param price Price in wei
     * @return listingId The ID of the created listing
     */
    function listGiftCard(uint256 tokenId, uint256 price) 
        external 
        returns (uint256) 
    {
        if (giftCardNFT.ownerOf(tokenId) != msg.sender) revert NotSeller();
        if (price == 0) revert InvalidListing();
        if (giftCardNFT.getApproved(tokenId) != address(this)) revert NotApproved();

        // Transfer NFT to marketplace for escrow
        giftCardNFT.transferFrom(msg.sender, address(this), tokenId);

        uint256 listingId = _giftCardListingCounter++;
        
        _giftCardListings[listingId] = GiftCardListing({
            listingId: listingId,
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true
        });

        emit GiftCardListed(listingId, tokenId, price);
        
        return listingId;
    }

    /**
     * @dev Purchases a listed gift card
     * @param listingId The ID of the listing to purchase
     */
    function purchaseGiftCard(uint256 listingId) external payable nonReentrant {
        GiftCardListing storage listing = _giftCardListings[listingId];
        
        if (!listing.active) revert InvalidListing();
        if (msg.value < listing.price) revert InsufficientPayment();

        listing.active = false;

        // Transfer NFT to buyer
        giftCardNFT.transferFrom(address(this), msg.sender, listing.tokenId);

        // Transfer payment to seller
        (bool success, ) = listing.seller.call{value: msg.value}("");
        if (!success) revert TransferFailed();

        emit GiftCardSold(listingId, listing.tokenId, msg.sender);
    }

    /**
     * @dev Cancels a gift card listing
     * @param listingId The ID of the listing to cancel
     */
    function cancelGiftCardListing(uint256 listingId) external nonReentrant {
        GiftCardListing storage listing = _giftCardListings[listingId];
        
        if (listing.seller != msg.sender) revert NotSeller();
        if (!listing.active) revert InvalidListing();

        listing.active = false;

        // Return NFT to seller
        giftCardNFT.transferFrom(address(this), msg.sender, listing.tokenId);

        emit ListingCancelled(listingId, "giftcard");
    }

    /**
     * @dev Returns all artist listings
     */
    function getArtistListings() external view returns (ArtistListing[] memory) {
        ArtistListing[] memory listings = new ArtistListing[](_artistListingCounter);
        for (uint256 i = 0; i < _artistListingCounter; i++) {
            listings[i] = _artistListings[i];
        }
        return listings;
    }

    /**
     * @dev Returns all gift card listings
     */
    function getGiftCardListings() external view returns (GiftCardListing[] memory) {
        GiftCardListing[] memory listings = new GiftCardListing[](_giftCardListingCounter);
        for (uint256 i = 0; i < _giftCardListingCounter; i++) {
            listings[i] = _giftCardListings[i];
        }
        return listings;
    }

    /**
     * @dev Returns a specific artist listing
     */
    function getArtistListing(uint256 listingId) external view returns (ArtistListing memory) {
        return _artistListings[listingId];
    }

    /**
     * @dev Returns a specific gift card listing
     */
    function getGiftCardListing(uint256 listingId) external view returns (GiftCardListing memory) {
        return _giftCardListings[listingId];
    }
}
