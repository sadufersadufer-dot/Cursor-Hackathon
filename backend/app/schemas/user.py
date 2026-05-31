from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    display_name: str | None
    locale: str
    city_id: int | None
    created_at: datetime


class UserUpdate(BaseModel):
    display_name: str | None = None
    locale: str | None = None
    city_id: int | None = None
