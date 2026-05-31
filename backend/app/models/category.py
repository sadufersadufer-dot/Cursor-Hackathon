from typing import Any

from sqlalchemy import Enum as SAEnum
from sqlalchemy import String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base
from app.models.enums import CategoryType


class Category(Base):
    __tablename__ = "categories"
    __table_args__ = (UniqueConstraint("type", "slug", name="uq_category_type_slug"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[CategoryType] = mapped_column(
        SAEnum(CategoryType, name="category_type"), nullable=False
    )
    slug: Mapped[str] = mapped_column(String, nullable=False)
    # {"en": "Cafe", "ru": "Кафе"}
    name_i18n: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    icon: Mapped[str | None] = mapped_column(String, nullable=True)
