from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Skill(BaseModel):
    name: str
    level: Optional[float] = 0.0

class Education(BaseModel):
    level: str
    field: str
    year: int
    score: Optional[float] = None

class Job(BaseModel):
    title: str
    required_skills: List[Skill]
    preferred_skills: Optional[List[Skill]] = []
    min_experience: Optional[int] = 0
    education_preference: Optional[List[str]] = []
    location: Optional[str] = ""
    createdAt: datetime = datetime.utcnow()

class Candidate(BaseModel):
    firstName: str
    lastName: str
    email: str
    experienceYears: float = 0
    education: Optional[List[Education]] = []
    skills: Optional[List[Skill]] = []
    certifications: Optional[List[str]] = []
    resumeText: Optional[str] = ""
    lastUpdated: datetime = datetime.utcnow()
