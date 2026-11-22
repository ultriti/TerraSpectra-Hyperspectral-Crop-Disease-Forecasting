// @ts-nocheck
import React, { useState } from 'react';
import Map, { Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// We use the .env variable for security
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN; 

const mockGeoJSON = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { health: 'diseased' }, geometry: { type: 'Point', coordinates: [78.4867, 17.3850] } },
    { type: 'Feature', properties: { health: 'healthy' }, geometry: { type: 'Point', coordinates: [78.4900, 17.3850] } }
  ]
};

const layerStyle = {
  id: 'disease-layer',
  type: 'circle',
  paint: {
    'circle-radius': 15,
    'circle-color': [
      'match',
      ['get', 'health'],
      'diseased', '#ef4444',
      'healthy', '#22c55e',
      '#cccccc'
    ],
    'circle-opacity': 0.8
  }
};

export default function PredictionMap() {
  const [viewState, setViewState] = useState({
    longitude: 78.4867,
    latitude: 17.3850,
    zoom: 14,
    pitch: 0,
    bearing: 0
  });

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        dragPan={true}
        scrollZoom={true}
      >
        <Source id="mock-data" type="geojson" data={mockGeoJSON}>
          <Layer {...layerStyle} />
        </Source>
      </Map>
    </div>
  );
}