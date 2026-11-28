"""
TerraSpectra – 3D-CNN Hyperspectral Crop-Health Training Script
================================================================
Generates a synthetic 100×100×30 HSI cube, trains a PyTorch 3D-CNN,
evaluates it, saves the checkpoint + GeoJSON predictions ready for the
React/Deck.gl dashboard.

Usage:
    python backend/ml/train_3dcnn.py
    (run from anywhere; paths are resolved relative to this file)
"""

import json
import time
from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # headless – no display needed
import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn
from sklearn.decomposition import PCA
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from torch.utils.data import DataLoader, TensorDataset

# ── Paths ────────────────────────────────────────────────────────────────────
HERE = Path(__file__).resolve().parent.parent  # backend/
DATA_DIR = HERE / "data" / "processed"
OUT_DIR = HERE / "data" / "output"
EVAL_DIR = HERE / "evaluation"
ART_DIR = HERE / "artifacts"

for d in (DATA_DIR, OUT_DIR, EVAL_DIR, ART_DIR):
    d.mkdir(parents=True, exist_ok=True)

# ── 1. GENERATE SYNTHETIC HSI DATASET ────────────────────────────────────────
print("\n" + "═" * 60)
print("  SECTION 1 — Generating Synthetic HSI Dataset")
print("═" * 60)

ROWS, COLS, BANDS = 100, 100, 30
rng = np.random.default_rng(42)
wavelengths = np.linspace(450, 950, BANDS, dtype=np.float32)


# Base spectra
def healthy_spectrum(wl):
    """Vegetation-like: strong NIR, red-edge peak, chlorophyll absorption."""
    spec = np.zeros_like(wl)
    spec += 0.08 * np.exp(-((wl - 550) ** 2) / (2 * 30**2))  # green peak
    spec += 0.04 * np.exp(-((wl - 480) ** 2) / (2 * 25**2))  # blue
    spec += 0.45 * (1 / (1 + np.exp(-(wl - 720) / 20)))  # NIR plateau
    spec += 0.10 * np.exp(-((wl - 710) ** 2) / (2 * 15**2))  # red-edge bump
    return np.clip(spec, 0, 1).astype(np.float32)


def stressed_spectrum(wl):
    """Stressed: depressed NIR, elevated red, chlorophyll depletion."""
    spec = np.zeros_like(wl)
    spec += 0.12 * np.exp(-((wl - 550) ** 2) / (2 * 40**2))  # weakened green
    spec += 0.18 * np.exp(-((wl - 670) ** 2) / (2 * 30**2))  # elevated red
    spec += 0.22 * (1 / (1 + np.exp(-(wl - 740) / 25)))  # reduced NIR
    return np.clip(spec, 0, 1).astype(np.float32)


base_h = healthy_spectrum(wavelengths)
base_s = stressed_spectrum(wavelengths)

# Build labels: stress cluster in bottom-right (rows 60-99, cols 60-99)
labels = np.zeros((ROWS, COLS), dtype=np.int64)
labels[60:, 60:] = 1

# Build cube: healthy pixels use healthy spectrum + noise; stressed likewise
cube = np.zeros((ROWS, COLS, BANDS), dtype=np.float32)
for r in range(ROWS):
    for c in range(COLS):
        if labels[r, c] == 1:
            cube[r, c] = base_s + rng.normal(0, 0.02, BANDS).astype(np.float32)
        else:
            cube[r, c] = base_h + rng.normal(0, 0.02, BANDS).astype(np.float32)

cube = np.clip(cube, 0, 1)

npz_path = DATA_DIR / "hsi_training_data.npz"
np.savez_compressed(npz_path, cube=cube, labels=labels, wavelengths_nm=wavelengths)
print(f"  ✔ Dataset saved → {npz_path}")
print(
    f"    cube shape: {cube.shape}  |  healthy: {(labels==0).sum()}  |  stressed: {(labels==1).sum()}"
)

# Band stats for reusable pipeline
band_min = cube.reshape(-1, BANDS).min(axis=0).tolist()
band_max = cube.reshape(-1, BANDS).max(axis=0).tolist()
with open(DATA_DIR / "band_scaler.json", "w") as f:
    json.dump(
        {
            "band_min": band_min,
            "band_max": band_max,
            "wavelengths_nm": wavelengths.tolist(),
        },
        f,
        indent=2,
    )
print("  ✔ Band scaler saved → band_scaler.json")

