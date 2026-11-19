/**
 * TerraSpectra Backend API Service
 * Connects frontend to FastAPI routes:
 * - GET  / (Health check & telemetry)
 * - POST /predict_plant_health (Deep Learning inference on uploaded image)
 * - GET  /api/diseases (Detectable crop diseases & recommendation rules)
 * - GET  /api/farm_overview (Farm boundaries, sector metrics, early alerts)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${API_BASE_URL}/`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        online: true,
        data,
        error: null
      };
    }
    return {
      online: false,
      data: null,
      error: `Server responded with status ${response.status}`
    };
  } catch (err) {
    return {
      online: false,
      data: null,
      error: err.name === "AbortError" ? "Connection timed out" : err.message
    };
  }
}

export async function fetchFarmOverview() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/farm_overview`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchDiseasesCatalog() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/diseases`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}

export async function predictPlantHealth(imageFile) {
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await fetch(`${API_BASE_URL}/predict_plant_health`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Prediction failed with status ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
      error: null
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err.message
    };
  }
}

export { API_BASE_URL };
