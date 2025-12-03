import { useState, useEffect } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { formatUnits } from 'viem';
import { MarketplaceABI } from '../contracts/abis';
import { MARKETPLACE_ADDRESS } from '../contracts/addresses';
import { getIPFSUrl } from '../services/ipfs';
import { useToast } from '../components/ToastContainer';
import { parseContractError } from '../utils/contractUtils';

interface ArtistListing {
  listingId: bigint;
  artist: string;
  ipfsHash: string;
  price: bigint;
  active: boolean;
  metadata?: any;
}

interface GiftCardListing {
  listingId: bigint;
  seller: string;
  tokenId: bigint;
  price: bigint;
  active: boolean;
  metadata?: any;
  vaultAmount?: bigint;
  vaultToken?: string;
}

export default function Marketplace() {
  const { isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const { showSuccess, showError, showInfo } = useToast();
  const [activeTab, setActiveTab] = useState<'designs' | 'giftcards'>('designs');
  const [artistListings, setArtistListings] = useState<ArtistListing[]>([]);
  const [giftCardListings, setGiftCardListings] = useState<GiftCardListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadListings();
  }, [activeTab]);

  const loadListings = async () => {
    setLoading(true);
    try {
      if (activeTab === 'designs') {
        await loadArtistListings();
      } else {
        await loadGiftCardListings();
      }
    } catch (err) {
      setError('Failed to load listings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadArtistListings = async () => {
    // For now, show empty state - marketplace listings require event indexing
    // In production, use a subgraph or backend indexer
    console.log('Artist listings feature requires event indexing service');
    setArtistListings([]);
  };

  const loadGiftCardListings = async () => {
    // For now, show empty state - marketplace listings require event indexing
    // In production, use a subgraph or backend indexer
    console.log('Gift card listings feature requires event indexing service');
    setGiftCardListings([]);
  };

  const handlePurchaseDesign = async (listingId: bigint, price: bigint) => {
    if (!isConnected) {
      showError('Please connect your wallet');
      return;
    }

    showInfo('Purchasing artist design...');

    try {
      writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: MarketplaceABI,
        functionName: 'purchaseArtistDesign',
        args: [listingId],
        value: price,
      }, {
        onSuccess: (hash) => {
          showSuccess('Artist design purchased successfully!', hash);
          setTimeout(() => loadListings(), 3000);
        },
        onError: (err) => {
          const errorMsg = parseContractError(err);
          setError(errorMsg);
          showError(errorMsg);
        },
      });
    } catch (err) {
      const errorMsg = 'Failed to purchase design';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  const handlePurchaseGiftCard = async (listingId: bigint, price: bigint) => {
    if (!isConnected) {
      showError('Please connect your wallet');
      return;
    }

    showInfo('Purchasing gift card...');

    try {
      writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: MarketplaceABI,
        functionName: 'purchaseGiftCard',
        args: [listingId],
        value: price,
      }, {
        onSuccess: (hash) => {
          showSuccess('Gift card purchased successfully!', hash);
          setTimeout(() => loadListings(), 3000);
        },
        onError: (err) => {
          const errorMsg = parseContractError(err);
          setError(errorMsg);
          showError(errorMsg);
        },
      });
    } catch (err) {
      const errorMsg = 'Failed to purchase gift card';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  return (
    <div className="marketplace-page">
      <h2>🛒 Marketplace</h2>

      <div className="tabs">
        <button
          className={activeTab === 'designs' ? 'active' : ''}
          onClick={() => setActiveTab('designs')}
        >
          🎨 Artist Designs
        </button>
        <button
          className={activeTab === 'giftcards' ? 'active' : ''}
          onClick={() => setActiveTab('giftcards')}
        >
          🎁 Gift Cards
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {activeTab === 'designs' && (
            <div className="listings-grid">
              {artistListings.length === 0 ? (
                <div className="info-box">
                  <p>🎨 Artist Design Marketplace</p>
                  <p>This feature requires an event indexing service (like The Graph) to efficiently query marketplace listings.</p>
                  <p>For now, you can create and trade gift cards directly!</p>
                </div>
              ) : (
                artistListings.map((listing) => (
                  <div key={listing.listingId.toString()} className="listing-card">
                    <img
                      src={getIPFSUrl(`ipfs://${listing.ipfsHash}`)}
                      alt="Artist design"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="listing-info">
                      <p className="artist">By: {listing.artist.slice(0, 6)}...{listing.artist.slice(-4)}</p>
                      <p className="price">{formatUnits(listing.price, 18)} MATIC</p>
                      <button onClick={() => handlePurchaseDesign(listing.listingId, listing.price)}>
                        Purchase Design
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'giftcards' && (
            <div className="listings-grid">
              {giftCardListings.length === 0 ? (
                <div className="info-box">
                  <p>🎁 Gift Card Marketplace</p>
                  <p>This feature requires an event indexing service (like The Graph) to efficiently query marketplace listings.</p>
                  <p>To list your gift card for sale:</p>
                  <ol style={{ textAlign: 'left', marginLeft: '20px' }}>
                    <li>Go to "My Gifts"</li>
                    <li>Click "List for Sale" on any gift card</li>
                    <li>Set your price</li>
                  </ol>
                  <p>Note: Listings will appear here once indexing is set up.</p>
                </div>
              ) : (
                giftCardListings.map((listing) => (
                  <div key={listing.listingId.toString()} className="listing-card">
                    {listing.metadata && listing.metadata.image && (
                      <img
                        src={getIPFSUrl(listing.metadata.image)}
                        alt={listing.metadata.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    )}
                    <div className="listing-info">
                      <h3>{listing.metadata?.name || `Gift Card #${listing.tokenId}`}</h3>
                      {listing.metadata?.description && (
                        <p className="description">{listing.metadata.description}</p>
                      )}
                      <p className="vault-info">
                        Contains: {listing.vaultAmount ? formatUnits(listing.vaultAmount, 18) : '0'} tokens
                      </p>
                      <p className="price">Price: {formatUnits(listing.price, 18)} MATIC</p>
                      <p className="seller">Seller: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}</p>
                      <button onClick={() => handlePurchaseGiftCard(listing.listingId, listing.price)}>
                        Purchase Gift Card
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
