import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockSpectralData = [
  { wavelength: 450, healthy: 0.2, stressed: 0.3 },
  { wavelength: 500, healthy: 0.25, stressed: 0.4 },
  { wavelength: 550, healthy: 0.5, stressed: 0.35 },
  { wavelength: 600, healthy: 0.45, stressed: 0.3 },
  { wavelength: 650, healthy: 0.35, stressed: 0.25 },
  { wavelength: 700, healthy: 0.6, stressed: 0.2 },
  { wavelength: 750, healthy: 0.7, stressed: 0.15 },
];

export default function SpectralChart() {
  return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '350px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700' }}>Spectral Signature (Healthy vs Stressed)</h3>
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockSpectralData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="wavelength" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="healthy" stroke="#22c55e" strokeWidth={2} name="Healthy" />
            <Line type="monotone" dataKey="stressed" stroke="#ef4444" strokeWidth={2} name="Stressed" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}