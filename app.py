# app.py
from flask import Flask, request, jsonify
from pymongo import MongoClient
from transformers import pipeline
import torch
from flask_cors import CORS
from datetime import datetime
import random
import io

# Import your CV analyzer
from aisummary import cv_analyzer

app = Flask(__name__)
CORS(app)

# --- MongoDB connection with proper error handling ---
try:
    client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=5000)
    # Test the connection
    client.admin.command('ismaster')
    db = client.emailDB
    emails_collection = db.emails
    cv_analyses_collection = db.cv_analyses  # New collection for CV analyses
    print("✅ MongoDB connected successfully!")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    print("⚠️  Running without database - data will not be saved")
    emails_collection = None
    cv_analyses_collection = None

# --- Load the AI model ---
print("🔄 Loading AI model...")
try:
    # Use a model better suited for email generation
    generator = pipeline(
        'text-generation',
        model='gpt2',
        torch_dtype=torch.float32
    )
    print("✅ GPT2 AI model loaded successfully!")
except Exception as e:
    print(f"❌ GPT2 failed: {e}")
    try:
        generator = pipeline(
            'text-generation',
            model='microsoft/DialoGPT-small',
            torch_dtype=torch.float32
        )
        print("✅ Fallback to DialoGPT-small")
    except Exception as e2:
        print(f"❌ All models failed: {e2}")
        generator = None

import requests

def generate_jd_ollama(job_title, department, skills, experience, location_type, model="mistral"):
    """Use local Ollama with optimized settings"""
    
    prompt = f"""
    Create a professional job description for a {experience}-level {job_title} in {department}.
    Skills: {', '.join(skills)}
    Location: {location_type}
    
    Format with:
    - Position summary
    - Key responsibilities (5 bullet points)
    - Required qualifications
    - What we offer
    
    Keep it concise and professional.
    """
    
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "top_k": 40,
            "num_predict": 800,  # Limit output length
            "seed": 42
        }
    }
    
    try:
        print(f"🔍 Generating JD with {model}...")
        # Increased timeout from 30 to 120 seconds
        response = requests.post("http://localhost:11434/api/generate", json=payload, timeout=120)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ AI generation successful!")
            return result['response']
        else:
            print(f"❌ API error: {response.status_code}")
            return generate_fallback_jd(job_title, department, skills, experience, location_type)
            
    except requests.exceptions.Timeout:
        print("❌ Ollama timeout - model is too slow")
        return generate_fallback_jd(job_title, department, skills, experience, location_type)
    except Exception as e:
        print(f"❌ Ollama error: {e}")
        return generate_fallback_jd(job_title, department, skills, experience, location_type)
    
def generate_fallback_jd(job_title, department, skills, experience, location_type):
    """Enhanced fallback template"""
    
    experience_years = {
        'entry': '0-2 years',
        'junior': '1-3 years', 
        'mid': '3-5 years',
        'senior': '5-8 years',
        'lead': '8+ years'
    }.get(experience.lower(), '3-5 years')
    
    return f"""
JOB TITLE: {job_title}
DEPARTMENT: {department}
LOCATION: {location_type.title()}
EXPERIENCE: {experience}

POSITION SUMMARY:
We are looking for a {experience} {job_title} to join our {department} team. The ideal candidate will have expertise in {', '.join(skills[:3]) if skills else 'relevant technologies'} and thrive in a {location_type} work environment.

KEY RESPONSIBILITIES:
• Develop and implement {department.lower()} strategies and solutions
• Collaborate with team members to achieve project objectives
• {f"Utilize {', '.join(skills[:2])} to deliver high-quality results" if skills else "Apply technical expertise to solve complex problems"}
• Participate in cross-functional initiatives and meetings
• Contribute to continuous improvement and innovation

REQUIRED QUALIFICATIONS:
• {experience_years} of experience in {department.lower()} or related field
• {f"Proficiency with {', '.join(skills)}" if skills else "Strong technical skills in relevant areas"}
• Excellent communication and collaboration abilities
• Ability to work effectively in a {location_type} environment

WHAT WE OFFER:
• Competitive salary and comprehensive benefits package
• {location_type.title()} work arrangement with modern tools
• Professional development and growth opportunities
• Supportive, collaborative team culture
"""

