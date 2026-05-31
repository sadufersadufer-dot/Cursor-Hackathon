from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, Float, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Place(Base):
    __tablename__ = "places"
    __table_args__ = (Index("ix_places_city_category", "city_id", "category_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    # 2GIS object id; nullable so manually-seeded places are allowed.
    gis_id: Mapped[str | None] = mapped_column(String, unique=True, nullable=True)
    city_id: Mapped[int] = mapped_column(
        ForeignKey("cities.id", ondelete="CASCADE"), nullable=False
    )
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    photos: Mapped[list[str]] = mapped_column(JSONB, default=list, nullable=False)
    source: Mapped[str] = mapped_column(String, default="2gis", nullable=False)
    raw: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    synced_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
