'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabase';

// =============================================================================
// ZONE CONFIGURATION - Pre-batched block system
// =============================================================================

interface ZoneConfig {
  name: string;
  zoneX: number;
  zoneY: number;
  zoneW: number;
  zoneH: number;
  blockW: number;
  blockH: number;
  price: number;
  color: string;
  hoverColor: string;
}

const GRID_WIDTH = 250;
const GRID_HEIGHT = 400;
const TOTAL_PIXELS = GRID_WIDTH * GRID_HEIGHT;
const PIXEL_SIZE = 3;

// Zone definitions from center outward (order matters for rendering)
const ZONES: ZoneConfig[] = [
  {
    name: 'center',
    zoneX: 105, zoneY: 185, zoneW: 40, zoneH: 30,
    blockW: 40, blockH: 30,
    price: 25000,
    color: '#7F77DD',
    hoverColor: '#9990FF'
  },
  {
    name: 'premium',
    zoneX: 85, zoneY: 170, zoneW: 80, zoneH: 60,
    blockW: 20, blockH: 15,
    price: 5000,
    color: '#AFA9EC',
    hoverColor: '#C5C0FF'
  },
  {
    name: 'large',
    zoneX: 70, zoneY: 120, zoneW: 110, zoneH: 160,
    blockW: 10, blockH: 5,
    price: 1000,
    color: '#85B7EB',
    hoverColor: '#A0CCFF'
  },
  {
    name: 'medium',
    zoneX: 30, zoneY: 80, zoneW: 190, zoneH: 240,
    blockW: 5, blockH: 5,
    price: 500,
    color: '#5DCAA5',
    hoverColor: '#7EDDBB'
  },
  {
    name: 'small',
    zoneX: 6, zoneY: 24, zoneW: 238, zoneH: 352,
    blockW: 2, blockH: 2,
    price: 100,
    color: '#EF9F27',
    hoverColor: '#FFB847'
  },
  {
    name: 'tiny',
    zoneX: 0, zoneY: 0, zoneW: 250, zoneH: 400,
    blockW: 1, blockH: 1,
    price: 30,
    color: '#F09595',
    hoverColor: '#FFAAAA'
  }
];

interface Block {
  id: string;
  zone: string;
  x: number;
  y: number;
  w: number;
  h: number;
  pixels: number;
  price: number;
}

interface SoldBlock {
  block_id: string;
  image_url: string;
  website_url: string;
  company_name: string;
}

// =============================================================================
// GENERATE ALL PRE-BATCHED BLOCKS
// =============================================================================

