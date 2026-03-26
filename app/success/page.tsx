'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabase';

export const dynamic = 'force-dynamic';

function SuccessContent() {
  const searchParams = useSearchParams();
  const purchaseId = searchParams.get('purchase_id');
  
  const [loading, setLoading] = useState(true);
  const [purchase, setPurchase] = useState<any>(null);
  const [pixelIds, setPixelIds] = useState<number[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [urlMode, setUrlMode] = useState<'single' | 'multiple'>('single');
  const [singleUrl, setSingleUrl] = useState('');
  const [multipleUrls, setMultipleUrls] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPurchase() {
      if (!purchaseId) {
        setError('No purchase ID found');
        setLoading(false);
        return;
      }

      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .select('*')
        .eq('id', purchaseId)
        .single();

      if (purchaseError || !purchaseData) {
        setError('Purchase not found');
        setLoading(false);
        return;
      }

      setPurchase(purchaseData);

      const { data: pixels, error: pixelsError } = await supabase
        .from('pixels')
        .select('id')
        .eq('purchase_id', purchaseId);

      if (!pixelsError && pixels) {
        setPixelIds(pixels.map(p => p.id).sort((a, b) => a - b));
      }

      if (purchaseData.image_url) {
        setSubmitted(true);
      }

      setLoading(false);
    }

    loadPurchase();
  }, [purchaseId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      setError('Please upload an image');
      return;
    }

    if (urlMode === 'single' && !singleUrl) {
      setError('Please enter a URL');
      return;
    }

    if (urlMode === 'multiple' && !multipleUrls.trim()) {
      setError('Please enter at least one URL');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const fileExt = image.name.split('.').pop();
      const fileName = `${purchaseId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('pixel-images')
        .upload(fileName, image, { upsert: true });

      if (uploadError) {
        setError('Failed to upload image: ' + uploadError.message);
        setSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('pixel-images')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      let urls: string[] = [];
      if (urlMode === 'single') {
        urls = pixelIds.map(() => singleUrl);
      } else {
        const urlList = multipleUrls.split('\n').map(u => u.trim()).filter(u => u);
        while (urlList.length < pixelIds.length) {
          urlList.push(urlList[urlList.length - 1] || '');
        }
        urls = urlList.slice(0, pixelIds.length);
      }

      const { error: purchaseUpdateError } = await supabase
        .from('purchases')
        .update({
          image_url: imageUrl,
          website_url: urls[0],
          company_name: companyName,
          status: 'completed'
        })
        .eq('id', purchaseId);

      if (purchaseUpdateError) {
        setError('Failed to update purchase: ' + purchaseUpdateError.message);
        setSubmitting(false);
        return;
      }

      for (let i = 0; i < pixelIds.length; i++) {
        const { error: pixelError } = await supabase
          .from('pixels')
          .update({
            status: 'sold',
            image_url: imageUrl,
            website_url: urls[i],
            company_name: companyName
          })
          .eq('id', pixelIds[i]);
        
        if (pixelError) {
          console.error('Error updating pixel:', pixelIds[i], pixelError);
        }
      }

      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong');
      console.error(err);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        padding: '20px'
      }}>
        <h1 style={{ color: '#0f0', marginBottom: '20px' }}>🎉 You're Live!</h1>
        <p style={{ marginBottom: '20px' }}>Your pixels are now displayed on the grid.</p>
        <a href="/" style={{
          padding: '15px 30px',
          backgroundColor: '#ff1493',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '5px',
          fontWeight: 'bold'
        }}>
          View the Grid
        </a>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      fontFamily: 'Arial, sans-serif',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: '#0f0', marginBottom: '10px' }}>✓ Payment Successful!</h1>
        <p style={{ color: '#888', marginBottom: '30px' }}>
          You purchased {pixelIds.length} pixel{pixelIds.length > 1 ? 's' : ''}. 
          Now upload your image and enter your URL{pixelIds.length > 1 ? 's' : ''}.
        </p>

        {error && (
          <p style={{ color: '#ff0000', marginBottom: '20px' }}>{error}</p>
        )}

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Company/Display Name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Your company or name"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#1a1a1a',
              border: '2px solid #333',
              color: '#fff',
              borderRadius: '5px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Upload Your Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#1a1a1a',
              border: '2px solid #333',
              color: '#fff',
              borderRadius: '5px'
            }}
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                marginTop: '10px',
                maxWidth: '200px',
                border: '2px solid #333'
              }}
            />
          )}
          <p style={{ color: '#888', fontSize: '12px', marginTop: '5px' }}>
            Recommended: Square image, at least 100x100 pixels
          </p>
        </div>

        {pixelIds.length > 1 && (
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              URL Options
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setUrlMode('single')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: urlMode === 'single' ? '#ff1493' : '#1a1a1a',
                  color: '#fff',
                  border: '2px solid #ff1493',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Same URL for all
              </button>
              <button
                onClick={() => setUrlMode('multiple')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: urlMode === 'multiple' ? '#ff1493' : '#1a1a1a',
                  color: '#fff',
                  border: '2px solid #ff1493',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Different URLs ({pixelIds.length} backlinks)
              </button>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            {urlMode === 'single' || pixelIds.length === 1 
              ? 'Website URL' 
              : `Enter ${pixelIds.length} URLs (one per line)`}
          </label>
          
          {(urlMode === 'single' || pixelIds.length === 1) ? (
            <input
              type="url"
              value={singleUrl}
              onChange={(e) => setSingleUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1a1a1a',
                border: '2px solid #333',
                color: '#fff',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            />
          ) : (
            <textarea
              value={multipleUrls}
              onChange={(e) => setMultipleUrls(e.target.value)}
              placeholder={`https://yoursite.com/page1\nhttps://yoursite.com/page2\nhttps://yoursite.com/page3`}
              rows={Math.min(pixelIds.length, 10)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1a1a1a',
                border: '2px solid #333',
                color: '#fff',
                borderRadius: '5px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
            />
          )}
          {urlMode === 'multiple' && pixelIds.length > 1 && (
            <p style={{ color: '#888', fontSize: '12px', marginTop: '5px' }}>
              Enter up to {pixelIds.length} URLs. If you enter fewer, the last URL will be repeated.
            </p>
          )}
        </div>

        <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#1a1a1a', borderRadius: '5px' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Your Pixel IDs:</p>
          <p style={{ color: '#888', fontSize: '12px', wordBreak: 'break-all' }}>
            {pixelIds.join(', ')}
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: submitting ? '#555' : '#ff1493',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: submitting ? 'not-allowed' : 'pointer'
          }}
        >
          {submitting ? 'Uploading...' : 'Submit & Go Live'}
        </button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}