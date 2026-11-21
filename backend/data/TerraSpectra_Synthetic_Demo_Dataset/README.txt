TerraSpectra Synthetic HSI Demo
==============================

Files:
- synthetic_hsi_demo.npz: cube [rows, cols, bands], labels [rows, cols], wavelengths_nm
- pixel_spectra.csv: one row per pixel with 16 band values and demo label
- metadata.json: dataset description and important caveats

Quick load:
  import numpy as np
  data = np.load("synthetic_hsi_demo.npz")
  cube = data["cube"]                 # (32, 32, 16)
  labels = data["labels"]             # (32, 32), 0/1
  wavelengths = data["wavelengths_nm"] # (16,)

This is synthetic data created to test your TerraSpectra preprocessing, training,
API, and map pipeline. It is NOT real hyperspectral field data and must not be
used to report scientific crop-disease accuracy or real farm predictions.
