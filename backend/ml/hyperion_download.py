
import ee

# Initialize Google Earth Engine
ee.Initialize(project="YOUR_GOOGLE_CLOUD_PROJECT_ID")

# Define your area of interest.
# Replace these coordinates with your farm/region coordinates.
longitude = 77.5946
latitude = 12.9716

aoi = ee.Geometry.Point([longitude, latitude]).buffer(5000).bounds()

# Load Hyperion imagery
dataset = (
    ee.ImageCollection("EO1/HYPERION")
    .filterDate("2016-01-01", "2017-03-01")
    .filterBounds(aoi)
)

# Check available scenes
print("Number of scenes:", dataset.size().getInfo())

# Select RGB bands from your original code
rgb = dataset.select(["B050", "B023", "B015"])

# Create median composite
composite = rgb.median().clip(aoi)

# Export RGB composite to Google Drive
task = ee.batch.Export.image.toDrive(
    image=composite,
    description="Hyperion_RGB",
    folder="TerraSpectra",
    fileNamePrefix="hyperion_rgb",
    region=aoi,
    scale=30,
    maxPixels=1e13,
    fileFormat="GeoTIFF"
)

task.start()

print("Export started!")
print("Task ID:", task.id)