# ── 2. VISUALIZATIONS ────────────────────────────────────────────────────────
print("\n" + "═" * 60)
print("  SECTION 2 — Visualizations")
print("═" * 60)

# 2a. Spectral signatures
fig, ax = plt.subplots(figsize=(10, 5))
mask_h = labels.flatten() == 0
mask_s = labels.flatten() == 1
flat = cube.reshape(-1, BANDS)
ax.plot(
    wavelengths,
    flat[mask_h].mean(axis=0),
    color="#22c55e",
    lw=2.5,
    label="Healthy (Class 0)",
)
ax.fill_between(
    wavelengths,
    flat[mask_h].mean(axis=0) - flat[mask_h].std(axis=0),
    flat[mask_h].mean(axis=0) + flat[mask_h].std(axis=0),
    alpha=0.15,
    color="#22c55e",
)
ax.plot(
    wavelengths,
    flat[mask_s].mean(axis=0),
    color="#ef4444",
    lw=2.5,
    label="Stressed (Class 1)",
)
ax.fill_between(
    wavelengths,
    flat[mask_s].mean(axis=0) - flat[mask_s].std(axis=0),
    flat[mask_s].mean(axis=0) + flat[mask_s].std(axis=0),
    alpha=0.15,
    color="#ef4444",
)
ax.set_xlabel("Wavelength (nm)", fontsize=12)
ax.set_ylabel("Reflectance", fontsize=12)
ax.set_title(
    "Spectral Signatures: Healthy vs Stressed Crop", fontsize=14, fontweight="bold"
)
ax.legend(fontsize=11)
ax.grid(True, alpha=0.3)
plt.tight_layout()
fig.savefig(EVAL_DIR / "spectral_signatures.png", dpi=150)
plt.close()
print("  ✔ spectral_signatures.png saved")

# 2b. PCA visualization
pca = PCA(n_components=2, random_state=42)
pca_coords = pca.fit_transform(flat)
fig, ax = plt.subplots(figsize=(8, 6))
ax.scatter(
    pca_coords[mask_h, 0],
    pca_coords[mask_h, 1],
    c="#22c55e",
    alpha=0.4,
    s=5,
    label="Healthy",
)
ax.scatter(
    pca_coords[mask_s, 0],
    pca_coords[mask_s, 1],
    c="#ef4444",
    alpha=0.4,
    s=5,
    label="Stressed",
)
ax.set_xlabel(f"PC1 ({pca.explained_variance_ratio_[0]*100:.1f}% var)", fontsize=11)
ax.set_ylabel(f"PC2 ({pca.explained_variance_ratio_[1]*100:.1f}% var)", fontsize=11)
ax.set_title("PCA of Hyperspectral Pixels (100×100)", fontsize=13, fontweight="bold")
ax.legend(markerscale=3, fontsize=11)
ax.grid(True, alpha=0.3)
plt.tight_layout()
fig.savefig(EVAL_DIR / "pca_visualization.png", dpi=150)
plt.close()
print("  ✔ pca_visualization.png saved")

