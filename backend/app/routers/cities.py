from fastapi import APIRouter
from sqlalchemy import select

from app.deps import DbSession
from app.models.city import City
from app.schemas.city import CityRead

router = APIRouter(prefix="/cities", tags=["cities"])


@router.get("", response_model=list[CityRead])
async def list_cities(db: DbSession) -> list[City]:
    result = await db.scalars(
        select(City).where(City.is_active.is_(True)).order_by(City.id)
    )
    return list(result)
