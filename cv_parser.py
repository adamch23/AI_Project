# ---------------- cv_parser.py ----------------
import re
import pdfplumber
from transformers import pipeline
from datetime import datetime
from typing import List, Dict, Any
from scoring import predict_turnover_or_engagement, screen_cv_class

# --- Pipeline NER pour extraire les noms et infos ---
ner_pipeline = pipeline("ner", model="dslim/bert-base-NER", grouped_entities=True)

# ---------------- Extraction texte ----------------
def extract_text_from_pdf(file_path: str) -> str:
    """Extrait le texte d'un PDF de manière générique"""
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

# ---------------- Informations personnelles ----------------
def extract_personal_info(text: str) -> Dict[str, Any]:
    ner_results = ner_pipeline(text[:1000])
    firstName, lastName, location = "Unknown", "Candidate", ""
    
    for ent in ner_results:
        if ent['entity_group'] == 'PER':
            name_parts = ent['word'].split()
            if len(name_parts) >= 2:
                firstName = " ".join(name_parts[:-1])
                lastName = name_parts[-1]
            else:
                firstName = name_parts[0]
        elif ent['entity_group'] == 'LOC':
            location = ent['word']

    email_match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    email = email_match.group(0) if email_match else ""

    phone_patterns = [
        r'[\+]?[0-9]{2}[\s]?[0-9]{2}[\s]?[0-9]{3}[\s]?[0-9]{3}',
        r'[\+]?[0-9]{1,3}[\s]?[0-9]{3}[\s]?[0-9]{3}[\s]?[0-9]{4}',
        r'[0-9]{2}[\s]?[0-9]{2}[\s]?[0-9]{2}[\s]?[0-9]{2}[\s]?[0-9]{2}'
    ]
    phone = ""
    for pattern in phone_patterns:
        match = re.search(pattern, text)
        if match:
            phone = match.group(0)
            break

    return {
        "firstName": firstName,
        "lastName": lastName,
        "email": email,
        "phone": phone,
        "location": location
    }

# ---------------- Compétences ----------------
def extract_skills(text: str) -> List[Dict[str, Any]]:
    technical_skills_db = {
        "programming": ['python', 'java', 'javascript', 'c++', 'c#', 'ruby', 'php', 'go', 'rust', 'swift'],
        "web": ['html', 'css', 'react', 'angular', 'vue', 'django', 'flask', 'spring'],
        "mobile": ['flutter', 'react native', 'android', 'ios'],
        "database": ['mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle'],
        "devops": ['docker', 'kubernetes', 'jenkins', 'git', 'aws', 'azure', 'gcp']
    }
    found_skills = []
    text_lower = text.lower()
    for category, skills in technical_skills_db.items():
        for skill in skills:
            if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                found_skills.append({
                    "name": skill,
                    "level": estimate_skill_level(skill, text),
                    "category": category
                })
    return found_skills

def estimate_skill_level(skill: str, text: str) -> float:
    text_lower = text.lower()
    skill_lower = skill.lower()
    expertise_patterns = [
        r'expert.*?' + re.escape(skill_lower),
        r'maîtrise.*?' + re.escape(skill_lower),
        r'expérimenté.*?' + re.escape(skill_lower),
        r'senior.*?' + re.escape(skill_lower)
    ]
    for pattern in expertise_patterns:
        if re.search(pattern, text_lower):
            return 0.9
    if re.search(r'(projet|expérience|stage).*?' + re.escape(skill_lower), text_lower):
        return 0.7
    return 0.5

