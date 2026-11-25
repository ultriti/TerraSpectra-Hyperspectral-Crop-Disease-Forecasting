/**
 * Mock Backend JSON Responses for Hyperspectral Disease Heatmaps
 * Conforms to the output format of the 3D-CNN + Vision Transformer inference pipeline.
 */

// Generate a 400-cell grid across the 1,000-acre Salinas Valley farm (-121.6220 to -121.5980 lon, 36.6500 to 36.6700 lat)
const generateGridCells = (scenario = "current") => {
  const cells = [];
  const minLon = -121.6220;
  const maxLon = -121.5980;
  const minLat = 36.6500;
  const maxLat = 36.6700;
  const step = 0.0012; // ~100m grid cell (30m GSD aggregated)

  let idCounter = 1;

  for (let lon = minLon; lon < maxLon; lon += step) {
    for (let lat = minLat; lat < maxLat; lat += step) {
      const centerLon = lon + step / 2;
      const centerLat = lat + step / 2;

      // Determine sector
      let sector = "Sector D";
      let crop = "Celery & Root Crops";
      if (centerLon >= -121.6100 && centerLat >= 36.6600) {
        sector = "Sector A";
        crop = "Romaine Lettuce";
      } else if (centerLon < -121.6100 && centerLat >= 36.6600) {
        sector = "Sector B";
        crop = "Strawberries";
      } else if (centerLon < -121.6100 && centerLat < 36.6600) {
        sector = "Sector C";
        crop = "Broccoli & Brassicas";
      }

      // Check if inside the 5-acre blight hotspot in Sector A
      const isHotspotCore = (centerLon >= -121.6065 && centerLon <= -121.6020 && centerLat >= 36.6640 && centerLat <= 36.6685);
      
      // Proximity to hotspot for buffer / progression zone
      const distToHotspot = Math.sqrt(
        Math.pow(centerLon - (-121.6042), 2) + Math.pow(centerLat - 36.6662, 2)
      );

      let diseaseRisk = 0.08 + Math.random() * 0.12;
      let chlorophyllIndex = 0.82 + Math.random() * 0.12;
      let redEdgeSlope = 0.76 + Math.random() * 0.10;
      let waterStress = 0.20 + Math.random() * 0.15;
      let canopyHeight = 0.35 + Math.random() * 0.15;
      let status = "HEALTHY";
      let isHotspot = false;

      if (scenario === "baseline") {
        // T-7 Days Baseline: Healthy uniform canopy
        diseaseRisk = 0.05 + Math.random() * 0.08;
        chlorophyllIndex = 0.85 + Math.random() * 0.10;
        status = "HEALTHY";
      } else if (scenario === "current") {
        // Day 0: 5-acre critical outbreak in Sector A (pre-symptomatic)
        if (isHotspotCore) {
          diseaseRisk = 0.88 + Math.random() * 0.11;
          chlorophyllIndex = 0.35 + Math.random() * 0.12;
          redEdgeSlope = 0.25 + Math.random() * 0.10; // Collapsed red-edge slope
          waterStress = 0.65 + Math.random() * 0.20;
          canopyHeight = 0.48;
          status = "CRITICAL_BLIGHT";
          isHotspot = true;
        } else if (distToHotspot < 0.005) {
          // Perimeter buffer
          diseaseRisk = 0.45 + Math.random() * 0.20;
          chlorophyllIndex = 0.65 + Math.random() * 0.10;
          redEdgeSlope = 0.55 + Math.random() * 0.10;
          status = "MODERATE_STRESS";
        }
      } else if (scenario === "progression") {
        // T+14 Days Progression: untreated spores spreading along irrigation corridor
        if (isHotspotCore || distToHotspot < 0.008) {
          diseaseRisk = 0.92 + Math.random() * 0.07;
          chlorophyllIndex = 0.28 + Math.random() * 0.10;
          redEdgeSlope = 0.20 + Math.random() * 0.08;
          status = "CRITICAL_BLIGHT";
          isHotspot = true;
        } else if (distToHotspot < 0.014) {
          diseaseRisk = 0.58 + Math.random() * 0.25;
          chlorophyllIndex = 0.55 + Math.random() * 0.12;
          status = "MODERATE_STRESS";
        }
      }

      // 7 key spectral wavelengths reflectance for pixel inspector sparkline
      const spectralSignature = {
        b480_blue: Number((0.05 + (1 - chlorophyllIndex) * 0.08).toFixed(3)),
        b560_green: Number((0.14 + chlorophyllIndex * 0.08).toFixed(3)),
        b680_red_abs: Number((0.08 + (1 - chlorophyllIndex) * 0.22).toFixed(3)), // Higher reflectance when chlorophyll is lost
        b705_red_edge: Number(redEdgeSlope.toFixed(3)),
        b740_nir_shoulder: Number((redEdgeSlope * 1.35).toFixed(3)),
        b850_nir_plateau: Number((0.50 + chlorophyllIndex * 0.35).toFixed(3)),
        b1650_swir_water: Number((0.15 + waterStress * 0.25).toFixed(3))
      };

      const cellId = `PX-${String(idCounter++).padStart(3, "0")}`;

      cells.push({
        cell_id: cellId,
        coordinates: [centerLon, centerLat],
        bounds: [
          [lon, lat],
          [lon + step, lat],
          [lon + step, lat + step],
          [lon, lat + step]
        ],
        sector,
        crop,
        disease_risk: Number(diseaseRisk.toFixed(3)),
        chlorophyll_index: Number(chlorophyllIndex.toFixed(3)),
        red_edge_slope: Number(redEdgeSlope.toFixed(3)),
        water_stress_index: Number(waterStress.toFixed(3)),
        canopy_height_m: Number(canopyHeight.toFixed(2)),
        status,
        is_hotspot: isHotspot,
        confidence: isHotspot ? 0.948 : 0.912,
        spectral_signature: spectralSignature
      });
    }
  }

  return cells;
};

