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
  const [block, setBlock] = useState<any>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

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

      // Load block data
      if (purchaseData.block_id) {
        const { data: blockData, error: blockError } = await supabase
          .from('blocks')
          .select('*')
          .eq('block_id', purchaseData.block_id)
          .single();

        if (!blockError && blockData) {
          setBlock(blockData);
          
          // Send receipt email (only once)
          if (!emailSent && purchaseData.email) {
            setEmailSent(true);
            fetch('/api/send-receipt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: purchaseData.email,
                blockId: blockData.block_id,
                zone: blockData.zone,
                pixels: blockData.pixels,
                price: blockData.price / 100,
                purchaseId: purchaseId
              })
            }).catch(err => console.error('Email error:', err));
          }
        }
      }

      if (purchaseData.image_url) {
        setSubmitted(true);
      }

      setLoading(false);
    }

    loadPurchase();
  }, [purchaseId, emailSent]);

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

    if (!websiteUrl) {
      setError('Please enter a URL');
      return;
    }

    if (!purchase?.block_id) {
      setError('Block ID not found');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const fileExt = image.name.split('.').pop();
      const fileName = `${purchase.block_id}.${fileExt}`;
      
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

      // Update purchase
      const { error: purchaseUpdateError } = await supabase
        .from('purchases')
        .update({
          image_url: imageUrl,
          website_url: websiteUrl,
          company_name: companyName,
          status: 'completed'
        })
        .eq('id', purchaseId);

      if (purchaseUpdateError) {
        setError('Failed to update purchase: ' + purchaseUpdateError.message);
        setSubmitting(false);
        return;
      }

      // Update block to sold
      const { error: blockError } = await supabase
        .from('blocks')
        .update({
          status: 'sold',
          image_url: imageUrl,
          website_url: websiteUrl,
          company_name: companyName,
          sold_at: new Date().toISOString()
        })
        .eq('block_id', purchase.block_id);

      if (blockError) {
        console.error('Error updating block:', blockError);
        setError('Failed to update block: ' + blockError.message);
        setSubmitting(false);
        return;
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
        <p style={{ marginBottom: '20px' }}>Your block is now displayed on the grid.</p>
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
          You purchased a {block?.w}×{block?.h} {block?.zone} block ({block?.pixels || purchase?.pixel_count} pixels). 
          Now upload your image and enter your URL.
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

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Website URL
          </label>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
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
        </div>

        <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#1a1a1a', borderRadius: '5px' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Your Block:</p>
          <p style={{ color: '#888', fontSize: '14px' }}>
            {block?.zone ? `${block.zone.charAt(0).toUpperCase() + block.zone.slice(1)} Zone` : 'Loading...'} • {block?.w}×{block?.h} • {block?.pixels || purchase?.pixel_count} pixels
          </p>
          <p style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>
            Position: ({block?.x}, {block?.y})
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