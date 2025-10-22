from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import spacy

# Charger le modèle français correct
nlp = spacy.load("fr_core_news_md")

# Liste de mots clés soft skills
SOFT_SKILLS_KEYWORDS = [
    "leadership", "communication", "teamwork", "gestion", 
    "organisation", "créativité", "adaptabilité", "autonomie", "empathie"
]

def extraire_soft_skills(description):
    """Extrait les soft skills depuis un texte"""
    doc = nlp(description.lower())
    skills = [token.text for token in doc if token.text in SOFT_SKILLS_KEYWORDS]
    return list(set(skills))

def recommander_candidats_avance(offre, candidats):
    """
    Recommande les candidats les plus proches de l'offre avec scoring avancé.
    """
    
    if not candidats:
        return []

    # Créer une liste de textes représentant les compétences
    docs = [" ".join(offre.get("competences_requises", []))] + [
        " ".join(c.get("competences", [])) for c in candidats
    ]

    # TF-IDF
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(docs)
    similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    recommandations = []
    for i, c in enumerate(candidats):
        # Score d'expérience
        experience_score = min(c.get("experience_years", 0) / 5, 1.0)
        
        # Score de soft skills
        soft_skills = extraire_soft_skills(" ".join(c.get("competences", [])))
        soft_skills_score = min(len(soft_skills) / 3, 1.0)

        # Score de similarité
        similarity_score = similarities[i] if i < len(similarities) else 0
        
        # ✅ NOUVEAU : Vérification de compétences correspondantes
        competences_offre = set(offre.get("competences_requises", []))
        competences_candidat = set(c.get("competences", []))
        competences_communes = competences_offre.intersection(competences_candidat)
        
        # Score final avec pondération
        score_final = (
            0.7 * similarity_score + 
            0.2 * experience_score + 
            0.1 * soft_skills_score
        )
        
        # ✅ CORRECTION : Conversion en pourcentage
        score_pourcentage = round(score_final * 100, 1)
        
        # ✅ NOUVEAU : Score de matching basique (compétences communes)
        matching_score = len(competences_communes) / max(len(competences_offre), 1)

        recommandations.append({
            "nom": c.get("nom", "Inconnu"),
            "poste": c.get("poste", "Inconnu"),
            "experience_years": c.get("experience_years", 0),
            "competences": c.get("competences", []),
            "soft_skills": soft_skills,
            "score_final": score_pourcentage,
            "matching_score": matching_score,  # ✅ Nouveau score de matching
            "competences_communes": list(competences_communes)  # ✅ Compétences communes
        })

    # ✅ CORRECTION AMÉLIORÉE : Filtrage intelligent
    # 1. D'abord filtrer par matching minimum
    candidats_filtres = [
        c for c in recommandations 
        if c["matching_score"] > 0.1 or c["score_final"] > 30  # Au moins 10% de matching OU score > 30%
    ]
    
    # 2. Ensuite trier par score final
    candidats_filtres = sorted(candidats_filtres, key=lambda x: x["score_final"], reverse=True)
    
    # 3. Si pas assez de candidats pertinents, retourner moins de résultats
    if len(candidats_filtres) < 3:
        # Prendre les 2-3 meilleurs même avec faible score
        return candidats_filtres[:3]
    
    return candidats_filtres[:5]  # Maximum 5 candidats pertinents
