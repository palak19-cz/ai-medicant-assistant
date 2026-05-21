from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class AlarmTime(BaseModel):
    label:   str        # e.g. "Morning", "Evening"
    time:    str        # e.g. "08:00"
    enabled: bool = True


class MedicineAlarm(BaseModel):
    medicine_name: str
    dosage:        Optional[str] = None
    instructions:  Optional[str] = None
    category:      Optional[str] = None
    times:         List[AlarmTime] = []
    enabled:       bool = True
    days:          List[str] = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]


class AlarmSetInDB(BaseModel):
    user_id:       str
    prescription_id: Optional[str] = None
    medicines:     List[MedicineAlarm] = []
    created_at:    datetime = Field(default_factory=datetime.utcnow)
    updated_at:    datetime = Field(default_factory=datetime.utcnow)


class AlarmSetOut(BaseModel):
    id:              str
    prescription_id: Optional[str]
    medicines:       List[MedicineAlarm]
    created_at:      datetime
    updated_at:      datetime


class AlarmSetCreate(BaseModel):
    prescription_id: Optional[str] = None
    medicines:       List[MedicineAlarm]


class FCMTokenUpdate(BaseModel):
    fcm_token: str
