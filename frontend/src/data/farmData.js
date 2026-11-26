/**
 * TerraSpectra Geospatial Farm Layers & Mock Datasets
 * Center: Salinas Valley Precision Agriculture Zone (-121.6100, 36.6600)
 * Total Area: ~1,000 Acres across 4 primary cultivation sectors
 */

export const FARM_CENTER = {
  longitude: -121.6100,
  latitude: 36.6600,
  zoom: 14.2,
  pitch: 48,
  bearing: -22,
  minZoom: 10,
  maxZoom: 20
};

// 1,000-Acre Farm Boundary Polygon
export const FARM_BOUNDARY_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "terra-farm-main",
        name: "TerraSpectra Alpha Experimental Farm",
        totalAcreage: 1000,
        owner: "AgriVision Consortium",
        soilType: "Chualar Loam (Class I)",
        elevationMeanMeters: 45
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-121.6220, 36.6500],
            [-121.6220, 36.6700],
            [-121.5980, 36.6700],
            [-121.5980, 36.6500],
            [-121.6220, 36.6500]
          ]
        ]
      }
    }
  ]
};

// Sectors / Agricultural Parcels (Sectors A, B, C, D)
export const FARM_SECTORS_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "sector-a",
        sector: "Sector A",
        crop: "Romaine Lettuce & Baby Spinach",
        acreage: 295,
        plantingDate: "2026-09-12",
        canopyCover: "88%",
        chlorophyllIndex: 0.62, // Lowered due to sub-surface fungal stress
        healthStatus: "WARNING",
        elevation: 40,
        color: [220, 53, 69, 160] // Highlighted warning
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-121.6100, 36.6600],
            [-121.6100, 36.6700],
            [-121.5980, 36.6700],
            [-121.5980, 36.6600],
            [-121.6100, 36.6600]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "sector-b",
        sector: "Sector B",
        crop: "Strawberries (Albion Variety)",
        acreage: 285,
        plantingDate: "2026-08-30",
        canopyCover: "94%",
        chlorophyllIndex: 0.89,
        healthStatus: "OPTIMAL",
        elevation: 25,
        color: [40, 167, 69, 140]
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-121.6220, 36.6600],
            [-121.6220, 36.6700],
            [-121.6100, 36.6700],
            [-121.6100, 36.6600],
            [-121.6220, 36.6600]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "sector-c",
        sector: "Sector C",
        crop: "Broccoli & Brassica Oleracea",
        acreage: 240,
        plantingDate: "2026-09-01",
        canopyCover: "91%",
        chlorophyllIndex: 0.84,
        healthStatus: "OPTIMAL",
        elevation: 20,
        color: [46, 204, 113, 140]
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-121.6220, 36.6500],
            [-121.6220, 36.6600],
            [-121.6100, 36.6600],
            [-121.6100, 36.6500],
            [-121.6220, 36.6500]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "sector-d",
        sector: "Sector D",
        crop: "Celery & Root Vegetables",
        acreage: 180,
        plantingDate: "2026-09-18",
        canopyCover: "86%",
        chlorophyllIndex: 0.79,
        healthStatus: "NORMAL",
        elevation: 15,
        color: [52, 152, 219, 140]
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-121.6100, 36.6500],
            [-121.6100, 36.6600],
            [-121.5980, 36.6600],
            [-121.5980, 36.6500],
            [-121.6100, 36.6500]
          ]
        ]
      }
    }
  ]
};

