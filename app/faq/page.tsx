export default function FAQ() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      fontFamily: 'Arial, sans-serif',
    }}>
      {/* NAV BAR */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 30px',
        borderBottom: '1px solid #333'
      }}>
        <a href="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff1493', textDecoration: 'none' }}>
          2M Homepage
        </a>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ color: '#0f0' }}>100,000 pixels left</span>
          <a href="/about" style={{ color: '#fff', textDecoration: 'none' }}>About</a>
          <a href="/faq" style={{ color: '#fff', textDecoration: 'none' }}>FAQ</a>
          <a href="/contact" style={{ color: '#fff', textDecoration: 'none' }}>Contact</a>
          <a href="https://x.com/yourhandle" target="_blank" style={{ color: '#fff', textDecoration: 'none' }}>𝕏</a>
        </div>
      </nav>

      {/* FAQ CONTENT */}
      <div style={{
        padding: '40px 20px',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <h1 style={{
          fontSize: '48px',
          color: '#ff1493',
          marginBottom: '40px',
        }}>
          Frequently Asked Questions
        </h1>

        {/* FAQ Items */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#0f0', fontSize: '24px', marginBottom: '10px' }}>
            What is this project?
          </h3>
          <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
            I'm Noah, a 10-year-old trying to beat the original Million Dollar Homepage by making TWICE the money - $2 million instead of $1 million. I'm selling 100,000 pixels at $20 each.
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#0f0', fontSize: '24px', marginBottom: '10px' }}>
            What do I get when I buy pixels?
          </h3>
          <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
            You get a permanent spot on this page with your logo/image and a link to your website. Each pixel you buy can link to a different URL, so 20 pixels = up to 20 backlinks!
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#0f0', fontSize: '24px', marginBottom: '10px' }}>
            How much does it cost?
          </h3>
          <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
            $20 per pixel. We offer small discounts for batch purchases: 2×2 for $75, 5×5 for $475, 10×10 for $1,900, and 20×20 for $7,500.
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#0f0', fontSize: '24px', marginBottom: '10px' }}>
            Is this really built by a 10-year-old?
          </h3>
          <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
            Yes! I'm Noah Sanders, a 4th grader. I built this entire website using AI (Claude, Canva AI) with zero coding experience. My dad helps with payments and legal stuff since I'm a minor.
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#0f0', fontSize: '24px', marginBottom: '10px' }}>
            How long will my pixels stay on the site?
          </h3>
          <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
            Forever! Once you buy pixels, they're yours permanently. The site will stay online indefinitely.
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#0f0', fontSize: '24px', marginBottom: '10px' }}>
            Can I change my image or link later?
          </h3>
          <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
            Currently, sales are final. But if you have a really good reason, email us and we'll see what we can do!
          </p>
        </div>

        <a href="/" style={{
          display: 'inline-block',
          marginTop: '30px',
          padding: '15px 30px',
          backgroundColor: '#ff1493',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '5px',
          fontSize: '20px',
          fontWeight: 'bold',
        }}>
          Buy Pixels Now
        </a>
      </div>
    </div>
  );
}