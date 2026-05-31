import enum


class CategoryType(str, enum.Enum):
    place = "place"
    event = "event"


class EntityType(str, enum.Enum):
    place = "place"
    event = "event"


class SwipeAction(str, enum.Enum):
    like = "like"
    dislike = "dislike"


class EventStatus(str, enum.Enum):
    draft = "draft"
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    expired = "expired"
