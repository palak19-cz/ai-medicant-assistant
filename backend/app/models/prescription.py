from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class Medicine(BaseModel):
    name:          str
    dosage:        str
    frequency:     str
    duration:      Optional[str] = None
    instructions:  Optional[str] = None
    purpose:       str
    how_it_helps:  str
    side_effects:  List[str] = []
    category:      str          # e.g. Antibiotic, Painkiller, Supplement


class PrescriptionAnalysis(BaseModel):
    doctor_name:     Optional[str] = None
    doctor_specialty:Optional[str] = None
    patient_name:    Optional[str] = None
    date:            Optional[str] = None
    diagnosis:       Optional[str] = None
    medicines:       List[Medicine] = []
    general_advice:  Optional[str] = None
    follow_up:       Optional[str] = None
    raw_text:        Optional[str] = None   # OCR output
    language:        str = "en"


class PrescriptionInDB(BaseModel):
    user_id:      str
    analysis:     PrescriptionAnalysis
    image_base64: Optional[str] = None     # store thumbnail
    created_at:   datetime = Field(default_factory=datetime.utcnow)
    title:        str = "Prescription"


class PrescriptionOut(BaseModel):
    id:         str
    title:      str
    analysis:   PrescriptionAnalysis
    created_at: datetime
