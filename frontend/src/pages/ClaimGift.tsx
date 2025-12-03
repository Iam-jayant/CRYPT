import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useSearchParams } from 'react-router-dom';
import { formatUnits } from 'viem';

export default function ClaimGift() {
  const { address, isConnected } = useAccount();
  const [searchParams] = useSearchParams();
  const [tokenId, setTokenId] = useState<bigint | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [vaultInfo, setVaultInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      decodeClaimToken(token);
    } else {
      setError('Invalid claim link');
      setLoading(false);
    }
  }, [token]);

  const decodeClaimToken = async (claimToken: string) => {
    try {
      // Decode the claim token (base64 encoded tokenId)
      const decoded = atob(claimToken);
      const tid = BigInt(decoded);
      setTokenId(tid);

      // Load gift card details
      await loadGiftCardDetails(tid);
    } catch (err) {
      setError('Invalid claim token');
      setLoading(false);
    }
  };

  const loadGiftCardDetails = async (tid: bigint) => {
    try {
      // TODO: Implement proper metadata and vault fetching
      // For now, set placeholder data
      await fetchMetadataURI(tid);
      setMetadata({
        name: 'Gift Card',
        description: 'Placeholder gift card',
        image: 'ipfs://placeholder',
      });

      // Fetch vault contents
      const vault = await fetchVaultContents(tid);
      setVaultInfo(vault);

      setLoading(false);
    } catch (err) {
      setError('Failed to load gift card details');
      setLoading(false);
    }
  };

  const fetchMetadataURI = async (_tid: bigint): Promise<string> => {
    // TODO: Call tokenURI on contract
    return 'ipfs://...';
  };

  const fetchVaultContents = async (_tid: bigint) => {
    // TODO: Call getVaultContents on contract
    return {
      token: '0x...',
      amount: BigInt(0),
      isLiquidated: false,
      symbol: 'TOKEN',
    };
  };

  const handleClaim = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet to claim');
      return;
    }

    if (!tokenId) {
      setError('Invalid token ID');
      return;
    }

    setClaiming(true);
    setError(null);

    try {
      // TODO: Implement proper claim mechanism
      // This requires either:
      // 1. A claim function in the contract
      // 2. The sender to have approval to transfer
      // 3. A signature-based claim system
      
      // Placeholder - would need proper implementation
      setError('Claim functionality requires contract implementation');
      console.log('Attempting to claim token:', tokenId);
      
      // Example of what the call would look like:
      // writeContract({
      //   address: GIFT_CARD_NFT_ADDRESS,
      //   abi: GiftCardNFTABI,
      //   functionName: 'claimGiftCard', // Would need this function in contract
      //   args: [tokenId],
      // });
    } catch (err) {
      setError('Failed to claim gift card');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="claim-page">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error && !metadata) {
    return (
      <div className="claim-page">
        <h2>❌ Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="claim-page">
      <h2>🎁 Claim Your Gift Card</h2>

      {metadata && (
        <div className="gift-card-preview">
          <img
            src={metadata.image?.replace('ipfs://', 'https://ipfs.io/ipfs/')}
            alt={metadata.name}
          />
          <h3>{metadata.name}</h3>
          <p>{metadata.description}</p>

          {vaultInfo && (
            <div className="vault-info">
              <h4>Gift Card Contains:</h4>
              <p className="amount">
                {formatUnits(vaultInfo.amount, 18)} {vaultInfo.symbol}
              </p>
              <p className="status">
                Status: {vaultInfo.isLiquidated ? '✅ Already Claimed' : '🎁 Ready to Claim'}
              </p>
            </div>
          )}
        </div>
      )}

      {!isConnected ? (
        <div className="connect-prompt">
          <p>Connect your wallet to claim this gift card</p>
        </div>
      ) : vaultInfo?.isLiquidated ? (
        <div className="already-claimed">
          <p>This gift card has already been claimed.</p>
        </div>
      ) : (
        <button onClick={handleClaim} disabled={claiming}>
          {claiming ? 'Claiming...' : '🎁 Claim Gift Card'}
        </button>
      )}

      {error && <div className="error">{error}</div>}

      <div className="info-box">
        <p>💡 After claiming, the gift card NFT will be transferred to your wallet. You can then liquidate it to receive the tokens.</p>
      </div>
    </div>
  );
}
