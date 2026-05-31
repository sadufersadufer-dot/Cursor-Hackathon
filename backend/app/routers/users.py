from fastapi import APIRouter

from app.deps import CurrentUser, DbSession
from app.schemas.user import UserRead, UserUpdate

router = APIRouter(prefix="/me", tags=["users"])


@router.get("", response_model=UserRead)
async def read_me(user: CurrentUser) -> UserRead:
    return user


@router.patch("", response_model=UserRead)
async def update_me(payload: UserUpdate, user: CurrentUser, db: DbSession) -> UserRead:
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user
