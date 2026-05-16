import 'server-only';

const CHAPA_BASE = 'https://api.chapa.co/v1';

function secretKey(): string {
  const k = process.env.CHAPA_SECRET_KEY;
  if (!k) throw new Error('CHAPA_SECRET_KEY env var is not configured');
  return k;
}

export interface ChapaInitPayload {
  amount: string;
  currency: string;
  tx_ref: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  callback_url: string;
  return_url: string;
  customization?: {
    title?: string;
    description?: string;
    logo?: string;
  };
}

export interface ChapaInitResponse {
  status: 'success' | string;
  message: string;
  data?: { checkout_url: string };
}

export async function initializeTransaction(
  payload: ChapaInitPayload,
): Promise<ChapaInitResponse> {
  const res = await fetch(`${CHAPA_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export interface ChapaVerifyResponse {
  status: 'success' | string;
  message: string;
  data?: {
    status: 'success' | 'pending' | 'failed' | string;
    reference: string;
    tx_ref: string;
    amount: string | number;
    currency: string;
    charge: string | number;
    type: string;
    method: string;
  };
}

export async function verifyTransaction(tx_ref: string): Promise<ChapaVerifyResponse> {
  const res = await fetch(`${CHAPA_BASE}/transaction/verify/${encodeURIComponent(tx_ref)}`, {
    headers: {
      Authorization: `Bearer ${secretKey()}`,
    },
  });
  return res.json();
}
