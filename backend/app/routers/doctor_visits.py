from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime
from typing import List, Optional
from bson import ObjectId

from app.core.deps     import get_current_user
from app.core.database import get_db
from app.models.doctor_visit import DoctorVisitCreate, DoctorVisitOut

router = APIRouter(prefix="/visits", tags=["doctor_visits"])


def _fmt(doc: dict) -> dict:
    return {
        "id":               str(doc["_id"]),
        "doctor_name":      doc["doctor_name"],
        "specialty":        doc.get("specialty"),
        "hospital":         doc.get("hospital"),
        "visit_date":       doc.get("visit_date"),
        "next_visit":       doc.get("next_visit"),
        "notes":            doc.get("notes"),
        "diagnosis":        doc.get("diagnosis"),
        "prescription_ids": doc.get("prescription_ids", []),
        "created_at":       doc.get("created_at", datetime.utcnow()),
    }


# ── CREATE visit ────────────────────────────────────────────
@router.post("/", response_model=DoctorVisitOut, status_code=201)
async def create_visit(
    payload:      DoctorVisitCreate,
    current_user: dict = Depends(get_current_user),
):
    doc = {
        "user_id":          str(current_user["_id"]),
        **payload.model_dump(),
        "prescription_ids": [],
        "created_at":       datetime.utcnow(),
    }
    db     = get_db()
    result = await db.doctor_visits.insert_one(doc)
    doc["_id"] = result.inserted_id
    return DoctorVisitOut(**_fmt(doc))


# ── LIST visits ─────────────────────────────────────────────
@router.get("/", response_model=List[DoctorVisitOut])
async def list_visits(
    current_user: dict = Depends(get_current_user),
    skip:  int = Query(0, ge=0),
    limit: int = Query(30, ge=1, le=100),
):
    db   = get_db()
    docs = await db.doctor_visits.find(
        {"user_id": str(current_user["_id"])}
    ).sort("visit_date", -1).skip(skip).limit(limit).to_list(limit)
    return [DoctorVisitOut(**_fmt(d)) for d in docs]


# ── GET single ──────────────────────────────────────────────
@router.get("/{visit_id}", response_model=DoctorVisitOut)
async def get_visit(
    visit_id:     str,
    current_user: dict = Depends(get_current_user),
):
    db  = get_db()
    doc = await db.doctor_visits.find_one({
        "_id":     ObjectId(visit_id),
        "user_id": str(current_user["_id"]),
    })
    if not doc:
        raise HTTPException(404, "Visit not found")
    return DoctorVisitOut(**_fmt(doc))


# ── ATTACH prescription to visit ────────────────────────────
@router.post("/{visit_id}/prescriptions/{prescription_id}", status_code=204)
async def attach_prescription(
    visit_id:        str,
    prescription_id: str,
    current_user:    dict = Depends(get_current_user),
):
    db  = get_db()
    res = await db.doctor_visits.update_one(
        {"_id": ObjectId(visit_id), "user_id": str(current_user["_id"])},
        {"$addToSet": {"prescription_ids": prescription_id}}
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Visit not found")


# ── UPDATE visit ────────────────────────────────────────────
@router.put("/{visit_id}", response_model=DoctorVisitOut)
async def update_visit(
    visit_id:     str,
    payload:      DoctorVisitCreate,
    current_user: dict = Depends(get_current_user),
):
    db  = get_db()
    res = await db.doctor_visits.find_one_and_update(
        {"_id": ObjectId(visit_id), "user_id": str(current_user["_id"])},
        {"$set": payload.model_dump()},
        return_document=True,
    )
    if not res:
        raise HTTPException(404, "Visit not found")
    return DoctorVisitOut(**_fmt(res))


# ── DELETE ──────────────────────────────────────────────────
@router.delete("/{visit_id}", status_code=204)
async def delete_visit(
    visit_id:     str,
    current_user: dict = Depends(get_current_user),
):
    db     = get_db()
    result = await db.doctor_visits.delete_one({
        "_id":     ObjectId(visit_id),
        "user_id": str(current_user["_id"]),
    })
    if result.deleted_count == 0:
        raise HTTPException(404, "Visit not found")
