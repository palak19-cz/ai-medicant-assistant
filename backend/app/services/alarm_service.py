"""
Smart alarm suggestion logic.
Given a list of medicines with frequency info,
suggest appropriate time slots without calling the AI API
(pure rule-based for speed and reliability).
"""

from typing import List, Dict


# Frequency keyword → time slots mapping
FREQUENCY_MAP: Dict[str, List[Dict]] = {
    # Once daily
    "once":         [{"label": "Morning",   "time": "08:00"}],
    "once daily":   [{"label": "Morning",   "time": "08:00"}],
    "od":           [{"label": "Morning",   "time": "08:00"}],
    "once a day":   [{"label": "Morning",   "time": "08:00"}],

    # Twice daily
    "twice":        [{"label": "Morning",   "time": "08:00"},
                     {"label": "Night",     "time": "20:00"}],
    "twice daily":  [{"label": "Morning",   "time": "08:00"},
                     {"label": "Night",     "time": "20:00"}],
    "bd":           [{"label": "Morning",   "time": "08:00"},
                     {"label": "Night",     "time": "20:00"}],
    "bid":          [{"label": "Morning",   "time": "08:00"},
                     {"label": "Night",     "time": "20:00"}],
    "twice a day":  [{"label": "Morning",   "time": "08:00"},
                     {"label": "Night",     "time": "20:00"}],

    # Three times daily
    "thrice":       [{"label": "Morning",   "time": "08:00"},
                     {"label": "Afternoon", "time": "14:00"},
                     {"label": "Night",     "time": "20:00"}],
    "thrice daily": [{"label": "Morning",   "time": "08:00"},
                     {"label": "Afternoon", "time": "14:00"},
                     {"label": "Night",     "time": "20:00"}],
    "three times":  [{"label": "Morning",   "time": "08:00"},
                     {"label": "Afternoon", "time": "14:00"},
                     {"label": "Night",     "time": "20:00"}],
    "tid":          [{"label": "Morning",   "time": "08:00"},
                     {"label": "Afternoon", "time": "14:00"},
                     {"label": "Night",     "time": "20:00"}],
    "tds":          [{"label": "Morning",   "time": "08:00"},
                     {"label": "Afternoon", "time": "14:00"},
                     {"label": "Night",     "time": "20:00"}],

    # Four times daily
    "four times":   [{"label": "Morning",   "time": "08:00"},
                     {"label": "Noon",      "time": "12:00"},
                     {"label": "Evening",   "time": "16:00"},
                     {"label": "Night",     "time": "20:00"}],
    "qid":          [{"label": "Morning",   "time": "08:00"},
                     {"label": "Noon",      "time": "12:00"},
                     {"label": "Evening",   "time": "16:00"},
                     {"label": "Night",     "time": "20:00"}],
    "qds":          [{"label": "Morning",   "time": "08:00"},
                     {"label": "Noon",      "time": "12:00"},
                     {"label": "Evening",   "time": "16:00"},
                     {"label": "Night",     "time": "20:00"}],

    # Special
    "weekly":       [{"label": "Sunday",    "time": "09:00"}],
    "once weekly":  [{"label": "Sunday",    "time": "09:00"}],
    "at night":     [{"label": "Night",     "time": "22:00"}],
    "bedtime":      [{"label": "Bedtime",   "time": "22:00"}],
    "hs":           [{"label": "Bedtime",   "time": "22:00"}],
    "morning":      [{"label": "Morning",   "time": "08:00"}],
    "night":        [{"label": "Night",     "time": "22:00"}],
}

# Category → preferred time override
CATEGORY_DEFAULTS: Dict[str, List[Dict]] = {
    "Antidiabetic":     [{"label": "Morning",   "time": "08:00"},
                         {"label": "Night",     "time": "20:00"}],
    "Antihypertensive": [{"label": "Morning",   "time": "07:00"}],
    "Supplement":       [{"label": "Morning",   "time": "08:00"}],
    "Antibiotic":       [{"label": "Morning",   "time": "08:00"},
                         {"label": "Night",     "time": "20:00"}],
    "Painkiller":       [{"label": "Morning",   "time": "08:00"},
                         {"label": "Afternoon", "time": "14:00"},
                         {"label": "Night",     "time": "20:00"}],
}

DEFAULT_SLOT = [{"label": "Morning", "time": "08:00"}]


def suggest_times(frequency: str | None, category: str | None) -> List[Dict]:
    """
    Return a list of {label, time} dicts for a medicine.
    Priority: frequency string match → category default → single morning dose.
    """
    if frequency:
        freq_lower = frequency.lower().strip()

        # exact match
        if freq_lower in FREQUENCY_MAP:
            return FREQUENCY_MAP[freq_lower]

        # partial match — check if any key is contained in the frequency string
        for key, slots in FREQUENCY_MAP.items():
            if key in freq_lower:
                return slots

    # fallback to category
    if category and category in CATEGORY_DEFAULTS:
        return CATEGORY_DEFAULTS[category]

    return DEFAULT_SLOT


def build_alarm_times(frequency: str | None, category: str | None) -> List[dict]:
    """
    Return alarm times with 'enabled': True added.
    """
    slots = suggest_times(frequency, category)
    return [{"label": s["label"], "time": s["time"], "enabled": True} for s in slots]


def suggest_alarms_for_medicines(medicines: List[dict]) -> List[dict]:
    """
    Given a list of medicine dicts (from prescription analysis),
    return a list of MedicineAlarm-compatible dicts with suggested times.
    """
    result = []
    for med in medicines:
        freq     = med.get("frequency")
        category = med.get("category")
        times    = build_alarm_times(freq, category)

        result.append({
            "medicine_name": med.get("name", "Unknown medicine"),
            "dosage":        med.get("dosage"),
            "instructions":  med.get("instructions"),
            "category":      category,
            "times":         times,
            "enabled":       True,
            "days":          ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
        })

    return result
