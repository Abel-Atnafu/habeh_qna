import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { initializeTransaction } from '@/lib/chapa';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CartLineInput {
  menu_item_id: string;
  qty: number;
}

interface CheckoutBody {
  lines: CartLineInput[];
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  delivery: {
    type: 'pickup' | 'delivery';
    address?: string;
  };
  notes?: string;
}

function siteUrl(req: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const origin = req.headers.get('origin') ?? req.nextUrl.origin;
  return origin.replace(/\/$/, '');
}

export async function POST(req: NextRequest) {
  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // ─── Validate input shape ───────────────────────────────────────────
  if (!Array.isArray(body.lines) || body.lines.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }
  if (!body.customer?.name?.trim() || !body.customer?.phone?.trim()) {
    return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
  }
  if (body.delivery?.type !== 'pickup' && body.delivery?.type !== 'delivery') {
    return NextResponse.json({ error: 'Invalid delivery type' }, { status: 400 });
  }
  if (body.delivery.type === 'delivery' && !body.delivery.address?.trim()) {
    return NextResponse.json({ error: 'Delivery address required' }, { status: 400 });
  }

  const qtyById = new Map<string, number>();
  for (const l of body.lines) {
    if (!l.menu_item_id || typeof l.qty !== 'number' || l.qty <= 0) {
      return NextResponse.json({ error: 'Invalid cart line' }, { status: 400 });
    }
    qtyById.set(l.menu_item_id, (qtyById.get(l.menu_item_id) ?? 0) + Math.floor(l.qty));
  }

  // ─── Re-fetch live menu data (NEVER trust client prices) ────────────
  const admin = createAdminClient();
  const ids = Array.from(qtyById.keys());
  const { data: items, error: fetchErr } = await admin
    .from('menu_items')
    .select('id, name, price, available')
    .in('id', ids);

  if (fetchErr) {
    return NextResponse.json({ error: 'Could not load menu' }, { status: 500 });
  }
  if (!items || items.length !== ids.length) {
    return NextResponse.json({ error: 'One or more items no longer exist' }, { status: 400 });
  }
  for (const item of items) {
    const row = item as { id: string; name: string; price: number; available: boolean };
    if (!row.available) {
      return NextResponse.json(
        { error: `"${row.name}" is currently unavailable` },
        { status: 400 },
      );
    }
  }

  // ─── Compute server-side totals (integer birr) ─────────────────────
  let subtotal = 0;
  const orderItemsPayload = items.map((item) => {
    const row = item as { id: string; name: string; price: number };
    const qty = qtyById.get(row.id)!;
    const line_total = row.price * qty;
    subtotal += line_total;
    return {
      menu_item_id: row.id,
      name: row.name,
      price: row.price,
      qty,
      line_total,
    };
  });
  const total = subtotal; // No delivery fee in MVP

  // ─── Insert order row ──────────────────────────────────────────────
  const tx_ref = `yeroo-${crypto.randomUUID()}`;
  const { data: orderRow, error: orderErr } = await admin
    .from('orders')
    .insert({
      tx_ref,
      customer_name: body.customer.name.trim(),
      phone: body.customer.phone.trim(),
      email: body.customer.email?.trim() || null,
      type: body.delivery.type,
      delivery_address: body.delivery.address?.trim() || null,
      notes: body.notes?.trim() || null,
      subtotal,
      total,
      currency: 'ETB',
      status: 'received',
      payment_status: 'pending',
    })
    .select('id')
    .single();

  if (orderErr || !orderRow) {
    return NextResponse.json({ error: 'Could not create order' }, { status: 500 });
  }

  const { error: itemsErr } = await admin
    .from('order_items')
    .insert(orderItemsPayload.map((line) => ({ ...line, order_id: orderRow.id })));

  if (itemsErr) {
    await admin.from('orders').delete().eq('id', orderRow.id);
    return NextResponse.json({ error: 'Could not save order items' }, { status: 500 });
  }

  // ─── Initialize Chapa transaction ──────────────────────────────────
  const base = siteUrl(req);
  const [firstName, ...rest] = body.customer.name.trim().split(/\s+/);
  const lastName = rest.join(' ');

  try {
    const init = await initializeTransaction({
      amount: total.toFixed(2),
      currency: 'ETB',
      tx_ref,
      email: body.customer.email?.trim() || undefined,
      first_name: firstName,
      last_name: lastName || firstName,
      phone_number: body.customer.phone.trim(),
      callback_url: `${base}/api/checkout/verify`,
      return_url: `${base}/order/${tx_ref}`,
      customization: {
        title: 'Yeroo Coffee',
        description: 'Order payment',
      },
    });

    if (init.status !== 'success' || !init.data?.checkout_url) {
      await admin
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', orderRow.id);
      return NextResponse.json(
        { error: init.message || 'Payment provider rejected the request' },
        { status: 502 },
      );
    }

    return NextResponse.json({
      checkout_url: init.data.checkout_url,
      tx_ref,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Payment provider error';
    await admin.from('orders').update({ payment_status: 'failed' }).eq('id', orderRow.id);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
