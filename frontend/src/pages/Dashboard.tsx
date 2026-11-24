import { useState } from 'react';
import PredictionMap from '../components/Map/PredictionMap';
import UploadPanel from '../components/Upload/UploadPanel';
import SpectralChart from '../components/Analytics/SpectralChart';
import ClassDistribution from '../components/Analytics/ClassDistribution';
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'map' | 'upload' | 'analytics'>('map');

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', backgroundColor: '#f8fafc' }}>

      {/* SIDEBAR */}
      <div style={{ width: '250px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>TerraSpectra</h1>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '32px' }}>Hyperspectral Crop Analysis</p>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            onClick={() => setActiveTab('map')}
            style={{ padding: '12px', backgroundColor: activeTab === 'map' ? '#f3e8ff' : 'transparent', color: activeTab === 'map' ? '#6b21a8' : '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
          >
            🌍 Map Dashboard
          </div>

          <div
            onClick={() => setActiveTab('upload')}
            style={{ padding: '12px', backgroundColor: activeTab === 'upload' ? '#f3e8ff' : 'transparent', color: activeTab === 'upload' ? '#6b21a8' : '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
          >
            📁 Upload Dataset
          </div>

          <div
            onClick={() => setActiveTab('analytics')}
            style={{ padding: '12px', backgroundColor: activeTab === 'analytics' ? '#f3e8ff' : 'transparent', color: activeTab === 'analytics' ? '#6b21a8' : '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
          >
            📊 Analytics
          </div>
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
            {activeTab === 'map' ? 'Farm Overview' : activeTab === 'upload' ? 'Upload Dataset' : 'Analytics'}
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            {activeTab === 'map' ? 'Monitor crop health and stress levels from hyperspectral data.' : activeTab === 'upload' ? 'Upload your hyperspectral data for analysis.' : 'View spectral charts and class distributions.'}
          </p>
        </div>

        <div style={{ height: 'calc(100vh - 90px)', position: 'relative' }}>
          {activeTab === 'map' && <PredictionMap />}
          {activeTab === 'upload' && <UploadPanel />}
          {activeTab === 'analytics' && (
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', backgroundColor: '#f8fafc', height: '100%' }}>
              <SpectralChart />
              <ClassDistribution />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}