import React from 'react';
import PredictionMap from '../components/Map/PredictionMap';

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', backgroundColor: '#f8fafc' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '250px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>TerraSpectra</h1>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '32px' }}>Hyperspectral Crop Analysis</p>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ padding: '12px', backgroundColor: '#f3e8ff', color: '#6b21a8', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            🌍 Map Dashboard
          </div>
          <div style={{ padding: '12px', color: '#475569', borderRadius: '8px', cursor: 'pointer' }}>
            📁 Upload Dataset
          </div>
          <div style={{ padding: '12px', color: '#475569', borderRadius: '8px', cursor: 'pointer' }}>
            📊 Analytics
          </div>
        </nav>
      </div>

      {/* MAIN CONTENT (The Map goes here) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Farm Overview</h2>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Monitor crop health and stress levels from hyperspectral data.</p>
        </div>
        
        <div style={{ flex: 1, position: 'relative' }}>
          {/* This is where your Mapbox component will render */}
          <PredictionMap />
        </div>
      </div>

    </div>
  );
}