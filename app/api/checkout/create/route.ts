import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STORAGE_BUCKET = 'yeroo-uploads';
const PROOF_FOLDER = 'payment-proofs';
const MAX_PROOF_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_PROOF_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface CartLineInput {
  menu_item_id: string;
  qty: number;
}

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad('Invalid form payload');
  }

  // ── Parse + validate the JSON-encoded fields ──
  let lines: CartLineInput[];
  try {
    lines = JSON.parse(String(form.get('lines') ?? '[]'));
  } catch {
    return bad('Invalid lines field');
  }
  if (!Array.isArray(lines) || lines.length === 0) return bad('Cart is empty');

  const name = String(form.get('name') ?? '').trim();
  const phone = String(form.get('phone') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const deliveryType = String(form.get('delivery_type') ?? '');
  const deliveryAddress = String(form.get('delivery_address') ?? '').trim();
  const notes = String(form.get('notes') ?? '').trim();
  const paymentMethod = String(form.get('payment_method') ?? '');
  const paymentReference = String(form.get('payment_reference') ?? '').trim();
  const proof = form.get('payment_proof');

  if (!name || !phone) return bad('Name and phone are required');
  if (deliveryType !== 'pickup' && deliveryType !== 'delivery') return bad('Invalid delivery type');
  if (deliveryType === 'delivery' && !deliveryAddress) return bad('Delivery address required');
  if (paymentMethod !== 'telebirr' && paymentMethod !== 'cbe') return bad('Pick Telebirr or CBE');
  if (!paymentReference) return bad('Transaction reference is required');
  if (!(proof instanceof File) || proof.size === 0) return bad('Payment screenshot is required');
  if (!ACCEPTED_PROOF_TYPES.includes(proof.type)) {
    return bad('Screenshot must be a JPG, PNG, or WebP');
  }
  if (proof.size > MAX_PROOF_BYTES) return bad('Screenshot is too large (max 5 MB)');

  // ── Dedupe / sanity-check the cart lines ──
  const qtyById = new Map<string, number>();
  for (const l of lines) {
    if (!l.menu_item_id || typeof l.qty !== 'number' || l.qty <= 0) {
      return bad('Invalid cart line');
    }
    qtyById.set(l.menu_item_id, (qtyById.get(l.menu_item_id) ?? 0) + Math.floor(l.qty));
  }

  const admin = createAdminClient();

  // ── Re-fetch live menu prices (never trust the client) ──
  const ids = Array.from(qtyById.keys());
  const { data: items, error: fetchErr } = await admin
    .from('menu_items')
    .select('id, name, price, available')
    .in('id', ids);

  if (fetchErr) return bad('Could not load menu', 500);
  if (!items || items.length !== ids.length) return bad('One or more items no longer exist');

  for (const item of items) {
    const row = item as { id: string; name: string; price: number; available: boolean };
    if (!row.available) return bad(`"${row.name}" is currently unavailable`);
  }

  let subtotal = 0;
  const orderItemsPayload = items.map((item) => {
    const row = item as { id: string; name: string; price: number };
    const qty = qtyById.get(row.id)!;
    const line_total = row.price * qty;
    subtotal += line_total;
    return { menu_item_id: row.id, name: row.name, price: row.price, qty, line_total };
  });
  const total = subtotal; // No delivery fee in MVP

  // ── Upload screenshot to Storage (service-role bypasses RLS) ──
  const ext = (proof.type.split('/')[1] ?? 'jpg').toLowerCase();
  const proofPath = `${PROOF_FOLDER}/${crypto.randomUUID()}.${ext}`;
  const proofBuffer = Buffer.from(await proof.arrayBuffer());

  const { error: uploadErr } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(proofPath, proofBuffer, {
      contentType: proof.type,
      upsert: false,
      cacheControl: '3600',
    });
  if (uploadErr) {
    return bad('Could not save payment screenshot', 500);
  }

  const { data: pub } = admin.storage.from(STORAGE_BUCKET).getPublicUrl(proofPath);
  const proofUrl = pub.publicUrl;

  // ── Insert order, then line items ──
  const { data: orderRow, error: orderErr } = await admin
    .from('orders')
    .insert({
      customer_name: name,
      phone,
      email: email || null,
      type: deliveryType,
      delivery_address: deliveryAddress || null,
      notes: notes || null,
      subtotal,
      total,
      currency: 'ETB',
      status: 'received',
      payment_status: 'pending_review',
      payment_method: paymentMethod,
      payment_reference: paymentReference,
      payment_proof_url: proofUrl,
    })
    .select('id, order_number')
    .single();

  if (orderErr || !orderRow) {
    // Best-effort cleanup of the upload so we don't leave orphan files.
    await admin.storage.from(STORAGE_BUCKET).remove([proofPath]);
    return bad('Could not create order', 500);
  }

  const { error: itemsErr } = await admin
    .from('order_items')
    .insert(orderItemsPayload.map((line) => ({ ...line, order_id: orderRow.id })));

  if (itemsErr) {
    await admin.from('orders').delete().eq('id', orderRow.id);
    await admin.storage.from(STORAGE_BUCKET).remove([proofPath]);
    return bad('Could not save order items', 500);
  }

  return NextResponse.json({
    id: orderRow.id,
    order_number: orderRow.order_number,
  });
}
