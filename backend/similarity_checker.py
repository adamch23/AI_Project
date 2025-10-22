# similarity_check.py
from sentence_transformers import SentenceTransformer, util
import torch

# ======================================================
# 🧠 Chargement du modèle d'embeddings (pré-entraîné)
# ======================================================
try:
    print("🚀 Chargement du modèle de similarité (MiniLM)...")
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    print("✅ Modèle de similarité prêt !")
except Exception as e:
    print("❌ Erreur lors du chargement du modèle MiniLM :", e)
    model = None


# ======================================================
# 🔍 Fonction de comparaison de deux CV
# ======================================================
def compare_cvs(cv_text_1: str, cv_text_2: str):
   
    if not model:
        return {"error": "Modèle non initialisé"}

    try:
        emb1 = model.encode(cv_text_1, convert_to_tensor=True)
        emb2 = model.encode(cv_text_2, convert_to_tensor=True)

        similarity = util.cos_sim(emb1, emb2).item()

        if similarity > 0.9:
            verdict = "🚨 CV potentiellement copié ou généré automatiquement."
            status = "suspicious"
        elif similarity > 0.75:
            verdict = "⚠️ CV fortement inspiré d'un modèle existant."
            status = "partially_similar"
        else:
            verdict = "✅ CV original et unique."
            status = "authentic"

        return {
            "similarity_score": round(similarity, 3),
            "verdict": verdict,
            "status": status
        }

    except Exception as e:
        return {"error": str(e)}