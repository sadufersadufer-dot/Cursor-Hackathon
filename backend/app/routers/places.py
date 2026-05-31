from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.deps import CurrentUser, DbSession
from app.models.enums import EntityType
from app.models.place import Place
from app.models.swipe import Swipe
from app.schemas.common import DeckResponse
from app.schemas.place import PlaceRead

router = APIRouter(prefix="/places", tags=["places"])


@router.get("/deck", response_model=DeckResponse[PlaceRead])
async def places_deck(
    user: CurrentUser,
    db: DbSession,
    city_id: int,
    category_id: int | None = None,
    limit: int = Query(default=15, ge=1, le=50),
) -> DeckResponse[PlaceRead]:
    """Random-shuffle deck of places in a city, excluding already-swiped ones."""
    swiped = select(Swipe.entity_id).where(
        Swipe.user_id == user.id, Swipe.entity_type == EntityType.place
    )
    stmt = (
        select(Place)
        .where(Place.city_id == city_id, Place.id.not_in(swiped))
        .order_by(func.random())
        .limit(limit)
    )
    if category_id is not None:
        stmt = stmt.where(Place.category_id == category_id)
    result = await db.scalars(stmt)
    return DeckResponse(items=list(result))


@router.get("/{place_id}", response_model=PlaceRead)
async def get_place(place_id: int, db: DbSession) -> Place:
    place = await db.get(Place, place_id)
    if place is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Place not found")
    return place
