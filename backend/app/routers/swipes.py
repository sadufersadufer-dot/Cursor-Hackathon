from fastapi import APIRouter, status
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.deps import CurrentUser, DbSession
from app.models.enums import EntityType, SwipeAction
from app.models.event import Event
from app.models.place import Place
from app.models.swipe import Swipe
from app.schemas.event import EventRead
from app.schemas.place import PlaceRead
from app.schemas.swipe import SwipeCreate, SwipeRead

router = APIRouter(prefix="/swipes", tags=["swipes"])


@router.post("", response_model=SwipeRead, status_code=status.HTTP_201_CREATED)
async def create_swipe(
    payload: SwipeCreate, user: CurrentUser, db: DbSession
) -> Swipe:
    """Record a swipe. Re-swiping the same entity updates the action (upsert)."""
    stmt = (
        pg_insert(Swipe)
        .values(
            user_id=user.id,
            entity_type=payload.entity_type,
            entity_id=payload.entity_id,
            action=payload.action,
        )
        .on_conflict_do_update(
            constraint="uq_swipe_user_entity",
            set_={"action": payload.action},
        )
        .returning(Swipe)
    )
    swipe = await db.scalar(stmt)
    await db.commit()
    return swipe


@router.get("/liked/places", response_model=list[PlaceRead])
async def liked_places(user: CurrentUser, db: DbSession) -> list[Place]:
    liked_ids = select(Swipe.entity_id).where(
        Swipe.user_id == user.id,
        Swipe.entity_type == EntityType.place,
        Swipe.action == SwipeAction.like,
    )
    result = await db.scalars(select(Place).where(Place.id.in_(liked_ids)))
    return list(result)


@router.get("/liked/events", response_model=list[EventRead])
async def liked_events(user: CurrentUser, db: DbSession) -> list[Event]:
    liked_ids = select(Swipe.entity_id).where(
        Swipe.user_id == user.id,
        Swipe.entity_type == EntityType.event,
        Swipe.action == SwipeAction.like,
    )
    result = await db.scalars(select(Event).where(Event.id.in_(liked_ids)))
    return list(result)
