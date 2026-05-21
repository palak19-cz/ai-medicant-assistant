from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Query, Form
from fastapi import status as http_status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.core.deps import get_current_user
from app.core.database import get_db
from app.models.symptom import SymptomCheckOut
from app.services.claude_service import analyse_symptoms

router = APIRouter(prefix="/symptoms", tags=["symptoms"])

ALLOWED_IMG = {"image/jpeg", "image/png", "image/webp"}
MAX_MB = 8


def _fmt(doc: dict) -> dict:
    return {
        "id":           str(doc["_id"]),
        "symptom_text": doc["symptom_text"],
        "analysis":     doc["analysis"],
        "created_at":   doc.get("created_at", datetime.utcnow()),
    }


# ── ANALYSE + SAVE ──────────────────────────────────────────
@router.post("/analyse", response_model=SymptomCheckOut, status_code=201)
async def analyse_and_save(
    symptom_text: str        = Form(..., min_length=3, max_length=2000),
    language:     str        = Form("en"),
    image:        Optional[UploadFile] = File(None),
    current_user: dict       = Depends(get_current_user),
):
    image_bytes = None
    mime_type   = None
    has_image   = False

    if image and image.filename:
        if image.content_type not in ALLOWED_IMG:
            raise HTTPException(415, "Image must be JPG, PNG, or WEBP.")
        image_bytes = await image.read()
        if len(image_bytes) > MAX_MB * 1024 * 1024:
            raise HTTPException(400, f"Image too large. Max {MAX_MB}MB.")
        mime_type = image.content_type
        has_image = True

    try:
        analysis_dict = await analyse_symptoms(
            text=symptom_text,
            language=language,
            image_bytes=image_bytes,
            mime_type=mime_type,
        )
    except Exception as e:
        raise HTTPException(502, f"AI analysis failed: {str(e)}")

    doc = {
        "user_id":      str(current_user["_id"]),
        "symptom_text": symptom_text,
        "has_image":    has_image,
        "analysis":     analysis_dict,
        "created_at":   datetime.utcnow(),
        "language":     language,
    }

    db     = get_db()
    result = await db.symptom_checks.insert_one(doc)
    doc["_id"] = result.inserted_id

    return SymptomCheckOut(**_fmt(doc))


# ── LIST history ────────────────────────────────────────────
@router.get("/", response_model=List[SymptomCheckOut])
async def list_checks(
    current_user: dict = Depends(get_current_user),
    skip:  int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    db   = get_db()
    docs = await db.symptom_checks.find(
        {"user_id": str(current_user["_id"])}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [SymptomCheckOut(**_fmt(d)) for d in docs]


# ── GET single ──────────────────────────────────────────────
@router.get("/{check_id}", response_model=SymptomCheckOut)
async def get_check(
    check_id: str,
    current_user: dict = Depends(get_current_user),
):
    db  = get_db()
    doc = await db.symptom_checks.find_one({
        "_id":     ObjectId(check_id),
        "user_id": str(current_user["_id"]),
    })
    if not doc:
        raise HTTPException(404, "Symptom check not found")
    return SymptomCheckOut(**_fmt(doc))


# ── DELETE ──────────────────────────────────────────────────
@router.delete("/{check_id}", status_code=204)
async def delete_check(
    check_id: str,
    current_user: dict = Depends(get_current_user),
):
    db     = get_db()
    result = await db.symptom_checks.delete_one({
        "_id":     ObjectId(check_id),
        "user_id": str(current_user["_id"]),
    })
    if result.deleted_count == 0:
        raise HTTPException(404, "Not found")
