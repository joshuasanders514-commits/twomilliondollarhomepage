import { NextRequest } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, blockId, zone, pixels, price, purchaseId } = body;

    const zoneCapitalized = zone ? zone.charAt(0).toUpperCase() + zone.slice(1) : 'Unknown';

    const { data, error } = await resend.emails.send({
      from: 'Noah @ 2M Homepage <noah@twomilliondollarhomepage.io>',
      to: email,
      subject: 'Your 2M Homepage Pixel Purchase Confirmed!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #1a1a1a; color: #ffffff;">
          <h1 style="color: #ff1493;">Payment Confirmed!</h1>
          <p>Thank you for buying pixels on the Two Million Dollar Homepage!</p>
          <div style="background-color: #000; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Purchase ID:</strong> #${purchaseId}</p>
            <p><strong>Block:</strong> ${zoneCapitalized} Zone</p>
            <p><strong>Block ID:</strong> ${blockId}</p>
            <p><strong>Pixels:</strong> ${pixels}</p>
            <p style="font-size: 24px; color: #0f0;"><strong>Total: $${price} USD</strong></p>
          </div>
          <p><strong>What happens next?</strong></p>
          <p>Reply to this email with your image and the URL you want your pixels to link to.</p>
          <p>Thanks for supporting a 10-year-old's big dream!</p>
          <p>— Noah Sanders</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return Response.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return Response.json({ success: true, messageId: data?.id });
  } catch (error) {
    console.error('Email error:', error);
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }
}