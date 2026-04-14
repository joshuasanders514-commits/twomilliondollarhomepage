export default function About() {
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
          <a href="/about" style={{ color: '#fff', textDecoration: 'none' }}>About</a>
          <a href="/faq" style={{ color: '#fff', textDecoration: 'none' }}>FAQ</a>
          <a href="/contact" style={{ color: '#fff', textDecoration: 'none' }}>Contact</a>
          <a href="https://x.com/2Mhomepage" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>𝕏</a>
        </div>
      </nav>

      {/* ABOUT CONTENT */}
      <div style={{
        padding: '40px 20px',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        {/* Title */}
        <h1 style={{
          fontSize: '48px',
          color: '#ff1493',
          marginBottom: '30px',
          textAlign: 'center',
        }}>
          The Two Million Dollar Homepage
        </h1>

        {/* What Is This */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '2px solid #ff1493',
          borderRadius: '10px',
          padding: '30px',
          marginBottom: '30px',
        }}>
          <h2 style={{ color: '#0f0', fontSize: '28px', marginBottom: '15px', marginTop: 0 }}>
            What Is This?
          </h2>
          <p style={{ fontSize: '18px', lineHeight: '1.8', margin: 0 }}>
            This is a grid of <strong>100,000 pixels</strong> for sale. When you buy pixels, you upload your logo or image, and it becomes a clickable link to your website. Your image stays on this page <strong>forever</strong> — or as long as the internet exists.
          </p>
        </div>

        {/* Meet Noah */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '2px solid #0f0',
          borderRadius: '10px',
          padding: '30px',
          marginBottom: '30px',
        }}>
          <h2 style={{ color: '#0f0', fontSize: '28px', marginBottom: '15px', marginTop: 0 }}>
            Meet Noah Sanders
          </h2>
          <p style={{ fontSize: '18px', lineHeight: '1.8', marginBottom: '15px' }}>
            Hi! I'm <strong>Noah Sanders</strong>, a 10-year-old 4th grader from Michigan. I'm a 5-time national champion runner and I love climbing mountains.
          </p>
          <p style={{ fontSize: '18px', lineHeight: '1.8', margin: 0 }}>
            I built this entire website using AI tools like Claude — with <strong>zero coding experience</strong> before starting. This project is proof that kids can build real things with the right tools and determination.
          </p>
        </div>

        {/* The Inspiration */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '2px solid #ff1493',
          borderRadius: '10px',
          padding: '30px',
          marginBottom: '30px',
        }}>
          <h2 style={{ color: '#ff1493', fontSize: '28px', marginBottom: '15px', marginTop: 0 }}>
            The Inspiration
          </h2>
          <p style={{ fontSize: '18px', lineHeight: '1.8', marginBottom: '15px' }}>
            In 2005, a 21-year-old college student named Alex Tew created the <strong>"Million Dollar Homepage"</strong>. He sold 1 million pixels at $1 each to pay for college — and made exactly $1,000,000.
          </p>
          <p style={{ fontSize: '18px', lineHeight: '1.8', margin: 0 }}>
            I'm <strong>half his age</strong>, so my goal is <strong style={{ color: '#ff1493' }}>TWICE the money</strong>: $2,000,000.
          </p>
        </div>

        {/* How It Works */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '2px solid #0f0',
          borderRadius: '10px',
          padding: '30px',
          marginBottom: '30px',
        }}>
          <h2 style={{ color: '#0f0', fontSize: '28px', marginBottom: '20px', marginTop: 0 }}>
            How It Works
          </h2>
          
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '10px' }}>
              <strong style={{ color: '#ff1493' }}>1.</strong> Click any available block on the grid
            </p>
            <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '10px' }}>
              <strong style={{ color: '#ff1493' }}>2.</strong> Enter your email and pay with a credit card
            </p>
            <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '10px' }}>
              <strong style={{ color: '#ff1493' }}>3.</strong> Upload your image and enter your website URL
            </p>
            <p style={{ fontSize: '18px', lineHeight: '1.6', margin: 0 }}>
              <strong style={{ color: '#ff1493' }}>4.</strong> Your image appears on the grid forever!
            </p>
          </div>
        </div>

        {/* Pricing */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '2px solid #ff1493',
          borderRadius: '10px',
          padding: '30px',
          marginBottom: '30px',
        }}>
          <h2 style={{ color: '#ff1493', fontSize: '28px', marginBottom: '15px', marginTop: 0 }}>
            Pricing
          </h2>
          <p style={{ fontSize: '18px', lineHeight: '1.8', marginBottom: '15px' }}>
            Prices depend on location. The <strong>center blocks cost more</strong> because they get seen the most. The <strong>edge blocks cost less</strong> — starting at just <strong style={{ color: '#0f0' }}>$30</strong> for a single pixel.
          </p>
          <p style={{ fontSize: '18px', lineHeight: '1.8', margin: 0 }}>
            Bigger blocks give you more space for your logo and cost more, but they're also more visible!
          </p>
        </div>

        {/* Why Buy */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '2px solid #0f0',
          borderRadius: '10px',
          padding: '30px',
          marginBottom: '30px',
        }}>
          <h2 style={{ color: '#0f0', fontSize: '28px', marginBottom: '20px', marginTop: 0 }}>
            Why Buy Pixels?
          </h2>
          
          <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '12px' }}>
            ✅ <strong>Permanent backlink</strong> to your website (great for SEO)
          </p>
          <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '12px' }}>
            ✅ <strong>Support a kid's dream</strong> — help me make internet history
          </p>
          <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '12px' }}>
            ✅ <strong>Be part of something unique</strong> — own a piece of the grid forever
          </p>
          <p style={{ fontSize: '18px', lineHeight: '1.6', margin: 0 }}>
            ✅ <strong>Visibility</strong> — thousands of people will see your logo
          </p>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <a href="/" style={{
            display: 'inline-block',
            padding: '20px 50px',
            backgroundColor: '#ff1493',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '10px',
            fontSize: '24px',
            fontWeight: 'bold',
          }}>
            Buy Pixels Now
          </a>
        </div>

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '50px', 
          paddingTop: '30px',
          borderTop: '1px solid #333',
          color: '#666',
          fontSize: '14px'
        }}>
          <p>Built by Noah Sanders, age 10 🚀</p>
        </div>
      </div>
    </div>
  );
}