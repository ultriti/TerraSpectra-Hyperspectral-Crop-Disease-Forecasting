
import rasterio
import numpy as np

def load_hyperspectral_image(file_path):

    with rasterio.open(file_path) as src:

        image = src.read()

        metadata = {
            "width": src.width,
            "height": src.height,
            "bands": src.count,
            "crs": str(src.crs),
            "transform": src.transform,
            "dtype": str(src.dtypes[0])
        }

    print("Image shape:", image.shape)
    print("Metadata:", metadata)

    return image, metadata


image, metadata = load_hyperspectral_image(
    "data/raw/sample.tif"
)
