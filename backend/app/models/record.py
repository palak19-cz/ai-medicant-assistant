from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class HealthRecord(BaseModel):
    user_id:      str
    title:        str
    category:     str           # Prescription | Report | Scan | Other
    doctor_name:  Optional[str] = None
    hospital:     Optional[str] = None
    notes:        Optional[str] = None
    file_name:    str
    file_type:    str           # image/jpeg, application/pdf …
    file_size:    int           # bytes
    file_b64:     Optional[str] = None   # stored for small files < 2MB
    created_at:   datetime = Field(default_factory=datetime.utcnow)


class HealthRecordOut(BaseModel):
    id:           str
    title:        str
    category:     str
    doctor_name:  Optional[str]
    hospital:     Optional[str]
    notes:        Optional[str]
    file_name:    str
    file_type:    str
    file_size:    int
    has_file:     bool
    created_at:   datetime


class HealthRecordCreate(BaseModel):
    title:       str
    category:    str
    doctor_name: Optional[str] = None
    hospital:    Optional[str] = None
    notes:       Optional[str] = None
