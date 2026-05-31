from pydantic import BaseModel, Field

from app.models.enums import EntityType


class SearchRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=500)
    entity_type: EntityType
    city_id: int | None = None
