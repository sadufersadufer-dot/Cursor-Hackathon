from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class DeckResponse(BaseModel, Generic[T]):
    """A batch of cards for a deck. Random-shuffle decks need no cursor."""

    items: list[T]
