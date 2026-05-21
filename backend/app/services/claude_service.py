"""
Claude AI service for MediPredict.
Handles prescription image analysis (OCR + medicine explanation).
"""

import json
import base64
import httpx
from app.core.config import settings

ANTHROPIC_API = "https://api.anthropic.com/v1/messages"
MODEL         = "claude-opus-4-5"

HEADERS = {
    "x-api-key":         settings.ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
    "content-type":      "application/json",
}


# ── Prescription analysis prompt ────────────────────────────
def _build_prescription_prompt(language: str) -> str:
    lang_instruction = (
        "Respond entirely in Hindi (Devanagari script) for all text fields."
        if language == "hi"
        else "Respond in clear, simple English."
    )

    return f"""You are MediPredict's AI pharmacist. A patient has uploaded a prescription image.

{lang_instruction}

Your job:
1. Read ALL text visible in the image (OCR).
2. Extract doctor details, patient details, date, diagnosis if visible.
3. For EVERY medicine listed, provide detailed, patient-friendly information.

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):

{{
  "doctor_name": "string or null",
  "doctor_specialty": "string or null",
  "patient_name": "string or null",
  "date": "string or null",
  "diagnosis": "string or null",
  "raw_text": "full OCR text here",
  "general_advice": "any general advice written on prescription or null",
  "follow_up": "follow-up instruction or null",
  "medicines": [
    {{
      "name": "medicine name + strength e.g. Metformin 500mg",
      "dosage": "e.g. 500mg",
      "frequency": "e.g. Twice daily",
      "duration": "e.g. 30 days or null",
      "instructions": "e.g. After meals, with water",
      "purpose": "What condition/disease this treats in 1 sentence",
      "how_it_helps": "How this medicine helps the body in 2-3 simple sentences",
      "side_effects": ["side effect 1", "side effect 2", "side effect 3"],
      "category": "e.g. Antidiabetic / Antibiotic / Painkiller / Supplement / Antihypertensive / etc"
    }}
  ]
}}

Important rules:
- If you cannot read a field clearly, set it to null.
- Always extract ALL medicines, even if handwritten and unclear — make your best guess and note uncertainty.
- Keep explanations simple — the patient may have no medical background.
- side_effects should list 2-4 common ones, not scare the patient.
- Never invent medicines that are not on the prescription.
"""


async def analyse_prescription(image_bytes: bytes, mime_type: str, language: str = "en") -> dict:
    """
    Send prescription image to Claude, get structured JSON analysis back.
    Returns the parsed JSON dict.
    """
    image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

    payload = {
        "model":      MODEL,
        "max_tokens": 2000,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type":   "image",
                        "source": {
                            "type":       "base64",
                            "media_type": mime_type,
                            "data":       image_b64,
                        },
                    },
                    {
                        "type": "text",
                        "text": _build_prescription_prompt(language),
                    },
                ],
            }
        ],
    }

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(ANTHROPIC_API, headers=HEADERS, json=payload)
        resp.raise_for_status()
        data = resp.json()

    raw_text = data["content"][0]["text"].strip()

    # Strip markdown fences if Claude added them
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```")[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]

    return json.loads(raw_text.strip())


# ── Symptom analysis — Phase 3 full build ───────────────────
def _build_symptom_prompt(language: str, symptom_text: str) -> str:
    lang_instruction = (
        "Respond entirely in Hindi (Devanagari script) for all text fields."
        if language == "hi"
        else "Respond in clear, simple English."
    )
    return f"""You are MediPredict's AI health assistant. A patient is describing their symptoms.

{lang_instruction}

Patient's symptom description: "{symptom_text}"

IMPORTANT RULES:
- You are NOT a doctor. Give general health guidance only.
- Always recommend consulting a real doctor for serious symptoms.
- Be caring, calm, and reassuring — don't alarm the patient unnecessarily.
- Keep all explanations simple and jargon-free.
- For suggested_medicines, only mention common OTC (over-the-counter) medicines.

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):

{{
  "likely_condition": "Most likely condition name in plain language",
  "severity": "Mild",
  "description": "2-3 sentence explanation of what this condition likely is and why these symptoms occur",
  "avoid": [
    "specific thing to avoid 1",
    "specific thing to avoid 2",
    "specific thing to avoid 3",
    "specific thing to avoid 4"
  ],
  "suggested_medicines": "List 2-3 common OTC medicines with dosage hints. E.g. Paracetamol 500mg for fever. Always add: consult a pharmacist or doctor before taking.",
  "home_remedies": [
    "practical home remedy 1",
    "practical home remedy 2",
    "practical home remedy 3"
  ],
  "tests_if_worsens": [
    "medical test 1 if symptoms worsen",
    "medical test 2"
  ],
  "see_doctor_if": "Clear sentence describing exactly when they must see a doctor immediately",
  "recovery_time": "Typical recovery time e.g. 3-5 days with rest"
}}

severity must be exactly one of: "Mild", "Moderate", "Severe"
"""


def _build_symptom_image_prompt(language: str, symptom_text: str) -> str:
    lang_instruction = (
        "Respond entirely in Hindi (Devanagari script) for all text fields."
        if language == "hi"
        else "Respond in clear, simple English."
    )
    return f"""You are MediPredict's AI health assistant. A patient has shared a photo of their symptom along with this description: "{symptom_text}"

{lang_instruction}

Look carefully at the image AND the description together.

IMPORTANT RULES:
- You are NOT a doctor. Give general health guidance only.
- Describe what you observe visually (rash, swelling, skin condition, etc.) but do not make definitive medical diagnoses.
- Be caring and reassuring.
- Suggest seeing a dermatologist or appropriate specialist if the visual symptom looks concerning.

Return ONLY a valid JSON object:
{{
  "likely_condition": "Most likely condition based on image + description",
  "severity": "Mild",
  "description": "What you observe in the image + what the symptoms suggest. 3-4 sentences.",
  "avoid": ["avoid 1", "avoid 2", "avoid 3"],
  "suggested_medicines": "OTC topical or oral medicines that may help. Always add: consult a doctor.",
  "home_remedies": ["remedy 1", "remedy 2", "remedy 3"],
  "tests_if_worsens": ["test 1", "test 2"],
  "see_doctor_if": "When to see a doctor immediately",
  "recovery_time": "Typical recovery time"
}}

severity must be exactly one of: "Mild", "Moderate", "Severe"
"""


def _parse_json(raw: str) -> dict:
    raw = raw.strip()
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1] if len(parts) > 1 else raw
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


async def analyse_symptoms(
    text: str,
    language: str = "en",
    image_bytes: bytes = None,
    mime_type: str = None,
) -> dict:
    """
    Analyse symptoms from text only, or text + image together.
    Returns parsed JSON dict matching SymptomAnalysis model.
    """
    if image_bytes and mime_type:
        # Text + image path
        image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")
        content = [
            {
                "type": "image",
                "source": {
                    "type":       "base64",
                    "media_type": mime_type,
                    "data":       image_b64,
                },
            },
            {
                "type": "text",
                "text": _build_symptom_image_prompt(language, text),
            },
        ]
    else:
        # Text-only path
        content = _build_symptom_prompt(language, text)

    payload = {
        "model":      MODEL,
        "max_tokens": 1200,
        "messages":   [{"role": "user", "content": content}],
    }

    async with httpx.AsyncClient(timeout=45) as client:
        resp = await client.post(ANTHROPIC_API, headers=HEADERS, json=payload)
        resp.raise_for_status()
        data = resp.json()

    return _parse_json(data["content"][0]["text"])
