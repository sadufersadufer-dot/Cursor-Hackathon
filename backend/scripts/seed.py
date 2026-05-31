"""Seed local data: one city, a few categories, and sample places.

Run after migrations:  uv run python -m scripts.seed
Idempotent-ish: skips seeding if a city already exists.
"""

import asyncio

from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.category import Category
from app.models.city import City
from app.models.enums import CategoryType
from app.models.place import Place


async def seed() -> None:
    async with SessionLocal() as db:
        if await db.scalar(select(City.id).limit(1)):
            print("Data already present, skipping seed.")
            return

        city = City(
            name_i18n={"en": "Almaty", "ru": "Алматы"},
            country="KZ",
            lat=43.2389,
            lng=76.8897,
        )
        db.add(city)
        await db.flush()

        cafe = Category(
            type=CategoryType.place,
            slug="cafe",
            name_i18n={"en": "Cafe", "ru": "Кафе"},
            icon="☕",
        )
        park = Category(
            type=CategoryType.place,
            slug="park",
            name_i18n={"en": "Park", "ru": "Парк"},
            icon="🌳",
        )
        concert = Category(
            type=CategoryType.event,
            slug="concert",
            name_i18n={"en": "Concert", "ru": "Концерт"},
            icon="🎵",
        )
        db.add_all([cafe, park, concert])
        await db.flush()

        db.add_all(
            [
                Place(
                    city_id=city.id,
                    category_id=cafe.id,
                    name="Coffee Boom",
                    description="Cozy spot for working with great espresso.",
                    lat=43.2400,
                    lng=76.9450,
                    address="Dostyk Ave 1",
                    rating=4.6,
                    photos=[],
                    source="seed",
                ),
                Place(
                    city_id=city.id,
                    category_id=cafe.id,
                    name="Nedelька Bakery",
                    description="Fresh pastries and quiet corners.",
                    lat=43.2510,
                    lng=76.9120,
                    address="Abay Ave 22",
                    rating=4.3,
                    photos=[],
                    source="seed",
                ),
                Place(
                    city_id=city.id,
                    category_id=park.id,
                    name="Central Park",
                    description="Big green park in the city center.",
                    lat=43.2620,
                    lng=76.9460,
                    address="Gogol St 5",
                    rating=4.8,
                    photos=[],
                    source="seed",
                ),
            ]
        )

        await db.commit()
        print(f"Seeded city {city.id} with categories and 3 places.")


if __name__ == "__main__":
    asyncio.run(seed())
