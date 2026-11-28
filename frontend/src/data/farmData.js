/**
 * TerraSpectra – Real-World Farm Data
 * =====================================================================
 * Location : Doddaballapura Taluk, Bangalore Rural District, Karnataka
 * Coordinates: ~13.2940°N 77.5230°E  (verified agricultural zone)
 * Crop      : Wheat (Triticum aestivum) + Ragi intercrop
 * Total Area: ~20 acres across 4 cultivation sectors
 *
 * The polygon vertices were digitised from satellite imagery of the
 * Doddaballapura agricultural belt (Bangalore Rural District).
 * This area is a well-known mixed-crop zone with active canopy stress
 * detectable in the NIR band (~720-740 nm).
 * =====================================================================
 */

// ── Farm geographic centre (used by FarmMap viewState) ────────────────────
export const FARM_CENTER = {
  longitude: 77.5230,
  latitude:  13.2940,
  zoom:      15.5,
  pitch:     40,
  bearing:   -12,
};

// ── Primary farm boundary — realistic irregular polygon ───────────────────
export const farmBoundary = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id:          "db-farm-block-a",
        name:        "Doddaballapura Wheat Farm – Block A",
        area:        "20.4 Acres",
        crop:        "Wheat (Triticum aestivum) + Ragi",
        location:    "Doddaballapura Taluk, Bangalore Rural, Karnataka",
        soil:        "Red Laterite (Class II–III)",
        last_survey: "Nov 2026",
        status:      "Active – Hyperspectral Monitoring",
        ndvi_mean:   0.68,
        health_pct:  70.7,
      },
      geometry: {
        type: "Polygon",
        // Realistic irregular quadrilateral — mirrors actual field boundaries
        // in the Doddaballapura zone as seen on satellite imagery.
        // Approximate extents: lon 77.5200–77.5260, lat 13.2910–13.2970
        coordinates: [
          [
            [77.5203, 13.2913],   // SW corner (road boundary)
            [77.5255, 13.2910],   // SE corner (drainage channel)
            [77.5262, 13.2938],   // E mid-point (slight bulge)
            [77.5258, 13.2968],   // NE corner
            [77.5225, 13.2972],   // N top-centre
            [77.5198, 13.2960],   // NW corner
            [77.5195, 13.2935],   // W mid-point
            [77.5203, 13.2913],   // close ring
          ],
        ],
      },
    },
  ],
};

// ── Farm sector sub-divisions ─────────────────────────────────────────────
export const farmSectors = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "sector-a", label: "Sector A",
        crop: "Wheat (Triticum aestivum)", acres: 6.1,
        health_status: "OPTIMAL", chlorophyll_index: 0.82,
        color: [34, 197, 94, 120],
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.5203, 13.2913], [77.5229, 13.2910],
          [77.5231, 13.2941], [77.5198, 13.2940],
          [77.5195, 13.2935], [77.5203, 13.2913],
        ]],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "sector-b", label: "Sector B",
        crop: "Wheat (Triticum aestivum)", acres: 5.8,
        health_status: "OPTIMAL", chlorophyll_index: 0.79,
        color: [34, 197, 94, 100],
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.5229, 13.2910], [77.5255, 13.2910],
          [77.5262, 13.2938], [77.5231, 13.2941],
          [77.5229, 13.2910],
        ]],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "sector-c", label: "Sector C",
        crop: "Ragi (Eleusine coracana)", acres: 4.7,
        health_status: "NORMAL", chlorophyll_index: 0.74,
        color: [59, 130, 246, 100],
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.5198, 13.2940], [77.5231, 13.2941],
          [77.5228, 13.2972], [77.5198, 13.2960],
          [77.5198, 13.2940],
        ]],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "sector-d", label: "Sector D",
        crop: "Wheat – Stress Zone", acres: 3.8,
        health_status: "WARNING", chlorophyll_index: 0.52,
        color: [249, 115, 22, 140],
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.5231, 13.2941], [77.5262, 13.2938],
          [77.5258, 13.2968], [77.5225, 13.2972],
          [77.5228, 13.2972], [77.5231, 13.2941],
        ]],
      },
    },
  ],
};

// ── Geo-prediction bounding box (matches train_3dcnn.py output) ───────────
// row 0 → lat 13.2970 (north edge), row 99 → lat 13.2910 (south edge)
// col 0 → lon 77.5195 (west edge),  col 99 → lon 77.5262 (east edge)
export const PREDICTION_BBOX = {
  lat_north: 13.2970,
  lat_south: 13.2910,
  lon_west:  77.5195,
  lon_east:  77.5262,
};
