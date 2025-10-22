import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import spacy
import re
from typing import List, Dict, Tuple, Any
import logging

# Configuration du logging
logger = logging.getLogger(__name__)

class AIEngine:
    def __init__(self):
        """Initialise le moteur IA avec les modèles nécessaires"""
        try:
            # Charger le modèle spaCy français
            self.nlp = spacy.load("fr_core_news_sm")
            logger.info("Modèle spaCy français chargé avec succès")
        except OSError:
            logger.warning("Modèle spaCy français non trouvé, utilisation du modèle small")
            self.nlp = spacy.load("fr_core_news_sm")
        
        # Initialiser le vectorizer TF-IDF
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
        # Base de connaissances des compétences
        self.skill_categories = {
            "programming": ["python", "java", "javascript", "c++", "c#", "php", "ruby", "go", "rust"],
            "web": ["html", "css", "react", "vue", "angular", "node.js", "django", "flask", "spring"],
            "database": ["sql", "mysql", "postgresql", "mongodb", "redis", "oracle"],
            "devops": ["docker", "kubernetes", "aws", "azure", "gcp", "jenkins", "git", "ci/cd"],
            "data_science": ["python", "r", "pandas", "numpy", "tensorflow", "pytorch", "ml", "ai"],
            "mobile": ["android", "ios", "react native", "flutter", "swift", "kotlin"],
            "soft_skills": ["communication", "leadership", "teamwork", "problem solving", "creativity", "adaptability"]
        }
        
        # Synonymes de compétences
        self.skill_synonyms = {
            "python": ["python", "py", "django", "flask"],
            "javascript": ["javascript", "js", "node", "react", "vue", "angular"],
            "java": ["java", "spring", "j2ee"],
            "sql": ["sql", "mysql", "postgresql", "oracle"],
            "mongodb": ["mongodb", "mongo", "nosql"],
            "docker": ["docker", "container"],
            "aws": ["aws", "amazon web services"],
            "react": ["react", "reactjs", "react.js"],
            "node.js": ["node", "nodejs", "node.js"]
        }
        
        logger.info("Moteur IA initialisé avec succès")

    def extract_skills_from_text(self, text: str) -> List[str]:
        """
        Extrait les compétences techniques d'un texte de CV
        """
        try:
            if not text:
                return []
            
            text_lower = text.lower()
            found_skills = []
            
            # Recherche des compétences par catégorie
            for category, skills in self.skill_categories.items():
                for skill in skills:
                    # Vérifier la compétence et ses synonymes
                    synonyms = self.skill_synonyms.get(skill, [skill])
                    for synonym in synonyms:
                        if synonym in text_lower:
                            found_skills.append(skill)
                            break
            
            # Extraction avec spaCy pour les entités
            doc = self.nlp(text_lower)
            for ent in doc.ents:
                if ent.label_ in ["SKILL", "TECH"] or any(skill in ent.text.lower() for skill in self.get_all_skills()):
                    found_skills.append(ent.text.lower())
            
            return list(set(found_skills))
        
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction des compétences: {e}")
            return []

    def get_all_skills(self) -> List[str]:
        """Retourne toutes les compétences connues"""
        all_skills = []
        for skills in self.skill_categories.values():
            all_skills.extend(skills)
        return all_skills

    def calculate_similarity(self, text1: str, text2: str) -> float:
        """
        Calcule la similarité cosinus entre deux textes
        """
        try:
            if not text1 or not text2:
                return 0.0
            
            # Vectorisation TF-IDF
            tfidf_matrix = self.vectorizer.fit_transform([text1, text2])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
            return float(similarity[0][0])
        
        except Exception as e:
            logger.error(f"Erreur calcul similarité: {e}")
            return 0.0

    def extract_experience(self, text: str) -> float:
        """
        Extrait les années d'expérience d'un texte de CV
        """
        try:
            # Patterns pour détecter l'expérience
            patterns = [
                r'(\d+)[\s]*(ans|années|years|année|year)',
                r'expérience[\s]*:?[\s]*(\d+)',
                r'(\d+)[\s]*ans',
                r'(\d+)\+?[\s]*(ans|années|years)'
            ]
            
            for pattern in patterns:
                matches = re.finditer(pattern, text.lower())
                for match in matches:
                    years = int(match.group(1))
                    if years <= 50:  # Filtre réaliste
                        return float(years)
            
            return 0.0
        
        except Exception as e:
            logger.error(f"Erreur extraction expérience: {e}")
            return 0.0

    def extract_education(self, text: str) -> List[str]:
        """
        Extrait le niveau d'éducation d'un texte de CV
        """
        education_levels = {
            "bac": ["bac", "baccalaureat", "baccalauréat"],
            "bts": ["bts", "brevet de technicien supérieur"],
            "dut": ["dut", "diplôme universitaire de technologie"],
            "licence": ["licence", "bachelor"],
            "master": ["master", "mastère", "msc"],
            "doctorat": ["doctorat", "phd", "doctorat"]
        }
        
        found_levels = []
        text_lower = text.lower()
        
        for level, keywords in education_levels.items():
            for keyword in keywords:
                if keyword in text_lower:
                    found_levels.append(level)
                    break
        
        return found_levels

    def match_candidates_job(self, candidatess: Dict, job: Dict) -> Dict[str, Any]:
        """
        Effectue un matching avancé entre un candidat et une offre
        """
        try:
            # Extraction des données
            candidates_skills = self.extract_candidates_skills(candidatess)
            job_skills = self.extract_job_skills(job)
            
            # Calcul des scores
            skill_score = self.calculate_skill_score(candidates_skills, job_skills)
            experience_score = self.calculate_experience_score(candidatess, job)
            education_score = self.calculate_education_score(candidatess, job)
            text_similarity = self.calculate_text_similarity(candidatess, job)
            
            # Score final pondéré
            final_score = (
                0.4 * skill_score +
                0.3 * experience_score +
                0.15 * education_score +
                0.15 * text_similarity
            )
            
            # Analyse détaillée
            matching_skills = self.find_matching_skills(candidates_skills, job_skills)
            missing_skills = self.find_missing_skills(candidates_skills, job_skills)
            strengths = self.identify_strengths(candidatess, job, matching_skills)
            weaknesses = self.identify_weaknesses(candidatess, job, missing_skills)
            
            return {
                "overall_score": round(final_score * 100, 1),
                "skill_score": round(skill_score * 100, 1),
                "experience_score": round(experience_score * 100, 1),
                "education_score": round(education_score * 100, 1),
                "text_similarity": round(text_similarity * 100, 1),
                "matching_skills": matching_skills,
                "missing_skills": missing_skills,
                "strengths": strengths,
                "weaknesses": weaknesses,
                "recommendation": self.generate_recommendation(final_score, strengths, weaknesses)
            }
        
        except Exception as e:
            logger.error(f"Erreur matching candidat-job: {e}")
            return self.create_fallback_result()

    def extract_candidates_skills(self, candidates: Dict) -> List[str]:
        """Extrait les compétences du candidat"""
        skills = []
        
        # Compétences structurées
        if candidates.get("skills"):
            for skill in candidates["skills"]:
                if isinstance(skill, dict):
                    skills.append(skill["name"].lower())
                else:
                    skills.append(skill.lower())
        
        # Extraction depuis le texte
        if candidates.get("resumeText"):
            text_skills = self.extract_skills_from_text(candidates["resumeText"])
            skills.extend(text_skills)
        
        return list(set(skills))

    def extract_job_skills(self, job: Dict) -> List[str]:
        """Extrait les compétences de l'offre"""
        skills = []
        
        if job.get("required_skills"):
            for skill in job["required_skills"]:
                if isinstance(skill, dict):
                    skills.append(skill["name"].lower())
                else:
                    skills.append(skill.lower())
        
        if job.get("preferred_skills"):
            for skill in job["preferred_skills"]:
                if isinstance(skill, dict):
                    skills.append(skill["name"].lower())
                else:
                    skills.append(skill.lower())
        
        return list(set(skills))

    def calculate_skill_score(self, candidates_skills: List[str], job_skills: List[str]) -> float:
        """Calcule le score de matching des compétences"""
        if not job_skills:
            return 0.0
        
        matching_count = 0
        for job_skill in job_skills:
            if any(self.skills_match(candidates_skill, job_skill) for candidates_skill in candidates_skills):
                matching_count += 1
        
        return matching_count / len(job_skills)

    def skills_match(self, skill1: str, skill2: str) -> bool:
        """Vérifie si deux compétences correspondent"""
        if skill1 == skill2:
            return True
        
        # Vérification des synonymes
        for main_skill, synonyms in self.skill_synonyms.items():
            if skill1 in synonyms and skill2 in synonyms:
                return True
        
        return False

    def calculate_experience_score(self, candidates: Dict, job: Dict) -> float:
        """Calcule le score d'expérience"""
        candidates_exp = candidates.get("experienceYears", 0)
        job_min_exp = job.get("min_experience", 0)
        
        if job_min_exp == 0:
            return 1.0
        
        return min(candidates_exp / job_min_exp, 1.0)

    def calculate_education_score(self, candidates: Dict, job: Dict) -> float:
        """Calcule le score d'éducation"""
        if not job.get("education_preference"):
            return 0.5
        
        candidates_education = candidates.get("education", [])
        if not candidates_education:
            return 0.0
        
        candidates_levels = [edu.get("level", "").lower() for edu in candidates_education]
        preferred_levels = [level.lower() for level in job["education_preference"]]
        
        for level in candidates_levels:
            if any(pref in level for pref in preferred_levels):
                return 1.0
        
        return 0.0

    def calculate_text_similarity(self, candidates: Dict, job: Dict) -> float:
        """Calcule la similarité textuelle"""
        candidates_text = candidates.get("resumeText", "")
        job_text = job.get("description", "")
        
        if not candidates_text or not job_text:
            return 0.0
        
        return self.calculate_similarity(candidates_text, job_text)

    def find_matching_skills(self, candidates_skills: List[str], job_skills: List[str]) -> List[str]:
        """Trouve les compétences correspondantes"""
        matching = []
        for job_skill in job_skills:
            for candidates_skill in candidates_skills:
                if self.skills_match(candidates_skill, job_skill):
                    matching.append(job_skill)
                    break
        return matching

    def find_missing_skills(self, candidates_skills: List[str], job_skills: List[str]) -> List[str]:
        """Trouve les compétences manquantes"""
        missing = []
        for job_skill in job_skills:
            if not any(self.skills_match(candidates_skill, job_skill) for candidates_skill in candidates_skills):
                missing.append(job_skill)
        return missing

    def identify_strengths(self, candidates: Dict, job: Dict, matching_skills: List[str]) -> List[str]:
        """Identifie les points forts"""
        strengths = []
        
        # Expérience supérieure
        candidates_exp = candidates.get("experienceYears", 0)
        job_min_exp = job.get("min_experience", 0)
        if candidates_exp > job_min_exp + 2:
            strengths.append(f"Expérience supérieure ({candidates_exp} ans)")
        
        # Compétences rares correspondantes
        rare_skills = ["docker", "aws", "kubernetes", "machine learning", "ai"]
        rare_found = [skill for skill in matching_skills if skill in rare_skills]
        if rare_found:
            strengths.append(f"Compétences avancées: {', '.join(rare_found)}")
        
        # Bon niveau d'éducation
        if self.calculate_education_score(candidates, job) > 0.8:
            strengths.append("Profil académique solide")
        
        return strengths

    def identify_weaknesses(self, candidates: Dict, job: Dict, missing_skills: List[str]) -> List[str]:
        """Identifie les points faibles"""
        weaknesses = []
        
        # Expérience insuffisante
        candidates_exp = candidates.get("experienceYears", 0)
        job_min_exp = job.get("min_experience", 0)
        if candidates_exp < job_min_exp:
            weaknesses.append(f"Expérience insuffisante ({candidates_exp} ans vs {job_min_exp} ans requis)")
        
        # Compétences manquantes importantes
        if missing_skills:
            weaknesses.append(f"Compétences manquantes: {', '.join(missing_skills[:3])}")
        
        # Éducation non correspondante
        if self.calculate_education_score(candidates, job) < 0.3:
            weaknesses.append("Profil académique non aligné")
        
        return weaknesses

    def generate_recommendation(self, score: float, strengths: List[str], weaknesses: List[str]) -> str:
        """Génère une recommandation basée sur le score"""
        if score >= 0.8:
            return "Candidat très recommandé - correspondance excellente"
        elif score >= 0.6:
            return "Candidat recommandé - bonne correspondance"
        elif score >= 0.4:
            return "Candidat à considérer - correspondance moyenne"
        else:
            return "Candidat non recommandé - faible correspondance"

    def create_fallback_result(self) -> Dict[str, Any]:
        """Crée un résultat par défaut en cas d'erreur"""
        return {
            "overall_score": 0,
            "skill_score": 0,
            "experience_score": 0,
            "education_score": 0,
            "text_similarity": 0,
            "matching_skills": [],
            "missing_skills": [],
            "strengths": [],
            "weaknesses": ["Erreur d'analyse"],
            "recommendation": "Impossible d'analyser la correspondance"
        }

    def generate_interview_questions(self, candidates: Dict, job: Dict) -> Dict[str, List[str]]:
        """
        Génère des questions d'entretien personnalisées
        """
        try:
            candidates_skills = self.extract_candidates_skills(candidates)
            job_skills = self.extract_job_skills(job)
            experience = candidates.get("experienceYears", 0)
            
            # Questions techniques
            technical_questions = []
            for skill in job_skills[:5]:  # Top 5 compétences requises
                if skill in candidates_skills:
                    technical_questions.append(
                        f"Pouvez-vous détailler votre expérience avec {skill} sur un projet concret ?"
                    )
                else:
                    technical_questions.append(
                        f"Quelle est votre approche pour apprendre rapidement {skill} ?"
                    )
            
            # Questions comportementales
            behavioral_questions = [
                f"Avec {experience} ans d'expérience, quelle est votre plus grande réalisation ?",
                "Comment gérez-vous les délais serrés et les priorités changeantes ?",
                "Pouvez-vous décrire une situation où vous avez résolu un problème technique complexe ?"
            ]
            
            # Questions spécifiques au poste
            role_specific_questions = [
                f"Qu'est-ce qui vous attire particulièrement dans le poste de {job.get('title', '')} ?",
                "Comment voyez-vous votre évolution dans ce rôle dans les 2-3 prochaines années ?"
            ]
            
            return {
                "technical_questions": technical_questions[:5],
                "behavioral_questions": behavioral_questions,
                "role_specific_questions": role_specific_questions,
                "evaluation_criteria": [
                    "Maîtrise technique des compétences clés",
                    "Capacité à résoudre des problèmes complexes",
                    "Adéquation culturelle et motivation",
                    "Potentiel d'évolution et d'apprentissage"
                ]
            }
        
        except Exception as e:
            logger.error(f"Erreur génération questions: {e}")
            return {
                "technical_questions": ["Erreur lors de la génération des questions"],
                "behavioral_questions": [],
                "role_specific_questions": [],
                "evaluation_criteria": []
            }

# Instance globale du moteur IA
ai_engine = AIEngine()