// Mock Backend Scenarios
export const MOCK_HEATMAP_SCENARIOS = {
  current: {
    id: "current",
    name: "Day 0 (Current) - Early Detection",
    description: "Pre-symptomatic detection: 5-acre fungal blight hotspot identified 3 weeks prior to visible necrosis",
    timestamp: "2026-11-20T10:14:22Z",
    satellite_swath: "NASA EO-1 Hyperion Cube #EO1H044034",
    lead_time: "21 Days Pre-Symptomatic",
    summary: {
      total_acreage: 1000,
      healthy_acreage: 952.88,
      moderate_stress_acreage: 42.00,
      critical_blight_acreage: 5.12,
      mean_disease_risk: 0.148,
      mean_chlorophyll: 0.814,
      alert_status: "CRITICAL_ACTION_REQUIRED",
      primary_pathogen: "Fungal Blight (Downy Mildew / Bremia lactucae)"
    },
    grid_cells: generateGridCells("current")
  },
  baseline: {
    id: "baseline",
    name: "T - 7 Days (Historical Baseline)",
    description: "Historical hyperspectral scan showing uniform chlorophyll absorption and healthy vegetative vigor",
    timestamp: "2026-11-13T09:45:10Z",
    satellite_swath: "NASA EO-1 Hyperion Cube #EO1H044027",
    lead_time: "N/A - Healthy",
    summary: {
      total_acreage: 1000,
      healthy_acreage: 994.20,
      moderate_stress_acreage: 5.80,
      critical_blight_acreage: 0.00,
      mean_disease_risk: 0.062,
      mean_chlorophyll: 0.882,
      alert_status: "NOMINAL",
      primary_pathogen: "None Detected"
    },
    grid_cells: generateGridCells("baseline")
  },
  progression: {
    id: "progression",
    name: "T + 14 Days (Simulated Untreated Spread)",
    description: "AI predictive forecast showing spore migration along irrigation manifolds if preventative bio-fungicide is not applied",
    timestamp: "2026-12-04T10:14:22Z (Forecast)",
    satellite_swath: "AI ViT Forward-Attention Simulation",
    lead_time: "7 Days Until Visible Foliar Necrosis",
    summary: {
      total_acreage: 1000,
      healthy_acreage: 824.50,
      moderate_stress_acreage: 122.30,
      critical_blight_acreage: 53.20,
      mean_disease_risk: 0.384,
      mean_chlorophyll: 0.642,
      alert_status: "SEVERE_OUTBREAK_RISK",
      primary_pathogen: "Fungal Blight Epidemic Spread"
    },
    grid_cells: generateGridCells("progression")
  }
};

