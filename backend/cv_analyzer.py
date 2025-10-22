import re
from .spell_checker import analyze_text_quality
from .certificate_checker import verify_certificates_from_text
from PyPDF2 import PdfReader

def extract_text_from_pdf(pdf_path: str) -> str:
    """Lit le texte brut d’un fichier PDF."""
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

def analyze_cv(cv_path: str, candidate_name: str):
    """
    Analyse complète du CV :
    1️⃣ Vérifie orthographe/grammaire
    2️⃣ Détecte la section des certifications
    3️⃣ Vérifie leur authenticité
    """
    text = extract_text_from_pdf(cv_path)
    text_lower = text.lower()

    # Étape 1 : Analyse orthographique
    spelling_report = analyze_text_quality(text)

    # Étape 2 : Recherche de la section "certifications"
    certification_block = None
    match = re.search(r"(certifications?|certificats?|certificate)", text_lower)
    if match:
        certification_block = text[match.start(): match.start() + 800]

    # Étape 3 : Vérification simulée
    certif_report = []
    if certification_block:
        certif_report = verify_certificates_from_text(certification_block, candidate_name)

    return {
        "raw_text": text,
        "spelling_analysis": spelling_report,
        "certificate_verification": certif_report
    }