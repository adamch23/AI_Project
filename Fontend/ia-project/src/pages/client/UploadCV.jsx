import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  FaFileUpload, 
  FaFilePdf, 
  FaTimesCircle, 
  FaSpinner, 
  FaMagic, 
  FaDatabase, 
  FaSearch, 
  FaSync, 
  FaEdit, 
  FaSave, 
  FaPlus, 
  FaGraduationCap, 
  FaBriefcase,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaAward,
  FaCode,
  FaChartLine,
  FaRocket
} from 'react-icons/fa';

const API_URL = 'http://127.0.0.1:8000';
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook-test/a93c3fd5-c222-405b-833c-608d7b9af1da';

function UploadCV() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [candidateData, setCandidateData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionResults, setActionResults] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [showMissingFields, setShowMissingFields] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Récupération des offres depuis le backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${API_URL}/jobs`);
        const jobList = Array.isArray(response.data)
          ? response.data
          : response.data.jobs || [];
        setJobs(jobList);
        if (jobList.length > 0) setSelectedJob(jobList[0]._id);
      } catch (error) {
        console.error('Erreur de chargement des offres :', error);
        setMessage({ type: 'error', text: 'Erreur lors du chargement des offres.' });
      }
    };
    fetchJobs();
  }, []);

  // Vérification du fichier PDF
  const handleFileChange = (file) => {
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setMessage({ type: '', text: '' });
    } else {
      setSelectedFile(null);
      setMessage({ type: 'error', text: 'Format invalide. Veuillez sélectionner un fichier PDF.' });
    }
  };

  // Drag & Drop
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  }, []);

  // Soumission du CV
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedJob) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une offre et un CV.' });
      return;
    }

    setIsUploading(true);
    setCandidateData(null);
    setActionResults(null);
    setMessage({ type: 'info', text: 'Analyse de votre CV en cours...' });

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_URL}/upload_cv/${selectedJob}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage({ type: 'success', text: response.data.message || 'CV analysé avec succès !' });
      const candidate = response.data.candidate || {};
      
      // Initialiser les données avec des valeurs par défaut si manquantes
      const completeCandidateData = {
        firstName: candidate.firstName || 'Tu',
        lastName: candidate.lastName || 'Tunis',
        email: candidate.email || 'chemengui.adam@gmail.com',
        phone: candidate.phone || '16 99 168 074',
        location: candidate.location || 'Tunis',
        experienceYears: candidate.experienceYears || 0,
        skills: candidate.skills || [],
        certifications: candidate.certifications || [],
        education: candidate.education || [],
        missingValues: candidate.missingValues || []
      };
      
      setCandidateData(completeCandidateData);
      setEditedData(completeCandidateData);
      
      // Afficher les champs manquants s'il y en a
      if (candidate.missingValues && candidate.missingValues.length > 0) {
        setShowMissingFields(true);
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du CV :', error);
      setMessage({
        type: 'error',
        text: `Erreur: ${error.response?.data?.detail || error.message}`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Activer/désactiver le mode édition
  const toggleEdit = () => {
    if (isEditing) {
      // Sauvegarder les modifications
      setCandidateData({...editedData});
      setMessage({ type: 'success', text: 'Modifications sauvegardées !' });
      
      // Mettre à jour les valeurs manquantes
      const updatedMissingValues = calculateMissingValues(editedData);
      setCandidateData(prev => ({...prev, missingValues: updatedMissingValues}));
      setEditedData(prev => ({...prev, missingValues: updatedMissingValues}));
      
    } else {
      setEditedData({...candidateData});
    }
    setIsEditing(!isEditing);
  };

  // Calculer les champs manquants
  const calculateMissingValues = (data) => {
    const missing = [];
    if (!data.experienceYears || data.experienceYears === 0) missing.push('experienceYears');
    if (!data.education || data.education.length === 0) missing.push('education');
    if (!data.firstName || data.firstName === 'Unknown Candidate') missing.push('firstName');
    if (!data.lastName || data.lastName === 'Unknown Candidate') missing.push('lastName');
    return missing;
  };

  // Mettre à jour les données éditées
  const handleEditChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Ajouter une compétence
  const addSkill = () => {
    const newSkill = prompt('Entrez une nouvelle compétence:');
    if (newSkill && newSkill.trim()) {
      setEditedData(prev => ({
        ...prev,
        skills: [...prev.skills, { name: newSkill.trim(), level: 0.5, category: 'other' }]
      }));
    }
  };

  // Ajouter une éducation
  const addEducation = () => {
    const level = prompt('Niveau d\'éducation (ex: Licence, Master):');
    const field = prompt('Domaine d\'étude:');
    const year = prompt('Année d\'obtention:');
    
    if (level && field && year) {
      setEditedData(prev => ({
        ...prev,
        education: [...prev.education, { level, field, year }]
      }));
    }
  };

  // Mettre à jour l'expérience
  const updateExperience = () => {
    const experience = prompt('Années d\'expérience:', editedData.experienceYears || '0');
    if (experience !== null) {
      setEditedData(prev => ({
        ...prev,
        experienceYears: parseInt(experience) || 0
      }));
    }
  };

  // Actions disponibles après analyse
  const handleAction = async (actionType) => {
    if (!candidateData) return;

    // Vérifier les données manquantes pour l'amélioration du CV
    if (actionType === 'improve_cv') {
      const missing = calculateMissingValues(candidateData);
      if (missing.length > 0) {
        setMessage({ 
          type: 'error', 
          text: `Veuillez compléter les informations manquantes avant d'améliorer le CV: ${missing.join(', ')}` 
        });
        setShowMissingFields(true);
        return;
      }
    }

    setIsProcessing(true);
    setActionResults(null);
    setMessage({ type: 'info', text: `Exécution de l'action: ${getActionLabel(actionType)}...` });

    try {
      const selectedJobData = jobs.find(job => job._id === selectedJob);
      
      const payload = {
        action: actionType,
        cvData: candidateData,
        jobId: selectedJob,
        jobData: selectedJobData,
        originalFileName: selectedFile.name,
        timestamp: new Date().toISOString(),
        // Inclure des instructions spécifiques pour l'IA
        instructions: getActionInstructions(actionType)
      };

      const response = await axios.post(N8N_WEBHOOK_URL, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      setActionResults({
        action: actionType,
        data: response.data,
        timestamp: new Date().toLocaleTimeString()
      });

      setMessage({ 
        type: 'success', 
        text: `${getActionLabel(actionType)} terminé avec succès !` 
      });

    } catch (error) {
      console.error(`Erreur lors de l'action ${actionType}:`, error);
      setMessage({
        type: 'error',
        text: `Erreur ${getActionLabel(actionType)}: ${error.response?.data?.message || error.message}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Instructions pour l'IA selon l'action
  const getActionInstructions = (actionType) => {
    const instructions = {
      improve_cv: `Améliore le CV pour le poste de ${jobs.find(job => job._id === selectedJob)?.title}. 
        Concentre-toi sur: 
        - Mettre en valeur les compétences en Python et React
        - Structurer les expériences professionnelles
        - Améliorer la formulation des réalisations
        - Adapter le CV au format professionnel français`,
      
      analyze_compatibility: `Analyse la compatibilité entre le candidat et le poste. 
        Évalue:
        - Correspondance des compétences techniques
        - Adéquation de l'expérience
        - Potentiel de croissance
        - Points forts et points à améliorer`
    };
    return instructions[actionType] || '';
  };

  // Labels des actions
  const getActionLabel = (actionType) => {
    const labels = {
      improve_cv: 'Amélioration du CV',
      find_similar: 'Recherche de candidats similaires',
      mongo_search: 'Recherche dans MongoDB',
      analyze_compatibility: 'Analyse de compatibilité'
    };
    return labels[actionType] || actionType;
  };

  // Description des actions
  const getActionDescription = (actionType) => {
    const descriptions = {
      improve_cv: 'Optimiser le CV pour cette offre spécifique',
      find_similar: 'Trouver des candidats avec un profil similaire',
      mongo_search: 'Rechercher des documents liés dans la base de données',
      analyze_compatibility: 'Analyser la compatibilité avec le poste'
    };
    return descriptions[actionType] || '';
  };

  const actions = [
    { 
      type: 'improve_cv', 
      icon: FaMagic, 
      color: '#8B5CF6',
      label: 'Améliorer le CV',
      gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
    },
    { 
      type: 'analyze_compatibility', 
      icon: FaChartLine, 
      color: '#F59E0B',
      label: 'Analyse compatibilité',
      gradient: 'linear-gradient(135deg, #F59E0B, #D97706)'
    },
    { 
      type: 'find_similar', 
      icon: FaSearch, 
      color: '#10B981',
      label: 'Candidats similaires',
      gradient: 'linear-gradient(135deg, #10B981, #059669)'
    },
    { 
      type: 'mongo_search', 
      icon: FaDatabase, 
      color: '#3B82F6',
      label: 'Recherche MongoDB',
      gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)'
    }
  ];

  return (
    <div className="page">
      <style jsx>{`
        .page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Inter', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }

        .page-content {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        h1 {
          color: #1e293b;
          text-align: center;
          margin-bottom: 15px;
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .page-subtitle {
          text-align: center;
          color: #64748b;
          font-size: 1.1rem;
          margin-bottom: 40px;
          line-height: 1.6;
        }

        .form-card {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          padding: 30px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          margin-bottom: 30px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .form-group {
          margin-bottom: 25px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #334155;
          font-size: 0.95rem;
        }

        select, input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 1rem;
          background: white;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        select:focus, input:focus {
          outline: none;
          border-color: #8B5CF6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .dropzone {
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fafafa;
        }

        .dropzone:hover, .dropzone.dragging {
          border-color: #8B5CF6;
          background: #f8faff;
          transform: translateY(-2px);
        }

        .dropzone-icon {
          font-size: 3rem;
          color: #8B5CF6;
          margin-bottom: 15px;
        }

        .dropzone p {
          font-size: 1.1rem;
          color: #475569;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .dropzone span {
          color: #64748b;
          font-size: 0.9rem;
        }

        .file-preview {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px 20px;
          background: #f0f9ff;
          border: 2px solid #e0f2fe;
          border-radius: 10px;
          color: #0369a1;
          font-weight: 600;
        }

        .file-preview svg {
          font-size: 1.5rem;
          color: #dc2626;
        }

        .file-preview button {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 5px;
          border-radius: 5px;
          transition: color 0.3s ease;
        }

        .file-preview button:hover {
          color: #dc2626;
        }

        .btn {
          width: 100%;
          padding: 15px 30px;
          background: linear-gradient(135deg, #8B5CF6, #7C3AED);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }

        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .message {
          padding: 15px 20px;
          border-radius: 10px;
          margin: 20px 0;
          font-weight: 500;
          border: 1px solid;
        }

        .message.success {
          background: #f0fdf4;
          color: #166534;
          border-color: #bbf7d0;
        }

        .message.error {
          background: #fef2f2;
          color: #dc2626;
          border-color: #fecaca;
        }

        .message.info {
          background: #f0f9ff;
          color: #0369a1;
          border-color: #bae6fd;
        }

        .result-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 25px 30px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-bottom: 1px solid #e2e8f0;
        }

        .result-header h3 {
          margin: 0;
          color: #1e293b;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .btn-edit {
          background: linear-gradient(135deg, #10B981, #059669);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-edit:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-edit.editing {
          background: linear-gradient(135deg, #F59E0B, #D97706);
        }

        .personal-info {
          padding: 30px;
        }

        .info-display p {
          margin: 12px 0;
          color: #475569;
          font-size: 1rem;
        }

        .info-display strong {
          color: #334155;
          min-width: 120px;
          display: inline-block;
        }

        .edit-form {
          display: grid;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .missing-fields-warning {
          background: linear-gradient(135deg, #fef3c7, #fef7cd);
          border: 1px solid #fcd34d;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 30px;
        }

        .missing-fields-warning h4 {
          color: #92400e;
          margin: 0 0 10px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .missing-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 15px;
        }

        .btn-missing {
          background: #f59e0b;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 8px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-missing:hover {
          background: #d97706;
          transform: translateY(-1px);
        }

        .skills-section {
          padding: 0 30px 30px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h4 {
          color: #1e293b;
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .btn-add {
          background: #8B5CF6;
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .btn-add:hover {
          background: #7C3AED;
          transform: translateY(-1px);
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .skill-tag {
          background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
          color: #3730a3;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 500;
          border: 1px solid #c7d2fe;
        }

        .actions-section {
          padding: 30px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .actions-section h4 {
          color: #1e293b;
          margin-bottom: 10px;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .actions-description {
          color: #64748b;
          margin-bottom: 25px;
          font-size: 1rem;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .action-btn {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 15px;
          position: relative;
          overflow: hidden;
        }

        .action-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border-color: var(--action-color);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .action-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          background: var(--gradient);
          flex-shrink: 0;
        }

        .action-content {
          flex: 1;
          text-align: left;
        }

        .action-label {
          display: block;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 5px;
          font-size: 1rem;
        }

        .action-description {
          display: block;
          color: #64748b;
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .action-results {
          padding: 25px 30px;
          background: #f1f5f9;
          border-top: 1px solid #e2e8f0;
        }

        .action-results h4 {
          color: #1e293b;
          margin-bottom: 15px;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .results-content {
          background: white;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #e2e8f0;
        }

        .results-content pre {
          margin: 0;
          font-size: 0.85rem;
          color: #475569;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .results-meta {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 0.9rem;
        }

        /* Tabs Navigation */
        .tabs {
          display: flex;
          background: #f8fafc;
          border-radius: 12px;
          padding: 5px;
          margin: 20px 0;
        }

        .tab {
          flex: 1;
          padding: 12px 20px;
          text-align: center;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          color: #64748b;
          transition: all 0.3s ease;
        }

        .tab.active {
          background: white;
          color: #8B5CF6;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .page {
            padding: 15px;
          }

          .page-content {
            padding: 25px;
          }

          h1 {
            font-size: 2rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .result-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }

          .missing-actions {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .page-content {
            padding: 20px;
          }

          h1 {
            font-size: 1.75rem;
          }

          .form-card {
            padding: 20px;
          }

          .personal-info {
            padding: 20px;
          }

          .actions-section {
            padding: 20px;
          }
        }
      `}</style>

      <div className="page-content">
        <h1>📄 Analyse Intelligente de CV</h1>
        <p className="page-subtitle">
          Téléchargez votre CV et découvrez comment l'IA peut optimiser votre candidature pour l'offre sélectionnée
        </p>

        <form onSubmit={handleSubmit} className="form-card">
          {/* Sélection de l'offre */}
          <div className="form-group">
            <label htmlFor="job-select">
              <FaBriefcase style={{ marginRight: '8px' }} />
              Choisissez une offre d'emploi
            </label>
            <select
              id="job-select"
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              disabled={isUploading}
            >
              {jobs.length === 0 && <option>Chargement des offres...</option>}
              {Array.isArray(jobs) &&
                jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} {job.company ? `- ${job.company}` : ''}
                  </option>
                ))}
            </select>
          </div>

          {/* Upload du CV */}
          <div className="form-group">
            <label>
              <FaFileUpload style={{ marginRight: '8px' }} />
              Téléchargez votre CV (PDF)
            </label>
            {!selectedFile ? (
              <div
                className={`dropzone ${isDragging ? 'dragging' : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  type="file"
                  id="file-input"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                  accept=".pdf"
                  style={{ display: 'none' }}
                  disabled={isUploading}
                />
                <FaFileUpload className="dropzone-icon" />
                <p>Glissez-déposez votre fichier PDF ici</p>
                <span>ou cliquez pour sélectionner</span>
              </div>
            ) : (
              <div className="file-preview">
                <FaFilePdf />
                <span>{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                >
                  <FaTimesCircle />
                </button>
              </div>
            )}
          </div>

          {/* Bouton d'analyse */}
          <button type="submit" className="btn" disabled={isUploading || !selectedFile}>
            {isUploading ? (
              <>
                <FaSpinner className="spinner" /> 
                Analyse en cours...
              </>
            ) : (
              <>
                <FaRocket />
                Analyser mon CV avec l'IA
              </>
            )}
          </button>
        </form>

        {/* Message d'état */}
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Résultat de l'analyse */}
        {candidateData && (
          <div className="result-card">
            <div className="result-header">
              <h3>🎯 Résultats de l'analyse IA</h3>
              <button 
                className={`btn-edit ${isEditing ? 'editing' : ''}`}
                onClick={toggleEdit}
              >
                {isEditing ? <FaSave /> : <FaEdit />}
                {isEditing ? 'Sauvegarder' : 'Modifier le profil'}
              </button>
            </div>

            {/* Navigation par onglets */}
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <FaUser style={{ marginRight: '8px' }} />
                Profil
              </button>
              <button 
                className={`tab ${activeTab === 'skills' ? 'active' : ''}`}
                onClick={() => setActiveTab('skills')}
              >
                <FaCode style={{ marginRight: '8px' }} />
                Compétences
              </button>
              <button 
                className={`tab ${activeTab === 'actions' ? 'active' : ''}`}
                onClick={() => setActiveTab('actions')}
              >
                <FaMagic style={{ marginRight: '8px' }} />
                Actions IA
              </button>
            </div>

            {/* Contenu des onglets */}
            {activeTab === 'profile' && (
              <div className="personal-info">
                {isEditing ? (
                  <div className="edit-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          <FaUser style={{ marginRight: '8px' }} />
                          Prénom
                        </label>
                        <input
                          type="text"
                          value={editedData.firstName}
                          onChange={(e) => handleEditChange('firstName', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Nom</label>
                        <input
                          type="text"
                          value={editedData.lastName}
                          onChange={(e) => handleEditChange('lastName', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>
                        <FaEnvelope style={{ marginRight: '8px' }} />
                        Email
                      </label>
                      <input
                        type="email"
                        value={editedData.email}
                        onChange={(e) => handleEditChange('email', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        <FaPhone style={{ marginRight: '8px' }} />
                        Téléphone
                      </label>
                      <input
                        type="text"
                        value={editedData.phone}
                        onChange={(e) => handleEditChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        <FaMapMarkerAlt style={{ marginRight: '8px' }} />
                        Localisation
                      </label>
                      <input
                        type="text"
                        value={editedData.location}
                        onChange={(e) => handleEditChange('location', e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="info-display">
                    <p>
                      <strong>
                        <FaUser style={{ marginRight: '8px' }} />
                        Nom:
                      </strong> 
                      {candidateData.firstName} {candidateData.lastName}
                    </p>
                    <p>
                      <strong>
                        <FaEnvelope style={{ marginRight: '8px' }} />
                        Email:
                      </strong> 
                      {candidateData.email}
                    </p>
                    <p>
                      <strong>
                        <FaPhone style={{ marginRight: '8px' }} />
                        Téléphone:
                      </strong> 
                      {candidateData.phone}
                    </p>
                    <p>
                      <strong>
                        <FaMapMarkerAlt style={{ marginRight: '8px' }} />
                        Localisation:
                      </strong> 
                      {candidateData.location}
                    </p>
                    <p>
                      <strong>
                        <FaBriefcase style={{ marginRight: '8px' }} />
                        Expérience:
                      </strong> 
                      {candidateData.experienceYears} ans
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="skills-section">
                <div className="section-header">
                  <h4>
                    <FaCode style={{ marginRight: '8px' }} />
                    Compétences détectées
                  </h4>
                  {isEditing && (
                    <button className="btn-add" onClick={addSkill}>
                      <FaPlus /> Ajouter
                    </button>
                  )}
                </div>
                <div className="skills-list">
                  {candidateData.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill.name}
                      {skill.level && ` (${Math.round(skill.level * 100)}%)`}
                    </span>
                  ))}
                </div>

                {/* Section des champs manquants */}
                {showMissingFields && candidateData.missingValues && candidateData.missingValues.length > 0 && (
                  <div className="missing-fields-warning">
                    <h4>📋 Informations à compléter</h4>
                    <p>Pour une meilleure amélioration de votre CV, veuillez compléter ces informations :</p>
                    <div className="missing-actions">
                      {candidateData.missingValues.includes('experienceYears') && (
                        <button className="btn-missing" onClick={updateExperience}>
                          <FaBriefcase /> Ajouter l'expérience professionnelle
                        </button>
                      )}
                      {candidateData.missingValues.includes('education') && (
                        <button className="btn-missing" onClick={addEducation}>
                          <FaGraduationCap /> Ajouter une formation
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'actions' && (
              <div className="actions-section">
                <h4>
                  <FaMagic style={{ marginRight: '8px' }} />
                  Actions IA disponibles
                </h4>
                <p className="actions-description">
                  Utilisez la puissance de l'IA pour optimiser votre candidature et découvrir de nouvelles opportunités
                </p>
                
                <div className="actions-grid">
                  {actions.map((action) => {
                    const IconComponent = action.icon;
                    return (
                      <button
                        key={action.type}
                        className="action-btn"
                        onClick={() => handleAction(action.type)}
                        disabled={isProcessing}
                        style={{ 
                          '--action-color': action.color,
                          '--gradient': action.gradient
                        }}
                      >
                        <div className="action-icon">
                          <IconComponent />
                        </div>
                        <div className="action-content">
                          <span className="action-label">{action.label}</span>
                          <span className="action-description">
                            {getActionDescription(action.type)}
                          </span>
                        </div>
                        {isProcessing && <FaSpinner className="spinner" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Résultats des actions */}
            {actionResults && (
              <div className="action-results">
                <h4>
                  <FaChartLine style={{ marginRight: '8px' }} />
                  Résultats: {getActionLabel(actionResults.action)}
                </h4>
                <div className="results-content">
                  <pre>{JSON.stringify(actionResults.data, null, 2)}</pre>
                  <div className="results-meta">
                    Exécuté à: {actionResults.timestamp}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadCV;