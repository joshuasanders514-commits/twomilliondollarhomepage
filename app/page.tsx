'use client';

import { useState } from 'react';

export default function Home() {
  const [availablePixels, setAvailablePixels] = useState(99856);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000',
      color: '#fff',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* NAV BAR */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 30px',
        borderBottom: '1px solid #333'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff1493' }}>
          2M Homepage
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a href="#about" style={{ color: '#fff', textDecoration: 'none' }}>About</a>
          <span style={{ color: '#0f0' }}>{availablePixels.toLocaleString()} pixels left</span>
          <a href="#faq" style={{ color: '#fff', textDecoration: 'none' }}>FAQ</a>
          <a href="#contact" style={{ color: '#fff', textDecoration: 'none' }}>Contact</a>
          <a href="https://x.com/yourhandle" target="_blank" style={{ color: '#fff', textDecoration: 'none' }}>𝕏</a>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* TITLE SPONSOR */}
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          height: '120px',
          backgroundColor: '#1a1a1a',
          border: '2px dashed #555',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: '#888',
          fontSize: '18px'
        }}>
          Title Sponsor Available - Email for Pricing
        </div>

        {/* 6 FEATURED SPONSORS */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          {[1, 2, 3, 4, 5, 6].map(num => (
            <div key={num} style={{
              width: '150px',
              height: '150px',
              backgroundColor: '#1a1a1a',
              border: '2px dashed #555',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#888',
              fontSize: '14px',
              textAlign: 'center',
              padding: '10px'
            }}>
              Featured Sponsor {num}<br/>Available
            </div>
          ))}
        </div>

        {/* GRID LABEL */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#ff1493', margin: '0 0 10px' }}>316×316 Pixel Grid</h2>
          <p style={{ color: '#888', margin: 0 }}>Click and drag to select pixels</p>
        </div>

        {/* GRID PLACEHOLDER (will build next) */}
        <div style={{
          width: '950px',
          height: '950px',
          backgroundColor: '#333',
          margin: '0 auto',
          border: '1px solid #555',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888'
        }}>
          Grid will appear here (Stage 2)
        </div>

      </div>

      {/* BOTTOM TEXT */}
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: '#ff1493',
        fontSize: '24px'
      }}>
        Stitch Go Boom What's Up Hello, Micah!
      </div>
    </div>
  );
}