# Your main endpoint should use Ollama directly
@app.route('/generate-job-description', methods=['POST'])
def generate_job_description():
    """Generate job description using Ollama AI"""
    try:
        data = request.json or {}
        
        job_title = data.get('jobTitle', 'Software Engineer')
        department = data.get('department', 'Engineering')
        skills = data.get('skills', [])
        experience = data.get('experience', 'Mid-Level')
        location_type = data.get('location', 'remote')
        
        print(f"🎯 Generating JD for: {job_title} using Ollama")
        
        # Use Ollama directly for the entire JD
        jd_text = generate_jd_ollama(job_title, department, skills, experience, location_type)

        return jsonify({
            "status": "success",
            "job_description": jd_text,
            "source": "ollama_ai"
        })
        
    except Exception as e:
        print(f"❌ JD Generation Error: {e}")
        return jsonify({
            "status": "error", 
            "message": f"Failed to generate job description: {str(e)}"
        })

def generate_ai_summary(job_title, department, experience):
    """Use AI only for the summary section."""
    if generator:
        try:
            prompt = f"Write a 2-sentence job summary for a {experience} {job_title} in {department}:"
            result = generator(prompt, max_new_tokens=50, temperature=0.7)
            text = result[0]['generated_text'].replace(prompt, '').strip()
            # Basic cleaning
            text = text.split('.')[0] + '.' if '.' in text else text
            return text
        except:
            pass
    
    # Fallback summary
    return f"We are seeking a {experience.lower()} {job_title} to join our {department} team. This role offers exciting opportunities for professional growth and meaningful impact."

def get_experience_text(experience):
    exp_map = {
        'intern': 'Currently pursuing relevant education',
        'junior': '1-3 years of experience',
        'mid': '3-5 years of professional experience', 
        'senior': '5+ years of demonstrated experience',
        'lead': '7+ years of leadership experience'
    }
    return exp_map.get(experience.lower(), 'Relevant professional experience')

