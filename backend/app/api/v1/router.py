from fastapi import APIRouter
# from app.api.v1.routes.hyperspectral import router as hsi_router
from app.api.v1.routes.Hy import router

api_router = APIRouter()

# api_router.include_router(hsi_router)

api_router.include_router(router)

