import os
from PyPDF2 import PdfReader
import docx
from flask import Flask, request, render_template_string
import webbrowser
from threading import Timer
import requests

# Configure Hugging Face API
HF_API_KEY = "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"
HF_API_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create uploads folder if it doesn't exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>CV Analyzer with AI</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 800px;
            width: 100%;
        }
        h1 {
            color: #667eea;
            text-align: center;
            margin-bottom: 10px;
            font-size: 2em;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
        }
        .upload-area {
            border: 3px dashed #667eea;
            border-radius: 15px;
            padding: 50px;
            text-align: center;
            transition: all 0.3s;
            cursor: pointer;
            background: #f8f9ff;
        }
        .upload-area:hover {
            border-color: #764ba2;
            background: #f0f2ff;
        }
        .upload-area.dragover {
            border-color: #764ba2;
            background: #e8ebff;
            transform: scale(1.02);
        }
        .upload-icon {
            font-size: 60px;
            margin-bottom: 20px;
        }
        input[type="file"] {
            display: none;
        }
        .file-label {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 30px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: transform 0.2s;
        }
        .file-label:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }
        .file-name {
            margin-top: 20px;
            font-style: italic;
            color: #667eea;
            font-weight: bold;
        }
        .submit-btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 30px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 20px;
            transition: all 0.3s;
        }
        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }
        .submit-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .result-container {
            margin-top: 30px;
            padding: 25px;
            background: #f8f9ff;
            border-radius: 15px;
            border-left: 5px solid #667eea;
        }
        .result-container h2 {
            color: #667eea;
            margin-bottom: 15px;
        }
        .result-container pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            line-height: 1.6;
            color: #333;
        }
        .loader {
            border: 5px solid #f3f3f3;
            border-top: 5px solid #667eea;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
            display: none;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .info-box {
            background: #e8f4fd;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .back-btn {
            display: inline-block;
            padding: 10px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 20px;
            margin-top: 20px;
            transition: all 0.3s;
        }
        .back-btn:hover {
            background: #764ba2;
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎓 CV Analyzer</h1>
        <p class="subtitle">Powered by Hugging Face AI 🤗</p>
       
        {% if result %}
            <div class="result-container">
                <h2>✨ Analysis Results</h2>
                <pre>{{ result }}</pre>
                <a href="/" class="back-btn">📄 Analyze Another CV</a>
            </div>
        {% else %}
            <div class="info-box">
                <strong>📌 Supported formats:</strong> PDF, DOCX (Word)<br>
                <strong>🌍 Languages:</strong> English & French<br>
                <strong>🤖 Model:</strong> Mixtral-8x7B (Free & Powerful)
            </div>
           
            <form method="POST" enctype="multipart/form-data" id="uploadForm">
                <div class="upload-area" id="uploadArea" onclick="document.getElementById('fileInput').click()">
                    <div class="upload-icon">📁</div>
                    <label for="fileInput" class="file-label">
                        Choose Your CV
                    </label>
                    <input type="file" name="file" id="fileInput" accept=".pdf,.docx" required onchange="updateFileName()">
                    <div class="file-name" id="fileName"></div>
                </div>
               
                <div class="loader" id="loader"></div>
               
                <button type="submit" class="submit-btn" id="submitBtn" disabled>
                    🚀 Analyze CV
                </button>
            </form>
        {% endif %}
    </div>

    <script>
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const submitBtn = document.getElementById('submitBtn');
        const uploadForm = document.getElementById('uploadForm');
        const loader = document.getElementById('loader');

        function updateFileName() {
            const fileName = fileInput.files[0]?.name;
            if (fileName) {
                document.getElementById('fileName').textContent = '✓ Selected: ' + fileName;
                submitBtn.disabled = false;
            }
        }

        // Drag and drop functionality
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                updateFileName();
            }
        });

        uploadForm.addEventListener('submit', () => {
            loader.style.display = 'block';
            submitBtn.textContent = '⏳ Analyzing... (may take 30-60 seconds)';
            submitBtn.disabled = true;
        });
    </script>
</body>
</html>
"""

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF file"""
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        return f"Error reading PDF: {e}"

def extract_text_from_docx(docx_path):
    """Extract text from DOCX file"""
    try:
        doc = docx.Document(docx_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        return f"Error reading DOCX: {e}"

def extract_cv_text(file_path):
    """Extract text from CV file (PDF or DOCX)"""
    if file_path.lower().endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    elif file_path.lower().endswith('.docx'):
        return extract_text_from_docx(file_path)
    else:
        return "Unsupported file format. Please use PDF or DOCX."

def generate_cv_summary(cv_text):
    """Generate summary using Hugging Face API"""
    try:
        headers = {
            "Authorization": f"Bearer {HF_API_KEY}",
            "Content-Type": "application/json"
        }
       
        prompt = f"""<s>[INST] You are a professional CV analyst. Analyze the following CV and provide a comprehensive summary in both English and French.

Please extract and organize:
1. Personal Information (Name, Contact)
2. Professional Summary
3. Key Skills (technical and soft skills)
4. Work Experience (roles, companies, duration, achievements)
5. Education
6. Certifications (if any)

Then generate:
- A professional summary highlighting the candidate's strengths
- Key competencies list
- Career highlights

CV Content:
{cv_text[:3000]}

Provide the response in a well-structured format. [/INST]"""
       
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 1500,
                "temperature": 0.7,
                "top_p": 0.95,
                "return_full_text": False
            }
        }
       
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=120)
       
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                return result[0].get('generated_text', 'No response generated')
            return str(result)
        elif response.status_code == 503:
            return """
⏳ MODEL LOADING

The AI model is currently loading. This can take 20-60 seconds on first use.

🔄 Please wait a moment and try again!

The model will be ready for instant responses after the first load.
            """
        else:
            return f"Error: API returned status code {response.status_code}\n{response.text}"
           
    except requests.exceptions.Timeout:
        return """
⏰ REQUEST TIMEOUT

The request took too long. This can happen when:
- The model is loading for the first time
- The CV is very long

💡 Try again in a few moments!
        """
    except Exception as e:
        return f"Error generating summary: {str(e)}"

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            return render_template_string(HTML_TEMPLATE, result=None, error="No file uploaded")
       
        file = request.files['file']
       
        if file.filename == '':
            return render_template_string(HTML_TEMPLATE, result=None, error="No file selected")
       
        if file:
            filename = file.filename
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
           
            # Extract text
            cv_text = extract_cv_text(filepath)
           
            # Generate summary
            summary = generate_cv_summary(cv_text)
           
            # Clean up uploaded file
            os.remove(filepath)
           
            return render_template_string(HTML_TEMPLATE, result=summary)
   
    return render_template_string(HTML_TEMPLATE, result=None)

def open_browser():
    webbrowser.open('http://127.0.0.1:5000/')

if __name__ == '__main__':
    print("=" * 60)
    print("🎓 CV ANALYZER WITH HUGGING FACE AI")
    print("=" * 60)
    print("\n🌐 Starting web server...")
    print("📱 Opening browser at: http://127.0.0.1:5000/")
    print("🤗 Using Mixtral-8x7B model (Free)")
    print("\n⚠️  Press CTRL+C to stop the server")
    print("\n💡 First request may take 30-60 seconds as model loads\n")
    print("=" * 60)
   
    Timer(1, open_browser).start()
    app.run(debug=True, use_reloader=False)