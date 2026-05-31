from pydantic import BaseModel, ConfigDict

from app.models.enums import CategoryType


class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: CategoryType
    slug: str
    name_i18n: dict[str, str]
    icon: str | None
