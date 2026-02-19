'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const GRID_WIDTH = 316;
  const GRID_HEIGHT = 316;
  const EXTRA_ROW_PIXELS = 144;
  const TOTAL_PIXELS = (GRID_WIDTH * GRID_HEIGHT) + EXTRA_ROW_PIXELS; // 100,000!
  const PIXEL_SIZE = 5;
  const PRICE_PER_PIXEL = 20;
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [availablePixels, setAvailablePixels] = useState(TOTAL_PIXELS);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{x: number, y: number} | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{x: number, y: number} | null>(null);

  // Batch pricing options
  const batchOptions = [
    { size: '2×2', pixels: 4, price: 75, width: 2, height: 2 },
    { size: '5×5', pixels: 25, price: 475, width: 5, height: 5, popular: true },
    { size: '10×10', pixels: 100, price: 1900, width: 10, height: 10 },
    { size: '20×20', pixels: 400, price: 7500, width: 20, height: 20 }
  ];

  // Quick select batch size with discounted price - NOW STARTS AT TOP
  const handleBatchSelect = (width: number, height: number, discountedPrice: number) => {
    // Start from top-center of grid (centered horizontally, very top vertically)
    const centerX = Math.floor(GRID_WIDTH / 2) - Math.floor(width / 2);
    const startY = 0;
    
    setSelectionStart({ x: centerX, y: startY });
    setSelectionEnd({ x: centerX + width - 1, y: startY + height - 1 });
  };

  // Draw the grid - OPTIMIZED with centered extra row
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

    // Draw main grid (316x316)
    ctx.fillStyle = '#666';
    ctx.fillRect(0, 0, GRID_WIDTH * PIXEL_SIZE, GRID_HEIGHT * PIXEL_SIZE);

    // Draw extra row CENTERED (144 pixels)
    const extraRowStartX = Math.floor((GRID_WIDTH - EXTRA_ROW_PIXELS) / 2);
    ctx.fillRect(extraRowStartX * PIXEL_SIZE, GRID_HEIGHT * PIXEL_SIZE, EXTRA_ROW_PIXELS * PIXEL_SIZE, PIXEL_SIZE);

    // Draw gridlines for main grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_WIDTH; i++) {
      ctx.beginPath();
      ctx.moveTo(i * PIXEL_SIZE, 0);
      ctx.lineTo(i * PIXEL_SIZE, GRID_HEIGHT * PIXEL_SIZE);
      ctx.stroke();
    }
    for (let i = 0; i <= GRID_HEIGHT; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * PIXEL_SIZE);
      ctx.lineTo(GRID_WIDTH * PIXEL_SIZE, i * PIXEL_SIZE);
      ctx.stroke();
    }

    // Draw gridlines for extra row (centered)
    for (let i = 0; i <= EXTRA_ROW_PIXELS; i++) {
      ctx.beginPath();
      ctx.moveTo((extraRowStartX + i) * PIXEL_SIZE, GRID_HEIGHT * PIXEL_SIZE);
      ctx.lineTo((extraRowStartX + i) * PIXEL_SIZE, (GRID_HEIGHT + 1) * PIXEL_SIZE);
      ctx.stroke();
    }
    // Bottom line of extra row
    ctx.beginPath();
    ctx.moveTo(extraRowStartX * PIXEL_SIZE, (GRID_HEIGHT + 1) * PIXEL_SIZE);
    ctx.lineTo((extraRowStartX + EXTRA_ROW_PIXELS) * PIXEL_SIZE, (GRID_HEIGHT + 1) * PIXEL_SIZE);
    ctx.stroke();

    // Draw selection if active
    if (selectionStart && selectionEnd) {
      const startX = Math.min(selectionStart.x, selectionEnd.x);
      const startY = Math.min(selectionStart.y, selectionEnd.y);
      const endX = Math.max(selectionStart.x, selectionEnd.x);
      const endY = Math.max(selectionStart.y, selectionEnd.y);

      ctx.fillStyle = 'rgba(255, 20, 147, 0.5)';
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

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);

    setSelectionEnd({ x, y });
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  const getSelectionInfo = () => {
    if (!selectionStart || !selectionEnd) return null;

    const width = Math.abs(selectionEnd.x - selectionStart.x) + 1;
    const height = Math.abs(selectionEnd.y - selectionStart.y) + 1;
    const pixelCount = width * height;
    
    // Check if this matches a batch size for discount
    const matchingBatch = batchOptions.find(
      opt => opt.width === width && opt.height === height
    );
    
    const price = matchingBatch ? matchingBatch.price : pixelCount * PRICE_PER_PIXEL;

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
          <span style={{ color: '#0f0' }}>{availablePixels.toLocaleString()} pixels left</span>
          <a href="#about" style={{ color: '#fff', textDecoration: 'none' }}>About</a>
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
          height: '60px',
          backgroundColor: '#1a1a1a',
          border: '2px dashed #555',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 15px',
          color: '#888',
          fontSize: '14px'
        }}>
          Title Sponsor Available - Email for Pricing
        </div>

        {/* 6 FEATURED SPONSORS */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          marginBottom: '25px',
          flexWrap: 'wrap'
        }}>
          {[1, 2, 3, 4, 5, 6].map(num => (
            <div key={num} style={{
              width: '75px',
              height: '75px',
              backgroundColor: '#1a1a1a',
              border: '2px dashed #555',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#888',
              fontSize: '10px',
              textAlign: 'center',
              padding: '5px'
            }}>
              Sponsor {num}
            </div>
          ))}
        </div>

        {/* GRID LABEL - 50% smaller text */}
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <h2 style={{ color: '#ff1493', margin: '0 0 8px', fontSize: '14px', fontWeight: 'normal' }}>
            316×316 Pixel Grid — Click and drag to select pixels, or choose a popular size:
          </h2>
          
          {/* BATCH PRICING BUTTONS */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            marginBottom: '15px'
          }}>
            {batchOptions.map((option) => (
              <button
                key={option.size}
                onClick={() => handleBatchSelect(option.width, option.height, option.price)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: option.popular ? '#ff1493' : '#1a1a1a',
                  color: '#fff',
                  border: option.popular ? '2px solid #ff1493' : '2px solid #555',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  borderRadius: '5px',
                  position: 'relative'
                }}
              >
                {option.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: '#0f0',
                    color: '#000',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontWeight: 'bold'
                  }}>
                    POPULAR
                  </div>
                )}
                <div>{option.size}</div>
                <div style={{ fontSize: '16px', marginTop: '5px' }}>${option.price.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: '#aaa' }}>save ${(option.pixels * PRICE_PER_PIXEL - option.price)}</div>
              </button>
            ))}
            <button
              onClick={() => {
                setSelectionStart(null);
                setSelectionEnd(null);
              }}
              style={{
                padding: '12px 20px',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                border: '2px solid #555',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderRadius: '5px'
              }}
            >
              Custom<br/>Size
            </button>
          </div>
        </div>

        {/* CANVAS GRID */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={GRID_WIDTH * PIXEL_SIZE}
            height={(GRID_HEIGHT + 1) * PIXEL_SIZE}
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