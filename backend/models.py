from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class Skill(BaseModel):
    name: str
    level: Optional[float] = 0.0
    category: Optional[str] = ""

class Education(BaseModel):
    level: str
    field: str
    institution: Optional[str] = ""
    year: int
    score: Optional[float] = None

class Experience(BaseModel):
    title: str
    company: str
    duration: str
    description: Optional[str] = ""

class Job(BaseModel):
    title: str
    description: Optional[str] = ""
    required_skills: List[Skill]
    preferred_skills: Optional[List[Skill]] = []
    min_experience: Optional[int] = 0
    education_preference: Optional[List[str]] = []
    location: Optional[str] = ""
    company: Optional[str] = ""
    salary_range: Optional[str] = ""
    createdAt: datetime = datetime.utcnow()

class Candidate(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: Optional[str] = ""
    experienceYears: float = 0
    education: Optional[List[Education]] = []
    skills: Optional[List[Skill]] = []
    experiences: Optional[List[Experience]] = []
    certifications: Optional[List[str]] = []
    resumeText: Optional[str] = ""
    currentPosition: Optional[str] = ""
    desiredPosition: Optional[str] = ""
    lastUpdated: datetime = datetime.utcnow()

class InterviewRequest(BaseModel):
    candidate_name: str
    poste: str
    competences: List[str]
    experience_years: int
    description: Optional[str] = ""
    job_requirements: Optional[List[str]] = []

class MatchingRequest(BaseModel):
    candidate_id: str
    job_id: str

class ScoringResult(BaseModel):
    candidate_id: str
    job_id: str
    overall_score: float
    skill_match: float
    experience_match: float
    education_match: float
    matching_skills: List[str]
    missing_skills: List[str]
    strengths: List[str]
    weaknesses: List[str]

class N8nRequest(BaseModel):
    question: str

class UploadResponse(BaseModel):
    message: str
    candidate_id: str
    matching_score: float
    status: str

class HealthResponse(BaseModel):
    status: str
    version: str
    services: Dict[str, str]
    timestamp: str