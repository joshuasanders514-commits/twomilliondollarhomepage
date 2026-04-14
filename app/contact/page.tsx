export default function Contact() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000',
      color: '#fff',
      fontFamily: 'Arial, sans-serif'
    }}>
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
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="/about" style={{ color: '#fff', textDecoration: 'none' }}>About</a>
          <a href="/faq" style={{ color: '#fff', textDecoration: 'none' }}>FAQ</a>
          <a href="/contact" style={{ color: '#fff', textDecoration: 'none' }}>Contact</a>
        </div>
      </nav>

      <div style={{ padding: '40px 30px', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: '#ff1493', marginBottom: '30px' }}>Contact Us</h1>
        
        <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
          Have questions about the Two Million Dollar Homepage? Want to discuss a bulk purchase? 
          We'd love to hear from you!
        </p>

        <div style={{ marginTop: '30px' }}>
          <p style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#ff1493' }}>Email:</strong>{' '}
            <a href="mailto:noah@twomilliondollarhomepage.io" style={{ color: '#0f0' }}>
              noah@twomilliondollarhomepage.io
            </a>
          </p>
          <p>
            <strong style={{ color: '#ff1493' }}>Twitter/X:</strong>{' '}
            <a href="https://x.com/2Mhomepage" target="_blank" rel="noopener noreferrer" style={{ color: '#0f0' }}>
              @2Mhomepage
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}