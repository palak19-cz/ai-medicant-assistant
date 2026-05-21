from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime
from typing import List
from bson import ObjectId

from app.core.deps    import get_current_user
from app.core.database import get_db
from app.models.alarm import (
    AlarmSetOut, AlarmSetCreate, AlarmSetInDB,
    MedicineAlarm, FCMTokenUpdate
)
from app.services.alarm_service import suggest_alarms_for_medicines

router = APIRouter(prefix="/alarms", tags=["alarms"])


def _fmt(doc: dict) -> dict:
    return {
        "id":              str(doc["_id"]),
        "prescription_id": doc.get("prescription_id"),
        "medicines":       doc.get("medicines", []),
        "created_at":      doc.get("created_at", datetime.utcnow()),
        "updated_at":      doc.get("updated_at", datetime.utcnow()),
    }


# ── SUGGEST time slots from medicines list ──────────────────
@router.post("/suggest", response_model=List[MedicineAlarm])
async def suggest(
    medicines: List[dict],
    current_user: dict = Depends(get_current_user),
):
    """
    Given a list of medicine dicts (from prescription analysis),
    return suggested alarm times. Does NOT save to DB.
    """
    if not medicines:
        raise HTTPException(400, "medicines list cannot be empty")
    return suggest_alarms_for_medicines(medicines)


# ── SAVE confirmed alarm set ────────────────────────────────
@router.post("/", response_model=AlarmSetOut, status_code=201)
async def create_alarm_set(
    payload: AlarmSetCreate,
    current_user: dict = Depends(get_current_user),
):
    db  = get_db()
    uid = str(current_user["_id"])

    # If a prescription_id is provided, deactivate old alarms for same Rx
    if payload.prescription_id:
        await db.alarms.update_many(
            {"user_id": uid, "prescription_id": payload.prescription_id},
            {"$set": {"active": False}}
        )

    doc = {
        "user_id":         uid,
        "prescription_id": payload.prescription_id,
        "medicines":       [m.model_dump() for m in payload.medicines],
        "active":          True,
        "created_at":      datetime.utcnow(),
        "updated_at":      datetime.utcnow(),
    }
    result    = await db.alarms.insert_one(doc)
    doc["_id"] = result.inserted_id
    return AlarmSetOut(**_fmt(doc))


# ── LIST all alarm sets for user ────────────────────────────
@router.get("/", response_model=List[AlarmSetOut])
async def list_alarms(
    current_user: dict = Depends(get_current_user),
    skip:  int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    db   = get_db()
    docs = await db.alarms.find(
        {"user_id": str(current_user["_id"]), "active": True}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [AlarmSetOut(**_fmt(d)) for d in docs]


# ── GET single alarm set ────────────────────────────────────
@router.get("/{alarm_id}", response_model=AlarmSetOut)
async def get_alarm(
    alarm_id: str,
    current_user: dict = Depends(get_current_user),
):
    db  = get_db()
    doc = await db.alarms.find_one({
        "_id":     ObjectId(alarm_id),
        "user_id": str(current_user["_id"]),
    })
    if not doc:
        raise HTTPException(404, "Alarm set not found")
    return AlarmSetOut(**_fmt(doc))


# ── UPDATE (full replace of medicines list) ─────────────────
@router.put("/{alarm_id}", response_model=AlarmSetOut)
async def update_alarm(
    alarm_id: str,
    payload:  AlarmSetCreate,
    current_user: dict = Depends(get_current_user),
):
    db  = get_db()
    res = await db.alarms.find_one_and_update(
        {"_id": ObjectId(alarm_id), "user_id": str(current_user["_id"])},
        {"$set": {
            "medicines":  [m.model_dump() for m in payload.medicines],
            "updated_at": datetime.utcnow(),
        }},
        return_document=True,
    )
    if not res:
        raise HTTPException(404, "Alarm set not found")
    return AlarmSetOut(**_fmt(res))


# ── TOGGLE single medicine alarm on/off ────────────────────
@router.patch("/{alarm_id}/toggle/{medicine_index}")
async def toggle_medicine(
    alarm_id:       str,
    medicine_index: int,
    current_user:   dict = Depends(get_current_user),
):
    db  = get_db()
    doc = await db.alarms.find_one({
        "_id":     ObjectId(alarm_id),
        "user_id": str(current_user["_id"]),
    })
    if not doc:
        raise HTTPException(404, "Alarm set not found")

    meds = doc.get("medicines", [])
    if medicine_index >= len(meds):
        raise HTTPException(400, "Invalid medicine index")

    meds[medicine_index]["enabled"] = not meds[medicine_index].get("enabled", True)

    await db.alarms.update_one(
        {"_id": ObjectId(alarm_id)},
        {"$set": {"medicines": meds, "updated_at": datetime.utcnow()}}
    )
    return {"enabled": meds[medicine_index]["enabled"]}


# ── DELETE alarm set ────────────────────────────────────────
@router.delete("/{alarm_id}", status_code=204)
async def delete_alarm(
    alarm_id: str,
    current_user: dict = Depends(get_current_user),
):
    db     = get_db()
    result = await db.alarms.delete_one({
        "_id":     ObjectId(alarm_id),
        "user_id": str(current_user["_id"]),
    })
    if result.deleted_count == 0:
        raise HTTPException(404, "Alarm set not found")


# ── SAVE FCM push notification token ───────────────────────
@router.post("/fcm-token", status_code=204)
async def save_fcm_token(
    payload:      FCMTokenUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"fcm_token": payload.fcm_token, "fcm_updated_at": datetime.utcnow()}}
    )
