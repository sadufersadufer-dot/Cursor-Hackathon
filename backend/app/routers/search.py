from datetime import datetime, timezone

from fastapi import APIRouter
from sqlalchemy import select

from app.deps import CurrentUser, DbSession
from app.models.enums import EntityType, EventStatus
from app.models.event import Event
from app.models.place import Place
from app.schemas.common import DeckResponse
from app.schemas.event import EventRead
from app.schemas.place import PlaceRead
from app.schemas.search import SearchRequest
from app.services.ai_search import rank_candidates

router = APIRouter(prefix="/search", tags=["search"])

# Candidate pool size handed to the AI ranker.
_CANDIDATE_LIMIT = 50


@router.post("", response_model=DeckResponse[PlaceRead] | DeckResponse[EventRead])
async def ai_search(payload: SearchRequest, user: CurrentUser, db: DbSession):
    """Semantic search over the user's city, rendered as a swipeable deck.

    The AI ranking is currently a stub (random shuffle); the candidate pool and wiring
    are real so the Claude call drops in later without endpoint changes.
    """
    city_id = payload.city_id or user.city_id

    if payload.entity_type == EntityType.place:
        stmt = select(Place).limit(_CANDIDATE_LIMIT)
        if city_id is not None:
            stmt = stmt.where(Place.city_id == city_id)
        candidates = list(await db.scalars(stmt))
        ranked = await rank_candidates(payload.prompt, candidates)
        return DeckResponse[PlaceRead](items=ranked)

    stmt = (
        select(Event)
        .where(
            Event.status == EventStatus.approved,
            Event.starts_at > datetime.now(timezone.utc),
        )
        .limit(_CANDIDATE_LIMIT)
    )
    if city_id is not None:
        stmt = stmt.where(Event.city_id == city_id)
    candidates = list(await db.scalars(stmt))
    ranked = await rank_candidates(payload.prompt, candidates)
    return DeckResponse[EventRead](items=ranked)
