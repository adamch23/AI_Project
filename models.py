from pydantic import BaseModel
from typing import List, Optional

class Candidat(BaseModel):
    nom: str
    poste: str
    experience_years: int
    competences: List[str]
    description: Optional[str] = ""  # texte pour NLP soft skills

class Offre(BaseModel):
    poste: str
    competences_requises: List[str]
    formation_preferee: Optional[List[str]] = []
class InterviewRequest(BaseModel):
    candidate_name: str
    poste: str
    competences: List[str]
    experience_years: int
    description: Optional[str] = ""

class InterviewResponse(BaseModel):
    technical_questions: List[str]
    behavioral_questions: List[str]
    evaluation_criteria: List[str]
    interview_tips: List[str]