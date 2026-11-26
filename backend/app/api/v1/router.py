"""
TerraSpectra API v1 Router
Aggregates all v1 endpoint modules into a single router mounted at /api.
"""
from fastapi import APIRouter
from app.api.v1.routes.hyperspectral import router as hsi_router

api_router = APIRouter()
api_router.include_router(hsi_router)
