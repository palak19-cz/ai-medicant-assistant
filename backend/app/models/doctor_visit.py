from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date


class DoctorVisitCreate(BaseModel):
    doctor_name:  str
    specialty:    Optional[str] = None
    hospital:     Optional[str] = None
    visit_date:   str           # ISO date string "2026-05-18"
    next_visit:   Optional[str] = None
    notes:        Optional[str] = None
    diagnosis:    Optional[str] = None


class DoctorVisitOut(BaseModel):
    id:               str
    doctor_name:      str
    specialty:        Optional[str]
    hospital:         Optional[str]
    visit_date:       str
    next_visit:       Optional[str]
    notes:            Optional[str]
    diagnosis:        Optional[str]
    prescription_ids: List[str] = []
    created_at:       datetime
