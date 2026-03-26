'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from './lib/supabase';

export default function Home() {
  const GRID_WIDTH = 316;
  const GRID_HEIGHT = 316;
  const EXTRA_ROW_PIXELS = 144;
  const TOTAL_PIXELS = (GRID_WIDTH * GRID_HEIGHT) + EXTRA_ROW_PIXELS;
  const PIXEL_SIZE = 5;
  const PRICE_PER_PIXEL = 20;
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [availablePixels, setAvailablePixels] = useState(TOTAL_PIXELS);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{x: number, y: number} | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{x: number, y: number} | null>(null);
  const [soldPixels, setSoldPixels] = useState<Map<number, {image_url: string, website_url: string, company_name: string}>>(new Map());
  const [reservedPixels, setReservedPixels] = useState<Set<number>>(new Set());
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [email, setEmail] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const [hoveredPixel, setHoveredPixel] = useState<{id: number, company: string, x: number, y: number} | null>(null);

  const batchOptions = [
    { size: '2×2', pixels: 4, price: 75, width: 2, height: 2 },
    { size: '5×5', pixels: 25, price: 475, width: 5, height: 5, popular: true },
    { size: '10×10', pixels: 100, price: 1900, width: 10, height: 10 },
    { size: '20×20', pixels: 400, price: 7500, width: 20, height: 20 }
  ];

  // Load images for sold pixels
  useEffect(() => {
    const imageUrls = new Set<string>();
    soldPixels.forEach(pixel => {
      if (pixel.image_url) imageUrls.add(pixel.image_url);
    });

    imageUrls.forEach(url => {
      if (!loadedImages.has(url)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setLoadedImages(prev => new Map(prev).set(url, img));
        };
        img.src = url;
      }
    });
  }, [soldPixels]);

  useEffect(() => {
    async function loadPixels() {
      try {
        const { data, error } = await supabase
          .from('pixels')
          .select('id, status, image_url, website_url, company_name')
          .in('status', ['sold', 'reserved', 'pending']);

        if (error) {
          console.error('Database error:', error);
          setDbConnected(false);
          return;
        }

        setDbConnected(true);

        const sold = new Map<number, {image_url: string, website_url: string, company_name: string}>();
        const reserved = new Set<number>();

        data?.forEach(pixel => {
          if (pixel.status === 'sold') {
            sold.set(pixel.id, {
              image_url: pixel.image_url || '',
              website_url: pixel.website_url || '',
              company_name: pixel.company_name || ''
            });
          } else if (pixel.status === 'reserved') {
            reserved.add(pixel.id);
          } else if (pixel.status === 'pending') {
            reserved.add(pixel.id);
          }
        });

        setSoldPixels(sold);
        setReservedPixels(reserved);
        setAvailablePixels(TOTAL_PIXELS - sold.size - reserved.size);
      } catch (err) {
        console.error('Connection error:', err);
        setDbConnected(false);
      }
    }

    loadPixels();
  }, []);

  const getPixelId = (x: number, y: number): number | null => {
    if (y < GRID_HEIGHT) {
      return (y * GRID_WIDTH) + x + 1;
    } else if (y === GRID_HEIGHT) {
      const extraRowStartX = Math.floor((GRID_WIDTH - EXTRA_ROW_PIXELS) / 2);
      if (x >= extraRowStartX && x < extraRowStartX + EXTRA_ROW_PIXELS) {
        return (GRID_WIDTH * GRID_HEIGHT) + (x - extraRowStartX) + 1;
      }
    }
    return null;
  };

  const getPixelCoords = (pixelId: number): {x: number, y: number} | null => {
    const extraRowStartX = Math.floor((GRID_WIDTH - EXTRA_ROW_PIXELS) / 2);
    if (pixelId <= GRID_WIDTH * GRID_HEIGHT) {
      return {
        x: (pixelId - 1) % GRID_WIDTH,
        y: Math.floor((pixelId - 1) / GRID_WIDTH)
      };
    } else {
      const extraIndex = pixelId - (GRID_WIDTH * GRID_HEIGHT) - 1;
      return {
        x: extraRowStartX + extraIndex,
        y: GRID_HEIGHT
      };
    }
  };

  const getSelectedPixelIds = (): number[] => {
    if (!selectionStart || !selectionEnd) return [];
    
    const startX = Math.min(selectionStart.x, selectionEnd.x);
    const startY = Math.min(selectionStart.y, selectionEnd.y);
    const endX = Math.max(selectionStart.x, selectionEnd.x);
    const endY = Math.max(selectionStart.y, selectionEnd.y);
    
    const pixelIds: number[] = [];
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const pixelId = getPixelId(x, y);
        if (pixelId !== null) {
          pixelIds.push(pixelId);
        }
      }
    }
    return pixelIds;
  };

  const getUnavailableInSelection = (): { sold: number[], reserved: number[] } => {
    const selectedIds = getSelectedPixelIds();
    const sold = selectedIds.filter(id => soldPixels.has(id));
    const reserved = selectedIds.filter(id => reservedPixels.has(id));
    return { sold, reserved };
  };

  const handleBatchSelect = (width: number, height: number, discountedPrice: number) => {
    const centerX = Math.floor(GRID_WIDTH / 2) - Math.floor(width / 2);
    const startY = 0;
    
    setSelectionStart({ x: centerX, y: startY });
    setSelectionEnd({ x: centerX + width - 1, y: startY + height - 1 });
    setShowCheckout(false);
  };

  const handleBuyClick = () => {
    setShowCheckout(true);
    setCheckoutError('');
  };

  const handleCheckout = async () => {
    if (!email) {
      setCheckoutError('Please enter your email');
      return;
    }

    const selectionInfo = getSelectionInfo();
    if (!selectionInfo) return;

    setCheckoutLoading(true);
    setCheckoutError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pixelIds: selectionInfo.selectedIds,
          price: selectionInfo.price,
          email: email
        })
      });

      const data = await response.json();

      if (data.error) {
        setCheckoutError(data.error);
        setCheckoutLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setCheckoutError('Something went wrong. Please try again.');
      setCheckoutLoading(false);
    }
  };

  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#666';
    ctx.fillRect(0, 0, GRID_WIDTH * PIXEL_SIZE, GRID_HEIGHT * PIXEL_SIZE);

    const extraRowStartX = Math.floor((GRID_WIDTH - EXTRA_ROW_PIXELS) / 2);
    ctx.fillRect(extraRowStartX * PIXEL_SIZE, GRID_HEIGHT * PIXEL_SIZE, EXTRA_ROW_PIXELS * PIXEL_SIZE, PIXEL_SIZE);

    // Draw sold pixels with images
    soldPixels.forEach((info, pixelId) => {
      const coords = getPixelCoords(pixelId);
      if (!coords) return;
      
      const img = loadedImages.get(info.image_url);
      if (img) {
        ctx.drawImage(img, coords.x * PIXEL_SIZE, coords.y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      } else {
        ctx.fillStyle = '#ff1493';
        ctx.fillRect(coords.x * PIXEL_SIZE, coords.y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      }
    });

    // Draw reserved pixels in gold
    ctx.fillStyle = '#ffd700';
    reservedPixels.forEach(pixelId => {
      const coords = getPixelCoords(pixelId);
      if (!coords) return;
      ctx.fillRect(coords.x * PIXEL_SIZE, coords.y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    });

    // Draw gridlines
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

    for (let i = 0; i <= EXTRA_ROW_PIXELS; i++) {
      ctx.beginPath();
      ctx.moveTo((extraRowStartX + i) * PIXEL_SIZE, GRID_HEIGHT * PIXEL_SIZE);
      ctx.lineTo((extraRowStartX + i) * PIXEL_SIZE, (GRID_HEIGHT + 1) * PIXEL_SIZE);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(extraRowStartX * PIXEL_SIZE, (GRID_HEIGHT + 1) * PIXEL_SIZE);
    ctx.lineTo((extraRowStartX + EXTRA_ROW_PIXELS) * PIXEL_SIZE, (GRID_HEIGHT + 1) * PIXEL_SIZE);
    ctx.stroke();

    // Draw selection
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
  }, [selectionStart, selectionEnd, soldPixels, reservedPixels, loadedImages]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);
    const pixelId = getPixelId(x, y);

    if (pixelId && soldPixels.has(pixelId)) {
      const pixelData = soldPixels.get(pixelId);
      if (pixelData?.website_url) {
        window.open(pixelData.website_url, '_blank');
      }
      return;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);
    const pixelId = getPixelId(x, y);

    // Don't start selection if clicking a sold pixel
    if (pixelId && soldPixels.has(pixelId)) {
      return;
    }

    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectionEnd({ x, y });
    setShowCheckout(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);
    const pixelId = getPixelId(x, y);

    // Show tooltip for sold pixels
    if (pixelId && soldPixels.has(pixelId)) {
      const pixelData = soldPixels.get(pixelId);
      setHoveredPixel({
        id: pixelId,
        company: pixelData?.company_name || 'Unknown',
        x: e.clientX,
        y: e.clientY
      });
    } else {
      setHoveredPixel(null);
    }

    if (!isSelecting) return;
    setSelectionEnd({ x, y });
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  const handleMouseLeave = () => {
    setIsSelecting(false);
    setHoveredPixel(null);
  };

  const getSelectionInfo = () => {
    if (!selectionStart || !selectionEnd) return null;

    const width = Math.abs(selectionEnd.x - selectionStart.x) + 1;
    const height = Math.abs(selectionEnd.y - selectionStart.y) + 1;
    const pixelCount = width * height;
    
    const matchingBatch = batchOptions.find(
      opt => opt.width === width && opt.height === height
    );
    
    const price = matchingBatch ? matchingBatch.price : pixelCount * PRICE_PER_PIXEL;
    const selectedIds = getSelectedPixelIds();
    const unavailable = getUnavailableInSelection();

    return { width, height, pixelCount, price, selectedIds, unavailable };
  };

  const selectionInfo = getSelectionInfo();
  const canBuy = selectionInfo && selectionInfo.unavailable.sold.length === 0 && selectionInfo.unavailable.reserved.length === 0;

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
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ color: '#0f0' }}>{availablePixels.toLocaleString()} pixels left</span>
          {dbConnected === true && <span style={{ color: '#0f0', fontSize: '12px' }}>● DB Connected</span>}
          {dbConnected === false && <span style={{ color: '#f00', fontSize: '12px' }}>● DB Error</span>}
          <a href="/about" style={{ color: '#fff', textDecoration: 'none' }}>About</a>
          <a href="/faq" style={{ color: '#fff', textDecoration: 'none' }}>FAQ</a>
          <a href="/contact" style={{ color: '#fff', textDecoration: 'none' }}>Contact</a>
          <a href="https://x.com/2Mhomepage" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>𝕏</a>
        </div>
      </nav>

      <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        
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

        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <h2 style={{ color: '#ff1493', margin: '0 0 8px', fontSize: '14px', fontWeight: 'normal' }}>
            316×316 Pixel Grid — Click and drag to select pixels, or choose a popular size:
          </h2>
          
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
                setShowCheckout(false);
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

        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={GRID_WIDTH * PIXEL_SIZE}
            height={(GRID_HEIGHT + 1) * PIXEL_SIZE}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{
              border: '1px solid #555',
              cursor: 'crosshair'
            }}
          />
          
          {/* Tooltip for sold pixels */}
          {hoveredPixel && (
            <div style={{
              position: 'fixed',
              left: hoveredPixel.x + 10,
              top: hoveredPixel.y + 10,
              backgroundColor: '#000',
              border: '1px solid #ff1493',
              padding: '8px 12px',
              borderRadius: '5px',
              fontSize: '12px',
              pointerEvents: 'none',
              zIndex: 1000
            }}>
              <div style={{ color: '#ff1493', fontWeight: 'bold' }}>{hoveredPixel.company}</div>
              <div style={{ color: '#888' }}>Click to visit</div>
            </div>
          )}
        </div>

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
            <p style={{ margin: '5px 0', fontSize: '12px', color: '#888' }}>
              IDs: {selectionInfo.selectedIds.slice(0, 5).join(', ')}{selectionInfo.selectedIds.length > 5 ? '...' : ''}
            </p>
            
            {selectionInfo.unavailable.sold.length > 0 && (
              <p style={{ margin: '5px 0', color: '#ff0000', fontSize: '12px' }}>
                ⚠️ {selectionInfo.unavailable.sold.length} pixel(s) already sold
              </p>
            )}
            {selectionInfo.unavailable.reserved.length > 0 && (
              <p style={{ margin: '5px 0', color: '#ffd700', fontSize: '12px' }}>
                ⚠️ {selectionInfo.unavailable.reserved.length} pixel(s) reserved for auction
              </p>
            )}
            
            <p style={{ margin: '5px 0', fontSize: '24px', fontWeight: 'bold', color: '#0f0' }}>
              ${selectionInfo.price.toLocaleString()}
            </p>

            {!showCheckout ? (
              <button 
                onClick={handleBuyClick}
                disabled={!canBuy}
                style={{
                  marginTop: '15px',
                  padding: '12px 30px',
                  backgroundColor: canBuy ? '#ff1493' : '#555',
                  color: '#fff',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: canBuy ? 'pointer' : 'not-allowed',
                  borderRadius: '5px'
                }}>
                Buy Now
              </button>
            ) : (
              <div style={{ marginTop: '15px' }}>
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '10px',
                    backgroundColor: '#000',
                    border: '2px solid #333',
                    color: '#fff',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                />
                {checkoutError && (
                  <p style={{ color: '#ff0000', fontSize: '12px', marginBottom: '10px' }}>{checkoutError}</p>
                )}
                <button 
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: checkoutLoading ? '#555' : '#0f0',
                    color: '#000',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: checkoutLoading ? 'not-allowed' : 'pointer',
                    borderRadius: '5px'
                  }}>
                  {checkoutLoading ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            )}
          </div>
        )}

      </div>

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