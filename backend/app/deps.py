"""Shared FastAPI dependencies: DB session, current user, admin guard."""

from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.services.firebase import InvalidToken, verify_token

DbSession = Annotated[AsyncSession, Depends(get_db)]


async def _bearer_token(authorization: Annotated[str | None, Header()] = None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return authorization[7:].strip()


async def get_current_user(
    db: DbSession,
    token: Annotated[str, Depends(_bearer_token)],
) -> User:
    """Verify the bearer token and return the User, creating the row on first sight."""
    try:
        claims = verify_token(token)
    except InvalidToken as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user = await db.get(User, claims["uid"])
    if user is None:
        user = User(id=claims["uid"], email=claims["email"])
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


async def require_admin(
    user: CurrentUser,
    token: Annotated[str, Depends(_bearer_token)],
) -> User:
    """Allow only admins: Firebase `admin` claim, or email in ADMIN_EMAILS (dev-stub)."""
    claims = verify_token(token)
    is_admin = bool(claims.get("admin")) or (
        user.email.lower() in settings.admin_emails_list
    )
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    return user


AdminUser = Annotated[User, Depends(require_admin)]
