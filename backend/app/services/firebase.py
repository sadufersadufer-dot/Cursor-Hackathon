"""Firebase auth — STUB.

Dev-stub mode until firebase-admin is wired in a later pass. `verify_token` does NOT
verify a real Firebase ID token yet; it decodes the unverified JWT payload (or accepts a
raw "uid:email" dev token) so the rest of the API is exercisable end-to-end.

TODO: replace with firebase-admin:
    from firebase_admin import auth
    decoded = auth.verify_id_token(token)
    return {"uid": decoded["uid"], "email": decoded.get("email"),
            "admin": bool(decoded.get("admin"))}
"""

import base64
import binascii
import json


class InvalidToken(Exception):
    pass


def _decode_unverified_jwt(token: str) -> dict | None:
    parts = token.split(".")
    if len(parts) != 3:
        return None
    try:
        payload = parts[1] + "=" * (-len(parts[1]) % 4)
        data = json.loads(base64.urlsafe_b64decode(payload))
    except (ValueError, binascii.Error, json.JSONDecodeError):
        return None
    return data


def verify_token(token: str) -> dict:
    """Return {"uid", "email", "admin"} for a bearer token (dev-stub).

    Accepts either an unverified JWT (uses `sub`/`user_id` + `email` claims) or a plain
    "uid:email" dev token.
    """
    claims = _decode_unverified_jwt(token)
    if claims is not None:
        uid = claims.get("user_id") or claims.get("sub") or claims.get("uid")
        email = claims.get("email")
        admin = bool(claims.get("admin"))
        if uid and email:
            return {"uid": uid, "email": email, "admin": admin}

    # Fallback dev format: "uid:email"
    if ":" in token:
        uid, _, email = token.partition(":")
        if uid and email:
            return {"uid": uid, "email": email, "admin": False}

    raise InvalidToken("Could not extract uid/email from token (dev-stub mode)")