# 2c. Band visualization (8 selected bands)
selected_bands = [0, 4, 8, 12, 16, 20, 24, 28]
fig, axes = plt.subplots(2, 4, figsize=(14, 6))
for i, b in enumerate(selected_bands):
    ax = axes[i // 4][i % 4]
    im = ax.imshow(cube[:, :, b], cmap="viridis", vmin=0, vmax=1)
    ax.set_title(f"Band {b}\n({wavelengths[b]:.0f} nm)", fontsize=9)
    ax.axis("off")
    plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
fig.suptitle(
    "Hyperspectral Band Visualization (8 Selected Bands)",
    fontsize=13,
    fontweight="bold",
)
plt.tight_layout()
fig.savefig(EVAL_DIR / "band_visualization.png", dpi=150)
plt.close()
print("  ✔ band_visualization.png saved")

# ── 3. DATA PREPROCESSING ────────────────────────────────────────────────────
print("\n" + "═" * 60)
print("  SECTION 3 — Preprocessing & Spatial Train/Test Split")
print("═" * 60)

# Per-band min-max normalization
cube_norm = cube.copy()
for b in range(BANDS):
    b_min, b_max = cube[:, :, b].min(), cube[:, :, b].max()
    cube_norm[:, :, b] = (cube[:, :, b] - b_min) / (b_max - b_min + 1e-8)

# Spatial split: rows 0-69 train, rows 70-99 test
SPLIT = 70
cube_train, labels_train = cube_norm[:SPLIT], labels[:SPLIT]  # (70,100,30), (70,100)
cube_test, labels_test = cube_norm[SPLIT:], labels[SPLIT:]  # (30,100,30), (30,100)

print(f"  Train region: rows 0–{SPLIT-1}  |  pixels: {SPLIT*COLS}")
print(f"  Test region : rows {SPLIT}–{ROWS-1}  |  pixels: {(ROWS-SPLIT)*COLS}")

PATCH = 5
PAD = PATCH // 2  # 2


def extract_patches(cube_part, lbl_part):
    """
    Fast 5×5 patch extraction using sliding_window_view (NumPy ≥ 1.20).
    Returns X: (N, 1, B, 5, 5) float32   y: (N,) int64
    """
    H, W, B = cube_part.shape
    padded = np.pad(cube_part, ((PAD, PAD), (PAD, PAD), (0, 0)), mode="constant")
    # sliding_window_view gives shape (H, W, PATCH, PATCH, B)
    windows = np.lib.stride_tricks.sliding_window_view(
        padded, (PATCH, PATCH, B)
    )  # (H, W, 5, 5, B)
    # Rearrange to (N, 1, B, 5, 5)
    X = windows.reshape(H * W, PATCH, PATCH, B).transpose(0, 3, 1, 2)
    X = np.ascontiguousarray(X[:, np.newaxis], dtype=np.float32)
    y = lbl_part.flatten().astype(np.int64)
    return X, y


print("  Extracting training patches …", end=" ", flush=True)
X_train, y_train = extract_patches(cube_train, labels_train)
print(f"done  shape={X_train.shape}")

print("  Extracting test patches …", end=" ", flush=True)
X_test, y_test = extract_patches(cube_test, labels_test)
print(f"done  shape={X_test.shape}")

train_ds = TensorDataset(torch.from_numpy(X_train), torch.from_numpy(y_train))
test_ds = TensorDataset(torch.from_numpy(X_test), torch.from_numpy(y_test))
train_loader = DataLoader(train_ds, batch_size=256, shuffle=True, num_workers=0)
test_loader = DataLoader(test_ds, batch_size=256, shuffle=False, num_workers=0)

# ── 4. 3D-CNN ARCHITECTURE ───────────────────────────────────────────────────
print("\n" + "═" * 60)
print("  SECTION 4 — 3D-CNN Architecture")
print("═" * 60)


class CropHealth3DCNN(nn.Module):
    """
    Input:  (batch, 1, 30, 5, 5)  –  1 channel · 30 bands · 5×5 spatial
    Output: (batch, 2)             –  logits for [Healthy, Stressed]
    """

    def __init__(self, n_bands=30, n_classes=2):
        super().__init__()
        self.conv_block = nn.Sequential(
            nn.Conv3d(1, 16, kernel_size=3, padding=1),
            nn.BatchNorm3d(16),
            nn.ReLU(inplace=True),
            nn.Conv3d(16, 32, kernel_size=3, padding=1),
            nn.BatchNorm3d(32),
            nn.ReLU(inplace=True),
        )
        self.pool = nn.AdaptiveAvgPool3d((8, 1, 1))
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(32 * 8, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(128, n_classes),
        )

    def forward(self, x):
        x = self.conv_block(x)
        x = self.pool(x)
        return self.classifier(x)


device = torch.device("cpu")
model = CropHealth3DCNN(n_bands=BANDS).to(device)
total_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
print(f"  Model: CropHealth3DCNN  |  Trainable params: {total_params:,}")
print(f"  Input: (batch, 1, {BANDS}, {PATCH}, {PATCH})  →  Output: (batch, 2)")

# ── 5. TRAINING ───────────────────────────────────────────────────────────────
print("\n" + "═" * 60)
print("  SECTION 5 — Training (20 epochs, CPU)")
print("═" * 60)

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

EPOCHS = 20
history = {k: [] for k in ("train_loss", "val_loss", "train_acc", "val_acc")}

t0 = time.time()
for epoch in range(1, EPOCHS + 1):
    # ── train
    model.train()
    tr_loss, tr_correct, tr_total = 0.0, 0, 0
    for xb, yb in train_loader:
        xb, yb = xb.to(device), yb.to(device)
        optimizer.zero_grad()
        logits = model(xb)
        loss = criterion(logits, yb)
        loss.backward()
        optimizer.step()
        tr_loss += loss.item() * len(yb)
        tr_correct += (logits.argmax(1) == yb).sum().item()
        tr_total += len(yb)

    # ── validate
    model.eval()
    val_loss, val_correct, val_total = 0.0, 0, 0
    with torch.no_grad():
        for xb, yb in test_loader:
            xb, yb = xb.to(device), yb.to(device)
            logits = model(xb)
            loss = criterion(logits, yb)
            val_loss += loss.item() * len(yb)
            val_correct += (logits.argmax(1) == yb).sum().item()
            val_total += len(yb)

    tl = tr_loss / tr_total
    ta = tr_correct / tr_total
    vl = val_loss / val_total
    va = val_correct / val_total

    history["train_loss"].append(round(tl, 6))
    history["val_loss"].append(round(vl, 6))
    history["train_acc"].append(round(ta, 6))
    history["val_acc"].append(round(va, 6))

    print(
        f"  Epoch {epoch:2d}/{EPOCHS}  |  "
        f"Train Loss: {tl:.4f}  Train Acc: {ta*100:.1f}%  |  "
        f"Val Loss: {vl:.4f}  Val Acc: {va*100:.1f}%"
    )

elapsed = time.time() - t0
print(f"\n  Training complete in {elapsed:.1f}s")

# Save checkpoint
ckpt_path = ART_DIR / "terraspectra_cnn.pth"
torch.save(model.state_dict(), ckpt_path)
print(f"  ✔ Checkpoint saved → {ckpt_path}")

# ── 6. EVALUATION ─────────────────────────────────────────────────────────────
print("\n" + "═" * 60)
print("  SECTION 6 — Evaluation on Test Set")
print("═" * 60)

model.eval()
all_preds, all_probs, all_true = [], [], []
with torch.no_grad():
    for xb, yb in test_loader:
        logits = model(xb.to(device))
        probs = torch.softmax(logits, dim=1)[:, 1].cpu().numpy()
        preds = logits.argmax(1).cpu().numpy()
        all_preds.extend(preds.tolist())
        all_probs.extend(probs.tolist())
        all_true.extend(yb.numpy().tolist())

acc = accuracy_score(all_true, all_preds)
prec = precision_score(all_true, all_preds, zero_division=0)
rec = recall_score(all_true, all_preds, zero_division=0)
f1 = f1_score(all_true, all_preds, zero_division=0)
cm = confusion_matrix(all_true, all_preds).tolist()

print(f"  Accuracy : {acc*100:.2f}%")
print(f"  Precision: {prec*100:.2f}%")
print(f"  Recall   : {rec*100:.2f}%")
print(f"  F1-Score : {f1*100:.2f}%")
print(f"  Confusion Matrix:")
print(f"              Pred Healthy  Pred Stressed")
print(f"  True Healthy  {cm[0][0]:>8d}      {cm[0][1]:>8d}")
print(f"  True Stressed {cm[1][0]:>8d}      {cm[1][1]:>8d}")

# Save metrics JSON
metrics_data = {
    "epochs": list(range(1, EPOCHS + 1)),
    "train_loss": history["train_loss"],
    "val_loss": history["val_loss"],
    "train_acc": history["train_acc"],
    "val_acc": history["val_acc"],
    "final_metrics": {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm,
    },
}
with open(EVAL_DIR / "training_metrics.json", "w") as f:
    json.dump(metrics_data, f, indent=2)
print("  ✔ training_metrics.json saved")

# ── 7. FULL-CUBE INFERENCE ────────────────────────────────────────────────────
print("\n" + "═" * 60)
print("  SECTION 7 — Full-Cube Inference & Prediction Maps")
print("═" * 60)

# Extract patches for entire 100×100 cube
print("  Running inference on full 100×100 cube …", end=" ", flush=True)
padded_full = np.pad(cube_norm, ((PAD, PAD), (PAD, PAD), (0, 0)), mode="constant")
windows_full = np.lib.stride_tricks.sliding_window_view(
    padded_full, (PATCH, PATCH, BANDS)
)  # (ROWS, COLS, 5, 5, BANDS)
X_full = windows_full.reshape(ROWS * COLS, PATCH, PATCH, BANDS).transpose(0, 3, 1, 2)
X_full = np.ascontiguousarray(
    X_full[:, np.newaxis], dtype=np.float32
)  # (10000,1,30,5,5)
full_ds = TensorDataset(torch.from_numpy(X_full))
full_loader = DataLoader(full_ds, batch_size=512, shuffle=False, num_workers=0)

model.eval()
pred_list, conf_list = [], []
with torch.no_grad():
    for (xb,) in full_loader:
        logits = model(xb.to(device))
        probs = torch.softmax(logits, dim=1)[:, 1].cpu().numpy()
        preds = logits.argmax(1).cpu().numpy()
        pred_list.extend(preds.tolist())
        conf_list.extend(probs.tolist())

pred_map = np.array(pred_list, dtype=np.uint8).reshape(ROWS, COLS)
conf_map = np.array(conf_list, dtype=np.float32).reshape(ROWS, COLS)
print("done")

np.save(OUT_DIR / "prediction_map.npy", pred_map)
np.save(OUT_DIR / "confidence_map.npy", conf_map)
print(f"  ✔ prediction_map.npy saved  |  stressed pixels: {pred_map.sum()}")
print(f"  ✔ confidence_map.npy saved  |  mean confidence: {conf_map.mean():.4f}")

# 2d. Prediction map grid (GT vs Predictions on test region rows 70-99)
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
test_gt = labels[SPLIT:]
test_pred = pred_map[SPLIT:]

cmap_health = matplotlib.colors.ListedColormap(["#22c55e", "#ef4444"])
for ax, data, title in zip(
    axes, [test_gt, test_pred], ["Ground Truth", "3D-CNN Predictions"]
):
    im = ax.imshow(data, cmap=cmap_health, vmin=0, vmax=1)
    ax.set_title(title, fontsize=12, fontweight="bold")
    ax.set_xlabel("Column (pixel)")
    ax.set_ylabel("Row (pixel)")

cbar = fig.colorbar(im, ax=axes, fraction=0.03, pad=0.04)
cbar.set_ticks([0.25, 0.75])
cbar.set_ticklabels(["Healthy (0)", "Stressed (1)"])
fig.suptitle(
    "Test Region — Ground Truth vs Predictions", fontsize=14, fontweight="bold"
)
plt.tight_layout()
fig.savefig(EVAL_DIR / "prediction_map_grid.png", dpi=150)
plt.close()
print("  ✔ prediction_map_grid.png saved")

# ── 8. GeoJSON GENERATION ─────────────────────────────────────────────────────
print("\n" + "═" * 60)
print("  SECTION 8 — GeoJSON Prediction File for Dashboard")
print("═" * 60)

# Farm boundary
LAT_NORTH, LAT_SOUTH = 13.2840, 13.2800
LON_WEST, LON_EAST = 77.5200, 77.5250

features = []
STEP = 5  # sample every 5 pixels → at most 400 points
CONF_THRESH = 0.5  # only include confident predictions

for r in range(0, ROWS, STEP):
    for c in range(0, COLS, STEP):
        prob = float(conf_map[r, c])
        if prob < CONF_THRESH and pred_map[r, c] == 0:
            continue  # skip low-confidence healthy to keep file small
        lat = LAT_NORTH - (r / (ROWS - 1)) * (LAT_NORTH - LAT_SOUTH)
        lon = LON_WEST + (c / (COLS - 1)) * (LON_EAST - LON_WEST)
        cls = int(pred_map[r, c])
        features.append(
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [round(lon, 6), round(lat, 6)],
                },
                "properties": {
                    "class": cls,
                    "label": "Stressed" if cls == 1 else "Healthy",
                    "probability": round(prob, 3),
                    "row": r,
                    "col": c,
                },
            }
        )

geojson = {"type": "FeatureCollection", "features": features}
geo_path = OUT_DIR / "geo_predictions.json"
with open(geo_path, "w") as f:
    json.dump(geojson, f)
print(f"  ✔ geo_predictions.json saved  |  {len(features)} prediction points")

# ── SUMMARY ───────────────────────────────────────────────────────────────────
print("\n" + "═" * 60)
print("  TRAINING COMPLETE")
print("═" * 60)
print(f"  Dataset   : {ROWS}×{COLS}×{BANDS} HSI cube  ({ROWS*COLS:,} pixels)")
print(f"  Model     : CropHealth3DCNN  ({total_params:,} params)")
print(f"  Accuracy  : {acc*100:.2f}%")
print(f"  F1-Score  : {f1*100:.2f}%")
print(f"  Checkpoint: {ckpt_path}")
print(f"  GeoJSON   : {geo_path}  ({len(features)} points)")
print("═" * 60 + "\n")
