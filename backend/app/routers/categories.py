from fastapi import APIRouter
from sqlalchemy import select

from app.deps import DbSession
from app.models.category import Category
from app.models.enums import CategoryType
from app.schemas.category import CategoryRead

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryRead])
async def list_categories(db: DbSession, type: CategoryType | None = None) -> list[Category]:
    stmt = select(Category).order_by(Category.id)
    if type is not None:
        stmt = stmt.where(Category.type == type)
    result = await db.scalars(stmt)
    return list(result)
