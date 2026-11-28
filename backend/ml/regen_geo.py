"""
Regenerate geo_predictions.json with full farm coverage using real-world bbox.
Farm: Doddaballapura Taluk, Bangalore Rural, Karnataka
"""
import numpy as np
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent   # backend/
pred = np.load(BASE / "data/output/prediction_map.npy")
conf = np.load(BASE / "data/output/confidence_map.npy")
H, W = pred.shape

# Real-world bbox matching farmData.js polygon extents
LAT_N, LAT_S = 13.2970, 13.2910
LON_W, LON_E = 77.5195, 77.5262

features = []
STEP = 3   # every 3 pixels → 34×34 ≈ 1156 points — good visual density

for r in range(0, H, STEP):
    for c in range(0, W, STEP):
        lat  = LAT_N - (r / (H - 1)) * (LAT_N - LAT_S)
        lon  = LON_W + (c / (W - 1)) * (LON_E - LON_W)
        cls  = int(pred[r, c])
        prob = round(float(conf[r, c]), 4)
        # Include EVERY sampled point so the full farm area is covered
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [round(lon, 6), round(lat, 6)],
            },
            "properties": {
                "class":       cls,
                "label":       "Stressed" if cls == 1 else "Healthy",
                "probability": prob,
                "row": int(r),
                "col": int(c),
            },
        })

geojson = {"type": "FeatureCollection", "features": features}
out_path = BASE / "data/output/geo_predictions.json"
out_path.write_text(json.dumps(geojson))

stressed = sum(1 for f in features if f["properties"]["class"] == 1)
healthy  = sum(1 for f in features if f["properties"]["class"] == 0)
print(f"Total points : {len(features)}")
print(f"  Healthy    : {healthy}")
print(f"  Stressed   : {stressed}")
print(f"  Lat range  : {LAT_S} – {LAT_N}")
print(f"  Lon range  : {LON_W} – {LON_E}")
print(f"Saved → {out_path}")
