const WEB3_STORAGE_API_KEY = import.meta.env.VITE_WEB3_STORAGE_API_KEY;
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

// Multiple IPFS gateways for redundancy
const GATEWAY_OPTIONS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
];

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

// Mock IPFS storage for development/testing
const mockStorage = new Map<string, Blob | string>();
let mockCidCounter = 0;

function generateMockCID(): string {
  mockCidCounter++;
  return `Qm${mockCidCounter.toString().padStart(44, '0')}mock`;
}

export async function uploadImage(imageBlob: Blob): Promise<string> {
  // For development: Use mock storage if no API key
  if (!WEB3_STORAGE_API_KEY) {
    console.warn('No IPFS API key - using mock storage for development');
    const mockCid = generateMockCID();
    mockStorage.set(mockCid, imageBlob);
    return mockCid;
  }

  try {
    // Try NFT.Storage API (free and reliable)
    const formData = new FormData();
    formData.append('file', imageBlob);

    const response = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WEB3_STORAGE_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value.cid;
  } catch (error) {
    console.error('IPFS image upload error:', error);
    
    // Fallback to mock storage
    console.warn('Falling back to mock storage');
    const mockCid = generateMockCID();
    mockStorage.set(mockCid, imageBlob);
    return mockCid;
  }
}

export async function uploadMetadata(metadata: NFTMetadata): Promise<string> {
  // For development: Use mock storage if no API key
  if (!WEB3_STORAGE_API_KEY) {
    console.warn('No IPFS API key - using mock storage for development');
    const mockCid = generateMockCID();
    mockStorage.set(mockCid, JSON.stringify(metadata));
    return `ipfs://${mockCid}`;
  }

  try {
    const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', blob, 'metadata.json');

    const response = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WEB3_STORAGE_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return `ipfs://${data.value.cid}`;
  } catch (error) {
    console.error('IPFS metadata upload error:', error);
    
    // Fallback to mock storage
    console.warn('Falling back to mock storage');
    const mockCid = generateMockCID();
    mockStorage.set(mockCid, JSON.stringify(metadata));
    return `ipfs://${mockCid}`;
  }
}

export async function fetchMetadata(ipfsUri: string): Promise<NFTMetadata> {
  try {
    const cid = ipfsUri.replace('ipfs://', '');
    
    // Check mock storage first
    if (mockStorage.has(cid)) {
      const data = mockStorage.get(cid);
      if (typeof data === 'string') {
        return JSON.parse(data);
      }
    }
    
    // Try multiple gateways
    for (const gateway of GATEWAY_OPTIONS) {
      try {
        const url = `${gateway}${cid}`;
        const response = await fetch(url, {
          signal: AbortSignal.timeout(10000),
        });

        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.warn(`Gateway ${gateway} failed, trying next...`);
      }
    }
    
    throw new Error('All gateways failed');
  } catch (error) {
    console.error('IPFS metadata fetch error:', error);
    throw new Error('Failed to fetch metadata from IPFS');
  }
}

export async function fetchImage(ipfsUri: string): Promise<string> {
  try {
    const cid = ipfsUri.replace('ipfs://', '');
    
    // Check mock storage first
    if (mockStorage.has(cid)) {
      const blob = mockStorage.get(cid);
      if (blob instanceof Blob) {
        return URL.createObjectURL(blob);
      }
    }
    
    return `${IPFS_GATEWAY}${cid}`;
  } catch (error) {
    console.error('IPFS image fetch error:', error);
    throw new Error('Failed to fetch image from IPFS');
  }
}

export function getIPFSUrl(ipfsUri: string): string {
  const cid = ipfsUri.replace('ipfs://', '');
  
  // Check mock storage first
  if (mockStorage.has(cid)) {
    const data = mockStorage.get(cid);
    if (data instanceof Blob) {
      return URL.createObjectURL(data);
    }
  }
  
  return `${IPFS_GATEWAY}${cid}`;
}