// Heatmap Color Palettes
export const HEATMAP_COLOR_PALETTES = {
  disease_risk: {
    id: "disease_risk",
    name: "Disease Risk (Spectral Anomaly)",
    unit: "Risk Index",
    minLabel: "0.0 (Healthy)",
    midLabel: "0.5 (Stress)",
    maxLabel: "1.0 (Critical Blight)",
    gradientCss: "linear-gradient(to right, #00ff88, #2ecc71, #f59e0b, #ff5e7e, #ff0044)",
    getColor: (d, alpha = 200) => {
      const risk = d.disease_risk;
      if (d.is_hotspot) {
        return [255, 10, 60, alpha];
      }
      if (risk < 0.25) {
        return [0, 255, 136, Math.floor(alpha * 0.7)]; // Vibrant Green
      } else if (risk < 0.50) {
        return [46, 204, 113, Math.floor(alpha * 0.8)]; // Emerald
      } else if (risk < 0.70) {
        return [245, 158, 11, Math.floor(alpha * 0.9)]; // Amber Yellow
      } else if (risk < 0.85) {
        return [255, 94, 126, alpha]; // Coral Red
      }
      return [255, 0, 68, alpha]; // Crimson Hotspot
    }
  },
  chlorophyll: {
    id: "chlorophyll",
    name: "Chlorophyll Absorption (CAI / NDVI)",
    unit: "Index (0-1)",
    minLabel: "0.0 (Depleted)",
    midLabel: "0.5 (Moderate)",
    maxLabel: "1.0 (Optimal)",
    gradientCss: "linear-gradient(to right, #78350f, #d97706, #84cc16, #10b981, #047857)",
    getColor: (d, alpha = 200) => {
      const cai = d.chlorophyll_index;
      if (cai < 0.45) {
        return [180, 50, 20, alpha]; // Brown/Red Depleted
      } else if (cai < 0.65) {
        return [217, 119, 6, Math.floor(alpha * 0.85)]; // Orange/Yellow
      } else if (cai < 0.78) {
        return [132, 204, 22, Math.floor(alpha * 0.85)]; // Lime
      }
      return [16, 185, 129, alpha]; // Deep Emerald
    }
  },
  red_edge: {
    id: "red_edge",
    name: "Red-Edge Slope Anomaly (705nm - 740nm)",
    unit: "Slope Ratio",
    minLabel: "0.2 (Severe Collapse)",
    midLabel: "0.5 (Attenuated)",
    maxLabel: "0.8+ (Intact Mesophyll)",
    gradientCss: "linear-gradient(to right, #ef4444, #ec4899, #8b5cf6, #3b82f6, #00f0ff)",
    getColor: (d, alpha = 200) => {
      const slope = d.red_edge_slope;
      if (slope < 0.35) {
        return [239, 68, 68, alpha]; // Red/Pink Anomaly
      } else if (slope < 0.55) {
        return [236, 72, 153, Math.floor(alpha * 0.85)]; // Pink
      } else if (slope < 0.70) {
        return [139, 92, 246, Math.floor(alpha * 0.85)]; // Purple
      }
      return [0, 240, 255, alpha]; // Cyan Intact
    }
  },
  water_stress: {
    id: "water_stress",
    name: "SWIR Tissue Moisture Stress (1650nm)",
    unit: "Moisture Ratio",
    minLabel: "0.1 (Hydrated)",
    midLabel: "0.4 (Mild)",
    maxLabel: "0.8 (Dehydrated)",
    gradientCss: "linear-gradient(to right, #00f0ff, #3b82f6, #6366f1, #d946ef, #f43f5e)",
    getColor: (d, alpha = 200) => {
      const ws = d.water_stress_index;
      if (ws > 0.6) {
        return [244, 63, 94, alpha]; // Severe tissue dehydration
      } else if (ws > 0.4) {
        return [217, 70, 239, Math.floor(alpha * 0.85)];
      } else if (ws > 0.25) {
        return [59, 130, 246, Math.floor(alpha * 0.85)];
      }
      return [0, 240, 255, Math.floor(alpha * 0.8)]; // Fully hydrated
    }
  }
};
