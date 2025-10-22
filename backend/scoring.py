from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from sentence_transformers import SentenceTransformer, util
from transformers import pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# ---------------- IA SCORE ----------------
model = SentenceTransformer('all-MiniLM-L6-v2')

def compute_ai_score(job_text: str, resume_text: str) -> float:
    embeddings_job = model.encode(job_text, convert_to_tensor=True)
    embeddings_resume = model.encode(resume_text, convert_to_tensor=True)
    similarity = util.cos_sim(embeddings_job, embeddings_resume).item()
    return max(0.0, min(1.0, (similarity + 1) / 2))

def compute_overall_score_ai(job: dict, candidate: dict):
    job_text = job.get("title","") + " " + " ".join([s["name"] for s in job.get("required_skills", [])])
    resume_text = candidate.get("resumeText", "")
    score = compute_ai_score(job_text, resume_text)
    breakdown = {"ai_score": round(score, 3)}
    return round(score, 4), breakdown

def score_candidate_for_job(candidate_id: str, job_id: str, mongo_uri="mongodb://localhost:27017/", db_name="recruit_ai"):
    client = MongoClient(mongo_uri)
    db = client[db_name]

    candidate = db.candidates.find_one({"_id": ObjectId(candidate_id)})
    job = db.jobs.find_one({"_id": ObjectId(job_id)})

    if not candidate or not job:
        print("Candidat ou Job introuvable")
        return

    score, details = compute_overall_score_ai(job, candidate)
    db.candidates.update_one(
        {"_id": candidate["_id"]},
        {"$set": {f"computed.score_cache.job_{job['_id']}": {"score": score, "details": details, "updatedAt": datetime.utcnow()}}}
    )
    print(f"Score IA mis à jour pour le candidat {candidate_id} sur le job {job_id}")

# ---------------- IA Engagement / Turnover ----------------
engagement_classifier = pipeline("text-classification", model="distilbert-base-uncased-finetuned-sst-2-english")

def predict_turnover_or_engagement(resume_text: str) -> dict:
    result = engagement_classifier(resume_text[:512])
    label = result[0]["label"]
    score = result[0]["score"]
    
    if label.upper() == "POSITIVE":
        engagement_label = "Motivé"
        engagement_score = score
    else:
        engagement_label = "Risque de turnover"
        engagement_score = 1 - score
    
    return {"engagement_label": engagement_label, "engagement_score": round(engagement_score, 3)}

# ---------------- IA Screening CV ----------------
# Dataset exemple
classes = ["Motivé", "Non motivé", "Ambitieux", "Stable"]
train_texts = [
    # Motivé
    "Je souhaite rejoindre votre entreprise pour développer mes compétences",
    "Je suis très motivé à contribuer à vos projets et à apprendre",
    "J'ai hâte de mettre mes connaissances en pratique et de progresser",
    "Je veux m'investir pleinement dans ce poste et évoluer",
    
    # Non motivé
    "Je cherche juste un emploi temporaire",
    "Je veux un travail qui paie mais sans trop d'engagement",
    "Je postule simplement pour avoir une expérience professionnelle",
    "Je n'ai pas de préférence particulière, je veux juste travailler",
    
    # Ambitieux
    "J'ai de grandes ambitions et veux évoluer rapidement",
    "Mon objectif est de gravir les échelons et d'assumer des responsabilités",
    "Je souhaite devenir un expert reconnu dans mon domaine",
    "Je veux relever des défis stimulants et progresser dans ma carrière",
    
    # Stable
    "Je veux travailler dans un environnement stable",
    "Je recherche un poste où je peux rester longtemps et m'épanouir",
    "Je souhaite un emploi sûr et régulier, sans changement fréquent",
    "Je cherche un travail stable qui correspond à mon profil"
]

train_labels = [
    # Motivé
    "Motivé", "Motivé", "Motivé", "Motivé",
    # Non motivé
    "Non motivé", "Non motivé", "Non motivé", "Non motivé",
    # Ambitieux
    "Ambitieux", "Ambitieux", "Ambitieux", "Ambitieux",
    # Stable
    "Stable", "Stable", "Stable", "Stable"
]

vectorizer = TfidfVectorizer(max_features=5000)
X_train = vectorizer.fit_transform(train_texts)
classifier = LogisticRegression()
classifier.fit(X_train, train_labels)

def screen_cv_class(resume_text: str) -> dict:
    X_test = vectorizer.transform([resume_text])
    pred_class = classifier.predict(X_test)[0]
    pred_proba = classifier.predict_proba(X_test).max()
    return {"screening_class": pred_class, "confidence": round(pred_proba, 3)}
