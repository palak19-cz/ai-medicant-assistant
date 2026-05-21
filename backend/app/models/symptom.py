from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class SymptomAnalysis(BaseModel):
    likely_condition:    str
    severity:            str           # Mild | Moderate | Severe
    description:         str
    avoid:               List[str] = []
    suggested_medicines: str
    tests_if_worsens:    List[str] = []
    see_doctor_if:       str
    home_remedies:       List[str] = []
    recovery_time:       Optional[str] = None


class SymptomCheckInDB(BaseModel):
    user_id:      str
    symptom_text: str
    has_image:    bool = False
    analysis:     SymptomAnalysis
    created_at:   datetime = Field(default_factory=datetime.utcnow)


class SymptomCheckOut(BaseModel):
    id:           str
    symptom_text: str
    analysis:     SymptomAnalysis
    created_at:   datetime