function generateAllBlocks(): Block[] {
  const blocks: Block[] = [];
  const claimedPixels = new Set<string>();

  // Process zones from center outward
  for (const zone of ZONES) {
    const { name, zoneX, zoneY, zoneW, zoneH, blockW, blockH, price } = zone;

    for (let by = zoneY; by < zoneY + zoneH; by += blockH) {
      for (let bx = zoneX; bx < zoneX + zoneW; bx += blockW) {
        // Check if block extends beyond zone
        if (bx + blockW > zoneX + zoneW || by + blockH > zoneY + zoneH) {
          continue;
        }

        // Check if any pixel is already claimed
        let hasClaimedPixel = false;
        const blockPixels: string[] = [];

        for (let py = by; py < by + blockH; py++) {
          for (let px = bx; px < bx + blockW; px++) {
            const key = `${px},${py}`;
            if (claimedPixels.has(key)) {
              hasClaimedPixel = true;
              break;
            }
            blockPixels.push(key);
          }
          if (hasClaimedPixel) break;
        }

        if (hasClaimedPixel) continue;

        // Claim pixels and create block
        blockPixels.forEach(key => claimedPixels.add(key));

        blocks.push({
          id: `${name}_${bx}_${by}`,
          zone: name,
          x: bx,
          y: by,
          w: blockW,
          h: blockH,
          pixels: blockW * blockH,
          price: price
        });
      }
    }
  }

  return blocks;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Generate blocks once
  const allBlocks = useMemo(() => generateAllBlocks(), []);
  
  // Create a spatial index for fast block lookup
  const blockIndex = useMemo(() => {
    const index = new Map<string, Block>();
    allBlocks.forEach(block => {
      for (let py = block.y; py < block.y + block.h; py++) {
        for (let px = block.x; px < block.x + block.w; px++) {
          index.set(`${px},${py}`, block);
        }
      }
    });
    return index;
  }, [allBlocks]);

  const [soldBlocks, setSoldBlocks] = useState<Map<string, SoldBlock>>(new Map());
  const [reservedBlocks, setReservedBlocks] = useState<Set<string>>(new Set());
  const [hoveredBlock, setHoveredBlock] = useState<Block | null>(null);
  const [mousePos, setMousePos] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
  
  // Checkout state
  const [showCheckout, setShowCheckout] = useState(false);
  const [email, setEmail] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Calculate stats
  const soldPixels = Array.from(soldBlocks.keys()).reduce((sum, blockId) => {
    const block = allBlocks.find(b => b.id === blockId);
    return sum + (block?.pixels || 0);
  }, 0);
  const availablePixels = TOTAL_PIXELS - soldPixels;

  // =============================================================================
  // LOAD DATA FROM DATABASE
  // =============================================================================

  useEffect(() => {
    async function loadBlocks() {
      try {
        const { data, error } = await supabase
          .from('blocks')
          .select('block_id, status, image_url, website_url, company_name')
          .in('status', ['sold', 'reserved', 'pending']);

        if (error) {
          console.error('Database error:', error);
          setDbConnected(false);
          return;
        }

        setDbConnected(true);

        const sold = new Map<string, SoldBlock>();
        const reserved = new Set<string>();

        data?.forEach(row => {
          if (row.status === 'sold') {
            sold.set(row.block_id, {
              block_id: row.block_id,
              image_url: row.image_url || '',
              website_url: row.website_url || '',
              company_name: row.company_name || ''
            });
          } else {
            reserved.add(row.block_id);
          }
        });

        setSoldBlocks(sold);
        setReservedBlocks(reserved);
      } catch (err) {
        console.error('Connection error:', err);
        setDbConnected(false);
      }
    }

    loadBlocks();
  }, []);

  // =============================================================================
  // LOAD IMAGES
  // =============================================================================

  useEffect(() => {
    const imageUrls = new Set<string>();
    soldBlocks.forEach(block => {
      if (block.image_url) imageUrls.add(block.image_url);
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
  }, [soldBlocks]);

  // =============================================================================
  // DRAWING
  // =============================================================================

  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw zone backgrounds (in reverse order so outer zones are drawn first)
    for (let i = ZONES.length - 1; i >= 0; i--) {
      const zone = ZONES[i];
      ctx.fillStyle = zone.color + '40'; // 25% opacity
      ctx.fillRect(
        zone.zoneX * PIXEL_SIZE,
        zone.zoneY * PIXEL_SIZE,
        zone.zoneW * PIXEL_SIZE,
        zone.zoneH * PIXEL_SIZE
      );
    }

    // Draw grid lines for blocks - WHITE lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.5;

    // Draw block boundaries based on zones
    allBlocks.forEach(block => {
      ctx.strokeRect(
        block.x * PIXEL_SIZE,
        block.y * PIXEL_SIZE,
        block.w * PIXEL_SIZE,
        block.h * PIXEL_SIZE
      );
    });

    // Draw sold blocks with images
    soldBlocks.forEach((soldBlock, blockId) => {
      const block = allBlocks.find(b => b.id === blockId);
      if (!block) return;

      const img = loadedImages.get(soldBlock.image_url);
      const x = block.x * PIXEL_SIZE;
      const y = block.y * PIXEL_SIZE;
      const w = block.w * PIXEL_SIZE;
      const h = block.h * PIXEL_SIZE;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, w, h);

      // Draw image if loaded
      if (img) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, x, y, w, h);
      }

      // Border
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
    });

    // Draw reserved blocks
    reservedBlocks.forEach(blockId => {
      const block = allBlocks.find(b => b.id === blockId);
      if (!block) return;

      ctx.fillStyle = '#ffd70080';
      ctx.fillRect(
        block.x * PIXEL_SIZE,
        block.y * PIXEL_SIZE,
        block.w * PIXEL_SIZE,
        block.h * PIXEL_SIZE
      );
    });

    // Draw hovered block highlight
    if (hoveredBlock && !soldBlocks.has(hoveredBlock.id) && !reservedBlocks.has(hoveredBlock.id)) {
      const zone = ZONES.find(z => z.name === hoveredBlock.zone);
      ctx.fillStyle = zone?.hoverColor + 'AA' || '#ff149380';
      ctx.fillRect(
        hoveredBlock.x * PIXEL_SIZE,
        hoveredBlock.y * PIXEL_SIZE,
        hoveredBlock.w * PIXEL_SIZE,
        hoveredBlock.h * PIXEL_SIZE
      );

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        hoveredBlock.x * PIXEL_SIZE,
        hoveredBlock.y * PIXEL_SIZE,
        hoveredBlock.w * PIXEL_SIZE,
        hoveredBlock.h * PIXEL_SIZE
      );
    }

    // Draw selected block
    if (selectedBlock) {
      ctx.fillStyle = 'rgba(255, 20, 147, 0.5)';
      ctx.fillRect(
        selectedBlock.x * PIXEL_SIZE,
        selectedBlock.y * PIXEL_SIZE,
        selectedBlock.w * PIXEL_SIZE,
        selectedBlock.h * PIXEL_SIZE
      );

      ctx.strokeStyle = '#ff1493';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        selectedBlock.x * PIXEL_SIZE,
        selectedBlock.y * PIXEL_SIZE,
        selectedBlock.w * PIXEL_SIZE,
        selectedBlock.h * PIXEL_SIZE
      );
    }
  };

  useEffect(() => {
    drawGrid();
  }, [hoveredBlock, selectedBlock, soldBlocks, reservedBlocks, loadedImages, allBlocks]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const getBlockAtPosition = (mouseX: number, mouseY: number): Block | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((mouseX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((mouseY - rect.top) / PIXEL_SIZE);

    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return null;

    return blockIndex.get(`${x},${y}`) || null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const block = getBlockAtPosition(e.clientX, e.clientY);
    setHoveredBlock(block);
    setMousePos({x: e.clientX, y: e.clientY});
  };

  const handleMouseLeave = () => {
    setHoveredBlock(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const block = getBlockAtPosition(e.clientX, e.clientY);
    
    if (!block) return;

    // If sold, open website
    if (soldBlocks.has(block.id)) {
      const soldBlock = soldBlocks.get(block.id);
      if (soldBlock?.website_url) {
        let url = soldBlock.website_url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        window.open(url, '_blank');
      }
      return;
    }

    // If reserved, do nothing
    if (reservedBlocks.has(block.id)) {
      return;
    }

    // Select the block
    setSelectedBlock(block);
    setShowCheckout(false);
    setCheckoutError('');
  };

  // =============================================================================
  // CHECKOUT
  // =============================================================================

  const handleBuyClick = () => {
    setShowCheckout(true);
    setCheckoutError('');
  };

  const handleCheckout = async () => {
    if (!email) {
      setCheckoutError('Please enter your email');
      return;
    }

    if (!selectedBlock) return;

    setCheckoutLoading(true);
    setCheckoutError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockId: selectedBlock.id,
          zone: selectedBlock.zone,
          x: selectedBlock.x,
          y: selectedBlock.y,
          w: selectedBlock.w,
          h: selectedBlock.h,
          pixels: selectedBlock.pixels,
          price: selectedBlock.price,
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

  // =============================================================================
  // RENDER
  // =============================================================================

  const formatPrice = (price: number) => {
    return price >= 1000 ? `$${(price / 1000).toFixed(0)}K` : `$${price}`;
  };

  const getZoneStats = () => {
    const stats: { [key: string]: { total: number; sold: number; available: number } } = {};
    
    ZONES.forEach(zone => {
      stats[zone.name] = { total: 0, sold: 0, available: 0 };
    });

    allBlocks.forEach(block => {
      stats[block.zone].total++;
      if (soldBlocks.has(block.id) || reservedBlocks.has(block.id)) {
        stats[block.zone].sold++;
      } else {
        stats[block.zone].available++;
      }
    });

    return stats;
  };

  const zoneStats = getZoneStats();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000',
      color: '#fff',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Navigation */}
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

      <div style={{ padding: '20px 30px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Pricing tiers */}
        <h2 style={{ 
          color: '#ff1493', 
          textAlign: 'center', 
          margin: '0 0 15px', 
          fontSize: '18px', 
          fontWeight: 'normal' 
        }}>
          Click any block to purchase — Prices based on location
        </h2>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          gap: '8px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          {ZONES.slice().reverse().map(zone => (
            <div 
              key={zone.name}
              style={{
                padding: '10px 15px',
                backgroundColor: zone.color + '30',
                border: `2px solid ${zone.color}`,
                borderRadius: '5px',
                textAlign: 'center',
                minWidth: '100px'
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: zone.color }}>
                {formatPrice(zone.price)}
              </div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '3px' }}>
                {zone.blockW}×{zone.blockH} block
              </div>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                {zoneStats[zone.name]?.available || 0} left
              </div>
            </div>
          ))}
        </div>

        {/* Main grid area */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', alignItems: 'flex-start' }}>
          
          {/* Canvas */}
          <div style={{ position: 'relative' }}>
            <canvas
              ref={canvasRef}
              width={GRID_WIDTH * PIXEL_SIZE}
              height={GRID_HEIGHT * PIXEL_SIZE}
              onClick={handleClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                border: '1px solid #555',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Selection panel */}
          {selectedBlock && (
            <div style={{
              padding: '20px',
              backgroundColor: '#1a1a1a',
              border: '2px solid #ff1493',
              width: '280px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(255, 20, 147, 0.3)',
              borderRadius: '8px'
            }}>
              <h3 style={{ color: '#ff1493', margin: '0 0 15px', textTransform: 'capitalize' }}>
                {selectedBlock.zone} Block
              </h3>
              
              <div style={{ 
                padding: '15px', 
                backgroundColor: '#000', 
                borderRadius: '5px',
                marginBottom: '15px'
              }}>
                <p style={{ margin: '5px 0', color: '#888' }}>
                  Size: <span style={{ color: '#fff' }}>{selectedBlock.w} × {selectedBlock.h}</span>
                </p>
                <p style={{ margin: '5px 0', color: '#888' }}>
                  Pixels: <span style={{ color: '#fff' }}>{selectedBlock.pixels.toLocaleString()}</span>
                </p>
                <p style={{ margin: '5px 0', color: '#888' }}>
                  Position: <span style={{ color: '#fff' }}>({selectedBlock.x}, {selectedBlock.y})</span>
                </p>
              </div>

              <p style={{ margin: '10px 0', fontSize: '32px', fontWeight: 'bold', color: '#0f0' }}>
                ${selectedBlock.price.toLocaleString()}
              </p>

              {!showCheckout ? (
                <button 
                  onClick={handleBuyClick}
                  style={{
                    marginTop: '10px',
                    padding: '12px 30px',
                    backgroundColor: '#ff1493',
                    color: '#fff',
                    border: 'none',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    borderRadius: '5px',
                    width: '100%'
                  }}>
                  Buy This Block
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
                    <p style={{ color: '#ff0000', fontSize: '12px', marginBottom: '10px' }}>
                      {checkoutError}
                    </p>
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

              <button 
                onClick={() => setSelectedBlock(null)}
                style={{
                  marginTop: '10px',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  color: '#888',
                  border: '1px solid #333',
                  fontSize: '12px',
                  cursor: 'pointer',
                  borderRadius: '5px',
                  width: '100%'
                }}>
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Hover tooltip - follows cursor, hides when block selected */}
        {hoveredBlock && !selectedBlock && (
          <div style={{
            position: 'fixed',
            left: mousePos.x + 20,
            top: mousePos.y - 40,
            backgroundColor: '#000',
            border: `2px solid ${ZONES.find(z => z.name === hoveredBlock.zone)?.color || '#fff'}`,
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 100,
            minWidth: '150px'
          }}>
            {soldBlocks.has(hoveredBlock.id) ? (
              <>
                <div style={{ color: '#ff1493', fontWeight: 'bold', fontSize: '16px' }}>
                  {soldBlocks.get(hoveredBlock.id)?.company_name || 'Sold'}
                </div>
                <div style={{ color: '#888', marginTop: '5px' }}>Click to visit</div>
              </>
            ) : reservedBlocks.has(hoveredBlock.id) ? (
              <div style={{ color: '#ffd700', fontSize: '16px' }}>Reserved</div>
            ) : (
              <>
                <div style={{ color: '#0f0', fontWeight: 'bold', fontSize: '24px' }}>
                  {formatPrice(hoveredBlock.price)}
                </div>
                <div style={{ color: '#fff', marginTop: '8px' }}>
                  {hoveredBlock.w}×{hoveredBlock.h} block • {hoveredBlock.pixels} pixels
                </div>
                <div style={{ color: '#888', marginTop: '4px', textTransform: 'capitalize' }}>
                  {hoveredBlock.zone} zone
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer info */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px', 
          padding: '15px',
          color: '#666',
          fontSize: '12px'
        }}>
          <p style={{ margin: '0 0 10px' }}>
            {allBlocks.length.toLocaleString()} blocks • {TOTAL_PIXELS.toLocaleString()} pixels • Max revenue: $2,342,120
          </p>
          <p style={{ margin: '0', color: '#ff1493', fontSize: '24px', fontWeight: 'bold' }}>
            Stitch go boom what's up, Hello Micah
          </p>
        </div>

      </div>
    </div>
  );
}