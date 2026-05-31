from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import EntityType, SwipeAction


class SwipeCreate(BaseModel):
    entity_type: EntityType
    entity_id: int
    action: SwipeAction


class SwipeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
    entity_type: EntityType
    entity_id: int
    action: SwipeAction
    created_at: datetime
