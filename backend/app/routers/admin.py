from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.deps import AdminUser, DbSession
from app.models.enums import EventStatus
from app.models.event import Event
from app.schemas.event import EventRead, EventReject

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/events", response_model=list[EventRead])
async def list_events_for_moderation(
    _admin: AdminUser,
    db: DbSession,
    status_filter: EventStatus = EventStatus.pending,
) -> list[Event]:
    result = await db.scalars(
        select(Event)
        .where(Event.status == status_filter)
        .order_by(Event.created_at.asc())
    )
    return list(result)


@router.post("/events/{event_id}/approve", response_model=EventRead)
async def approve_event(event_id: int, _admin: AdminUser, db: DbSession) -> Event:
    event = await _get_pending(event_id, db)
    event.status = EventStatus.approved
    event.rejection_reason = None
    await db.commit()
    await db.refresh(event)
    return event


@router.post("/events/{event_id}/reject", response_model=EventRead)
async def reject_event(
    event_id: int, payload: EventReject, _admin: AdminUser, db: DbSession
) -> Event:
    event = await _get_pending(event_id, db)
    event.status = EventStatus.rejected
    event.rejection_reason = payload.reason
    await db.commit()
    await db.refresh(event)
    return event


async def _get_pending(event_id: int, db: DbSession) -> Event:
    event = await db.get(Event, event_id)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    if event.status != EventStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Event is '{event.status.value}', not pending",
        )
    return event
