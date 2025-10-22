from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json

# Importez vos modules existants
try:
    from database import candidats_collection, db
    from models import Candidat, Offre
    from ai_engine import recommander_candidats_avance
except ImportError:
    # Fallback si les modules n'existent pas
    candidats_collection = None
    db = None
    recommander_candidats_avance = None

app = FastAPI(title="Système de Recrutement IA Avancé")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ⭐⭐ MODÈLES PYDANTIC ⭐⭐
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

# ⭐⭐ ROUTES EXISTANTES ⭐⭐
@app.get("/")
def home():
    return {"message": "API Recrutement IA connectée à MongoDB et IA prête 🚀"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API Recrutement IA fonctionne"}

# Ajouter un candidat
@app.post("/candidats")
def ajouter_candidat(candidat: Candidat):
    try:
        if candidats_collection is None:
            return {"error": "Base de données non connectée"}
        
        result = candidats_collection.insert_one(candidat.dict())
        return {"message": "Candidat ajouté", "id": str(result.inserted_id)}
    except Exception as e:
        return {"error": f"Erreur ajout candidat: {str(e)}"}

# Lister tous les candidats
@app.get("/candidats")
def get_candidats():
    try:
        if candidats_collection is None:
            return {"error": "Base de données non connectée"}
        
        data = list(candidats_collection.find())
        for d in data:
            d["_id"] = str(d["_id"])
        return data
    except Exception as e:
        return {"error": f"Erreur récupération candidats: {str(e)}"}

# Recommandation IA avancée
@app.post("/recommandation")
def recommander(offre: Offre):
    try:
        # ✅ CORRECTION : Vérification sécurisée de la base de données
        if candidats_collection is None or db is None or recommander_candidats_avance is None:
            return {"error": "Module IA ou base de données non disponible"}
        
        # Récupération des candidats
        candidats = list(candidats_collection.find({}, {"_id": 0}))
        if not candidats:
            return {"message": "Aucun candidat disponible pour la recommandation."}

        # Assurer que chaque candidat a un champ competences
        for c in candidats:
            if "competences" not in c:
                c["competences"] = []

        # Génération des recommandations
        recommandations = recommander_candidats_avance(offre.dict(), candidats)

        # ✅ CORRECTION : Vérification sécurisée avant insertion historique
        if db is not None:  # ← CORRECTION ICI
            for rec in recommandations:
                db["historique"].insert_one({
                    "offre": offre.poste,
                    "candidat": rec["nom"],
                    "score_final": rec["score_final"],
                    "timestamp": datetime.now()
                })

        return {
            "poste": offre.poste,
            "top_candidats": recommandations
        }
    except Exception as e:
        return {"error": str(e)}

# ⭐⭐ NOUVELLE ROUTE INTERVIEW SIMULATOR ⭐⭐
@app.post("/generate-interview")
def generate_interview_questions(request: InterviewRequest):
    """
    Génère des questions d'entretien personnalisées avec IA
    """
    try:
        print(f"🎯 Génération questions pour {request.candidate_name} - {request.poste}")
        
        # Utiliser notre génération manuelle
        interview_data = generate_interview_fallback(request)
        print("✅ Questions générées avec succès")
        
        # Enregistrer dans MongoDB pour historique
        if db:
            db["interviews"].insert_one({
                "candidate_name": request.candidate_name,
                "poste": request.poste,
                "competences": request.competences,
                "experience_years": request.experience_years,
                "questions_generes": interview_data,
                "timestamp": datetime.now()
            })
        
        return interview_data
        
    except Exception as e:
        print(f"❌ Erreur génération questions: {str(e)}")
        fallback_data = generate_interview_fallback(request)
        return fallback_data

def generate_interview_fallback(request: InterviewRequest):
    """Génération de questions intelligentes sans API externe"""
    
    # Questions techniques basées sur les compétences réelles
    technical_questions = []
    if request.competences:
        technical_questions = [
            f"Pouvez-vous détailler un projet concret où vous avez utilisé {request.competences[0]} ?",
            f"Comment gérez-vous les défis techniques spécifiques au poste de {request.poste} ?",
            f"Quelle est votre méthodologie pour {request.competences[1] if len(request.competences) > 1 else 'résoudre des problèmes complexes'} ?",
            f"Comment restez-vous à jour avec les évolutions en {request.poste} avec {request.experience_years} ans d'expérience ?"
        ]
    else:
        technical_questions = [
            f"Pouvez-vous décrire votre approche pour un projet typique de {request.poste} ?",
            "Comment gérez-vous les défis techniques inattendus ?",
            "Quels sont vos outils de travail préférés et pourquoi ?",
            f"Comment avez-vous évolué techniquement au cours de vos {request.experience_years} ans d'expérience ?"
        ]
    
    # Questions comportementales adaptées à l'expérience
    behavioral_questions = [
        f"Avec {request.experience_years} ans d'expérience, quelle est la plus grande leçon professionnelle que vous avez apprise ?",
        "Pouvez-vous décrire une situation où vous avez dû résoudre un conflit en équipe ?",
        "Comment gérez-vous les délais serrés et les priorités changeantes ?"
    ]
    
    # Critères d'évaluation personnalisés
    evaluation_criteria = [
        f"Maîtrise technique en {request.poste}",
        "Capacité à résoudre des problèmes complexes",
        "Communication et collaboration en équipe", 
        f"Adéquation avec le niveau {request.experience_years} ans d'expérience"
    ]
    
    # Conseils pour l'entretien
    interview_tips = [
        f"Focus sur l'expérience pratique en {request.poste}",
        f"Vérifier la profondeur technique sur {', '.join(request.competences[:2]) if request.competences else 'les compétences clés'}",
        f"Évaluer la capacité d'évolution après {request.experience_years} ans dans le métier"
    ]
    
    return {
        "technical_questions": technical_questions,
        "behavioral_questions": behavioral_questions,
        "evaluation_criteria": evaluation_criteria,
        "interview_tips": interview_tips
    }

# ⭐⭐ NOUVELLE ROUTE POUR L'HISTORIQUE DES INTERVIEWS ⭐⭐
@app.get("/interview-history")
def get_interview_history():
    """Récupère l'historique des interviews générés"""
    try:
        if db is None:
            return {"error": "Base de données non connectée"}
            
        history = list(db["interviews"].find().sort("timestamp", -1).limit(10))
        for item in history:
            item["_id"] = str(item["_id"])
            if "timestamp" in item and item["timestamp"]:
                item["timestamp"] = item["timestamp"].isoformat()
        return {"interview_history": history}
    except Exception as e:
        return {"error": f"Erreur récupération historique: {str(e)}"}

# ⭐⭐ ROUTE TEST INTERVIEW ⭐⭐
@app.get("/test-interview")
def test_interview():
    """Route de test pour l'Interview Simulator"""
    test_request = InterviewRequest(
        candidate_name="Jean Dupont",
        poste="Développeur Fullstack",
        competences=["React", "Node.js", "MongoDB"],
        experience_years=3,
        description="Développeur fullstack expérimenté en startup"
    )
    
    result = generate_interview_fallback(test_request)
    return {
        "message": "Test Interview Simulator",
        "test_data": test_request.dict(),
        "generated_questions": result
    }

# ⭐⭐ DÉMARRAGE DU SERVEUR ⭐⭐
if __name__ == "__main__":
    import uvicorn
    print("🚀 Démarrage de l'API Recrutement IA...")
    print("📊 Routes disponibles:")
    print("   GET  /health")
    print("   GET  /candidats") 
    print("   POST /candidats")
    print("   POST /recommandation")
    print("   POST /generate-interview")
    print("   GET  /interview-history")
    print("   GET  /test-interview")
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0", 
        port=8002,
        reload=True
    )