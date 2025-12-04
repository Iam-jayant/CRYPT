import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export interface GiftCardEmailData {
  recipientEmail: string;
  senderAddress: string;
  tokenId: string;
  tokenSymbol: string;
  amount: string;
  claimUrl: string;
  txHash: string;
  explorerUrl: string;
}

export async function sendGiftCardEmail(data: GiftCardEmailData): Promise<void> {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn('EmailJS not configured - skipping email send');
    throw new Error('Email service not configured. Please add EmailJS credentials to .env file.');
  }

  try {
    const templateParams = {
      to_email: data.recipientEmail,
      sender_address: data.senderAddress,
      token_id: data.tokenId,
      token_symbol: data.tokenSymbol,
      amount: data.amount,
      claim_url: data.claimUrl,
      tx_hash: data.txHash,
      explorer_url: data.explorerUrl,
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    if (response.status !== 200) {
      throw new Error(`Email send failed with status: ${response.status}`);
    }

    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email notification');
  }
}

export function isEmailConfigured(): boolean {
  return !!(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);
}
