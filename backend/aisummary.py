# aisummary.py (updated)
import PyPDF2
import pdfplumber
import docx
import re
from transformers import pipeline

class CVAnalyzer:
    def __init__(self):
        self.summarizer = None
        self.generator = None
        self.load_models()
    
    def load_models(self):
        """Load AI models for CV analysis."""
        try:
            # Use smaller models for better performance
            self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
            self.generator = pipeline("text-generation", model="gpt2")
            print("✅ CV Analysis models loaded successfully!")
        except Exception as e:
            print(f"❌ CV model loading failed: {e}")
            # Fallback to simpler approach if models fail
            self.generator = None
    
    def extract_text_from_pdf(self, file_stream):
        """Extract text from PDF files with multiple fallbacks."""
        try:
            text = ""
            # Try pdfplumber first (better for text extraction)
            with pdfplumber.open(file_stream) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            
            # If pdfplumber didn't get much text, try PyPDF2 as fallback
            if len(text.strip()) < 50:
                file_stream.seek(0)  # Reset stream
                pdf_reader = PyPDF2.PdfReader(file_stream)
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            
            return text.strip()
        except Exception as e:
            print(f"PDF extraction error: {e}")
            return ""
    
    def extract_text_from_docx(self, file_stream):
        """Extract text from DOCX files."""
        try:
            doc = docx.Document(file_stream)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            print(f"DOCX extraction error: {e}")
            return ""
    
    def clean_cv_text(self, text):
        """Clean and preprocess CV text."""
        if not text:
            return ""
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s.,!?;:()\-]', '', text)
        return text.strip()
    
    def analyze_cv(self, cv_text, position):
        """Use AI to analyze CV and generate smart summary."""
        try:
            if not self.generator:
                return self._generate_basic_analysis(cv_text, position)
            
            # Limit text length to avoid token limits
            cv_preview = cv_text[:1500]  # Reduced for GPT2 limits
            
            analysis_prompt = f"""
Analyze this CV for a {position} position:

CV: {cv_preview}

Provide structured analysis:
KEY SKILLS: [Top relevant skills]
EXPERIENCE: [Career summary]  
STRENGTHS: [Main advantages]
CONCERNS: [Any gaps]
INTERVIEW FOCUS: [What to explore]
"""
            
            result = self.generator(
                analysis_prompt,
                max_new_tokens=300,  # Reduced for GPT2
                temperature=0.3,
                do_sample=True,
                repetition_penalty=1.2
            )
            
            analysis = result[0]['generated_text']
            if analysis.startswith(analysis_prompt):
                analysis = analysis[len(analysis_prompt):].strip()
                
            return analysis
            
        except Exception as e:
            print(f"CV analysis error: {e}")
            return self._generate_basic_analysis(cv_text, position)
    
    def _generate_basic_analysis(self, cv_text, position):
        """Generate basic analysis when AI model fails."""
        # Simple keyword-based analysis as fallback
        text_lower = cv_text.lower()
        
        skills_found = []
        for skill in ['python', 'java', 'javascript', 'react', 'sql', 'aws', 'docker', 'kubernetes']:
            if skill in text_lower:
                skills_found.append(skill)
        
        experience_years = "Not specified"
        if 'year' in text_lower or 'years' in text_lower:
            experience_years = "Experience mentioned"
        
        return f"""
KEY SKILLS: {', '.join(skills_found) if skills_found else 'Various technical skills'}
EXPERIENCE: Candidate with {experience_years} of professional experience
STRENGTHS: Relevant background for {position} role
CONCERNS: Review specific experience matches
INTERVIEW FOCUS: Discuss technical skills and project experience
"""
    
    def generate_email_advice(self, cv_analysis, candidate_name, position, email_type):
        """Generate smart email advice based on CV analysis."""
        try:
            if not self.generator:
                return "Focus on relevant experience and skills mentioned in CV."
            
            advice_prompt = f"""
Based on CV analysis for {candidate_name} ({position}), provide email advice for {email_type}:

ANALYSIS: {cv_analysis}

Advice on:
- Key strengths to highlight
- Areas to address  
- Tone recommendations
- Specific points to mention

Email Advice:
"""
            
            result = self.generator(
                advice_prompt,
                max_new_tokens=200,
                temperature=0.7,
                do_sample=True
            )
            
            advice = result[0]['generated_text']
            if advice.startswith(advice_prompt):
                advice = advice[len(advice_prompt):].strip()
                
            return advice
            
        except Exception as e:
            return f"Focus on candidate's relevant experience and skills."
    
    def process_cv_file(self, file, filename, position):
        """Main function to process CV file and return analysis."""
        # Extract text based on file type
        cv_text = ""
        
        if filename.lower().endswith('.pdf'):
            cv_text = self.extract_text_from_pdf(file)
        elif filename.lower().endswith(('.docx', '.doc')):
            cv_text = self.extract_text_from_docx(file)
        else:
            return None, "Unsupported file type. Use PDF or DOCX."
        
        if not cv_text:
            return None, "Could not extract text from CV"
        
        # Clean and analyze CV
        cleaned_text = self.clean_cv_text(cv_text)
        cv_analysis = self.analyze_cv(cleaned_text, position)
        
        return {
            'cv_analysis': cv_analysis,
            'text_sample': cleaned_text[:500] + '...' if len(cleaned_text) > 500 else cleaned_text,
            'original_text': cleaned_text
        }, None

# Create global instance
cv_analyzer = CVAnalyzer()