// PREDICTED 5-ACRE DISEASE OUTBREAK HOTSPOT
// Hyperspectral 3D-CNN + ViT detected early chlorophyll degradation
export const BLIGHT_PREDICTION_ZONE_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "fungal-blight-zone-5ac",
        name: "Target Zone Alpha-9 (5-Acre Hotspot)",
        threat: "Fungal Blight Outbreak (Downy Mildew / Bremia lactucae)",
        forecastLeadTime: "3 Weeks Pre-Symptomatic (Zero Visible Lesions)",
        confidenceScore: "94.8%",
        acreage: 5.12,
        detectedBandShift: "Red-Edge 705nm - 740nm Steep Flattening & PRI Anomaly",
        chlorophyllDepletionEst: "23.4%",
        recommendedAction: "Targeted bio-fungicide drone dispersion on Polygon A-9",
        status: "CRITICAL_ACTION_REQUIRED",
        color: [255, 30, 70, 210]
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-121.6065, 36.6640],
            [-121.6065, 36.6685],
            [-121.6020, 36.6685],
            [-121.6020, 36.6640],
            [-121.6065, 36.6640]
          ]
        ]
      }
    }
  ]
};

// IoT Ground Ground Stations & Spectral Radiometers
export const SENSOR_STATIONS = [
  {
    id: "RS-01",
    name: "Hyper-Radiometer Station 01 (North East)",
    coordinates: [-121.6042, 36.6662],
    spectralReflectanceB705: 0.32,
    soilMoisture: "38%",
    airTempC: 22.4,
    humidity: "78%",
    status: "ALERT_ANOMALY",
    elevation: 45
  },
  {
    id: "RS-02",
    name: "Hyper-Radiometer Station 02 (North West)",
    coordinates: [-121.6160, 36.6650],
    spectralReflectanceB705: 0.78,
    soilMoisture: "32%",
    airTempC: 21.8,
    humidity: "64%",
    status: "NORMAL",
    elevation: 30
  },
  {
    id: "RS-03",
    name: "Hyper-Radiometer Station 03 (South West)",
    coordinates: [-121.6160, 36.6550],
    spectralReflectanceB705: 0.81,
    soilMoisture: "34%",
    airTempC: 22.1,
    humidity: "62%",
    status: "NORMAL",
    elevation: 25
  },
  {
    id: "RS-04",
    name: "Hyper-Radiometer Station 04 (South East)",
    coordinates: [-121.6040, 36.6550],
    spectralReflectanceB705: 0.75,
    soilMoisture: "30%",
    airTempC: 23.0,
    humidity: "59%",
    status: "NORMAL",
    elevation: 20
  }
];

// Irrigation network & access paths (PathLayer)
export const IRRIGATION_LINES_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Central Pressurized Canal A", flowRate: "1200 gpm" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-121.6100, 36.6500],
          [-121.6100, 36.6700]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "East-West Drip Manifold B", flowRate: "850 gpm" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-121.6220, 36.6600],
          [-121.5980, 36.6600]
        ]
      }
    }
  ]
};

// Hyperspectral Grid Cells Simulation (Mocking the 30m GSD pixel raster)
export const generateSpectralPixelGrid = () => {
  const pixels = [];
  const minLon = -121.6220;
  const maxLon = -121.5980;
  const minLat = 36.6500;
  const maxLat = 36.6700;
  const step = 0.0012; // ~100m grid cell

  for (let lon = minLon; lon < maxLon; lon += step) {
    for (let lat = minLat; lat < maxLat; lat += step) {
      // Check if inside the 5-acre blight hotspot
      const isHotspot = (lon >= -121.6065 && lon <= -121.6020 && lat >= 36.6640 && lat <= 36.6685);
      
      let stressLevel = 0.12 + Math.random() * 0.15;
      let chlorophyllVal = 0.82 + Math.random() * 0.12;

      if (isHotspot) {
        stressLevel = 0.78 + Math.random() * 0.20; // Severe chemical stress
        chlorophyllVal = 0.40 + Math.random() * 0.15; // Low reflectance
      }

      pixels.push({
        position: [lon + step / 2, lat + step / 2],
        bounds: [
          [lon, lat],
          [lon + step, lat],
          [lon + step, lat + step],
          [lon, lat + step]
        ],
        stressLevel,
        chlorophyllVal,
        isHotspot,
        elevation: isHotspot ? 60 : 15 + stressLevel * 20
      });
    }
  }
  return pixels;
};
