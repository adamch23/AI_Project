import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaFileUpload, FaFilePdf, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const API_URL = 'http://127.0.0.1:8000';

function UploadCV() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [candidateData, setCandidateData] = useState(null);

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
    setMessage({ type: 'info', text: 'Analyse de votre CV en cours...' });

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_URL}/upload_cv/${selectedJob}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage({ type: 'success', text: response.data.message || 'CV analysé avec succès !' });
      setCandidateData(response.data.candidate);
    } catch (error) {
      console.error('Erreur lors de l’envoi du CV :', error);
      setMessage({
        type: 'error',
        text: `Erreur: ${error.response?.data?.detail || error.message}`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="page">
      <h1>Déposez votre CV</h1>
      <p className="page-subtitle">
        Sélectionnez une offre et téléchargez votre CV au format PDF pour une analyse instantanée par notre IA.
      </p>

      <form onSubmit={handleSubmit} className="form-card">
        {/* Sélection de l’offre */}
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

        {/* Bouton d’analyse */}
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

      {/* Message d’état */}
      {message.text && <p className={`message ${message.type}`}>{message.text}</p>}

      {/* Résultat de l’analyse */}
      {candidateData && (
        <div className="card result-card">
          <h3>Résultats de l'analyse</h3>

          <p><strong>Nom:</strong> {candidateData.firstName} {candidateData.lastName}</p>
          <p><strong>Email:</strong> {candidateData.email}</p>
          <p><strong>Téléphone:</strong> {candidateData.phone}</p>
          <p><strong>Localisation:</strong> {candidateData.location}</p>

          {candidateData.skills && candidateData.skills.length > 0 && (
            <div>
              <strong>Compétences détectées:</strong>
              <div className="skills-list">
                {candidateData.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill.name}</span>
                ))}
              </div>
            </div>
          )}

          {candidateData.certifications && candidateData.certifications.length > 0 && (
            <div>
              <strong>Certifications:</strong>
              <ul>
                {candidateData.certifications.map((cert, index) => (
                  <li key={index}>{cert}</li>
                ))}
              </ul>
            </div>
          )}

          {candidateData.education && candidateData.education.length > 0 && (
            <div>
              <strong>Éducation:</strong>
              <ul>
                {candidateData.education.map((edu, index) => (
                  <li key={index}>{edu.level} - {edu.field} ({edu.year})</li>
                ))}
              </ul>
            </div>
          )}

          <p><strong>Expérience:</strong> {candidateData.experienceYears} ans</p>

          {candidateData.missingValues && candidateData.missingValues.length > 0 && (
            <div>
              <strong>Valeurs manquantes:</strong> {candidateData.missingValues.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UploadCV;
