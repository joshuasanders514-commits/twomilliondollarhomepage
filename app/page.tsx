'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const GRID_SIZE = 316;
  const PIXEL_SIZE = 5; // BIGGER PIXELS
  const PRICE_PER_PIXEL = 20;
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [availablePixels, setAvailablePixels] = useState(99856);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{x: number, y: number} | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{x: number, y: number} | null>(null);

  // Draw the grid - OPTIMIZED
  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fill background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all pixels at once (faster)
    ctx.fillStyle = '#666';
    ctx.fillRect(0, 0, GRID_SIZE * PIXEL_SIZE, GRID_SIZE * PIXEL_SIZE);

    // Draw gridlines (only horizontal and vertical lines, not each pixel)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * PIXEL_SIZE, 0);
      ctx.lineTo(i * PIXEL_SIZE, GRID_SIZE * PIXEL_SIZE);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * PIXEL_SIZE);
      ctx.lineTo(GRID_SIZE * PIXEL_SIZE, i * PIXEL_SIZE);
      ctx.stroke();
    }

    // Draw selection if active
    if (selectionStart && selectionEnd) {
      const startX = Math.min(selectionStart.x, selectionEnd.x);
      const startY = Math.min(selectionStart.y, selectionEnd.y);
      const endX = Math.max(selectionStart.x, selectionEnd.x);
      const endY = Math.max(selectionStart.y, selectionEnd.y);

      ctx.fillStyle = 'rgba(255, 20, 147, 0.5)'; // Hot pink with transparency
      ctx.fillRect(
        startX * PIXEL_SIZE,
        startY * PIXEL_SIZE,
        (endX - startX + 1) * PIXEL_SIZE,
        (endY - startY + 1) * PIXEL_SIZE
      );

      ctx.strokeStyle = '#ff1493';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        startX * PIXEL_SIZE,
        startY * PIXEL_SIZE,
        (endX - startX + 1) * PIXEL_SIZE,
        (endY - startY + 1) * PIXEL_SIZE
      );
    }
  };

  useEffect(() => {
    drawGrid();
  }, [selectionStart, selectionEnd]);

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);

    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectionEnd({ x, y });
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);

    setSelectionEnd({ x, y });
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  // Calculate selection details
  const getSelectionInfo = () => {
    if (!selectionStart || !selectionEnd) return null;

    const width = Math.abs(selectionEnd.x - selectionStart.x) + 1;
    const height = Math.abs(selectionEnd.y - selectionStart.y) + 1;
    const pixelCount = width * height;
    const price = pixelCount * PRICE_PER_PIXEL;

    return { width, height, pixelCount, price };
  };

  const selectionInfo = getSelectionInfo();

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

        {/* CANVAS GRID */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={GRID_SIZE * PIXEL_SIZE}
            height={GRID_SIZE * PIXEL_SIZE}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              border: '1px solid #555',
              cursor: 'crosshair'
            }}
          />
        </div>

        {/* SELECTION INFO - FLOATING */}
        {selectionInfo && selectionEnd && (
          <div style={{
            position: 'fixed',
            top: '50%',
            right: '20px',
            transform: 'translateY(-50%)',
            padding: '20px',
            backgroundColor: '#1a1a1a',
            border: '2px solid #ff1493',
            maxWidth: '300px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(255, 20, 147, 0.5)',
            zIndex: 1000
          }}>
            <h3 style={{ color: '#ff1493', margin: '0 0 15px' }}>Your Selection</h3>
            <p style={{ margin: '5px 0' }}>Size: {selectionInfo.width} × {selectionInfo.height}</p>
            <p style={{ margin: '5px 0' }}>Pixels: {selectionInfo.pixelCount}</p>
            <p style={{ margin: '5px 0', fontSize: '24px', fontWeight: 'bold', color: '#0f0' }}>
              ${selectionInfo.price.toLocaleString()}
            </p>
            <button style={{
              marginTop: '15px',
              padding: '12px 30px',
              backgroundColor: '#ff1493',
              color: '#fff',
              border: 'none',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderRadius: '5px'
            }}>
              Buy Now
            </button>
          </div>
        )}

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