# ---------------- Education ----------------
def extract_education(text: str) -> List[Dict[str, Any]]:
    education_data = []
    education_patterns = [
        (r'(doctorat|phd).*?(\d{4})', "Doctorat"),
        (r'(master|msc).*?(\d{4})', "Master"),
        (r'(licence|bachelor|bsc).*?(\d{4})', "Licence"),
        (r'(bts|dut).*?(\d{4})', "BTS/DUT"),
        (r'(bac|high school).*?(\d{4})', "Baccalauréat")
    ]
    for pattern, level in education_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            year = int(match.group(2))
            education_data.append({
                "level": level,
                "field": "Informatique",
                "year": year,
                "score": None
            })
    current_study_patterns = [r'étudiant.*?(\d+(?:ème|ère)?\s*année)', r'en cours.*?(\w+)']
    for pattern in current_study_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            education_data.append({
                "level": "En cours",
                "field": "Informatique",
                "year": datetime.now().year,
                "score": None,
                "current": True
            })
            break
    return education_data

# ---------------- Experience ----------------
def estimate_experience(text: str) -> float:
    exp_patterns = [
        r'(\d+)\s*(an|année|ans|year|years).*?expérience',
        r'expérience.*?(\d+)\s*(an|année|ans|year|years)'
    ]
    for pattern in exp_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return float(match.group(1))
    year_matches = re.findall(r'(19|20)\d{2}', text)
    if year_matches:
        years = [int(year) for year in year_matches if 1970 <= int(year) <= datetime.now().year]
        if years:
            return max(0, min(datetime.now().year - min(years), 30))
    return 0.0

# ---------------- Certifications ----------------
def extract_certifications(text: str) -> List[str]:
    certifications = []
    cert_patterns = [
        r'certification\s+(.+)',
        r'certified\s+(.+)',
        r'(AWS|Azure|Google Cloud).*?certified',
        r'([A-Z]{2,}-[0-9]+)',
        r'(PMP|SCRUM|AGILE).*?certified'
    ]
    for pattern in cert_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            cert = match[0].strip() if isinstance(match, tuple) else match.strip()
            if cert and len(cert) > 2:
                certifications.append(cert)
    return list(set(certifications))

# ---------------- Détection des valeurs manquantes ----------------
def detect_missing_values(cv_data: dict) -> List[str]:
    """Retourne une liste des champs manquants"""
    missing = []
    if not cv_data.get("firstName") or cv_data["firstName"] == "Unknown":
        missing.append("firstName")
    if not cv_data.get("lastName") or cv_data["lastName"] == "Candidate":
        missing.append("lastName")
    if not cv_data.get("email"):
        missing.append("email")
    if not cv_data.get("phone"):
        missing.append("phone")
    if not cv_data.get("location"):
        missing.append("location")
    if not cv_data.get("experienceYears") or cv_data["experienceYears"] == 0:
        missing.append("experienceYears")
    if not cv_data.get("education"):
        missing.append("education")
    if not cv_data.get("skills"):
        missing.append("skills")
    if not cv_data.get("certifications"):
        missing.append("certifications")
    return missing

# ---------------- Analyse globale ----------------
def parse_cv_text(text: str) -> Dict[str, Any]:
    personal_info = extract_personal_info(text)
    skills = extract_skills(text)
    education = extract_education(text)
    experience_years = estimate_experience(text)
    certifications = extract_certifications(text)
    
    cv_data = {
        "firstName": personal_info["firstName"],
        "lastName": personal_info["lastName"],
        "email": personal_info["email"],
        "phone": personal_info["phone"],
        "location": personal_info["location"],
        "experienceYears": experience_years,
        "education": education,
        "skills": skills,
        "certifications": certifications,
        "resumeText": text,
        "lastUpdated": datetime.utcnow()
    }
    
    # Détection des valeurs manquantes
    cv_data["missingValues"] = detect_missing_values(cv_data)
    
    return cv_data

def parse_cv_text_with_ai(text: str) -> dict:
    base_data = parse_cv_text(text)
    engagement_result = predict_turnover_or_engagement(text)
    screening_result = screen_cv_class(text)
    
    base_data.update({
        "engagement_prediction": engagement_result,
        "screening_classification": screening_result
    })
    return base_data

def process_cv_pdf(file_path: str) -> Dict[str, Any]:
    text = extract_text_from_pdf(file_path)
    return parse_cv_text_with_ai(text)
