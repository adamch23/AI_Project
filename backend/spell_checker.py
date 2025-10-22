# text_quality.py - Version corrigée
import requests
import subprocess
import time

# ======================================================
# 🧠 Démarre le serveur Java LanguageTool local
# ======================================================
def start_local_languagetool_server():
    try:
        # Vérifie si déjà en ligne
        try:
            r = requests.get("http://127.0.0.1:8081/v2/check", params={"text": "test"})
            if r.status_code == 400:  # LanguageTool retourne 400 pour les requêtes sans texte valide
                print("✅ Serveur LanguageTool déjà actif.")
                return
        except requests.exceptions.ConnectionError:
            pass
        # Démarrer le serveur
        LT_PATH = r"D:\project IA\LanguageTool-6.6\LanguageTool-6.6"
        subprocess.Popen(
            [
                "java", "-cp", f"{LT_PATH}\\languagetool.jar",
                "org.languagetool.server.HTTPServer",
                "--port", "8081", "--allow-origin", "*"
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        print("🚀 Serveur Java LanguageTool démarré sur http://127.0.0.1:8081")
        time.sleep(5)  # Donner plus de temps pour le démarrage
    except Exception as e:
        print("❌ Erreur lors du démarrage de LanguageTool local :", e)

# ======================================================
# 🔍 Fonction d'analyse du texte via API HTTP locale
# ======================================================
def analyze_text_quality(text: str, lang: str = "en-US"):
    """Analyse la qualité linguistique d'un texte avec LanguageTool"""
    start_local_languagetool_server()

    url = "http://127.0.0.1:8081/v2/check"
    payload = {"language": lang, "text": text}

    try:
        response = requests.post(url, data=payload, timeout=30)
        if response.status_code != 200:
            return {
                "nb_errors": 0,
                "error_rate": 0,
                "quality_score": 0,
                "examples": [f"Erreur serveur {response.status_code}"],
            }

        result = response.json()
        matches = result.get("matches", [])
        nb_errors = len(matches)
        total_words = len(text.split()) or 1
        error_rate = (nb_errors / total_words) * 100
        score = max(0, 100 - min(error_rate, 100))  # Limiter à 100%
        examples = [m.get("message", "Erreur inconnue") for m in matches[:3]] if matches else ["Aucune erreur détectée."]

        return {
            "nb_errors": nb_errors,
            "error_rate": round(error_rate, 2),
            "quality_score": round(score, 2),
            "examples": examples,
        }

    except Exception as e:
        print("❌ Erreur lors de l'analyse du texte :", e)
        return {
            "nb_errors": 0,
            "error_rate": 0,
            "quality_score": 0,
            "examples": [str(e)],
        }