import { useState } from "react";
import PredictionMap from "../components/Map/PredictionMap";
import UploadPanel from "../components/Upload/UploadPanel";

export default function Dashboard() {
  const [activeTab] = useState<'map' | 'upload' | 'analytics'>('map');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* HEADER */}
      <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
          {activeTab === 'map' ? 'Farm Overview' : activeTab === 'upload' ? 'Upload Dataset' : 'Analytics'}
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          {activeTab === 'map' ? 'Monitor crop health and stress levels from hyperspectral data.' : activeTab === 'upload' ? 'Upload your hyperspectral data for analysis.' : 'View spectral charts and class distributions.'}
        </p>
      </div>

      {/* CONDITIONAL RENDERING */}
      <div style={{ height: 'calc(100vh - 90px)', position: 'relative' }}>
        {activeTab === 'map' && <PredictionMap />}
        {activeTab === 'upload' && <UploadPanel />}
        {activeTab === 'analytics' && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <h3>Analytics Coming Soon</h3>
          </div>
        )}
      </div>
    </div>
  );
}