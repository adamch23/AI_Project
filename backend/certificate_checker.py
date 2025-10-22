import re
import requests

def detect_platforms(text: str):
    """Détecte les plateformes mentionnées."""
    platforms = ["google", "aws", "coursera", "microsoft", "linkedin", "udemy", "ibm"]
    found = [p for p in platforms if p in text.lower()]
    return found

def verify_certificates_from_text(text: str, candidate_name: str):
    """
    Pour chaque plateforme détectée, tente une vérification via API publique.
    (Simulé ici pour exemple)
    """
    results = []
    found_platforms = detect_platforms(text)

    for platform in found_platforms:
        # 👉 Simulation d'appel API
        # En vrai : faire requête à leur endpoint public (ex: Coursera Catalog API)
        response = f"✅ Certificat {platform} trouvé pour {candidate_name}" \
            if candidate_name.lower() in text.lower() else \
            f"⚠️ {platform.title()} mentionné mais aucun certificat vérifié."

        results.append({
            "platform": platform,
            "verified": candidate_name.lower() in text.lower(),
            "message": response,
        })
    return results