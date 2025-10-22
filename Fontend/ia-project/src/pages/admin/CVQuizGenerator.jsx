import React, { useState, useEffect } from 'react';
import { Upload, FileText, Brain, Download, CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';

const CVQuizGenerator = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('mixte');
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);
  const [mammothLoaded, setMammothLoaded] = useState(false);

  const API_KEY = "AIzaSyAaVgNCZPXkkdNZOHIVR03u-dgmJ0uAvcg";

  // Load PDF.js and Mammoth libraries on component mount
  useEffect(() => {
    const loadPdfLib = () => {
      if (window.pdfjsLib) {
        if (!window.pdfjsLib.GlobalWorkerOptions) {
          window.pdfjsLib.GlobalWorkerOptions = {};
        }
        if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        setPdfLibLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.async = true;
      script.onload = () => {
        setTimeout(() => {
          if (window.pdfjsLib) {
            if (!window.pdfjsLib.GlobalWorkerOptions) {
              window.pdfjsLib.GlobalWorkerOptions = {};
            }
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            setPdfLibLoaded(true);
          }
        }, 100);
      };
      script.onerror = () => {
        console.error('Failed to load PDF.js library');
        alert('Erreur lors du chargement de la bibliothèque PDF. Veuillez rafraîchir la page.');
      };
      document.body.appendChild(script);
    };

    const loadMammoth = () => {
      if (window.mammoth) {
        setMammothLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
      script.async = true;
      script.onload = () => {
        setMammothLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Mammoth library');
        alert('Erreur lors du chargement de la bibliothèque DOCX. Veuillez rafraîchir la page.');
      };
      document.body.appendChild(script);
    };

    loadPdfLib();
    loadMammoth();
  }, []);

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    card: {
      maxWidth: '900px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '24px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      padding: '3rem',
      animation: 'slideIn 0.4s ease-out'
    },
    iconCircle: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '800',
      color: '#1a202c',
      marginBottom: '0.5rem',
      textAlign: 'center'
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#718096',
      textAlign: 'center',
      marginBottom: '2rem'
    },
    uploadArea: {
      border: '3px dashed #cbd5e0',
      borderRadius: '16px',
      padding: '3rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: '#f7fafc'
    },
    uploadAreaHover: {
      borderColor: '#667eea',
      background: '#edf2f7'
    },
    button: {
      width: '100%',
      padding: '1rem 2rem',
      fontSize: '1.1rem',
      fontWeight: '700',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
      marginTop: '2rem'
    },
    buttonSecondary: {
      background: '#e2e8f0',
      color: '#2d3748',
      boxShadow: 'none'
    },
    input: {
      width: '100%',
      padding: '1rem',
      fontSize: '1.1rem',
      borderRadius: '12px',
      border: '2px solid #e2e8f0',
      outline: 'none',
      transition: 'border 0.3s ease',
      boxSizing: 'border-box'
    },
    difficultyGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
      marginTop: '1rem'
    },
    difficultyButton: {
      padding: '1rem',
      borderRadius: '12px',
      border: '2px solid #e2e8f0',
      background: '#f7fafc',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    difficultyButtonActive: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: '2px solid #667eea',
      transform: 'scale(1.05)'
    },
    progressBar: {
      width: '100%',
      height: '12px',
      background: '#e2e8f0',
      borderRadius: '6px',
      overflow: 'hidden',
      marginBottom: '2rem'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      transition: 'width 0.3s ease'
    },
    questionCard: {
      background: '#f7fafc',
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '2rem'
    },
    optionButton: {
      width: '100%',
      padding: '1.25rem',
      marginBottom: '0.75rem',
      borderRadius: '12px',
      border: '2px solid #e2e8f0',
      background: 'white',
      textAlign: 'left',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    optionButtonSelected: {
      border: '2px solid #667eea',
      background: '#edf2f7',
      transform: 'translateX(5px)'
    },
    badge: {
      display: 'inline-block',
      padding: '0.4rem 0.8rem',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '600',
      marginRight: '0.5rem'
    },
    textarea: {
      width: '100%',
      minHeight: '150px',
      padding: '1rem',
      fontSize: '1rem',
      borderRadius: '12px',
      border: '2px solid #e2e8f0',
      outline: 'none',
      resize: 'vertical',
      fontFamily: 'inherit',
      boxSizing: 'border-box'
    },
    resultCard: {
      padding: '2rem',
      borderRadius: '16px',
      marginBottom: '1rem',
      border: '2px solid'
    },
    flexRow: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem'
    },
    fileInfo: {
      marginTop: '1.5rem',
      padding: '1.5rem',
      background: '#d4edda',
      border: '2px solid #c3e6cb',
      borderRadius: '12px',
      display: 'inline-block'
    }
  };

  // Extract text from PDF
  const extractPDFText = async (file) => {
    return new Promise((resolve, reject) => {
      if (!window.pdfjsLib) {
        reject(new Error('PDF.js library not loaded'));
        return;
      }

      // Ensure GlobalWorkerOptions is properly initialized
      if (!window.pdfjsLib.GlobalWorkerOptions) {
        window.pdfjsLib.GlobalWorkerOptions = {};
      }
      if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target.result);
          const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
          let text = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(' ');
            text += pageText + '\n';
          }

          resolve(text);
        } catch (error) {
          console.error('PDF extraction error:', error);
          reject(new Error(`Erreur lors de l'extraction PDF: ${error.message}`));
        }
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error('Erreur de lecture du fichier'));
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Extract text from DOCX
  const extractDOCXText = async (file) => {
    return new Promise((resolve, reject) => {
      if (!window.mammoth) {
        reject(new Error('Mammoth library not loaded'));
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const result = await window.mammoth.extractRawText({ arrayBuffer });
          resolve(result.value);
        } catch (error) {
          console.error('DOCX extraction error:', error);
          reject(new Error(`Erreur lors de l'extraction DOCX: ${error.message}`));
        }
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error('Erreur de lecture du fichier'));
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Extract text from TXT
  const extractTXTText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Erreur de lecture du fichier texte'));
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setLoading(true);

    try {
      let text = '';
      const fileType = uploadedFile.type;

      if (fileType === 'application/pdf') {
        if (!pdfLibLoaded) {
          alert('La bibliothèque PDF est en cours de chargement. Veuillez patienter un moment et réessayer.');
          setFile(null);
          setLoading(false);
          return;
        }
        text = await extractPDFText(uploadedFile);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        if (!mammothLoaded) {
          alert('La bibliothèque DOCX est en cours de chargement. Veuillez patienter un moment et réessayer.');
          setFile(null);
          setLoading(false);
          return;
        }
        text = await extractDOCXText(uploadedFile);
      } else if (fileType === 'text/plain') {
        text = await extractTXTText(uploadedFile);
      } else {
        alert('Format non supporté. Utilisez PDF, DOCX ou TXT');
        setFile(null);
        setLoading(false);
        return;
      }

      setExtractedText(text);
      setLoading(false);
    } catch (error) {
      console.error('Erreur extraction:', error);
      alert('Erreur lors de l\'extraction du texte: ' + error.message);
      setFile(null);
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    if (!extractedText) {
      alert('Aucun texte extrait du CV');
      return;
    }

    setLoading(true);

    const prompt = `Tu es un expert en recrutement et évaluation des compétences. Analyse le CV suivant et génère un quiz personnalisé.

CONTENU DU CV:
${extractedText}

INSTRUCTIONS:
1. Analyse toutes les compétences techniques, expériences professionnelles, projets, formations et langues mentionnés
2. Crée ${numQuestions} questions pertinentes et variées
3. Difficulté: ${difficulty}
4. Mélange différents types de questions:
   - Questions techniques sur les compétences mentionnées
   - Questions sur les expériences et réalisations
   - Questions de mise en situation basées sur le profil
   - Questions sur les outils et technologies utilisés
   - Questions comportementales liées aux responsabilités

FORMAT DE RÉPONSE (JSON strict):
{
  "langue_detectee": "français ou anglais",
  "profil_resume": "résumé du profil en 2-3 phrases",
  "competences_principales": ["compétence1", "compétence2", "compétence3", "compétence4", "compétence5"],
  "questions": [
    {
      "id": 1,
      "question": "La question ici",
      "type": "QCM ou Ouverte ou Technique ou Situation",
      "options": ["option A", "option B", "option C", "option D"],
      "reponse_correcte": "option correcte ou explication",
      "explication": "pourquoi cette réponse et lien avec le CV",
      "difficulte": "facile ou moyen ou difficile",
      "categorie": "technique ou experience ou comportemental"
    }
  ]
}

IMPORTANT: 
- Réponds UNIQUEMENT avec le JSON, aucun texte avant ou après
- Toutes les questions doivent être directement liées au contenu du CV
- Assure-toi que les questions évaluent vraiment les compétences du candidat
- Pour les questions ouvertes, laisse le tableau options vide`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            }
          })
        }
      );

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        let generatedText = data.candidates[0].content.parts[0].text;
        
        generatedText = generatedText.trim();
        if (generatedText.startsWith('```json')) {
          generatedText = generatedText.slice(7);
        }
        if (generatedText.startsWith('```')) {
          generatedText = generatedText.slice(3);
        }
        if (generatedText.endsWith('```')) {
          generatedText = generatedText.slice(0, -3);
        }
        generatedText = generatedText.trim();

        const quizJson = JSON.parse(generatedText);
        setQuizData(quizJson);
        setStep(3);
      } else {
        throw new Error('Réponse invalide de l\'API');
      }
    } catch (error) {
      console.error('Erreur génération:', error);
      alert('Erreur lors de la génération du quiz. Vérifiez la clé API.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quizData.questions.forEach(q => {
      if (userAnswers[q.id] === q.reponse_correcte) {
        correct++;
      }
    });
    return correct;
  };

  const downloadQuizJSON = () => {
    const dataStr = JSON.stringify(quizData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quiz_cv.json';
    link.click();
  };

  const exportToPDF = () => {
    const score = calculateScore();
    const percentage = Math.round((score / quizData.questions.length) * 100);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Résultats du Quiz CV</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            background: white;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #667eea;
          }
          .header h1 {
            color: #667eea;
            font-size: 32px;
            margin-bottom: 10px;
          }
          .score-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 30px;
          }
          .score-box h2 {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .profile-section {
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #667eea;
          }
          .profile-section h3 {
            color: #667eea;
            margin-bottom: 10px;
          }
          .competences {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
          }
          .competence-tag {
            background: white;
            padding: 8px 16px;
            border-radius: 20px;
            border: 2px solid #667eea;
            color: #667eea;
            font-weight: 600;
          }
          .question-block {
            page-break-inside: avoid;
            margin-bottom: 30px;
            padding: 20px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
          }
          .question-block.correct {
            background: #f0fdf4;
            border-color: #86efac;
          }
          .question-block.incorrect {
            background: #fef2f2;
            border-color: #fca5a5;
          }
          .question-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
          }
          .question-number {
            background: #667eea;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
          }
          .question-text {
            font-size: 18px;
            font-weight: 600;
            flex: 1;
          }
          .badges {
            display: flex;
            gap: 8px;
            margin-bottom: 10px;
          }
          .badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }
          .badge-type { background: #e9d5ff; color: #7c3aed; }
          .badge-difficulty { background: #dbeafe; color: #2563eb; }
          .badge-category { background: #d1fae5; color: #059669; }
          .answer-section {
            margin: 15px 0;
            padding: 15px;
            background: white;
            border-radius: 8px;
          }
          .answer-label {
            font-weight: 600;
            color: #4b5563;
            margin-bottom: 8px;
          }
          .answer-text {
            color: #1f2937;
            line-height: 1.6;
          }
          .explanation {
            margin-top: 15px;
            padding: 15px;
            background: #fffbeb;
            border-left: 4px solid #fbbf24;
            border-radius: 4px;
          }
          .explanation-label {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 8px;
          }
          .status-icon {
            font-size: 24px;
            margin-right: 10px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            border-top: 2px solid #e5e7eb;
            padding-top: 20px;
          }
          @media print {
            body { padding: 20px; }
            .question-block { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Résultats du Quiz CV</h1>
          <p style="color: #6b7280; font-size: 16px;">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <div class="score-box">
          <h2>${score} / ${quizData.questions.length}</h2>
          <p style="font-size: 24px;">Score: ${percentage}%</p>
          <p style="margin-top: 10px; opacity: 0.9;">
            ${percentage >= 70 ? '🎉 Excellent résultat !' : percentage >= 50 ? '👍 Bon travail !' : '💪 Continuez à progresser !'}
          </p>
        </div>

        <div class="profile-section">
          <h3>📌 Profil Analysé</h3>
          <p style="color: #4b5563; line-height: 1.6;">${quizData.profil_resume}</p>
          <div class="competences">
            ${quizData.competences_principales.map(c => `<span class="competence-tag">${c}</span>`).join('')}
          </div>
        </div>

        <h2 style="color: #667eea; margin-bottom: 20px; font-size: 24px;">📝 Détail des Réponses</h2>

        ${quizData.questions.map((q, idx) => {
          const isCorrect = userAnswers[q.id] === q.reponse_correcte;
          return `
            <div class="question-block ${isCorrect ? 'correct' : 'incorrect'}">
              <div class="question-header">
                <div class="question-number">${idx + 1}</div>
                <div style="flex: 1;">
                  <div class="badges">
                    <span class="badge badge-type">${q.type}</span>
                    <span class="badge badge-difficulty">${q.difficulte}</span>
                    <span class="badge badge-category">${q.categorie}</span>
                  </div>
                  <div class="question-text">${q.question}</div>
                </div>
                <span class="status-icon">${isCorrect ? '✅' : '❌'}</span>
              </div>

              <div class="answer-section">
                <div class="answer-label">Votre réponse:</div>
                <div class="answer-text">${userAnswers[q.id] || '(Non répondu)'}</div>
              </div>

              ${!isCorrect ? `
                <div class="answer-section" style="background: #f0fdf4;">
                  <div class="answer-label" style="color: #15803d;">Réponse correcte:</div>
                  <div class="answer-text" style="color: #166534;">${q.reponse_correcte}</div>
                </div>
              ` : ''}

              <div class="explanation">
                <div class="explanation-label">💡 Explication</div>
                <div style="color: #78350f; line-height: 1.6;">${q.explication}</div>
              </div>
            </div>
          `;
        }).join('')}

        <div class="footer">
          <p>Ce document a été généré automatiquement par le Générateur de Quiz CV</p>
          <p style="margin-top: 5px;">Powered by Gemini AI</p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Step 1: Upload CV
  if (step === 1) {
    return (
      <div style={styles.container}>
        <style>
          {`
            @keyframes slideIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            button:hover { transform: translateY(-2px); }
            button:active { transform: translateY(0); }
            input:focus { border-color: #667eea; }
            @keyframes spin { to { transform: rotate(360deg); } }
          `}
        </style>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={styles.iconCircle}>
              <FileText style={{ width: '40px', height: '40px', color: 'white' }} />
            </div>
            <h1 style={styles.title}>Générateur de Quiz CV</h1>
            <p style={styles.subtitle}>Uploadez votre CV pour générer un quiz personnalisé avec l'IA</p>
          </div>

          <div style={styles.uploadArea}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if ((!pdfLibLoaded || !mammothLoaded) || loading) return;
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile) {
                handleFileUpload({ target: { files: [droppedFile] } });
              }
            }}>
            <Upload style={{ width: '64px', height: '64px', color: '#667eea', margin: '0 auto 1rem' }} />
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.docx,.txt"
              style={{ display: 'none' }}
              id="file-upload"
              disabled={loading || !pdfLibLoaded || !mammothLoaded}
            />
            <label htmlFor="file-upload" style={{ 
              cursor: (loading || !pdfLibLoaded || !mammothLoaded) ? 'not-allowed' : 'pointer', 
              opacity: (loading || !pdfLibLoaded || !mammothLoaded) ? 0.6 : 1 
            }}>
              <span style={{ fontSize: '1.2rem', fontWeight: '600', color: '#667eea' }}>
                {(!pdfLibLoaded || !mammothLoaded) ? 'Chargement des bibliothèques...' : loading ? 'Extraction en cours...' : 'Cliquez pour uploader'}
              </span>
              {!loading && pdfLibLoaded && mammothLoaded && <span style={{ color: '#718096', display: 'block', marginTop: '0.5rem' }}> ou glissez-déposez</span>}
            </label>
            <p style={{ fontSize: '0.9rem', color: '#a0aec0', marginTop: '0.5rem' }}>PDF, DOCX ou TXT (max. 10MB)</p>
            
            {(!pdfLibLoaded || !mammothLoaded) && !loading && (
              <div style={{ marginTop: '1.5rem' }}>
                <Loader style={{ width: '32px', height: '32px', color: '#667eea', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#667eea', marginTop: '0.5rem', fontSize: '0.9rem' }}>Chargement des bibliothèques...</p>
              </div>
            )}

            {loading && (
              <div style={{ marginTop: '1.5rem' }}>
                <Loader style={{ width: '32px', height: '32px', color: '#667eea', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
              </div>
            )}
            
            {file && !loading && (
              <div style={styles.fileInfo}>
                <CheckCircle style={{ width: '20px', height: '20px', color: '#28a745', display: 'inline', marginRight: '0.5rem' }} />
                <span style={{ color: '#155724', fontWeight: '600' }}>{file.name}</span>
                <p style={{ fontSize: '0.9rem', color: '#155724', marginTop: '0.5rem' }}>
                  {extractedText.length} caractères extraits
                </p>
              </div>
            )}
          </div>

          {file && !loading && extractedText && (
            <button
              onClick={() => setStep(2)}
              style={styles.button}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Continuer →
            </button>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Configure Quiz
  if (step === 2) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={styles.iconCircle}>
              <Brain style={{ width: '40px', height: '40px', color: 'white' }} />
            </div>
            <h2 style={styles.title}>Configuration du Quiz</h2>
            <p style={styles.subtitle}>Personnalisez votre quiz selon vos besoins</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '1.1rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.75rem' }}>
              Nombre de questions
            </label>
            <input
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              min="5"
              max="20"
              style={styles.input}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '1.1rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.75rem' }}>
              Difficulté
            </label>
            <div style={styles.difficultyGrid}>
              {['facile', 'moyen', 'difficile', 'mixte'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  style={{
                    ...styles.difficultyButton,
                    ...(difficulty === level ? styles.difficultyButtonActive : {})
                  }}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.flexRow}>
            <button
              onClick={() => setStep(1)}
              style={{ ...styles.button, ...styles.buttonSecondary, flex: 1 }}
            >
              ← Retour
            </button>
            <button
              onClick={generateQuiz}
              disabled={loading}
              style={{ ...styles.button, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? (
                <>
                  <Loader style={{ width: '20px', height: '20px', marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                  Génération avec AI...
                </>
              ) : (
                'Générer le Quiz avec IA'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Quiz Interface
  if (step === 3 && quizData && !showResults) {
    const question = quizData.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#718096' }}>
                Question {currentQuestion + 1} / {quizData.questions.length}
              </span>
              <button
                onClick={downloadQuizJSON}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  background: '#d4edda',
                  color: '#155724',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                <Download style={{ width: '16px', height: '16px' }} />
                Exporter JSON
              </button>
            </div>
            
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
          </div>

          {currentQuestion === 0 && (
            <div style={{
              background: '#eef2ff',
              border: '2px solid #c7d2fe',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ fontWeight: '700', color: '#3730a3', marginBottom: '0.75rem' }}>📋 Profil détecté</h3>
              <p style={{ color: '#4338ca', marginBottom: '1rem', lineHeight: '1.6' }}>{quizData.profil_resume}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {quizData.competences_principales.map((comp, i) => (
                  <span key={i} style={{
                    padding: '0.5rem 1rem',
                    background: 'white',
                    color: '#5b21b6',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                flexShrink: 0,
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '1.2rem'
              }}>
                {currentQuestion + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ ...styles.badge, background: '#e9d5ff', color: '#7c3aed' }}>
                    {question.type}
                  </span>
                  <span style={{ ...styles.badge, background: '#dbeafe', color: '#2563eb' }}>
                    {question.difficulte}
                  </span>
                  <span style={{ ...styles.badge, background: '#d1fae5', color: '#059669' }}>
                    {question.categorie}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a202c', lineHeight: '1.4' }}>
                  {question.question}
                </h3>
              </div>
            </div>

            {question.type === 'QCM' && question.options && question.options.length > 0 ? (
              <div>
                {question.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(question.id, option)}
                    style={{
                      ...styles.optionButton,
                      ...(userAnswers[question.id] === option ? styles.optionButtonSelected : {})
                    }}
                  >
                    <span style={{
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      background: '#f7fafc',
                      fontWeight: '700',
                      color: '#4a5568',
                      flexShrink: 0
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span style={{ fontWeight: '500', color: '#2d3748' }}>{option}</span>
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                value={userAnswers[question.id] || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                placeholder="Écrivez votre réponse ici..."
                style={styles.textarea}
              />
            )}
          </div>

          <div style={styles.flexRow}>
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              style={{
                padding: '1rem 1.5rem',
                background: '#e2e8f0',
                color: '#2d3748',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '1rem',
                opacity: currentQuestion === 0 ? 0.5 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              ← Précédent
            </button>
            <button
              onClick={nextQuestion}
              style={{
                flex: 1,
                padding: '1rem 1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '1rem',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              {currentQuestion === quizData.questions.length - 1 ? 'Voir les résultats' : 'Suivant →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResults && quizData) {
    const score = calculateScore();
    const percentage = Math.round((score / quizData.questions.length) * 100);

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              background: percentage >= 70 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
                          percentage >= 50 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 
                          'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
            }}>
              {percentage >= 70 ? (
                <CheckCircle style={{ width: '50px', height: '50px', color: 'white' }} />
              ) : (
                <AlertCircle style={{ width: '50px', height: '50px', color: 'white' }} />
              )}
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1a202c', marginBottom: '0.5rem' }}>
              Quiz Terminé !
            </h2>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>
              Score: {score} / {quizData.questions.length} ({percentage}%)
            </p>
            <p style={{ fontSize: '1.2rem', color: '#718096', marginTop: '0.5rem' }}>
              {percentage >= 70 ? '🎉 Excellent résultat !' : percentage >= 50 ? '👍 Bon travail !' : '💪 Continuez à progresser !'}
            </p>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '2rem' }}>
            {quizData.questions.map((q, idx) => {
              const isCorrect = userAnswers[q.id] === q.reponse_correcte;
              return (
                <div key={q.id} style={{
                  ...styles.resultCard,
                  borderColor: isCorrect ? '#86efac' : '#fca5a5',
                  background: isCorrect ? '#f0fdf4' : '#fef2f2'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    {isCorrect ? (
                      <CheckCircle style={{ width: '24px', height: '24px', color: '#16a34a', flexShrink: 0, marginTop: '0.25rem' }} />
                    ) : (
                      <XCircle style={{ width: '24px', height: '24px', color: '#dc2626', flexShrink: 0, marginTop: '0.25rem' }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontWeight: '700', color: '#1a202c', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
                        Question {idx + 1}: {q.question}
                      </h4>
                      <p style={{ fontSize: '0.95rem', color: '#4b5563', marginBottom: '0.5rem' }}>
                        <strong>Votre réponse:</strong> {userAnswers[q.id] || '(Non répondu)'}
                      </p>
                      {!isCorrect && (
                        <p style={{ fontSize: '0.95rem', color: '#4b5563', marginBottom: '0.5rem' }}>
                          <strong>Réponse correcte:</strong> {q.reponse_correcte}
                        </p>
                      )}
                      <p style={{ fontSize: '0.95rem', color: '#374151', fontStyle: 'italic', marginTop: '0.75rem' }}>
                        💡 {q.explication}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={styles.flexRow}>
            <button
              onClick={() => {
                setStep(1);
                setFile(null);
                setQuizData(null);
                setUserAnswers({});
                setCurrentQuestion(0);
                setShowResults(false);
                setExtractedText('');
              }}
              style={{ ...styles.button, flex: 1 }}
            >
              Nouveau Quiz
            </button>
            <button
              onClick={exportToPDF}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '1rem',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              <Download style={{ width: '20px', height: '20px' }} />
              Export PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CVQuizGenerator;