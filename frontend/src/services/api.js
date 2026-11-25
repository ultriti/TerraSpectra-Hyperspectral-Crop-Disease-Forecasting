/**
 * TerraSpectra Backend API Service
 * Connects frontend to FastAPI routes:
 *
 * Existing routes (plant disease / farm GIS):
 *   GET  /               — Health check & telemetry
 *   POST /predict_plant_health — Deep Learning inference on uploaded image
 *   GET  /api/diseases   — Detectable crop diseases & recommendation rules
 *   GET  /api/farm_overview — Farm boundaries, sector metrics, early alerts
 *
 * New HSI Pipeline v1 routes (hyperspectral analysis):
 *   GET  /api/health                      — HSI pipeline status
 *   GET  /api/dashboard                   — Dashboard statistics
 *   POST /api/dataset/upload              — Upload .npz hyperspectral cube
 *   GET  /api/dataset/{id}                — Dataset metadata
 *   GET  /api/models                      — Available trained models
 *   GET  /api/models/metrics              — Model evaluation metrics
 *   POST /api/predict                     — Run crop-stress prediction
 *   GET  /api/predictions/{id}            — Prediction summary
 *   GET  /api/predictions/{id}/map        — Prediction map (JSON)
 *   GET  /api/predictions/{id}/confidence — Confidence map (JSON)
 *   GET  /api/predictions/{id}/download   — Download .npz result
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ─── Helper ────────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, options);
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }
  return res;
}

// ══════════════════════════════════════════════════════════════════════════════
// EXISTING ROUTES — unchanged
// ══════════════════════════════════════════════════════════════════════════════

export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(`${API_BASE_URL}/`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      return { online: true, data, error: null };
    }
    return { online: false, data: null, error: `Server responded with status ${response.status}` };
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
    if (response.ok) return await response.json();
    return null;
  } catch { return null; }
}

export async function fetchDiseasesCatalog() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/diseases`);
    if (response.ok) return await response.json();
    return null;
  } catch { return null; }
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
    return { success: true, data: result, error: null };
  } catch (err) {
    return { success: false, data: null, error: err.message };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// NEW HSI PIPELINE ROUTES — v1
// ══════════════════════════════════════════════════════════════════════════════

/** GET /api/health — HSI pipeline status */
export async function fetchHsiHealth() {
  try {
    const res = await apiFetch("/api/health");
    return { success: true, data: await res.json(), error: null };
  } catch (err) {
    return { success: false, data: null, error: err.message };
  }
}

/** GET /api/dashboard — Dashboard statistics (pixels, models, latest prediction) */
export async function fetchDashboard() {
  try {
    const res = await apiFetch("/api/dashboard");
    return { success: true, data: await res.json(), error: null };
  } catch (err) {
    return { success: false, data: null, error: err.message };
  }
}

/** POST /api/dataset/upload — Upload .npz hyperspectral cube */
export async function uploadDataset(file, onProgress) {
  return new Promise((resolve) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/api/dataset/upload`);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ success: true, data, error: null });
        } else {
          resolve({ success: false, data: null, error: data.detail || `HTTP ${xhr.status}` });
        }
      } catch {
        resolve({ success: false, data: null, error: "Invalid server response" });
      }
    };

    xhr.onerror = () => resolve({ success: false, data: null, error: "Network error during upload" });
    xhr.send(formData);
  });
}

/** GET /api/dataset/{id} — Dataset metadata. Use id='demo' for synthetic dataset. */
export async function fetchDataset(id = "demo") {
  try {
    const res = await apiFetch(`/api/dataset/${id}`);
    return { success: true, data: await res.json(), error: null };
  } catch (err) {
    return { success: false, data: null, error: err.message };
  }
}

/** GET /api/models — Available trained models */
export async function fetchModels() {
  try {
    const res = await apiFetch("/api/models");
    return { success: true, data: await res.json(), error: null };
  } catch (err) {
    return { success: false, data: null, error: err.message };
  }
}

/** GET /api/models/metrics — Model evaluation metrics (accuracy, F1, confusion matrix) */
export async function fetchModelMetrics() {
  try {
    const res = await apiFetch("/api/models/metrics");
    return { success: true, data: await res.json(), error: null };
  } catch (err) {
    return { success: false, data: null, error: err.message };
  }
}

/**
 * POST /api/predict — Run crop-stress prediction
 * @param {string} datasetId - 'demo' or uploaded dataset id
 * @param {string} modelId - 'rf' or 'cnn'
 */
export async function runPrediction(datasetId, modelId) {
  try {
    const res = await apiFetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataset_id: datasetId, model_id: modelId })
    });
    return { success: true, data: await res.json(), error: null };
  } catch (err) {
    return { success: false, data: null, error: err.message };
  }
}

/** GET /api/predictions/{id} — Prediction summary stats. Use 'latest' for most recent. */
export async function fetchPrediction(id = "latest") {
  try {
    const res = await apiFetch(`/api/predictions/${id}`);
    return { success: true, data: await res.json(), error: null };
  } catch (err) {
    return { success: false, data: null, error: err.message };
  }
}

/** GET /api/predictions/{id}/map — Full prediction map as JSON {data, shape, classes} */
export async function fetchPredictionMap(id = "latest") {
  try {
    const res = await apiFetch(`/api/predictions/${id}/map`);
    return { success: true, data: await res.json(), error: null };
  } catch (err) {
    return { success: false, data: null, error: err.message };
  }
}

/** GET /api/predictions/{id}/confidence — Confidence map as JSON {data, shape, min, max} */
export async function fetchConfidenceMap(id = "latest") {
  try {
    const res = await apiFetch(`/api/predictions/${id}/confidence`);
    return { success: true, data: await res.json(), error: null };
  } catch (err) {
    return { success: false, data: null, error: err.message };
  }
}

/** GET /api/predictions/{id}/download — Triggers .npz file download */
export function downloadPrediction(id = "latest") {
  window.open(`${API_BASE_URL}/api/predictions/${id}/download`, "_blank");
}

export { API_BASE_URL };
