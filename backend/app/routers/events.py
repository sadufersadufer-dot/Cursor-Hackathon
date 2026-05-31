from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.deps import CurrentUser, DbSession
from app.models.enums import EntityType, EventStatus
from app.models.event import Event
from app.models.swipe import Swipe
from app.schemas.common import DeckResponse
from app.schemas.event import EventCreate, EventRead, EventUpdate

router = APIRouter(prefix="/events", tags=["events"])

# Statuses a creator may still edit.
_EDITABLE = {EventStatus.draft, EventStatus.pending}


@router.get("/deck", response_model=DeckResponse[EventRead])
async def events_deck(
    user: CurrentUser,
    db: DbSession,
    city_id: int,
    category_id: int | None = None,
    limit: int = Query(default=15, ge=1, le=50),
) -> DeckResponse[EventRead]:
    """Random-shuffle deck of approved, upcoming events, excluding already-swiped ones."""
    swiped = select(Swipe.entity_id).where(
        Swipe.user_id == user.id, Swipe.entity_type == EntityType.event
    )
    stmt = (
        select(Event)
        .where(
            Event.city_id == city_id,
            Event.status == EventStatus.approved,
            Event.starts_at > datetime.now(timezone.utc),
            Event.id.not_in(swiped),
        )
        .order_by(func.random())
        .limit(limit)
    )
    if category_id is not None:
        stmt = stmt.where(Event.category_id == category_id)
    result = await db.scalars(stmt)
    return DeckResponse(items=list(result))


@router.post("", response_model=EventRead, status_code=status.HTTP_201_CREATED)
async def create_event(payload: EventCreate, user: CurrentUser, db: DbSession) -> Event:
    event = Event(
        creator_id=user.id, status=EventStatus.pending, **payload.model_dump()
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


@router.get("/mine", response_model=list[EventRead])
async def my_events(user: CurrentUser, db: DbSession) -> list[Event]:
    result = await db.scalars(
        select(Event)
        .where(Event.creator_id == user.id)
        .order_by(Event.created_at.desc())
    )
    return list(result)


@router.get("/{event_id}", response_model=EventRead)
async def get_event(event_id: int, db: DbSession) -> Event:
    event = await db.get(Event, event_id)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event


@router.patch("/{event_id}", response_model=EventRead)
async def update_event(
    event_id: int, payload: EventUpdate, user: CurrentUser, db: DbSession
) -> Event:
    event = await db.get(Event, event_id)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    if event.creator_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your event")
    if event.status not in _EDITABLE:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot edit an event in '{event.status.value}' status",
        )
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    await db.commit()
    await db.refresh(event)
    return event
