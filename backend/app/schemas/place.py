from pydantic import BaseModel, ConfigDict


class PlaceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    city_id: int
    category_id: int
    name: str
    description: str | None
    lat: float
    lng: float
    address: str | None
    rating: float | None
    photos: list[str]
