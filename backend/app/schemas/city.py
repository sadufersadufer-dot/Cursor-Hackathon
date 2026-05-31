from pydantic import BaseModel, ConfigDict


class CityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name_i18n: dict[str, str]
    country: str
    lat: float
    lng: float
    is_active: bool
