# cv_matching.py
import logging
from typing import Dict, List, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re
from sentence_transformers import SentenceTransformer
import spacy
from transformers import pipeline
import torch

logger = logging.getLogger(__name__)

class AdvancedCVMatchingService:
    def __init__(self):
        # Modèles d'embedding sémantique
        try:
            self.sentence_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
            logger.info("Sentence transformer model loaded successfully")
        except Exception as e:
            logger.warning(f"Could not load sentence transformer: {e}")
            self.sentence_model = None
        
        # Modèle spaCy pour le NLP
        try:
            self.nlp = spacy.load("fr_core_news_sm")
            logger.info("spaCy model loaded successfully")
        except Exception as e:
            logger.warning(f"Could not load spaCy model: {e}")
            self.nlp = None
        
        # Classificateur pour l'analyse sémantique
        try:
            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="nlptown/bert-base-multilingual-uncased-sentiment",
                tokenizer="nlptown/bert-base-multilingual-uncased-sentiment"
            )
            logger.info("Sentiment analyzer loaded successfully")
        except Exception as e:
            logger.warning(f"Could not load sentiment analyzer: {e}")
            self.sentiment_analyzer = None
        
        # TF-IDF traditionnel comme fallback
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=2000, 
            stop_words=['english', 'french'],
            ngram_range=(1, 2)
        )
        
        self.common_skills = [
            "python", "java", "javascript", "react", "angular", "vue", "nodejs", "django", "flask",
            "sql", "postgresql", "mysql", "mongodb", "redis", "docker", "kubernetes", "aws", "azure",
            "git", "github", "gitlab", "jenkins", "ci/cd", "rest api", "graphql", "microservices",
            "machine learning", "ai", "data science", "pandas", "numpy", "tensorflow", "pytorch",
            "html", "css", "bootstrap", "sass", "webpack", "npm", "yarn", "linux", "bash",
            "agile", "scrum", "kanban", "jira", "confluence", "testing", "tdd", "bdd",
            "next.js", "typescript", "express", "spring", "hibernate", "jpa", "maven", "gradle",
            "vue.js", "svelte", "ember", "backbone", "jquery", "lodash", "moment", "axios",
            "firebase", "supabase", "prisma", "sequelize", "typeorm", "mongoose", "elasticsearch",
            "kafka", "rabbitmq", "nginx", "apache", "tomcat", "jetty", "wildfly", "glassfish",
            "full stack", "frontend", "backend", "devops", "cloud", "api", "rest", "json", "xml"
        ]
        
        # Niveaux d'expérience pour l'analyse
        self.experience_levels = {
            "junior": ["débutant", "junior", "stage", "alternance", "0-2 ans", "1-3 ans"],
            "intermediaire": ["intermédiaire", "confirmé", "3-5 ans", "5-7 ans", "mid-level"],
            "senior": ["senior", "expert", "lead", "principal", "7+ ans", "10+ ans", "architecte"]
        }
    
    def extract_skills_advanced(self, text: str) -> Dict[str, Any]:
        """Extrait les compétences avec analyse sémantique avancée"""
        if not text:
            return {"skills": [], "experience_level": "unknown", "confidence": 0.0}
        
        text_lower = text.lower()
        found_skills = []
        
        # Extraction basique des compétences
        for skill in self.common_skills:
            if skill in text_lower:
                found_skills.append(skill.title())
        
        # Analyse d'expérience avec regex
        experience_level = self._detect_experience_level(text)
        
        # Extraction d'entités avec spaCy si disponible
        entities = []
        if self.nlp:
            doc = self.nlp(text)
            entities = [ent.text for ent in doc.ents if ent.label_ in ["ORG", "PRODUCT", "TECH"]]
        
        return {
            "skills": list(set(found_skills)),
            "experience_level": experience_level,
            "entities": entities,
            "skills_count": len(found_skills)
        }
    
    def _detect_experience_level(self, text: str) -> str:
        """Détecte le niveau d'expérience basé sur le texte"""
        text_lower = text.lower()
        
        for level, keywords in self.experience_levels.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return level
        
        # Détection basée sur les années d'expérience
        year_patterns = [
            r'(\d+)\s*ans?\s*d\'?expérience',
            r'expérience\s*:\s*(\d+)\s*ans?',
            r'(\d+)\s*ans?\s*dans',
            r'(\d+)\s*ans?\s*en\s*(?:développement|programmation)'
        ]
        
        for pattern in year_patterns:
            matches = re.findall(pattern, text_lower)
            if matches:
                years = int(matches[0])
                if years <= 2:
                    return "junior"
                elif years <= 5:
                    return "intermediaire"
                else:
                    return "senior"
        
        return "unknown"
    
    def calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """Calcule la similarité sémantique avec des embeddings"""
        try:
            if not text1 or not text2:
                return 0.0
            
            # Utilisation du modèle sentence transformer si disponible
            if self.sentence_model:
                embeddings = self.sentence_model.encode([text1, text2])
                similarity = cosine_similarity(
                    embeddings[0:1].reshape(1, -1), 
                    embeddings[1:2].reshape(1, -1)
                )[0][0]
                return float(similarity)
            else:
                # Fallback vers TF-IDF
                return self._calculate_tfidf_similarity(text1, text2)
                
        except Exception as e:
            logger.error(f"Error calculating semantic similarity: {e}")
            return self._calculate_tfidf_similarity(text1, text2)
    
    def _calculate_tfidf_similarity(self, text1: str, text2: str) -> float:
        """Calcule la similarité TF-IDF traditionnelle"""
        try:
            embeddings = self.tfidf_vectorizer.fit_transform([text1, text2])
            similarity = cosine_similarity(embeddings[0:1], embeddings[1:2])[0][0]
            return float(similarity)
        except Exception as e:
            logger.error(f"Error in TF-IDF similarity: {e}")
            return 0.0
    
    def analyze_experience_compatibility(self, candidate_exp: str, job_requirements: str) -> float:
        """Analyse la compatibilité des niveaux d'expérience"""
        candidate_level = self._detect_experience_level(candidate_exp)
        job_level = self._detect_experience_level(job_requirements)
        
        level_weights = {
            "junior": 1,
            "intermediaire": 2,
            "senior": 3,
            "unknown": 1.5
        }
        
        candidate_weight = level_weights.get(candidate_level, 1)
        job_weight = level_weights.get(job_level, 1)
        
        # Calcul de compatibilité basé sur la différence de niveau
        diff = abs(candidate_weight - job_weight)
        if diff == 0:
            return 1.0  # Parfait match
        elif diff == 1:
            return 0.7  # Match acceptable
        else:
            return 0.3  # Match faible
    
    def generate_ai_recommendations(self, candidate_data: Dict, job_data: Dict, 
                                  similarity_score: float, skill_overlap: float) -> List[str]:
        """Génère des recommandations intelligentes basées sur l'analyse AI"""
        recommendations = []
        
        # Analyse des compétences manquantes
        candidate_skills = set(self.extract_skills_advanced(
            f"{candidate_data.get('resumeText', '')} {candidate_data.get('firstName', '')} {candidate_data.get('lastName', '')}"
        )["skills"])
        
        job_skills = set([skill.get('name', '').lower() for skill in job_data.get('required_skills', [])])
        missing_skills = job_skills - candidate_skills
        
        if missing_skills:
            top_missing = list(missing_skills)[:3]
            recommendations.append(
                f"Compétences recommandées à développer : {', '.join(top_missing)}"
            )
        
        # Analyse d'expérience
        candidate_exp = candidate_data.get('resumeText', '')
        job_req = job_data.get('description', '') + ' ' + job_data.get('title', '')
        exp_compatibility = self.analyze_experience_compatibility(candidate_exp, job_req)
        
        if exp_compatibility < 0.5:
            recommendations.append("Le niveau d'expérience semble inférieur aux attentes - formation complémentaire recommandée")
        elif exp_compatibility > 0.8:
            recommendations.append("Excellent alignement du niveau d'expérience")
        
        # Recommandations basées sur le score de similarité
        if similarity_score < 0.4:
            recommendations.append("Faible similarité sémantique - envisager une reformulation du profil")
        elif similarity_score > 0.7:
            recommendations.append("Forte similarité sémantique - profil très pertinent")
        
        return recommendations
    
    def match_candidate_to_job(self, candidate_data: Dict, job_data: Dict) -> Dict[str, Any]:
        """Match un candidat avec une offre d'emploi utilisant l'AI avancée"""
        try:
            # Préparer les textes pour la comparaison
            candidate_text = self._prepare_candidate_text(candidate_data)
            job_text = self._prepare_job_text(job_data)
            
            # Calculer la similarité sémantique
            semantic_similarity = self.calculate_semantic_similarity(candidate_text, job_text)
            
            # Analyse avancée des compétences
            candidate_analysis = self.extract_skills_advanced(candidate_text)
            job_skills = [skill.get('name', '').lower() for skill in job_data.get('required_skills', [])]
            
            # Calculer le chevauchement des compétences
            common_skills = set(candidate_analysis["skills"]).intersection(set(job_skills))
            skill_overlap = len(common_skills) / max(len(job_skills), 1)
            
            # Analyse de compatibilité d'expérience
            experience_compatibility = self.analyze_experience_compatibility(
                candidate_text, job_text
            )
            
            # Score final pondéré avec plus de facteurs
            final_score = (
                semantic_similarity * 0.4 +
                skill_overlap * 0.3 +
                experience_compatibility * 0.3
            )
            
            # Déterminer le niveau de match
            match_level = self._determine_match_level(final_score)
            
            # Générer des recommandations AI
            recommendations = self.generate_ai_recommendations(
                candidate_data, job_data, semantic_similarity, skill_overlap
            )
            
            return {
                "score": round(final_score, 3),
                "score_percentage": round(final_score * 100, 1),
                "match_level": match_level,
                "semantic_similarity": round(semantic_similarity, 3),
                "skill_overlap": round(skill_overlap, 3),
                "experience_compatibility": round(experience_compatibility, 3),
                "common_skills": list(common_skills),
                "common_skills_count": len(common_skills),
                "candidate_experience_level": candidate_analysis["experience_level"],
                "recommendations": recommendations,
                "compatibility_breakdown": {
                    "skills_coverage": round(skill_overlap * 100, 1),
                    "semantic_similarity": round(semantic_similarity * 100, 1),
                    "experience_match": round(experience_compatibility * 100, 1)
                },
                "ai_insights": {
                    "skills_gap": len(job_skills) - len(common_skills),
                    "potential_upskilling_areas": list(set(job_skills) - common_skills)[:5],
                    "strengths": list(common_skills)[:5]
                }
            }
            
        except Exception as e:
            logger.error(f"Error in AI-powered candidate-job matching: {e}")
            return self._get_error_response()
    
    def _prepare_candidate_text(self, candidate_data: Dict) -> str:
        """Prépare le texte du candidat pour l'analyse"""
        return f"""
        {candidate_data.get('resumeText', '')}
        {candidate_data.get('firstName', '')}
        {candidate_data.get('lastName', '')}
        {candidate_data.get('email', '')}
        {candidate_data.get('phone', '')}
        """.strip()
    
    def _prepare_job_text(self, job_data: Dict) -> str:
        """Prépare le texte de l'offre d'emploi pour l'analyse"""
        skills_text = ' '.join([skill.get('name', '') for skill in job_data.get('required_skills', [])])
        return f"""
        {job_data.get('title', '')}
        {job_data.get('description', '')}
        {skills_text}
        {job_data.get('company', '')}
        """.strip()
    
    def _determine_match_level(self, score: float) -> str:
        """Détermine le niveau de match basé sur le score"""
        if score >= 0.85:
            return "Excellent"
        elif score >= 0.70:
            return "Très bon"
        elif score >= 0.60:
            return "Bon"
        elif score >= 0.45:
            return "Moyen"
        else:
            return "Faible"
    
    def _get_error_response(self) -> Dict[str, Any]:
        """Retourne une réponse d'erreur standardisée"""
        return {
            "score": 0.0,
            "score_percentage": 0.0,
            "match_level": "Erreur",
            "semantic_similarity": 0.0,
            "skill_overlap": 0.0,
            "experience_compatibility": 0.0,
            "common_skills": [],
            "common_skills_count": 0,
            "candidate_experience_level": "unknown",
            "recommendations": ["Erreur lors de l'analyse AI"],
            "compatibility_breakdown": {
                "skills_coverage": 0.0,
                "semantic_similarity": 0.0,
                "experience_match": 0.0
            },
            "ai_insights": {
                "skills_gap": 0,
                "potential_upskilling_areas": [],
                "strengths": []
            }
        }

# Instance globale
cv_matcher = AdvancedCVMatchingService()

# Alias pour la rétrocompatibilité
CVMatchingService = AdvancedCVMatchingService