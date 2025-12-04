// Note: HuggingFace Inference API has CORS restrictions for browser calls
// For production, you should use a backend proxy or a different service
// For now, we'll use Pollinations.ai which is free and CORS-friendly
const POLLINATIONS_API_URL = 'https://image.pollinations.ai/prompt';

export async function generateArt(prompt: string): Promise<Blob> {
  const enhancedPrompt = enhancePrompt(prompt);

  try {
    // Try Pollinations.ai first (free, no API key needed, CORS-friendly)
    const response = await fetch(
      `${POLLINATIONS_API_URL}/${encodeURIComponent(enhancedPrompt)}?width=512&height=512&nologo=true`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new Error(`Generation failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    
    if (blob.size === 0) {
      throw new Error('Generated image is empty');
    }

    return blob;
  } catch (error) {
    console.error('AI art generation error:', error);
    
    // Fallback: Generate a placeholder image with the prompt text
    return generatePlaceholderImage(prompt);
  }
}

// Fallback function to generate a placeholder image
async function generatePlaceholderImage(prompt: string): Promise<Blob> {
  // Create a canvas with a nice gradient and the prompt text
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not create canvas context');
  }

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  // Add decorative elements
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.arc(256, 256, 50 + i * 40, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Add text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Word wrap the prompt
  const words = prompt.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 450 && currentLine !== '') {
      lines.push(currentLine);
      currentLine = word + ' ';
    } else {
      currentLine = testLine;
    }
  });
  lines.push(currentLine);

  // Draw lines
  const lineHeight = 30;
  const startY = 256 - (lines.length * lineHeight) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line.trim(), 256, startY + i * lineHeight);
  });

  // Add "Gift Card" text at bottom
  ctx.font = 'italic 20px Arial';
  ctx.fillText('🎁 Gift Card Design 🎁', 256, 480);

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create placeholder image'));
      }
    }, 'image/png');
  });
}

export function enhancePrompt(userPrompt: string): string {
  const giftCardStyle = 'beautiful gift card design, elegant, festive, high quality, digital art, vibrant colors';
  return `${userPrompt}, ${giftCardStyle}`;
}
