import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, Loader, AlertCircle, Download, Play, Copy } from 'lucide-react';

const CVChallengeGenerator = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [challenges, setChallenges] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [code, setCode] = useState('// Write your solution here\n');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);
  const [mammothLoaded, setMammothLoaded] = useState(false);

  const GEMINI_API_KEY = "AIzaSyAaVgNCZPXkkdNZOHIVR03u-dgmJ0uAvcg";

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
        // Initialize PDF.js properly
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
    splitContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem',
      minHeight: 'calc(100vh - 200px)',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    leftPanel: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      padding: '2rem',
      overflowY: 'auto'
    },
    rightPanel: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column'
    },
    codeEditor: {
      flex: 1,
      background: '#1e1e1e',
      borderRadius: '12px',
      padding: '1.5rem',
      fontFamily: 'Monaco, Menlo, Courier New, monospace',
      fontSize: '0.95rem',
      color: '#d4d4d4',
      lineHeight: '1.6',
      border: '2px solid #e2e8f0',
      marginBottom: '1rem',
      overflow: 'auto'
    },
    textarea: {
      width: '100%',
      height: '100%',
      background: '#1e1e1e',
      color: '#d4d4d4',
      border: 'none',
      outline: 'none',
      fontFamily: 'Monaco, Menlo, Courier New, monospace',
      fontSize: '0.95rem',
      lineHeight: '1.6',
      padding: '1rem',
      boxSizing: 'border-box',
      resize: 'none'
    },
    output: {
      background: '#f0f0f0',
      borderRadius: '8px',
      padding: '1rem',
      minHeight: '100px',
      maxHeight: '200px',
      overflowY: 'auto',
      fontFamily: 'Monaco, Menlo, Courier New, monospace',
      fontSize: '0.9rem',
      color: '#333',
      marginTop: '1rem',
      border: '2px solid #e2e8f0',
      whiteSpace: 'pre-wrap'
    },
    button: {
      padding: '1rem 2rem',
      fontSize: '1rem',
      fontWeight: '700',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
      marginTop: '2rem',
      width: '100%'
    },
    runButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      background: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    badge: {
      display: 'inline-block',
      padding: '0.4rem 0.8rem',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '600',
      marginRight: '0.5rem'
    },
    challengeTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1a202c',
      marginBottom: '1rem'
    },
    challengeSection: {
      marginBottom: '1.5rem'
    },
    sectionLabel: {
      fontSize: '0.9rem',
      fontWeight: '700',
      color: '#667eea',
      textTransform: 'uppercase',
      marginBottom: '0.5rem'
    }
  };

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
          
          // Use the promise-based API
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

  const generateChallenges = async () => {
    if (!extractedText) {
      alert('Aucun texte extrait du CV');
      return;
    }

    setLoading(true);

    const prompt = `Tu es un expert en développement logiciel et entretiens techniques. Analyse le CV suivant et génère 3 défis de programmation personnalisés.

CONTENU DU CV:
${extractedText}

INSTRUCTIONS:
1. Analyse toutes les compétences techniques, langages de programmation, frameworks et projets
2. Crée 3 défis de programmation variés et progressifs
3. Les défis doivent correspondre au niveau et à la stack technique du candidat
4. Chaque défi doit tester une compétence clé mentionnée dans le CV

FORMAT DE RÉPONSE (JSON strict):
{
  "profil_resume": "résumé du profil en 2-3 phrases",
  "competences_principales": ["compétence1", "compétence2", "compétence3"],
  "defis": [
    {
      "id": 1,
      "titre": "Titre du défi",
      "difficulte": "Débutant ou Intermédiaire ou Avancé",
      "description": "Description détaillée du défi",
      "concepts_cles": "Concepts techniques à tester",
      "approche_solution": "Pseudocode ou approche de solution",
      "categorie": "Backend ou Frontend ou Full-stack ou Algorithme ou Base de données",
      "tests": ["test1", "test2", "test3"]
    }
  ]
}

IMPORTANT:
- Réponds UNIQUEMENT avec le JSON, aucun texte avant ou après
- Les défis doivent être directement liés aux compétences du CV
- Assure-toi que les défis sont réalistes et évaluent vraiment les compétences`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
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
              maxOutputTokens: 4096,
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

        const challengesJson = JSON.parse(generatedText);
        setChallenges(challengesJson);
        setStep(2);
      } else {
        throw new Error('Réponse invalide de l\'API');
      }
    } catch (error) {
      console.error('Erreur génération:', error);
      alert('Erreur lors de la génération des défis. Vérifiez la clé API.');
    } finally {
      setLoading(false);
    }
  };

  const executeCode = () => {
    setIsRunning(true);
    setOutput('');
    
    setTimeout(() => {
      try {
        // Capture console.log outputs
        const logs = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
          originalLog(...args);
        };

        const result = eval(code);
        
        console.log = originalLog;
        
        let output = '';
        if (logs.length > 0) {
          output = logs.join('\n');
        }
        if (result !== undefined) {
          output += (output ? '\n\n' : '') + 'Return value: ' + 
            (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result));
        }
        
        setOutput(output || 'Code exécuté avec succès (aucune sortie)');
      } catch (error) {
        setOutput(`Erreur: ${error.message}\n\nStack: ${error.stack}`);
      } finally {
        setIsRunning(false);
      }
    }, 100);
  };

  // Step 1: Upload
  if (step === 1) {
    return (
      <div style={styles.container}>
        <style>
          {`
            @keyframes slideIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            button:hover { transform: translateY(-2px); }
            button:active { transform: translateY(0); }
          `}
        </style>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
            }}>
              <FileText style={{ width: '40px', height: '40px', color: 'white' }} />
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1a202c', marginBottom: '0.5rem', textAlign: 'center' }}>
              Générateur de Défis
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#718096', textAlign: 'center', marginBottom: '2rem' }}>
              Uploadez votre CV pour générer des défis de programmation personnalisés avec éditeur de code
            </p>
          </div>

          <div style={{
            border: '3px dashed #cbd5e0',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: '#f7fafc',
            transition: 'all 0.3s ease'
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if ((!pdfLibLoaded && !mammothLoaded) || loading) return;
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
            <p style={{ fontSize: '0.9rem', color: '#a0aec0', marginTop: '0.5rem' }}>PDF, DOCX ou TXT</p>
            
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
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: '#d4edda',
                border: '2px solid #c3e6cb',
                borderRadius: '8px',
                display: 'inline-block'
              }}>
                <CheckCircle style={{ width: '20px', height: '20px', color: '#28a745', display: 'inline', marginRight: '0.5rem' }} />
                <span style={{ color: '#155724', fontWeight: '600' }}>{file.name}</span>
              </div>
            )}
          </div>

          {file && !loading && extractedText && (
            <button
              onClick={generateChallenges}
              style={styles.button}
            >
              Générer les Défis avec IA →
            </button>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Split View with Editor
  if (step === 2 && challenges) {
    const challenge = challenges.defis[currentChallenge];

    return (
      <div style={styles.container}>
        <style>
          {`
            @keyframes slideIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            ::-webkit-scrollbar {
              width: 8px;
            }
            ::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 10px;
            }
            ::-webkit-scrollbar-thumb {
              background: #667eea;
              border-radius: 10px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: #764ba2;
            }
          `}
        </style>

        <div style={styles.splitContainer}>
          {/* Left Panel - Challenge */}
          <div style={styles.leftPanel}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ ...styles.badge, background: '#dbeafe', color: '#2563eb' }}>
                  {challenge.difficulte}
                </span>
                <span style={{ ...styles.badge, background: '#d1fae5', color: '#059669' }}>
                  {challenge.categorie}
                </span>
              </div>
              <h2 style={styles.challengeTitle}>{challenge.titre}</h2>
            </div>

            <div style={styles.challengeSection}>
              <div style={styles.sectionLabel}>Description</div>
              <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {challenge.description}
              </p>
            </div>

            <div style={styles.challengeSection}>
              <div style={styles.sectionLabel}>Concepts Clés</div>
              <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {challenge.concepts_cles}
              </p>
            </div>

            <div style={styles.challengeSection}>
              <div style={styles.sectionLabel}>Approche de Solution</div>
              <pre style={{ 
                background: '#f7fafc', 
                padding: '1rem', 
                borderRadius: '8px', 
                fontSize: '0.85rem',
                color: '#2d3748',
                overflow: 'auto',
                border: '1px solid #e2e8f0',
                whiteSpace: 'pre-wrap'
              }}>
                {challenge.approche_solution}
              </pre>
            </div>

            {challenge.tests && challenge.tests.length > 0 && (
              <div style={styles.challengeSection}>
                <div style={styles.sectionLabel}>Tests</div>
                <ul style={{ fontSize: '0.9rem', color: '#4b5563', paddingLeft: '1.5rem' }}>
                  {challenge.tests.map((test, i) => (
                    <li key={i} style={{ marginBottom: '0.5rem' }}>
                      {test}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setCurrentChallenge(Math.max(0, currentChallenge - 1))}
                disabled={currentChallenge === 0}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#e2e8f0',
                  color: '#2d3748',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: currentChallenge === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: currentChallenge === 0 ? 0.5 : 1
                }}
              >
                ← Précédent
              </button>
              <button
                onClick={() => setCurrentChallenge(Math.min(challenges.defis.length - 1, currentChallenge + 1))}
                disabled={currentChallenge === challenges.defis.length - 1}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: currentChallenge === challenges.defis.length - 1 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: currentChallenge === challenges.defis.length - 1 ? 0.5 : 1
                }}
              >
                Suivant →
              </button>
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div style={styles.rightPanel}>
            <div style={{ marginBottom: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1a202c', margin: 0 }}>
                  Éditeur de Code
                </h3>
                <button
                  onClick={() => setCode('// Write your solution here\n')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#e2e8f0',
                    color: '#2d3748',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.85rem'
                  }}
                >
                  Réinitialiser
                </button>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={{
                    width: '100%',
                    flex: 1,
                    minHeight: '300px',
                    background: '#1e1e1e',
                    color: '#d4d4d4',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    outline: 'none',
                    fontFamily: 'Monaco, Menlo, Courier New, monospace',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    padding: '1rem',
                    boxSizing: 'border-box',
                    resize: 'none'
                  }}
                  spellCheck="false"
                />
              </div>
            </div>

            <button
              onClick={executeCode}
              disabled={isRunning}
              style={{
                ...styles.runButton,
                opacity: isRunning ? 0.7 : 1,
                cursor: isRunning ? 'not-allowed' : 'pointer'
              }}
            >
              <Play style={{ width: '16px', height: '16px' }} />
              {isRunning ? 'Exécution...' : 'Exécuter le code'}
            </button>

            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1a202c', marginTop: '1rem', marginBottom: '0.5rem' }}>
                Résultat
              </h4>
              <div style={styles.output}>
                {output || 'Le résultat s\'affichera ici...'}
              </div>
            </div>

            <button
              onClick={() => {
                setStep(1);
                setFile(null);
                setChallenges(null);
                setCurrentChallenge(0);
                setCode('// Write your solution here\n');
                setOutput('');
                setExtractedText('');
              }}
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                width: '100%'
              }}
            >
              Nouveau CV
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CVChallengeGenerator;