# --- CV Analysis Endpoints ---
@app.route('/analyze-cv', methods=['POST'])
def analyze_cv():
    """Analyze uploaded CV and provide structured insights."""
    try:
        # Check if file is provided
        if 'file' not in request.files:
            return jsonify({"status": "error", "message": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"status": "error", "message": "No file selected"}), 400
        
        # Get position from form data
        position = request.form.get('position', 'Software Engineer')
        candidate_name = request.form.get('candidate_name', 'Candidate')
        
        print(f"📄 Analyzing CV for {candidate_name} - Position: {position}")
        
        # Process the CV file
        analysis_result, error = cv_analyzer.process_cv_file(
            file.stream, 
            file.filename, 
            position
        )
        
        if error:
            return jsonify({"status": "error", "message": error}), 400
        
        # Save to MongoDB if available
        if cv_analyses_collection is not None:
            cv_record = {
                "candidate_name": candidate_name,
                "position": position,
                "filename": file.filename,
                "analysis": analysis_result['cv_analysis'],
                "text_sample": analysis_result['text_sample'],
                "created_at": datetime.now()
            }
            cv_analyses_collection.insert_one(cv_record)
        
        return jsonify({
            "status": "success",
            "candidate_name": candidate_name,
            "position": position,
            "filename": file.filename,
            "analysis": analysis_result['cv_analysis'],
            "text_sample": analysis_result['text_sample'],
            "saved_to_db": cv_analyses_collection is not None
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/generate-email-with-analysis', methods=['POST'])
def generate_email_with_analysis():
    """Generate email using CV analysis for personalized content."""
    try:
        data = request.json or {}
        
        email_type = data.get("type", "invitation")
        candidate_name = data.get("name", "Candidate")
        position = data.get("position", "Software Engineer")
        language = data.get("language", "EN")
        tone = data.get("tone", "professional")
        cv_analysis = data.get("cv_analysis", "")  # CV analysis from previous step
        
        print(f"📧 Generating {email_type} email for {candidate_name} with CV insights...")
        
        # Generate email using CV analysis for personalization
        email_text = generate_personalized_email(
            candidate_name, 
            position, 
            email_type, 
            language, 
            tone,
            cv_analysis
        )

        # Save to MongoDB if available
        if emails_collection is not None:
            email_record = {
                "candidate_name": candidate_name,
                "position": position,
                "type": email_type,
                "language": language,
                "tone": tone,
                "cv_analysis_used": bool(cv_analysis),
                "email_text": email_text,
                "created_at": datetime.now(),
                "responded": False
            }
            emails_collection.insert_one(email_record)

        return jsonify({
            "status": "success",
            "candidate": candidate_name,
            "position": position,
            "email_type": email_type,
            "tone": tone,
            "email": email_text,
            "personalized_with_cv": bool(cv_analysis),
            "saved_to_db": emails_collection is not None
        })
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

def generate_personalized_email(candidate_name, position, email_type, language, tone, cv_analysis):
    """Generate HR email personalized with CV analysis insights."""
    
    # Tone-specific instructions
    tone_instructions = {
        "professional": "Keep the tone professional, formal, and business-appropriate.",
        "formal": "Use a very formal, corporate tone with proper business etiquette.",
        "friendly": "Use a warm, friendly tone while maintaining professionalism."
    }
    
    # Base CV insights for personalization
    cv_insights = ""
    if cv_analysis:
        cv_insights = f"""
        
Based on the candidate's CV analysis:
{cv_analysis[:1000]}  # Limit analysis length
        
Use relevant insights from above to personalize this email.
        """
    
    # Type-specific content guidance with CV personalization
    type_guidance = {
        "invitation": f"""
Create a personalized interview invitation email for {candidate_name} for the {position} position.
{cv_insights}
Include: expression of interest, specific positive notes from their background, invitation to interview, scheduling options, and next steps.
{tone_instructions.get(tone, tone_instructions['professional'])}
Make it personalized but concise.
        """,
        
        "rejection": f"""
Create a job rejection email for {candidate_name} who applied for {position}.
{cv_insights}
Include: thank you for applying, acknowledge their specific strengths, polite rejection message, encouragement for future opportunities.
{tone_instructions.get(tone, tone_instructions['professional'])}
Be respectful and constructive.
        """,
        
        "follow-up": f"""
Create a follow-up email to {candidate_name} about their {position} application.
{cv_insights}
Include: check on continued interest, reference specific relevant experience, request for availability updates, offer for questions.
{tone_instructions.get(tone, tone_instructions['professional'])}
        """
    }
    
    prompt = type_guidance.get(email_type, type_guidance["invitation"]).strip()
    
    try:
        if generator is not None:
            # Generate with parameters optimized for email content
            result = generator(
                prompt,
                max_new_tokens=400,
                temperature=0.85,
                do_sample=True,
                top_p=0.92,
                repetition_penalty=1.2,
                pad_token_id=50256,
                no_repeat_ngram_size=2,
                early_stopping=True
            )
            
            generated_text = result[0]['generated_text']
            
            # Clean the generated text
            cleaned_text = smart_clean_email(generated_text, prompt, candidate_name, position, email_type, tone)
                
            return cleaned_text.strip()
        else:
            return "AI model not loaded."
        
    except Exception as e:
        return f"AI generation failed: {str(e)}"

# --- Keep your existing email generation function for backward compatibility ---
def generate_hr_email(candidate_name, position, email_type, language="EN", tone="professional"):
    """Original email generation function without CV analysis."""
    
    tone_instructions = {
        "professional": "Keep the tone professional, formal, and business-appropriate.",
        "formal": "Use a very formal, corporate tone with proper business etiquette.",
        "friendly": "Use a warm, friendly tone while maintaining professionalism."
    }
    
    type_guidance = {
        "invitation": f"""
Create an interview invitation email for {candidate_name} for the {position} position.
Include: expression of interest, invitation to interview, scheduling options, and next steps.
{tone_instructions.get(tone, tone_instructions['professional'])}
        """,
        
        "rejection": f"""
Create a job rejection email for {candidate_name} who applied for {position}.
Include: thank you for applying, polite rejection message, encouragement for future opportunities.
{tone_instructions.get(tone, tone_instructions['professional'])}
        """,
        
        "follow-up": f"""
Create a follow-up email to {candidate_name} about their {position} application.
Include: check on continued interest, request for availability updates, offer for questions.
{tone_instructions.get(tone, tone_instructions['professional'])}
        """
    }
    
    prompt = type_guidance.get(email_type, type_guidance["invitation"]).strip()
    
    try:
        if generator is not None:
            result = generator(
                prompt,
                max_new_tokens=400,
                temperature=0.85,
                do_sample=True,
                top_p=0.92,
                repetition_penalty=1.2,
                pad_token_id=50256,
                no_repeat_ngram_size=2,
                early_stopping=True
            )
            
            generated_text = result[0]['generated_text']
            cleaned_text = smart_clean_email(generated_text, prompt, candidate_name, position, email_type, tone)
                
            return cleaned_text.strip()
        else:
            return "AI model not loaded."
        
    except Exception as e:
        return f"AI generation failed: {str(e)}"

# --- Keep your existing utility functions ---
def smart_clean_email(text, prompt, candidate_name, position, email_type, tone):
    """Intelligently clean AI output while preserving good content."""
    import re
    
    if text.startswith(prompt):
        text = text[len(prompt):].strip()
    
    bad_patterns = [
        r'http\S+',
        r'www\.\S+',
        r'@\S+\.com',
        r'medium\.com',
        r'time off work',
        r'interesting as hell',
        r"can't do much",
        r'extra training\?',
        r'fuck|shit|damn|hell|wtf',
    ]
    
    for pattern in bad_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    
    lines = text.split('\n')
    valid_lines = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if (len(line) < 5 or 
            line.count('.com') > 1 or
            'pj.com' in line.lower() or
            line.isupper() or
            any(word in line.lower() for word in ['lorem', 'ipsum', 'test test'])):
            continue
            
        valid_lines.append(line)
    
    cleaned_text = '\n'.join(valid_lines)
    
    if (len(cleaned_text) > 100 and 
        any(keyword in cleaned_text.lower() for keyword in ['dear', 'thank', 'regards', 'sincerely', 'hello', 'hi ' + candidate_name.lower()])):
        return cleaned_text
    
    return generate_minimal_fallback(candidate_name, position, email_type, tone)

def generate_minimal_fallback(candidate_name, position, email_type, tone):
    """Generate a simple, appropriate email when AI fails badly."""
    
    greetings = {
        "professional": "Dear",
        "formal": "Dear",
        "friendly": "Hi"
    }
    
    greeting = greetings.get(tone, "Dear")
    
    base_content = {
        "invitation": f"{greeting} {candidate_name},\n\nThank you for your application for the {position} position. We would like to invite you for an interview. Please reply with your availability.\n\nBest regards,\nHR Team",
        
        "rejection": f"{greeting} {candidate_name},\n\nThank you for applying for the {position} role. After careful consideration, we have decided to move forward with other candidates.\n\nWe appreciate your interest.\n\nSincerely,\nHR Department",
        
        "follow-up": f"{greeting} {candidate_name},\n\nI'm following up on your application for the {position} position. Are you still interested and available?\n\nPlease let us know.\n\nBest,\nHR Team"
    }
    
    return base_content.get(email_type, base_content["invitation"])

# --- Updated API Endpoints ---
@app.route('/generate-email', methods=['POST'])
def generate_email():
    """Original email generation endpoint (backward compatible)."""
    try:
        data = request.json or {}
        
        email_type = data.get("type", "invitation")
        candidate_name = data.get("name", "Candidate")
        position = data.get("position", "Software Engineer")
        language = data.get("language", "EN")
        tone = data.get("tone", "professional")

        print(f"📧 Generating {email_type} email for {candidate_name}...")
        
        email_text = generate_hr_email(candidate_name, position, email_type, language, tone)

        if emails_collection is not None:
            email_record = {
                "candidate_name": candidate_name,
                "position": position,
                "type": email_type,
                "language": language,
                "tone": tone,
                "email_text": email_text,
                "created_at": datetime.now(),
                "responded": False
            }
            emails_collection.insert_one(email_record)

        return jsonify({
            "status": "success",
            "candidate": candidate_name,
            "position": position,
            "email_type": email_type,
            "tone": tone,
            "email": email_text,
            "saved_to_db": emails_collection is not None
        })
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/cv-analyses', methods=['GET'])
def list_cv_analyses():
    """List all saved CV analyses from MongoDB"""
    try:
        if cv_analyses_collection is not None:
            analyses = list(cv_analyses_collection.find({}, {'_id': 0}).limit(10))
            return jsonify({
                "status": "success",
                "count": len(analyses),
                "analyses": analyses
            })
        else:
            return jsonify({
                "status": "success",
                "message": "MongoDB not connected",
                "analyses": []
            })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/test', methods=['GET'])
def test():
    db_status = "connected" if emails_collection is not None else "disconnected"
    ai_status = "available" if generator is not None else "unavailable"
    cv_analyzer_status = "loaded" if cv_analyzer.generator is not None else "failed"
    
    return jsonify({
        "status": "Server is running!",
        "database": db_status,
        "ai_model": ai_status,
        "cv_analyzer": cv_analyzer_status,
        "endpoints": {
            "POST /generate-job-description": "Generate job descriptions",
            "POST /analyze-cv": "Analyze CV/PDF files",
            "POST /generate-email": "Generate HR emails",
            "POST /generate-email-with-analysis": "Generate personalized emails with CV insights",
            "GET /test": "Test endpoint",
            "GET /quick-demo": "Quick demo",
            "GET /email-types": "List available email types",
            "GET /emails": "List all saved emails",
            "GET /cv-analyses": "List all saved CV analyses"
        }
    })

@app.route('/quick-demo', methods=['GET'])
def quick_demo():
    """Quick demo with all email types"""
    demo_emails = {}
    
    for email_type in ["invitation", "rejection", "follow-up"]:
        demo_email = generate_hr_email(
            "Emily Watson",
            "Frontend Developer", 
            email_type,
            "EN",
            "professional"
        )
        demo_emails[email_type] = demo_email
    
    return jsonify({
        "status": "success",
        "demo": "Sample emails generated successfully!",
        "emails": demo_emails
    })

@app.route('/email-types', methods=['GET'])
def email_types():
    """List available email types and their purposes"""
    return jsonify({
        "available_types": {
            "invitation": "Interview invitation email",
            "rejection": "Job application rejection email", 
            "follow-up": "Follow-up email to check candidate interest"
        },
        "available_tone": ["professional", "formal", "friendly"]
    })

@app.route('/emails', methods=['GET'])
def list_emails():
    """List all saved emails from MongoDB"""
    try:
        if emails_collection is not None:
            emails = list(emails_collection.find({}, {'_id': 0}).limit(10))
            return jsonify({
                "status": "success",
                "count": len(emails),
                "emails": emails
            })
        else:
            return jsonify({
                "status": "success",
                "message": "MongoDB not connected",
                "emails": []
            })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 HR Email Generator & CV Analyzer API Starting...")
    print("📍 Available Endpoints:")
    print("   POST http://localhost:5000/generate-job-description")
    print("   POST http://localhost:5000/analyze-cv")
    print("   POST http://localhost:5000/generate-email") 
    print("   POST http://localhost:5000/generate-email-with-analysis")
    print("   GET  http://localhost:5000/test")
    print("   GET  http://localhost:5000/quick-demo")
    print("   GET  http://localhost:5000/email-types")
    print("   GET  http://localhost:5000/emails")
    print("   GET  http://localhost:5000/cv-analyses")
    print("="*60)
    
    # Test connections on startup
    if emails_collection is not None:
        print("🗄️  MongoDB: Connected and ready")
    else:
        print("⚠️  MongoDB: Not connected - running in memory-only mode")
    
    print(f"🤖 AI Model: {'Loaded' if generator else 'Not available'}")
    print(f"📄 CV Analyzer: {'Ready' if cv_analyzer.generator else 'Not available'}")
    
    app.run(debug=True, port=5000)