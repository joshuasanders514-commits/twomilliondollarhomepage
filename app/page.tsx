export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#0f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      fontSize: '24px'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
        🚀 Two Million Dollar Homepage
      </h1>
      <p>Built by Noah, a 10-year-old 4th grader using AI</p>
      <p style={{ marginTop: '20px', fontSize: '18px', color: '#0f0' }}>
        Coming soon...
      </p>
    </div>
  );
}