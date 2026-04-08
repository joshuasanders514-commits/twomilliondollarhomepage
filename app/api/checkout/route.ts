import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blockId, zone, x, y, w, h, pixels, price, email } = body;

    // Check if block exists and its status
    const { data: existingBlock, error: checkError } = await supabase
      .from('blocks')
      .select('block_id, status')
      .eq('block_id', blockId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = not found, which is okay
      return Response.json({ error: 'Database error' }, { status: 500 });
    }

    if (existingBlock && existingBlock.status !== 'available') {
      return Response.json({ 
        error: 'This block is no longer available'
      }, { status: 400 });
    }

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        email,
        pixel_count: pixels,
        amount_paid: price * 100,
        status: 'pending',
        block_id: blockId
      })
      .select()
      .single();

    if (purchaseError || !purchase) {
      return Response.json({ error: 'Failed to create purchase' }, { status: 500 });
    }

    // Insert or update block as pending
    const { error: upsertError } = await supabase
      .from('blocks')
      .upsert({
        block_id: blockId,
        zone: zone,
        x: x,
        y: y,
        w: w,
        h: h,
        pixels: pixels,
        price: price * 100,
        status: 'pending',
        email: email,
        reserved_at: new Date().toISOString(),
      }, {
        onConflict: 'block_id'
      });

    if (upsertError) {
      return Response.json({ error: 'Failed to reserve block' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${zone.charAt(0).toUpperCase() + zone.slice(1)} Block (${w}×${h}) on 2M Homepage`,
              description: `${pixels} pixels at position (${x}, ${y}) • Purchase ID: ${purchase.id}`,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}&purchase_id=${purchase.id}`,
      cancel_url: `${request.nextUrl.origin}/?canceled=true`,
      customer_email: email,
      metadata: {
        purchase_id: purchase.id,
        block_id: blockId,
        zone: zone,
        pixels: pixels.toString(),
      },
    });

    // Update block with stripe session id
    await supabase
      .from('blocks')
      .update({ stripe_session_id: session.id })
      .eq('block_id', blockId);

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: 'Checkout failed' }, { status: 500 });
  }
}