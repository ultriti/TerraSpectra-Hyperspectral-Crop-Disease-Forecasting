/**
 * TerraSpectra Constants & Sensor Config
 */

export const BASEMAP_STYLES = [
  {
    id: "satellite-esri",
    name: "Satellite Topography (ESRI)",
    description: "High-resolution real-world satellite orthophoto & terrain",
    type: "raster",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    ],
    maxZoom: 19
  },
  {
    id: "dark-carto",
    name: "Carto Dark Matter (GIS)",
    description: "High-contrast dark base layer optimized for spectral heatmaps",
    type: "raster",
    tiles: [
      "https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png"
    ],
    maxZoom: 19
  },
  {
    id: "osm-topo",
    name: "OpenStreetMap Terrain",
    description: "Topographical base contours & infrastructure",
    type: "raster",
    tiles: [
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    ],
    maxZoom: 19
  }
];

export const SPECTRAL_BANDS = [
  {
    id: "all",
    label: "Hyperspectral Full Cube (220 Bands)",
    wavelength: "400nm - 2500nm",
    sensor: "NASA EO-1 Hyperion / Sentinel-2",
    description: "Multi-band tensor feeding 3D-CNN & ViT encoder"
  },
  {
    id: "chlorophyll",
    label: "Chlorophyll Absorption Dip (680nm)",
    wavelength: "680nm",
    sensor: "Hyperion Band 33",
    description: "Direct indicator of chloroplast biochemical viability"
  },
  {
    id: "red-edge",
    label: "Red-Edge Slope Anomaly (705nm - 740nm)",
    wavelength: "705nm",
    sensor: "Hyperion Band 36",
    description: "Earliest chemical signature of cellular fungal disruption"
  },
  {
    id: "nir",
    label: "Near-Infrared Canopy Scattering (850nm)",
    wavelength: "850nm",
    sensor: "Hyperion Band 48",
    description: "Structural leaf integrity and mesophyll refraction"
  },
  {
    id: "water-stress",
    label: "Short-Wave Infrared Moisture (1650nm)",
    wavelength: "1650nm",
    sensor: "Hyperion Band 151",
    description: "Canopy water absorption and tissue dehydration index"
  }
];

export const SYSTEM_SPECS = {
  version: "v1.4-beta (Week 1 Build)",
  model: "Hybrid 3D-CNN + Vision Transformer (ViT)",
  ingestEngine: "GDAL / Rasterio Hyperspectral Cube Parser",
  spatialResolution: "30m GSD (Downscaled to 5m via Super-Resolution)",
  latencyTarget: "< 350ms per 10km² tile",
  earlyWarningLeadTime: "21 Days Pre-Symptomatic"
};
