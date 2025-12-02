import json
import re
import datetime as dt
import os
from typing import Dict, Any, Optional, List

import google.generativeai as genai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# =====================================
#         GEMINI CONFIG
# =====================================

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))
GEMINI_MODEL = "models/gemini-2.0-flash"

# =====================================
#         LOAD RESUMES
# =====================================

RESUME_PATH = os.path.join(os.path.dirname(__file__), "resumes.json")

if os.path.exists(RESUME_PATH):
  with open(RESUME_PATH, "r", encoding="utf-8") as f:
    RESUMES: List[Dict[str, Any]] = json.load(f)
else:
  RESUMES = []


def get_resume_by_name(name: str) -> Dict[str, Any]:
    for r in RESUMES:
        if r.get("name", "").lower() == name.lower():
            return r
    raise ValueError(f"Name not found: {name}")


def _extract_json(text: str) -> dict:
    cleaned = re.sub(
        r"^```[a-zA-Z0-9]*\s*|\s*```$",
        "",
        text.strip(),
        flags=re.MULTILINE,
    )
    cleaned = cleaned.replace("“", '"').replace("”", '"').replace("’", "'")
    cleaned = re.sub(r"^[A-Za-z\s:;-]*\{", "{", cleaned, flags=re.DOTALL)

    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = cleaned[start : end + 1]
        try:
            return json.loads(candidate)
        except Exception:
            pass

    try:
        return json.loads(cleaned)
    except Exception:
        return {"error": "Could not parse JSON", "raw": text}

# =====================================
#         FASTAPI SETUP
# =====================================

