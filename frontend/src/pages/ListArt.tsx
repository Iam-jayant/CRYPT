import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { uploadImage } from '../services/ipfs';
import { MarketplaceABI } from '../contracts/abis';
import { MARKETPLACE_ADDRESS } from '../contracts/addresses';
import { useToast } from '../components/ToastContainer';
import { parseContractError } from '../utils/contractUtils';

export default function ListArt() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const { showSuccess, showError, showInfo } = useToast();

  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArtworkFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setArtworkPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateListing = async () => {
    if (!isConnected || !address) {
      showError('Please connect your wallet');
      return;
    }

    if (!artworkFile) {
      showError('Please select an artwork file');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      showError('Please enter a valid price');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      showInfo('Uploading artwork to IPFS...');
      
      // Upload artwork to IPFS
      const cid = await uploadImage(artworkFile);
      const priceInWei = parseUnits(price, 18);

      showInfo('Creating marketplace listing...');

      // Create artist listing
      writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: MarketplaceABI,
        functionName: 'createArtistListing',
        args: [cid, priceInWei],
      }, {
        onSuccess: (hash) => {
          setSuccess('Artwork listed successfully!');
          showSuccess('Artwork listed successfully on marketplace!', hash);
          setArtworkFile(null);
          setArtworkPreview(null);
          setPrice('');
        },
        onError: (err) => {
          const errorMsg = parseContractError(err);
          setError(errorMsg);
          showError(errorMsg);
        },
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to list artwork';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="list-art-page">
        <h2>List Your Art</h2>
        <p>Please connect your wallet to list your artwork.</p>
      </div>
    );
  }

  return (
    <div className="list-art-page">
      <h2>🎨 List Your Art</h2>

      <div className="form-section">
        <label>
          Upload Artwork
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>

        {artworkPreview && (
          <div className="preview">
            <h3>Preview</h3>
            <img src={artworkPreview} alt="Artwork preview" />
          </div>
        )}

        <label>
          Price (MATIC)
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.0"
            step="0.01"
            min="0"
            disabled={isUploading}
          />
        </label>

        <button onClick={handleCreateListing} disabled={isUploading || !artworkFile || !price}>
          {isUploading ? 'Uploading...' : '📝 Create Listing'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="info-box">
        <p>💡 Your artwork will be uploaded to IPFS and listed on the marketplace. Buyers can purchase your design to use for their gift cards.</p>
      </div>
    </div>
  );
}
