import React, { useState } from 'react';

export default function UploadPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success'>('idle');

  const handleUpload = () => {
    if (!file) return;
    setStatus('uploading');
    // Simulate API call
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '600px', margin: '40px auto' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Upload Hyperspectral Data</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Select a .npz or .csv file to begin analysis.</p>

      <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '40px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
        <input type="file" accept=".npz,.csv" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} id="file-upload" />
        <label htmlFor="file-upload" style={{ cursor: 'pointer', color: '#7c3aed', fontWeight: '600' }}>
          {file ? file.name : "Click to browse files"}
        </label>
      </div>

      <button onClick={handleUpload} disabled={!file || status === 'uploading'} style={{ marginTop: '20px', width: '100%', padding: '12px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
        {status === 'uploading' ? 'Processing...' : 'Start Analysis'}
      </button>

      {status === 'success' && <p style={{ color: 'green', marginTop: '16px', textAlign: 'center' }}>✅ Dataset uploaded successfully!</p>}
    </div>
  );
}