app = FastAPI(title="Homework AI + Mentor Matching API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================
#   WEEKLY TASKS FROM MENTOR NOTES
# =====================================

class NotesRequest(BaseModel):
    meeting_notes: str


@app.post("/generate-weekly-tasks")
def generate_weekly_tasks(req: NotesRequest):
    notes = req.meeting_notes.strip()
    if not notes:
        return {"error": "No meeting notes provided"}

    system_prompt = """
    You are an AI mentorship assistant for a military spouse mentorship program.
    Given meeting notes from a mentor, summarize the session and create 3–4 specific, actionable tasks.
    Respond strictly in JSON format:
    {
      "session_summary": "...",
      "emotional_progress": "...",
      "next_steps": ["...", "...", "..."],
      "timestamp": "ISO 8601 datetime"
    }
    Keep each task short (<15 words) and goal-oriented.
    """

    model = genai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content([system_prompt, notes])

    raw_output = (response.text or "").strip()
    try:
        data = json.loads(raw_output)
    except Exception:
        data = _extract_json(raw_output)

    data["timestamp"] = dt.datetime.now(dt.timezone.utc).isoformat()
    return data

# =====================================
#           AI HINT ENDPOINT
# =====================================

class HintReq(BaseModel):
    question: str
    resume_name: Optional[str] = None
    resume_json: Optional[Dict[str, Any]] = None
    meeting_notes: Optional[str] = None


def summarize_resume_for_prompt(resume_json: Dict[str, Any]) -> str:
    name = resume_json.get("name") or "Unknown Spouse"
    summary = resume_json.get("summary", "")
    skills = ", ".join(resume_json.get("skills", []))

    exp_lines = []
    for exp in resume_json.get("experience", [])[:5]:
        role = exp.get("role") or exp.get("title") or ""
        org = exp.get("organization") or exp.get("company") or ""
        bullets = exp.get("bullets") or exp.get("highlights") or []
        bullet_one = bullets[0] if bullets else ""
        exp_lines.append(f"- {role} @ {org}: {bullet_one}")
    exp_text = "\n".join(exp_lines)

    edu_lines = []
    for edu in resume_json.get("education", [])[:2]:
        school = edu.get("school") or edu.get("institution") or ""
        degree = edu.get("degree") or ""
        edu_lines.append(f"- {degree} — {school}")
    edu_text = "\n".join(edu_lines)

    certs = ", ".join(resume_json.get("certifications", [])[:5])

    return f"""
Name: {name}
Summary: {summary}
Skills: {skills}
Experience:
{exp_text}
Education:
{edu_text}
Certifications: {certs}
"""


@app.get("/resumes")
def list_resumes():
    return [r.get("name", "") for r in RESUMES]


@app.post("/ai-hint")
def ai_hint(req: HintReq):
    if req.resume_json:
        resume = req.resume_json
    elif req.resume_name:
        resume = get_resume_by_name(req.resume_name)
    else:
        return {"error": "Provide resume_name or resume_json"}

    system_prompt = """
    You are an AI mentor assistant.
    Given a homework question, a spouse's resume, and optional mentor notes, generate 3–5 short, specific hints.
    Respond ONLY with JSON:
    {
      "hints": ["...", "..."],
      "rationale": "..."
    }
    Hints should be under ~20 words, grounded in the resume, and confidence-building.
    """

    user_prompt = f"""
QUESTION:
{req.question}

RESUME:
{summarize_resume_for_prompt(resume)}

MENTOR NOTES:
{req.meeting_notes or "(none)"}

Return JSON only.
"""

    model = genai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content([system_prompt, user_prompt])
    raw_output = (response.text or "").strip()

    try:
        data = json.loads(raw_output)
    except Exception:
        data = _extract_json(raw_output)

    data.setdefault("hints", [])
    data.setdefault("rationale", "")
    data["timestamp_utc"] = dt.datetime.now(dt.timezone.utc).isoformat()
    return data

# =====================================
#        MENTOR MATCHING (RULE-BASED)
# =====================================

class MatchProfile(BaseModel):
    backgroundTags: List[str] = []
    goals: List[str] = []
    preferredSupport: List[str] = []
    traits: Optional[str] = ""
    connectionPref: Optional[str] = ""
    milSpouseYears: Optional[str] = ""


class Mentor(BaseModel):
    id: int
    name: str
    title: str
    bio: str
    tags: List[str]
    experienceTags: List[str]
    supportedGoals: List[str]
    supportStyles: List[str]
    matchPercent: Optional[int] = None
    matchReason: Optional[str] = None


class MentorMatchReq(BaseModel):
    matchProfile: MatchProfile


class MentorMatchResp(BaseModel):
    matches: List[Mentor]


BASE_MENTORS: List[Mentor] = [
    Mentor(
        id=1,
        name="Lauren R.",
        title="Telehealth RN • Compact-State Mentor",
        bio=(
            "RN with 8+ years in telehealth and compact-licensure states. "
            "Helps spouses navigate remote nursing roles and licensing."
        ),
        tags=["Nursing", "Telehealth", "Compact License"],
        experienceTags=["nurse", "telehealth", "compact license"],
        supportedGoals=["telehealth role", "remote work", "license portability"],
        supportStyles=["quick tips", "structured guidance"],
    ),
    Mentor(
        id=2,
        name="Sam P.",
        title="Senior Project Manager • DoD & Remote Teams",
        bio=(
            "Project manager in a DoD-adjacent org. Mentors military spouses "
            "breaking into PM roles and remote-friendly organizations."
        ),
        tags=["Project Management", "DoD", "Remote Work"],
        experienceTags=["project manager", "dod contractor", "remote work"],
        supportedGoals=["project management role", "remote work", "networking"],
        supportStyles=["structured guidance", "goal-setting"],
    ),
    Mentor(
        id=3,
        name="Ms. Carter",
        title="K–5 Teacher • License Portability Guide",
        bio=(
            "Teacher who has moved across states 4+ times. Helps spouses navigate "
            "license reciprocity, subs, and tutoring options."
        ),
        tags=["Teaching", "License Reciprocity", "Public Schools"],
        experienceTags=["teacher", "license portability", "public-school"],
        supportedGoals=["teaching role", "license reciprocity", "flexible schedule"],
        supportStyles=["emotional support", "quick tips"],
    ),
    Mentor(
        id=4,
        name="Alex G.",
        title="Instructional Coach • Career Growth",
        bio=(
            "Former classroom teacher turned instructional coach. Great for "
            "experienced educators wanting leadership or coaching roles."
        ),
        tags=["Instructional Coaching", "Leadership", "Education"],
        experienceTags=["teacher", "experienced"],
        supportedGoals=["teaching role", "student impact", "career growth"],
        supportStyles=["peer mentoring", "light structure"],
    ),
]


def build_mentor_matches(user: MatchProfile, mentors: List[Mentor]) -> List[Mentor]:
    total_possible = (
        len(user.goals)
        + len(user.backgroundTags)
        + len(user.preferredSupport)
        or 1
    )

    results: List[Mentor] = []

    for mentor in mentors:
        goal_overlap = [g for g in mentor.supportedGoals if g in user.goals]
        background_overlap = [t for t in mentor.experienceTags if t in user.backgroundTags]
        style_overlap = [s for s in mentor.supportStyles if s in user.preferredSupport]

        total_matches = len(goal_overlap) + len(background_overlap) + len(style_overlap)
        match_percent = max(1, min(99, round((total_matches / total_possible) * 100)))

        reasons: List[str] = []
        if goal_overlap:
            reasons.append(
                f"Strong overlap on <strong>goals</strong> like {', '.join(goal_overlap)}."
            )
        if background_overlap:
            reasons.append(
                f"Shares experience with <strong>{', '.join(background_overlap)}</strong>."
            )
        if style_overlap:
            reasons.append(
                f"Mentorship style matches your preference for <strong>{', '.join(style_overlap)}</strong>."
            )

        mentor_copy = Mentor(**mentor.dict())
        mentor_copy.matchPercent = match_percent
        mentor_copy.matchReason = " ".join(reasons)
        results.append(mentor_copy)

    results.sort(key=lambda m: m.matchPercent or 0, reverse=True)
    return results


@app.post("/mentor-matches", response_model=MentorMatchResp)
def mentor_matches(req: MentorMatchReq):
    matches = build_mentor_matches(req.matchProfile, BASE_MENTORS)
    return MentorMatchResp(matches=matches)

@app.get("/")
def home():
    return {
        "status": "Backend running",
        "endpoints": ["/generate-weekly-tasks", "/ai-hint", "/mentor-matches", "/resumes"],
    }
