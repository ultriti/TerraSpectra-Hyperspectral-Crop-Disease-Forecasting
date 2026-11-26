import numpy as np
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["Hyperspectral Pipeline"])


BASE_DIR = Path(__file__).resolve().parents[4]   # routes → v1 → api → app → backend
OUTPUT_DIR = BASE_DIR / "data" / "output"


print("OUTPUT_DIR",OUTPUT_DIR)

@router.get("/predictions")
def get_predictions():
    pred_path = OUTPUT_DIR / "prediction_map.npy"
    conf_path = OUTPUT_DIR / "confidence_map.npy"

    # Check files exist
    if not pred_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Prediction file not found: {pred_path}"
        )

    if not conf_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Confidence file not found: {conf_path}"
        )

    try:
        prediction = np.load(pred_path)
        confidence = np.load(conf_path)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load prediction files: {str(e)}"
        )

    if prediction.shape != confidence.shape:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Shape mismatch. "
                f"Prediction shape={prediction.shape}, "
                f"Confidence shape={confidence.shape}"
            ),
        )

    return {
        "prediction_map": prediction.astype(int).tolist(),
        "confidence_map": np.round(confidence.astype(float), 4).tolist(),
        "height": int(prediction.shape[0]),
        "width": int(prediction.shape[1]),
        "class_names": {
            "0": "Healthy",
            "1": "Stress",
        },
    }
    
    
    

@router.get("/confidence")
def get_confidence():

    confidence_path = OUTPUT_DIR / "confidence_map.npy"

    if not confidence_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Confidence map not found. Generate predictions first."
        )

    confidence = np.load(confidence_path)

    if confidence.ndim != 2:
        raise HTTPException(
            status_code=500,
            detail="Expected a 2D confidence map."
        )

    if not np.isfinite(confidence).all():
        raise HTTPException(
            status_code=500,
            detail="Confidence map contains invalid values."
        )

    return {
        "confidence_map": confidence.tolist(),
        "height": int(confidence.shape[0]),
        "width": int(confidence.shape[1]),
        "min": float(confidence.min()),
        "max": float(confidence.max()),
        "mean": float(confidence.mean())
    }




@router.get("/analytics")
def get_farm_analytics():
    prediction_path = OUTPUT_DIR / "prediction_map.npy"
    confidence_path = OUTPUT_DIR / "confidence_map.npy"

    if not prediction_path.exists() or not confidence_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Prediction files not found. Run the ML prediction pipeline first."
        )

    predictions = np.load(prediction_path)
    confidence = np.load(confidence_path)

    if predictions.ndim != 2 or confidence.ndim != 2:
        raise HTTPException(
            status_code=500,
            detail="Prediction and confidence maps must be 2D arrays."
        )

    if predictions.shape != confidence.shape:
        raise HTTPException(
            status_code=500,
            detail="Prediction and confidence maps have different dimensions."
        )

    if not np.isfinite(confidence).all():
        raise HTTPException(
            status_code=500,
            detail="Confidence map contains invalid values."
        )

    total_pixels = int(predictions.size)
    healthy_pixels = int(np.sum(predictions == 0))
    stress_pixels = int(np.sum(predictions == 1))

    # Demo farm area. Change this to your actual farm area.
    total_area_acres = 5.0

    healthy_percentage = (healthy_pixels / total_pixels) * 100
    stress_percentage = (stress_pixels / total_pixels) * 100

    healthy_area = total_area_acres * healthy_percentage / 100
    affected_area = total_area_acres * stress_percentage / 100

    average_stress_score = float(np.mean(confidence))

    return {
        "farm_name": "Demo Farm",
        "total_area_acres": total_area_acres,
        "total_pixels": total_pixels,
        "healthy_pixels": healthy_pixels,
        "stress_pixels": stress_pixels,
        "healthy_percentage": round(healthy_percentage, 2),
        "stress_percentage": round(stress_percentage, 2),
        "healthy_area_acres": round(healthy_area, 2),
        "affected_area_acres": round(affected_area, 2),
        "average_stress_score": round(average_stress_score, 4),
        "map_height": int(predictions.shape[0]),
        "map_width": int(predictions.shape[1])
    }
