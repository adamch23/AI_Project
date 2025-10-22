from transformers import pipeline

# ======================================================
# 🧠 Chargement du modèle IA pré-entraîné Facebook BART
# ======================================================
try:
    print("🚀 Chargement du modèle facebook/bart-large-mnli...")
    bart_model = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    print("✅ Modèle BART chargé avec succès.")
except Exception as e:
    print("❌ Erreur lors du chargement du modèle BART :", e)
    bart_model = None


def detect_anomalies(cv_text: str, predicted_category: str, spelling_score: float):
    """
    Analyse avancée du texte d’un CV :
    - Vérifie la qualité linguistique
    - Détecte absence de certificats si domaine technique
    - Évalue la cohérence sémantique (BART)
    - Identifie contenu générique / incohérent
    """

    anomalies = []

    # 1️⃣ Score orthographique faible
    if spelling_score < 70:
        anomalies.append("Faible qualité linguistique détectée (score < 70%)")

    # 2️⃣ CV trop court
    if len(cv_text.split()) < 100:
        anomalies.append("CV trop court (moins de 100 mots)")

    # 3️⃣ Absence de certificats pour domaine technique
    if "certificate" not in cv_text.lower() and predicted_category in ["Data Science", "AI", "Software Engineer"]:
        anomalies.append("Aucune certification détectée pour un domaine technique")

    # 4️⃣ Vérifie la cohérence sémantique (BART)
    if bart_model:
        labels = ["coherent", "incoherent", "fake", "authentic"]
        bart_result = bart_model(cv_text[:1500], candidate_labels=labels)

        predicted_label = bart_result["labels"][0]
        confidence = round(bart_result["scores"][0] * 100, 2)

        if predicted_label in ["incoherent", "fake"]:
            anomalies.append(f"Incohérence sémantique détectée ({predicted_label}, confiance {confidence}%)")
        elif predicted_label == "authentic" and confidence > 80:
            anomalies.append("Texte globalement cohérent et crédible.")

        bart_output = {
            "label": predicted_label,
            "confidence": confidence,
            "raw_result": bart_result,
        }
    else:
        bart_output = {"error": "Modèle BART non initialisé."}

    # 5️⃣ Détecte contenu trop générique
    if all(word not in cv_text.lower() for word in ["project", "experience", "responsible", "developed"]):
        anomalies.append("Contenu générique ou peu détaillé détecté")

    # 6️⃣ Calcule un score global de fraude
    fraud_score = 0
    fraud_score += (100 - spelling_score) * 0.4
    fraud_score += min(40, len(anomalies) * 10)
    if bart_model and "fake" in bart_output.get("label", "").lower():
        fraud_score += 20
    fraud_score = round(min(100, fraud_score), 2)

    # ✅ Retour final
    return {
        "is_fraudulent": fraud_score > 50,
        "fraud_score": fraud_score,
        "anomalies": anomalies if anomalies else ["RAS"],
        "bart_analysis": bart_output,
        "predicted_category": predicted_category,
    }