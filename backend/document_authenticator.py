from transformers import (
    TrOCRProcessor,
    VisionEncoderDecoderModel,
    AutoImageProcessor,
    AutoModelForImageClassification,
)
from PIL import Image
import torch

# ======================================================
# 🧠 1️⃣ Initialisation des modèles
# ======================================================
print("🚀 Initialisation des modèles d'authentification de documents...")

# --- OCR (lecture de texte depuis image ou PDF) ---
try:
    ocr_processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
    ocr_model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-printed")
    print("✅ OCR (TrOCR) prêt.")
except Exception as e:
    print("❌ Erreur chargement OCR:", e)
    ocr_processor, ocr_model = None, None

# --- Détection falsification IA (images générées ou truquées) ---
try:
    forgery_processor = AutoImageProcessor.from_pretrained("umm-maybe/ai-image-detector")
    forgery_model = AutoModelForImageClassification.from_pretrained("umm-maybe/ai-image-detector")
    print("✅ Détecteur d'images truquées prêt.")
except Exception as e:
    print("❌ Erreur chargement du modèle de falsification:", e)
    forgery_processor, forgery_model = None, None


# ======================================================
# 📖 2️⃣ OCR : Extraction du texte
# ======================================================
def extract_text_from_image(image_path: str) -> str:
    if not ocr_model:
        return "Erreur: modèle OCR non initialisé."
    try:
        image = Image.open(image_path).convert("RGB")
        pixel_values = ocr_processor(images=image, return_tensors="pt").pixel_values
        generated_ids = ocr_model.generate(pixel_values)
        text = ocr_processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        return text.strip()
    except Exception as e:
        return f"Erreur OCR: {e}"


# ======================================================
# 🔍 3️⃣ Vérification texte OCR vs texte du CV
# ======================================================
def verify_certificate_text(cv_text: str, ocr_text: str):
    keywords = ["aws", "google", "ibm", "coursera", "microsoft", "udemy", "oracle", "linkedin"]
    matches = [k for k in keywords if k in ocr_text.lower() and k in cv_text.lower()]
    is_consistent = len(matches) > 0

    return {
        "matched_keywords": matches,
        "is_consistent": is_consistent,
        "verdict": "✅ Document cohérent avec le CV" if is_consistent else "🚨 Document douteux ou incohérent",
    }


# ======================================================
# 🧠 4️⃣ Détection d’images falsifiées / générées par IA
# ======================================================
def detect_forgery(image_path: str):
    if not forgery_model:
        return {"error": "Modèle de falsification non initialisé"}

    try:
        image = Image.open(image_path).convert("RGB")
        inputs = forgery_processor(images=image, return_tensors="pt")

        with torch.no_grad():
            outputs = forgery_model(**inputs)
            logits = outputs.logits
            predicted_class = logits.argmax(-1).item()
            score = torch.softmax(logits, dim=-1)[0][predicted_class].item()

        labels = forgery_model.config.id2label
        label = labels[predicted_class]

        return {
            "label": label,
            "confidence": round(score * 100, 2),
            "verdict": (
                "🚨 Document probablement falsifié / généré par IA"
                if "fake" in label.lower()
                else "✅ Document authentique"
            ),
        }
    except Exception as e:
        return {"error": str(e)}


# ======================================================
# 🔗 5️⃣ Pipeline complet (OCR + vérification + IA)
# ======================================================
def analyze_document_authenticity(cv_text: str, doc_path: str):
    ocr_text = extract_text_from_image(doc_path)
    text_verif = verify_certificate_text(cv_text, ocr_text)
    image_verif = detect_forgery(doc_path)

    return {
        "ocr_text": ocr_text,
        "text_verification": text_verif,
        "image_verification": image_verif,
    }