'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from './lib/supabase';

export default function Home() {
  const GRID_WIDTH = 400;
  const GRID_HEIGHT = 250;
  const TOTAL_PIXELS = GRID_WIDTH * GRID_HEIGHT;
  const PIXEL_SIZE = 3;
  
  // Tiered pricing: $30 for 1-9, $20 for 10-99, $10 for 100+
  const getPricePerPixel = (quantity: number): number => {
    if (quantity >= 100) return 10;
    if (quantity >= 10) return 20;
    return 30;
  };
  
  const calculatePrice = (quantity: number): number => {
    return quantity * getPricePerPixel(quantity);
  };
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [availablePixels, setAvailablePixels] = useState(TOTAL_PIXELS);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{x: number, y: number} | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{x: number, y: number} | null>(null);
  const [soldPixels, setSoldPixels] = useState<Map<number, {image_url: string, website_url: string, company_name: string, purchase_id: string}>>(new Map());
  const [reservedPixels, setReservedPixels] = useState<Set<number>>(new Set());
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [email, setEmail] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const [hoveredPixel, setHoveredPixel] = useState<{id: number, company: string, x: number, y: number} | null>(null);
  const [purchaseGroups, setPurchaseGroups] = useState<Map<string, {pixelIds: number[], image_url: string, website_url: string, company_name: string, bounds: {minX: number, minY: number, maxX: number, maxY: number}}>>(new Map());

  const getPixelCoords = (pixelId: number): {x: number, y: number} | null => {
    if (pixelId < 1 || pixelId > TOTAL_PIXELS) return null;
    return {
      x: (pixelId - 1) % GRID_WIDTH,
      y: Math.floor((pixelId - 1) / GRID_WIDTH)
    };
  };

  useEffect(() => {
    const imageUrls = new Set<string>();
    purchaseGroups.forEach(group => {
      if (group.image_url) imageUrls.add(group.image_url);
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
  }, [purchaseGroups]);

  useEffect(() => {
    async function loadPixels() {
      try {
        const { data, error } = await supabase
          .from('pixels')
          .select('id, status, image_url, website_url, company_name, purchase_id')
          .in('status', ['sold', 'reserved', 'pending']);

        if (error) {
          console.error('Database error:', error);
          setDbConnected(false);
          return;
        }

        setDbConnected(true);

        const sold = new Map<number, {image_url: string, website_url: string, company_name: string, purchase_id: string}>();
        const reserved = new Set<number>();
        const groups = new Map<string, {pixelIds: number[], image_url: string, website_url: string, company_name: string, bounds: {minX: number, minY: number, maxX: number, maxY: number}}>();

        data?.forEach(pixel => {
          if (pixel.status === 'sold') {
            sold.set(pixel.id, {
              image_url: pixel.image_url || '',
              website_url: pixel.website_url || '',
              company_name: pixel.company_name || '',
              purchase_id: pixel.purchase_id || ''
            });

            if (pixel.purchase_id) {
              const coords = getPixelCoords(pixel.id);
              if (coords) {
                if (!groups.has(pixel.purchase_id)) {
                  groups.set(pixel.purchase_id, {
                    pixelIds: [pixel.id],
                    image_url: pixel.image_url || '',
                    website_url: pixel.website_url || '',
                    company_name: pixel.company_name || '',
                    bounds: { minX: coords.x, minY: coords.y, maxX: coords.x, maxY: coords.y }
                  });
                } else {
                  const group = groups.get(pixel.purchase_id)!;
                  group.pixelIds.push(pixel.id);
                  group.bounds.minX = Math.min(group.bounds.minX, coords.x);
                  group.bounds.minY = Math.min(group.bounds.minY, coords.y);
                  group.bounds.maxX = Math.max(group.bounds.maxX, coords.x);
                  group.bounds.maxY = Math.max(group.bounds.maxY, coords.y);
                }
              }
            }
          } else if (pixel.status === 'reserved') {
            reserved.add(pixel.id);
          } else if (pixel.status === 'pending') {
            reserved.add(pixel.id);
          }
        });

        setSoldPixels(sold);
        setReservedPixels(reserved);
        setPurchaseGroups(groups);
        setAvailablePixels(TOTAL_PIXELS - sold.size - reserved.size);
      } catch (err) {
        console.error('Connection error:', err);
        setDbConnected(false);
      }
    }

    loadPixels();
  }, []);

  const getPixelId = (x: number, y: number): number | null => {
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return null;
    return (y * GRID_WIDTH) + x + 1;
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

    // Draw grid lines FIRST (before sold pixels)
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

    // Draw purchase groups AFTER grid lines (covers them up)
    purchaseGroups.forEach((group) => {
      const img = loadedImages.get(group.image_url);
      const { minX, minY, maxX, maxY } = group.bounds;
      const width = (maxX - minX + 1) * PIXEL_SIZE;
      const height = (maxY - minY + 1) * PIXEL_SIZE;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(minX * PIXEL_SIZE, minY * PIXEL_SIZE, width, height);
      
      if (img) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, minX * PIXEL_SIZE, minY * PIXEL_SIZE, width, height);
      }
    });

    // Reserved pixels
    ctx.fillStyle = '#ffd700';
    reservedPixels.forEach(pixelId => {
      const coords = getPixelCoords(pixelId);
      if (!coords) return;
      ctx.fillRect(coords.x * PIXEL_SIZE, coords.y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    });

    // Selection overlay
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
  }, [selectionStart, selectionEnd, soldPixels, reservedPixels, loadedImages, purchaseGroups]);

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
        let url = pixelData.website_url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        window.open(url, '_blank');
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
    const price = calculatePrice(pixelCount);
    const pricePerPixel = getPricePerPixel(pixelCount);
    const selectedIds = getSelectedPixelIds();
    const unavailable = getUnavailableInSelection();

    return { width, height, pixelCount, price, pricePerPixel, selectedIds, unavailable };
  };

  const selectionInfo = getSelectionInfo();
  const canBuy = selectionInfo && selectionInfo.unavailable.sold.length === 0 && selectionInfo.unavailable.reserved.length === 0;

  const sponsorBlockStyle = {
    padding: '12px 20px',
    backgroundColor: '#1a1a1a',
    color: '#888',
    border: '2px dashed #555',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    borderRadius: '5px',
    textAlign: 'center' as const,
    minWidth: '120px'
  };

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

      <div style={{ padding: '20px 50px', maxWidth: '1400px', margin: '0 auto' }}>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'nowrap',
          padding: '0 20px'
        }}>
          {[1, 2, 3, 4, 5, 6].map(num => (
            <div key={`sponsor-${num}`} style={sponsorBlockStyle}>
              <div>Sponsor {num}</div>
              <div style={{ fontSize: '16px', marginTop: '5px', color: '#fff' }}>$10,000</div>
            </div>
          ))}
        </div>

        <h2 style={{ 
          color: '#ff1493', 
          textAlign: 'center', 
          margin: '0 0 15px', 
          fontSize: '18px', 
          fontWeight: 'normal' 
        }}>
          Pixel Grid — Click and drag to select pixels, or choose a popular size:
        </h2>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            padding: '12px 20px',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            border: '2px solid #0f0',
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '5px',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f0' }}>$30</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>1-9 pixels</div>
          </div>
          
          <div style={{
            padding: '12px 20px',
            backgroundColor: '#ff1493',
            color: '#fff',
            border: '2px solid #ff1493',
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '5px',
            textAlign: 'center',
            minWidth: '120px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              backgroundColor: '#0f0',
              color: '#000',
              fontSize: '10px',
              padding: '3px 8px',
              borderRadius: '3px',
              fontWeight: 'bold'
            }}>
              POPULAR
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>$20</div>
            <div style={{ fontSize: '12px', color: '#fff', marginTop: '5px' }}>10-99 pixels</div>
          </div>
          
          <div style={{
            padding: '12px 20px',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            border: '2px solid #0f0',
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '5px',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f0' }}>$10</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>100+ pixels</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={GRID_WIDTH * PIXEL_SIZE}
            height={GRID_HEIGHT * PIXEL_SIZE}
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
            zIndex: 1000,
            borderRadius: '8px'
          }}>
            <h3 style={{ color: '#ff1493', margin: '0 0 15px' }}>Your Selection</h3>
            <p style={{ margin: '5px 0' }}>Size: {selectionInfo.width} × {selectionInfo.height}</p>
            <p style={{ margin: '5px 0' }}>Pixels: {selectionInfo.pixelCount.toLocaleString()}</p>
            <p style={{ margin: '5px 0', fontSize: '12px', color: '#888' }}>
              @ ${selectionInfo.pricePerPixel}/pixel
            </p>
            
            {selectionInfo.unavailable.sold.length > 0 && (
              <p style={{ margin: '5px 0', color: '#ff0000', fontSize: '12px' }}>
                ⚠️ {selectionInfo.unavailable.sold.length} pixel(s) already sold
              </p>
            )}
            {selectionInfo.unavailable.reserved.length > 0 && (
              <p style={{ margin: '5px 0', color: '#ffd700', fontSize: '12px' }}>
                ⚠️ {selectionInfo.unavailable.reserved.length} pixel(s) reserved
              </p>
            )}
            
            <p style={{ margin: '10px 0', fontSize: '28px', fontWeight: 'bold', color: '#0f0' }}>
              ${selectionInfo.price.toLocaleString()}
            </p>

            {!showCheckout ? (
              <button 
                onClick={handleBuyClick}
                disabled={!canBuy}
                style={{
                  marginTop: '10px',
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
              <div style={{ marginTop: '10px' }}>
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
                    fontSize: '14px',
                    boxSizing: 'border-box'
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

        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px', 
          padding: '15px',
          color: '#666',
          fontSize: '12px'
        }}>
          <p style={{ margin: '0 0 10px' }}>
            100,000 pixels • Each pixel becomes an NFT when the grid sells out
          </p>
          <p style={{ margin: '0', color: '#ff1493', fontSize: '24px', fontWeight: 'bold' }}>
            Stitch go boom what's up, Hello Micah
          </p>
        </div>

      </div>
    </div>
  );
}