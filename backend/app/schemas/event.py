from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import EventStatus


class EventCreate(BaseModel):
    city_id: int
    category_id: int
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    starts_at: datetime
    ends_at: datetime | None = None
    venue: str | None = None
    lat: float | None = None
    lng: float | None = None
    photos: list[str] = Field(default_factory=list)


class EventUpdate(BaseModel):
    category_id: int | None = None
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, min_length=1)
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    venue: str | None = None
    lat: float | None = None
    lng: float | None = None
    photos: list[str] | None = None


class EventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    creator_id: str
    city_id: int
    category_id: int
    title: str
    description: str
    starts_at: datetime
    ends_at: datetime | None
    venue: str | None
    lat: float | None
    lng: float | None
    photos: list[str]
    status: EventStatus
    rejection_reason: str | None


class EventReject(BaseModel):
    reason: str = Field(min_length=1)
