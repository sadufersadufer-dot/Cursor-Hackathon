"""AI semantic search — STUB.

Real implementation (later pass) sends `prompt` + candidate summaries to Claude and asks
it to return the best-matching ids (with prompt caching on the static instructions). For
now we just shuffle the candidates so the endpoint is fully wired end-to-end.

TODO: Claude call returning ordered ids, e.g.:
    client.messages.create(model="claude-...", system=[{...cache_control...}], ...)
"""

import random
from typing import Sequence, TypeVar

T = TypeVar("T")


async def rank_candidates(prompt: str, candidates: Sequence[T]) -> list[T]:
    """Rank candidates by relevance to the prompt. STUB: random shuffle."""
    ranked = list(candidates)
    random.shuffle(ranked)
    return ranked
