export default function MapLegend() {
  return (
    <div style={{
      position: 'absolute',
      bottom: '40px',
      right: '40px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      zIndex: 10,
      fontFamily: 'Inter, sans-serif'
    }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
        Crop Health Legend
      </h4>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
        <span style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>Healthy Crop</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
        <span style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>Stressed Crop</span>
      </div>
    </div>
  );
}