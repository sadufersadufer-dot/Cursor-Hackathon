from typing import Any

from sqlalchemy import Boolean, Float, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class City(Base):
    __tablename__ = "cities"

    id: Mapped[int] = mapped_column(primary_key=True)
    # {"en": "Almaty", "ru": "Алматы"}
    name_i18n: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    country: Mapped[str] = mapped_column(String(2), nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    # Optional bounding box for 2GIS queries, e.g. {"min_lat":..,"min_lng":..,"max_lat":..,"max_lng":..}
    bbox: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    gis_region_id: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
