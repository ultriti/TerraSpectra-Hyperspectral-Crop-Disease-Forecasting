import React, { useState } from 'react';
import Map, { Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// PASTE YOUR MAPBOX TOKEN HERE
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
            'diseased', '#ef4444', // Red for disease
            'healthy', '#22c55e',  // Green for healthy
            '#cccccc'
        ],
        'circle-opacity': 0.8
    }
};

function TerraMap() {
    const [viewState, setViewState] = useState({
        longitude: 78.4867,
        latitude: 17.3850,
        zoom: 14,
        pitch: 45, // This makes the map 3D!
        bearing: 0
    });

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                mapboxAccessToken={MAPBOX_TOKEN}
                dragPan={true}         // Allows dragging
                scrollZoom={true}      // Allows scrolling to zoom
                dragRotate={true}     // Prevents accidental rotation
                touchZoomRotate={true} // Smooth zoom on trackpads
                maxPitch={60}          // Limits how far it can tilt
                pitchWithRotate={true}  // Allows pitch with rotation   
                style={{ width: '100%', height: '100%' }}
            >
                {/* Render the colored dots on the map */}
                <Source id="mock-data" type="geojson" data={mockGeoJSON}>
                    <Layer {...layerStyle} />
                </Source>
            </Map>
        </div>
    );
}

export default TerraMap;