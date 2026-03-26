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
    const { pixelIds, price, email } = body;

    const { data: pixels, error: checkError } = await supabase
      .from('pixels')
      .select('id, status')
      .in('id', pixelIds);

    if (checkError) {
      return Response.json({ error: 'Database error' }, { status: 500 });
    }

    const unavailable = pixels?.filter(p => p.status !== 'available') || [];
    if (unavailable.length > 0) {
      return Response.json({ 
        error: 'Some pixels are no longer available', 
        unavailableIds: unavailable.map(p => p.id) 
      }, { status: 400 });
    }

    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        email,
        pixel_count: pixelIds.length,
        amount_paid: price * 100,
        status: 'pending'
      })
      .select()
      .single();

    if (purchaseError || !purchase) {
      return Response.json({ error: 'Failed to create purchase' }, { status: 500 });
    }

    const { error: updateError } = await supabase
      .from('pixels')
      .update({ status: 'pending', purchase_id: purchase.id })
      .in('id', pixelIds);

    if (updateError) {
      return Response.json({ error: 'Failed to reserve pixels' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${pixelIds.length} Pixel${pixelIds.length > 1 ? 's' : ''} on 2M Homepage`,
              description: `Pixel IDs: ${pixelIds.slice(0, 10).join(', ')}${pixelIds.length > 10 ? '...' : ''}`,
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
        pixel_ids: JSON.stringify(pixelIds),
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: 'Checkout failed' }, { status: 500 });
  }
}