import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaFileUpload, FaFilePdf, FaTimesCircle, FaSpinner, FaMagic, FaDatabase, FaSearch, FaSync, FaEdit, FaSave, FaPlus, FaGraduationCap, FaBriefcase } from 'react-icons/fa';

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
        skills: [...prev.skills, { name: newSkill.trim() }]
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
      label: 'Améliorer le CV'
    },
    { 
      type: 'analyze_compatibility', 
      icon: FaSync, 
      color: '#F59E0B',
      label: 'Analyse compatibilité'
    },
    { 
      type: 'find_similar', 
      icon: FaSearch, 
      color: '#10B981',
      label: 'Candidats similaires'
    },
    { 
      type: 'mongo_search', 
      icon: FaDatabase, 
      color: '#3B82F6',
      label: 'Recherche MongoDB'
    }
  ];

  return (
    <div className="page">
      <h1>Déposez votre CV</h1>
      <p className="page-subtitle">
        Sélectionnez une offre et téléchargez votre CV au format PDF pour une analyse instantanée par notre IA.
      </p>

      <form onSubmit={handleSubmit} className="form-card">
        {/* Sélection de l'offre */}
        <div className="form-group">
          <label htmlFor="job-select">1. Choisissez une offre d'emploi</label>
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
                  {job.title}
                </option>
              ))}
          </select>
        </div>

        {/* Upload du CV */}
        <div className="form-group">
          <label>2. Téléchargez votre CV</label>
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
              <FaSpinner className="spinner" /> Analyse en cours...
            </>
          ) : (
            'Analyser mon CV'
          )}
        </button>
      </form>

      {/* Message d'état */}
      {message.text && <p className={`message ${message.type}`}>{message.text}</p>}

      {/* Résultat de l'analyse */}
      {candidateData && (
        <div className="card result-card">
          <div className="result-header">
            <h3>Résultats de l'analyse</h3>
            <button 
              className={`btn-edit ${isEditing ? 'editing' : ''}`}
              onClick={toggleEdit}
            >
              {isEditing ? <FaSave /> : <FaEdit />}
              {isEditing ? 'Sauvegarder' : 'Modifier'}
            </button>
          </div>

          {/* Informations personnelles */}
          <div className="personal-info">
            {isEditing ? (
              <div className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom</label>
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
                  <label>Email</label>
                  <input
                    type="email"
                    value={editedData.email}
                    onChange={(e) => handleEditChange('email', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="text"
                    value={editedData.phone}
                    onChange={(e) => handleEditChange('phone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Localisation</label>
                  <input
                    type="text"
                    value={editedData.location}
                    onChange={(e) => handleEditChange('location', e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="info-display">
                <p><strong>Nom:</strong> {candidateData.firstName} {candidateData.lastName}</p>
                <p><strong>Email:</strong> {candidateData.email}</p>
                <p><strong>Téléphone:</strong> {candidateData.phone}</p>
                <p><strong>Localisation:</strong> {candidateData.location}</p>
                <p><strong>Expérience:</strong> {candidateData.experienceYears} ans</p>
              </div>
            )}
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

          {/* Compétences */}
          <div className="skills-section">
            <div className="section-header">
              <h4>Compétences détectées</h4>
              {isEditing && (
                <button className="btn-add" onClick={addSkill}>
                  <FaPlus /> Ajouter
                </button>
              )}
            </div>
            <div className="skills-list">
              {candidateData.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill.name}</span>
              ))}
            </div>
          </div>

          {/* Actions disponibles */}
          <div className="actions-section">
            <h4>Actions disponibles</h4>
            <p className="actions-description">
              Que souhaitez-vous faire avec ces informations ?
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
                    style={{ '--action-color': action.color }}
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

          {/* Résultats des actions */}
          {actionResults && (
            <div className="action-results">
              <h4>Résultats: {getActionLabel(actionResults.action)}</h4>
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
  );
}

export default UploadCV;