from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Query
from fastapi import status as http_status
from datetime import datetime
from typing import List
from bson import ObjectId
import base64

from app.core.deps import get_current_user
from app.core.database import get_db
from app.models.prescription import PrescriptionOut, PrescriptionAnalysis
from app.services.claude_service import analyse_prescription

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])

ALLOWED_TYPES = {
    "image/jpeg": "image/jpeg",
    "image/png":  "image/png",
    "image/webp": "image/webp",
    "application/pdf": "application/pdf",
}
MAX_SIZE_MB = 10


def _fmt(doc: dict) -> dict:
    return {
        "id":         str(doc["_id"]),
        "title":      doc.get("title", "Prescription"),
        "analysis":   doc["analysis"],
        "created_at": doc.get("created_at", datetime.utcnow()),
    }


# ── ANALYSE + SAVE ──────────────────────────────────────────
@router.post("/analyse", response_model=PrescriptionOut, status_code=201)
async def analyse_and_save(
    file:     UploadFile = File(...),
    language: str        = Query("en", regex="^(en|hi)$"),
    current_user: dict   = Depends(get_current_user),
):
    # Validate file type
    mime = file.content_type
    if mime not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=http_status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {mime}. Use JPG, PNG, WEBP, or PDF.",
        )

    # Read & size-check
    img_bytes = await file.read()
    if len(img_bytes) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"File too large. Max {MAX_SIZE_MB}MB.")

    # Call Claude
    try:
        analysis_dict = await analyse_prescription(img_bytes, ALLOWED_TYPES[mime], language)
    except Exception as e:
        raise HTTPException(502, f"AI analysis failed: {str(e)}")

    # Build a title from doctor/date
    doc_name = analysis_dict.get("doctor_name") or "Prescription"
    date_str  = analysis_dict.get("date") or datetime.utcnow().strftime("%d %b %Y")
    title = f"{doc_name} · {date_str}"

    # Store thumbnail as base64 (first 200KB only)
    thumb = base64.b64encode(img_bytes[:200_000]).decode() if len(img_bytes) < 5_000_000 else None

    doc = {
        "user_id":      str(current_user["_id"]),
        "title":        title,
        "analysis":     analysis_dict,
        "image_base64": thumb,
        "created_at":   datetime.utcnow(),
        "language":     language,
    }

    db     = get_db()
    result = await db.prescriptions.insert_one(doc)
    doc["_id"] = result.inserted_id

    return PrescriptionOut(**_fmt(doc))


# ── LIST all prescriptions for user ────────────────────────
@router.get("/", response_model=List[PrescriptionOut])
async def list_prescriptions(
    current_user: dict = Depends(get_current_user),
    skip: int  = Query(0,  ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    db   = get_db()
    docs = await db.prescriptions.find(
        {"user_id": str(current_user["_id"])}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)

    return [PrescriptionOut(**_fmt(d)) for d in docs]


# ── GET single prescription ─────────────────────────────────
@router.get("/{prescription_id}", response_model=PrescriptionOut)
async def get_prescription(
    prescription_id: str,
    current_user: dict = Depends(get_current_user),
):
    db  = get_db()
    doc = await db.prescriptions.find_one({
        "_id":     ObjectId(prescription_id),
        "user_id": str(current_user["_id"]),
    })
    if not doc:
        raise HTTPException(404, "Prescription not found")
    return PrescriptionOut(**_fmt(doc))


# ── DELETE ──────────────────────────────────────────────────
@router.delete("/{prescription_id}", status_code=204)
async def delete_prescription(
    prescription_id: str,
    current_user: dict = Depends(get_current_user),
):
    db     = get_db()
    result = await db.prescriptions.delete_one({
        "_id":     ObjectId(prescription_id),
        "user_id": str(current_user["_id"]),
    })
    if result.deleted_count == 0:
        raise HTTPException(404, "Prescription not found")
