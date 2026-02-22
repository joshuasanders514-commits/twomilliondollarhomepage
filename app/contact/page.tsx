export default function Contact() {
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

      {/* CONTACT CONTENT */}
      <div style={{
        padding: '60px 20px',
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '48px',
          color: '#ff1493',
          marginBottom: '30px',
        }}>
          Get In Touch
        </h1>

        <p style={{
          fontSize: '20px',
          lineHeight: '1.8',
          marginBottom: '40px',
          color: '#aaa',
        }}>
          Have questions about buying pixels? Want to sponsor the project? Need support?
        </p>

        <div style={{
          backgroundColor: '#1a1a1a',
          border: '2px solid #ff1493',
          padding: '40px',
          borderRadius: '10px',
          marginBottom: '30px',
        }}>
          <p style={{
            fontSize: '18px',
            color: '#0f0',
            marginBottom: '15px',
          }}>
            Email Us:
          </p>
          <a 
            href="mailto:joshuasanders514@gmail.com"
            style={{
              fontSize: '24px',
              color: '#ff1493',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            joshuasanders514@gmail.com
          </a>
        </div>

        <p style={{
          fontSize: '16px',
          color: '#888',
        }}>
          We typically respond within 24 hours!
        </p>

        <a href="/" style={{
          display: 'inline-block',
          marginTop: '40px',
          padding: '15px 30px',
          backgroundColor: '#ff1493',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '5px',
          fontSize: '20px',
          fontWeight: 'bold',
        }}>
          Back to Grid
        </a>
      </div>
    </div>
  );
}