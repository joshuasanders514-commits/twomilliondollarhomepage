export default function About() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      fontFamily: 'Arial, sans-serif',
    }}>
      {/* NAV BAR - Same as homepage */}
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
          marginBottom: '20px',
        }}>
          About This Project
        </h1>

        {/* Noah's Story */}
        <div style={{
          fontSize: '20px',
          lineHeight: '1.8',
          marginBottom: '40px',
        }}>
          <h2 style={{ color: '#0f0', fontSize: '32px', marginBottom: '20px' }}>
            Hi, I'm Noah Sanders
          </h2>
          
          <p style={{ marginBottom: '20px' }}>
            I'm 10 years old and in 4th grade. I'm a <strong>5-time national champion runner</strong> and I love climbing mountains.
          </p>

          <p style={{ marginBottom: '20px' }}>
            I built this entire website using AI - Claude, Canva AI, and other tools - with zero coding experience before starting this project.
          </p>

          <h2 style={{ color: '#0f0', fontSize: '32px', marginTop: '40px', marginBottom: '20px' }}>
            The Challenge
          </h2>

          <p style={{ marginBottom: '20px' }}>
            Back in 2005, a 21-year-old college student created the "Million Dollar Homepage" and sold 1 million pixels for $1 each, making $1 million.
          </p>

          <p style={{ marginBottom: '20px' }}>
            My goal? <strong style={{ color: '#ff1493' }}>Beat his record.</strong>
          </p>

          <p style={{ marginBottom: '20px' }}>
            I'm half his age, so I'm going for <strong style={{ color: '#ff1493' }}>TWICE the money</strong> - $2 million by selling 100,000 pixels at $20 each.
          </p>

          <h2 style={{ color: '#0f0', fontSize: '32px', marginTop: '40px', marginBottom: '20px' }}>
            Why Buy a Pixel?
          </h2>

          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li style={{ marginBottom: '10px' }}>Get a backlink to your website ($20/backlink vs $85+ market rate)</li>
            <li style={{ marginBottom: '10px' }}>Support a 10-year-old kid's ambitious project</li>
            <li style={{ marginBottom: '10px' }}>Be part of internet history</li>
            <li style={{ marginBottom: '10px' }}>Your logo/brand will be seen by thousands</li>
          </ul>

          <p style={{ marginBottom: '20px' }}>
            Every pixel purchased helps me prove that a 4th grader with AI can accomplish what most people think is impossible.
          </p>

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
    </div>
  );
}