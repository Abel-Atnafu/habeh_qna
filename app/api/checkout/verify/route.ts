import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyTransaction } from '@/lib/chapa';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handle(tx_ref: string) {
  if (!tx_ref) {
    return NextResponse.json({ error: 'Missing tx_ref' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Idempotency check — already settled?
  const { data: existing } = await admin
    .from('orders')
    .select('id, payment_status, total')
    .eq('tx_ref', tx_ref)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  if (existing.payment_status !== 'pending') {
    return NextResponse.json({
      status: existing.payment_status,
      tx_ref,
      already: true,
    });
  }

  // Verify with Chapa
  const result = await verifyTransaction(tx_ref);
  const ok =
    result.status === 'success' &&
    (result.data?.status === 'success' || result.data?.status === 'succeeded');

  if (!ok) {
    // Atomic update only if still pending
    await admin
      .from('orders')
      .update({ payment_status: 'failed' })
      .eq('tx_ref', tx_ref)
      .eq('payment_status', 'pending');
    return NextResponse.json({ status: 'failed', tx_ref });
  }

  await admin
    .from('orders')
    .update({
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
      chapa_ref_id: result.data?.reference ?? null,
    })
    .eq('tx_ref', tx_ref)
    .eq('payment_status', 'pending');

  return NextResponse.json({ status: 'paid', tx_ref });
}

export async function POST(req: NextRequest) {
  let body: { tx_ref?: string; trx_ref?: string } | null = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }
  const tx_ref =
    body?.tx_ref || body?.trx_ref || req.nextUrl.searchParams.get('tx_ref') || '';
  return handle(tx_ref);
}

export async function GET(req: NextRequest) {
  const tx_ref =
    req.nextUrl.searchParams.get('tx_ref') ||
    req.nextUrl.searchParams.get('trx_ref') ||
    '';
  return handle(tx_ref);
}
