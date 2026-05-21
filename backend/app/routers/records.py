from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Query, Form
from fastapi.responses import Response
from datetime import datetime
from typing import List, Optional
from bson import ObjectId
import base64

from app.core.deps    import get_current_user
from app.core.database import get_db
from app.models.record import HealthRecordOut

router = APIRouter(prefix="/records", tags=["records"])

ALLOWED = {
    "image/jpeg", "image/png", "image/webp",
    "application/pdf", "image/dicom",
}
MAX_MB = 20


def _fmt(doc: dict) -> dict:
    return {
        "id":          str(doc["_id"]),
        "title":       doc["title"],
        "category":    doc.get("category", "Other"),
        "doctor_name": doc.get("doctor_name"),
        "hospital":    doc.get("hospital"),
        "notes":       doc.get("notes"),
        "file_name":   doc.get("file_name", ""),
        "file_type":   doc.get("file_type", ""),
        "file_size":   doc.get("file_size", 0),
        "has_file":    bool(doc.get("file_b64")),
        "created_at":  doc.get("created_at", datetime.utcnow()),
    }


# ── UPLOAD record ───────────────────────────────────────────
@router.post("/", response_model=HealthRecordOut, status_code=201)
async def upload_record(
    title:        str           = Form(...),
    category:     str           = Form("Other"),
    doctor_name:  Optional[str] = Form(None),
    hospital:     Optional[str] = Form(None),
    notes:        Optional[str] = Form(None),
    file:         UploadFile    = File(...),
    current_user: dict          = Depends(get_current_user),
):
    if file.content_type not in ALLOWED:
        raise HTTPException(415, f"Unsupported file type: {file.content_type}")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_MB * 1024 * 1024:
        raise HTTPException(400, f"File too large. Max {MAX_MB}MB.")

    # Store base64 for files ≤ 4MB, skip for larger (use gridfs in production)
    file_b64 = base64.b64encode(file_bytes).decode() if len(file_bytes) <= 4_000_000 else None

    doc = {
        "user_id":    str(current_user["_id"]),
        "title":      title.strip(),
        "category":   category,
        "doctor_name":doctor_name,
        "hospital":   hospital,
        "notes":      notes,
        "file_name":  file.filename,
        "file_type":  file.content_type,
        "file_size":  len(file_bytes),
        "file_b64":   file_b64,
        "created_at": datetime.utcnow(),
    }

    db     = get_db()
    result = await db.health_records.insert_one(doc)
    doc["_id"] = result.inserted_id
    return HealthRecordOut(**_fmt(doc))


# ── LIST records ────────────────────────────────────────────
@router.get("/", response_model=List[HealthRecordOut])
async def list_records(
    current_user: dict = Depends(get_current_user),
    category:  Optional[str] = Query(None),
    search:    Optional[str] = Query(None),
    skip:  int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    db    = get_db()
    query = {"user_id": str(current_user["_id"])}

    if category and category != "All":
        query["category"] = category
    if search:
        query["$or"] = [
            {"title":       {"$regex": search, "$options": "i"}},
            {"doctor_name": {"$regex": search, "$options": "i"}},
            {"hospital":    {"$regex": search, "$options": "i"}},
            {"notes":       {"$regex": search, "$options": "i"}},
        ]

    docs = await db.health_records.find(query).sort(
        "created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [HealthRecordOut(**_fmt(d)) for d in docs]


# ── GET single ──────────────────────────────────────────────
@router.get("/{record_id}", response_model=HealthRecordOut)
async def get_record(
    record_id:    str,
    current_user: dict = Depends(get_current_user),
):
    db  = get_db()
    doc = await db.health_records.find_one({
        "_id":     ObjectId(record_id),
        "user_id": str(current_user["_id"]),
    })
    if not doc:
        raise HTTPException(404, "Record not found")
    return HealthRecordOut(**_fmt(doc))


# ── DOWNLOAD file ───────────────────────────────────────────
@router.get("/{record_id}/download")
async def download_record(
    record_id:    str,
    current_user: dict = Depends(get_current_user),
):
    db  = get_db()
    doc = await db.health_records.find_one({
        "_id":     ObjectId(record_id),
        "user_id": str(current_user["_id"]),
    })
    if not doc:
        raise HTTPException(404, "Record not found")
    if not doc.get("file_b64"):
        raise HTTPException(404, "File not stored (too large — use cloud storage)")

    file_bytes = base64.b64decode(doc["file_b64"])
    return Response(
        content=file_bytes,
        media_type=doc["file_type"],
        headers={"Content-Disposition": f'attachment; filename="{doc["file_name"]}"'}
    )


# ── DELETE ──────────────────────────────────────────────────
@router.delete("/{record_id}", status_code=204)
async def delete_record(
    record_id:    str,
    current_user: dict = Depends(get_current_user),
):
    db     = get_db()
    result = await db.health_records.delete_one({
        "_id":     ObjectId(record_id),
        "user_id": str(current_user["_id"]),
    })
    if result.deleted_count == 0:
        raise HTTPException(404, "Record not found")
