"""2GIS places sync — STUB.

Real implementation (later pass) will page the 2GIS Places API for a city x category and
upsert into `places` keyed on `gis_id`, storing the raw payload in `places.raw`.
"""

from app.models.city import City


async def sync_city(city: City) -> int:
    """Sync places for a city from 2GIS. Returns number of places upserted. STUB: no-op."""
    # TODO: httpx client against 2GIS Places API, upsert on gis_id, set synced_at.
    return 0
