from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base
from app.models.enums import EntityType, SwipeAction


class Swipe(Base):
    __tablename__ = "swipes"
    __table_args__ = (
        UniqueConstraint(
            "user_id", "entity_type", "entity_id", name="uq_swipe_user_entity"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Polymorphic reference: (entity_type, entity_id) points at a place or event.
    # No cross-table FK by design.
    entity_type: Mapped[EntityType] = mapped_column(
        SAEnum(EntityType, name="entity_type"), nullable=False
    )
    entity_id: Mapped[int] = mapped_column(Integer, nullable=False)
    action: Mapped[SwipeAction] = mapped_column(
        SAEnum(SwipeAction, name="swipe_action"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
