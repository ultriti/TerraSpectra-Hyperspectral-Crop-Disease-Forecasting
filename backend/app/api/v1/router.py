from fastapi import APIRouter
from app.api.v1.routes.Hy import router as hy_router
from app.api.v1.routes.analytics import router as analytics_router

api_router = APIRouter()
api_router.include_router(hy_router)
api_router.include_router(analytics_router)
