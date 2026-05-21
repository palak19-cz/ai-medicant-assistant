from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime

from app.models.user import UserRegister, UserOut, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.database import get_db
from app.core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


def _format_user(doc: dict) -> dict:
    """Convert MongoDB doc to UserOut-compatible dict."""
    return {
        "id":         str(doc["_id"]),
        "name":       doc["name"],
        "email":      doc["email"],
        "phone":      doc["phone"],
        "created_at": doc.get("created_at", datetime.utcnow()),
    }


# ── REGISTER ───────────────────────────────────────────────
@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(payload: UserRegister):
    db = get_db()

    # Check duplicate email
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    # Insert user
    doc = {
        "name":            payload.name.strip(),
        "email":           payload.email.lower(),
        "phone":           payload.phone.strip(),
        "hashed_password": hash_password(payload.password),
        "created_at":      datetime.utcnow(),
        "is_active":       True,
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id

    token = create_access_token({"sub": str(result.inserted_id)})
    return TokenResponse(access_token=token, user=UserOut(**_format_user(doc)))


# ── LOGIN ──────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db   = get_db()
    user = await db.users.find_one({"email": form_data.username.lower()})

    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": str(user["_id"])})
    return TokenResponse(access_token=token, user=UserOut(**_format_user(user)))


# ── ME (get current user) ──────────────────────────────────
@router.get("/me", response_model=UserOut)
async def me(current_user: dict = Depends(get_current_user)):
    return UserOut(**_format_user(current_user))


# ── UPDATE PROFILE ─────────────────────────────────────────
@router.patch("/me", response_model=UserOut)
async def update_me(
    updates: dict,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    allowed = {k: v for k, v in updates.items() if k in ("name", "phone")}
    if not allowed:
        raise HTTPException(400, "No valid fields to update")

    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": allowed}
    )
    updated = await db.users.find_one({"_id": current_user["_id"]})
    return UserOut(**_format_user(updated))
