import React, { useState, useEffect } from 'react';

function CVMatching() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [matchingResult, setMatchingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch('http://localhost:8000/candidates');
      const data = await response.json();
      setCandidates(data.candidates || []);
    } catch (err) {
      setError('Erreur lors du chargement des candidats');
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:8000/jobs');
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (err) {
      setError('Erreur lors du chargement des offres');
    }
  };

  const handleMatch = async () => {
    if (!selectedCandidate || !selectedJob) {
      setError('Veuillez sélectionner un candidat et une offre');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:8000/cv_match/${selectedCandidate}/${selectedJob}`);
      const data = await response.json();
      setMatchingResult(data);
    } catch (err) {
      setError('Erreur lors du matching');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#ef4444';
    return '#6b7280';
  };

  const getMatchLevelColor = (verdict) => {
    if (verdict.includes('Excellent') || verdict.includes('✅')) return '#10b981';
    if (verdict.includes('Bon')) return '#f59e0b';
    if (verdict.includes('Moyen')) return '#ef4444';
    return '#6b7280';
  };

  // Fonction pour extraire le pourcentage du verdict
  const extractScoreFromVerdict = (verdict) => {
    const match = verdict.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  };

  return (
    <div className="cv-matching">
      <div className="matching-header">
        <h1>🔍 Matching CV - Offres</h1>
        <p>Analysez la compatibilité entre les candidats et les offres d'emploi</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="matching-controls">
        <div className="form-group">
          <label>Sélectionner un candidat</label>
          <select 
            value={selectedCandidate} 
            onChange={(e) => setSelectedCandidate(e.target.value)}
            className="form-select"
          >
            <option value="">Choisir un candidat...</option>
            {candidates.map(candidate => (
              <option key={candidate._id} value={candidate._id}>
                {candidate.firstName} {candidate.lastName} - {candidate.email}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Sélectionner une offre</label>
          <select 
            value={selectedJob} 
            onChange={(e) => setSelectedJob(e.target.value)}
            className="form-select"
          >
            <option value="">Choisir une offre...</option>
            {jobs.map(job => (
              <option key={job._id} value={job._id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleMatch}
          disabled={loading || !selectedCandidate || !selectedJob}
          className="match-button"
        >
          {loading ? 'Analyse en cours...' : '🔍 Analyser la compatibilité'}
        </button>
      </div>

      {matchingResult && (
        <div className="matching-results">
          <div className="results-header">
            <h2>Résultats du Matching</h2>
            <div 
              className="score-badge"
              style={{ backgroundColor: getScoreColor(matchingResult.matching_analysis.overall_score) }}
            >
              {matchingResult.matching_analysis.overall_score.toFixed(1)}%
            </div>
            <div 
              className="level-badge"
              style={{ color: getMatchLevelColor(matchingResult.matching_analysis.verdict) }}
            >
              {matchingResult.matching_analysis.verdict}
            </div>
          </div>

          <div className="candidate-job-info">
            <div className="info-card">
              <h4>👤 Candidat</h4>
              <p><strong>Nom:</strong> {matchingResult.candidate.name}</p>
              <p><strong>Email:</strong> {matchingResult.candidate.email}</p>
              <p><strong>Expérience:</strong> {matchingResult.candidate.experience} an(s)</p>
            </div>
            <div className="info-card">
              <h4>💼 Offre d'emploi</h4>
              <p><strong>Titre:</strong> {matchingResult.job.title}</p>
              <p><strong>Entreprise:</strong> {matchingResult.job.company || 'Non spécifiée'}</p>
            </div>
          </div>

          <div className="results-grid">
            <div className="score-card main-score">
              <h3>Score Global</h3>
              <div className="score-circle">
                <div 
                  className="score-value"
                  style={{ color: getScoreColor(matchingResult.matching_analysis.overall_score) }}
                >
                  {matchingResult.matching_analysis.overall_score.toFixed(1)}%
                </div>
              </div>
              <p>{matchingResult.matching_analysis.recommendation}</p>
            </div>

            <div className="score-card">
              <h3>Similarité Textuelle</h3>
              <div className="score-detail">
                {matchingResult.similarity_details.similarity_score > 0 ? 
                  `${(matchingResult.similarity_details.similarity_score * 100).toFixed(1)}%` : 
                  'Faible'
                }
              </div>
              <p>{matchingResult.similarity_details.verdict}</p>
            </div>

            <div className="score-card">
              <h3>Correspondance Compétences</h3>
              <div className="score-detail">
                {matchingResult.matching_analysis.skill_match_ratio}%
              </div>
              <p>{matchingResult.detailed_breakdown.matched_required_count} / {matchingResult.detailed_breakdown.total_required_count} compétences requises</p>
            </div>

            <div className="score-card">
              <h3>Statut Authenticité</h3>
              <div className="score-detail">
                {matchingResult.similarity_details.status}
              </div>
              <p>{matchingResult.similarity_details.verdict}</p>
            </div>
          </div>

          <div className="details-section">
            <div className="skills-section">
              <h4>✅ Compétences correspondantes</h4>
              <div className="skills-list">
                {matchingResult.detailed_breakdown.matching_skills.length > 0 ? (
                  matchingResult.detailed_breakdown.matching_skills.map((skill, index) => (
                    <span key={index} className="skill-tag matching">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="no-skills">Aucune compétence requise correspondante</p>
                )}
              </div>
            </div>

            <div className="skills-section">
              <h4>❌ Compétences requises manquantes</h4>
              <div className="skills-list">
                {matchingResult.detailed_breakdown.missing_required_skills.length > 0 ? (
                  matchingResult.detailed_breakdown.missing_required_skills.map((skill, index) => (
                    <span key={index} className="skill-tag missing">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="no-skills">Toutes les compétences requises sont couvertes</p>
                )}
              </div>
            </div>

            <div className="skills-section">
              <h4>💡 Compétences préférées manquantes</h4>
              <div className="skills-list">
                {matchingResult.detailed_breakdown.missing_preferred_skills.length > 0 ? (
                  matchingResult.detailed_breakdown.missing_preferred_skills.map((skill, index) => (
                    <span key={index} className="skill-tag preferred">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="no-skills">Toutes les compétences préférées sont couvertes</p>
                )}
              </div>
            </div>

            <div className="skills-section">
              <h4>🛠️ Toutes les compétences du candidat</h4>
              <div className="skills-list">
                {matchingResult.candidate.skills.map((skill, index) => (
                  <span key={index} className="skill-tag candidate">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section d'aide */}
      <div className="help-section">
        <h3>Comment interpréter les scores ?</h3>
        <div className="help-grid">
          <div className="help-item">
            <div className="help-color excellent"></div>
            <span>80-100%: Excellent match</span>
          </div>
          <div className="help-item">
            <div className="help-color good"></div>
            <span>60-79%: Bon match</span>
          </div>
          <div className="help-item">
            <div className="help-color average"></div>
            <span>40-59%: Match moyen</span>
          </div>
          <div className="help-item">
            <div className="help-color poor"></div>
            <span>0-39%: Match faible</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cv-matching {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .matching-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .matching-header h1 {
          color: #333;
          margin-bottom: 10px;
        }

        .matching-header p {
          color: #666;
          font-size: 16px;
        }

        .error-message {
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        }

        .matching-controls {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 20px;
          margin-bottom: 30px;
          align-items: end;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 600;
          margin-bottom: 8px;
          color: #374151;
        }

        .form-select {
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background-color: white;
        }

        .match-button {
          padding: 10px 20px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .match-button:hover:not(:disabled) {
          background-color: #2563eb;
        }

        .match-button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .matching-results {
          background-color: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .results-header h2 {
          color: #1f2937;
          margin: 0;
        }

        .score-badge {
          padding: 8px 16px;
          border-radius: 20px;
          color: white;
          font-weight: bold;
          font-size: 18px;
        }

        .level-badge {
          font-weight: bold;
          font-size: 16px;
        }

        .candidate-job-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        .info-card {
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }

        .info-card h4 {
          margin: 0 0 15px 0;
          color: #1f2937;
        }

        .info-card p {
          margin: 5px 0;
          color: #4b5563;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .score-card {
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }

        .score-card.main-score {
          background-color: #eff6ff;
          border: 2px solid #dbeafe;
        }

        .score-card h3 {
          margin: 0 0 15px 0;
          color: #374151;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .score-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
          border: 3px solid #e5e7eb;
        }

        .score-value {
          font-size: 24px;
          font-weight: bold;
        }

        .score-detail {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .skills-section {
          margin-bottom: 25px;
        }

        .skills-section h4 {
          margin: 0 0 15px 0;
          color: #1f2937;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .skill-tag {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .skill-tag.matching {
          background-color: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .skill-tag.missing {
          background-color: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .skill-tag.preferred {
          background-color: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }

        .skill-tag.candidate {
          background-color: #e0e7ff;
          color: #3730a3;
          border: 1px solid #c7d2fe;
        }

        .no-skills {
          color: #6b7280;
          font-style: italic;
        }

        .help-section {
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 8px;
        }

        .help-section h3 {
          margin: 0 0 15px 0;
          color: #1f2937;
        }

        .help-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .help-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .help-color {
          width: 20px;
          height: 20px;
          border-radius: 4px;
        }

        .help-color.excellent { background-color: #10b981; }
        .help-color.good { background-color: #f59e0b; }
        .help-color.average { background-color: #ef4444; }
        .help-color.poor { background-color: #6b7280; }

        @media (max-width: 768px) {
          .matching-controls {
            grid-template-columns: 1fr;
          }
          
          .results-grid {
            grid-template-columns: 1fr;
          }
          
          .candidate-job-info {
            grid-template-columns: 1fr;
          }
          
          .help-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default CVMatching;