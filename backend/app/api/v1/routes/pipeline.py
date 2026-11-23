# from fastapi import APIRouter, Depends, HTTPException, status, Response

# from typing import Annotated
# from datetime import datetime, timezone
# from sqlalchemy import select
# from sqlalchemy.orm import Session
# from src.models.credits import Credit

# from src.db.database import get_db
# from src.dependencies.credit_restore_helper import (
#     reset_daily_credits,
#     reset_monthly_credits,
# )


# router = APIRouter(prefix="/", tags=["Users"])


# # from src.core.rate_limiting import token_bucket_limit
# # from datetime import datetime, timezone
# # from sqlalchemy import select

# # from src.models.subscription import Subscription


# @router.get(
#     "/dashboard",
# )
# def read_current_user(
#   db: Annotated[Session, Depends(get_db)]
# ):
    
#     return CurrentUserResponse(
#         user=user,
#         credits=credits.balance,
#     )
