import { NextRequest } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, blockId, zone, pixels, price, purchaseId } = body;

    const { data, error } = await resend.emails.send({
      from: 'Noah @ 2M Homepage <noah@twomilliondollarhomepage.io>',
      to: email,
      subject: '🎉 Your 2M Homepage Pixel Purchase Confirmed!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 10px; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #ff1493; }
            .success-badge { background-color: #0f0; color: #000; padding: 8px 20px; border-radius: 20px; font-weight: bold; display: inline-block; margin-top: 15px; }
            .details { background-color: #000; border-radius: 8px; padding: 25px; margin: 25px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #333; }
            .detail-row:last-child { border-bottom: none; }
            .label { color: #888; }
            .value { color: #fff; font-weight: bold; }
            .total { font-size: 32px; color: #0f0; text-align: center; margin: 25px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
            .cta { text-align: center; margin: 30px 0; }
            .button { background-color: #ff1493; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">2M Homepage</div>
              <div class="success-badge">✓ PAYMENT CONFIRMED</div>
            </div>
            
            <p>Hey there! 👋</p>
            <p>Thank you so much for buying pixels on the Two Million Dollar Homepage! You're now part of internet history.</p>
            
            <div class="details">
              <div class="detail-row">
                <span class="label">Purchase ID</span>
                <span class="value">#${purchaseId}</span>
              </div>
              <div class="detail-row">
                <span class="label">Block Location</span>
                <span class="value">${zone.charAt(0).toUpperCase() + zone.slice(1)} Zone</span>
              </div>
              <div class="detail-row">
                <span class="label">Block ID</span>
                <span class="value">${blockId}</span>
              </div>
              <div class="detail-row">
                <span class="label">Pixels</span>
                <span class="value">${pixels} pixels</span>
              </div>
            </div>
            
            <div class="total">$${price} USD</div>
            
            <p><strong>What happens next?</strong></p>
            <p>Reply to this email with:</p>
            <ul>
              <li>Your image (logo, photo, or artwork)</li>
              <li>The URL you want your pixels to link to</li>
            </ul>
            <p>I'll get your pixels live on the grid within 48 hours!</p>
            
            <div class="cta">
              <a href="https://twomilliondollarhomepage.io" class="button">View the Grid</a>
            </div>
            
            <div class="footer">
              <p>Thanks for supporting a 10-year-old's big dream! 🚀</p>
              <p>— Noah Sanders</p>
              <p style="margin-top: 20px;">
                <a href="https://twomilliondollarhomepage.io/privacy" style="color: #666;">Privacy Policy</a> • 
                <a href="https://twomilliondollarhomepage.io/terms" style="color: #666;">Terms of Service</a>
              </p>
            </div>
          </div>
        </body>
        </html>
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