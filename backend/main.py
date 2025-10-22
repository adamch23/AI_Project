# ---------------- main.py ----------------
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
import os
import shutil
from datetime import datetime
from models import Job
from cv_parser import process_cv_pdf
from scoring import score_candidate_for_job
import requests
import json

# ---------------- FastAPI Setup ----------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

client = MongoClient("mongodb://localhost:27017/")
db = client["recruit_ai"]

# ---------------- Helper Functions ----------------
def convert_objectid(obj):
    if isinstance(obj, list):
        return [convert_objectid(x) for x in obj]
    elif isinstance(obj, dict):
        return {k: convert_objectid(v) for k, v in obj.items()}
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj

def ask_n8n_question(url, question, field_name="chatInput"):
    payload = {field_name: question}
    try:
        response = requests.post(url, json=payload, timeout=50)
        response.raise_for_status()
        try:
            return response.json()
        except json.JSONDecodeError:
            print("Réponse non JSON reçue :")
            print(response.text)
            return None
    except requests.exceptions.RequestException as e:
        print("Erreur lors de l'appel au webhook :", e)
        return None

# ---------------- API Endpoints ----------------
@app.post("/add_job")
def add_job(job: Job):
    result = db.jobs.insert_one(job.dict())
    return {"message": "Offre ajoutée avec succès", "id": str(result.inserted_id)}

@app.post("/upload_cv/{job_id}")
async def upload_cv(job_id: str, file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    parsed = process_cv_pdf(file_path)
    parsed["lastUpdated"] = datetime.utcnow()

    result = db.candidates.insert_one(parsed)
    candidate_id = str(result.inserted_id)

    score_candidate_for_job(candidate_id, job_id)

    parsed_clean = convert_objectid(parsed)
    return {"message": "CV ajouté et scanné avec IA", "candidate": parsed_clean, "id": candidate_id}

@app.get("/get_top_candidates/{job_id}")
def get_top_candidates(job_id: str, limit: int = 5):
    # On suppose que le score du candidat pour un job est stocké dans "computed.score_cache.job_{job_id}.score"
    candidates = list(
        db.candidates.find({
            f"computed.score_cache.job_{job_id}": {"$exists": True}
        }).sort([
            (f"computed.score_cache.job_{job_id}.score", -1)
        ]).limit(limit)
    )
    return {"top_candidates": convert_objectid(candidates)}

@app.get("/jobs")
def get_jobs():
    jobs = list(db.jobs.find())
    return {"jobs": convert_objectid(jobs)}

@app.get("/screening_classification")
def get_screening_classification(limit: int = 10):
    candidates = list(
        db.candidates.find({"screening_classification": {"$exists": True}})
        .sort([("screening_classification.confidence", -1)])
        .limit(limit)
    )
    return {"screening_classification_candidates": convert_objectid(candidates)}

# ---------------- Endpoint n8n ----------------
class N8nRequest(BaseModel):
    question: str

@app.post("/ask_n8n")
def ask_n8n_endpoint(request: N8nRequest):
    url = "http://localhost:5678/webhook/2742d23f-b2b7-4443-89fb-7705a9f5111a"
    ai_field_name = "chatInput"
    response = ask_n8n_question(url, request.question, ai_field_name)
    if response:
        return {"response": response}
    else:
        raise HTTPException(status_code=500, detail="Erreur ou réponse vide du webhook n8n")
