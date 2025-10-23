import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

function TopCandidates() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch jobs on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${API_URL}/jobs`);
        const jobList = Array.isArray(response.data) ? response.data : response.data.jobs || [];
        setJobs(jobList);

        if (jobList.length > 0) {
          setSelectedJob(jobList[0]._id);
        }
      } catch (error) {
        console.error("Erreur chargement jobs:", error);
        setMessage("Erreur lors du chargement des offres.");
      }
    };
    fetchJobs();
  }, []);

  // Fetch top candidates when selected job changes
  useEffect(() => {
    if (selectedJob) {
      fetchTopCandidates(selectedJob);
    }
  }, [selectedJob]);

  const fetchTopCandidates = async (jobId) => {
    if (!jobId) return;
    
    setLoading(true);
    setMessage('');
    setCandidates([]);

    try {
      const response = await axios.get(
        `${API_URL}/get_top_candidates/${jobId}?limit=5`
      );
      const topCandidates = response.data.top_candidates || [];
      setCandidates(topCandidates);

      if (topCandidates.length === 0) {
        setMessage("Aucun candidat trouvé pour cette offre.");
      }
    } catch (error) {
      console.error("Erreur fetchTopCandidates:", error);
      setMessage(`Erreur lors du chargement des candidats: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get candidate score for the selected job
  const getCandidateScore = (candidate) => {
    const scoreData = candidate.computed?.score_cache?.[`job_${selectedJob}`];
    return scoreData ? (scoreData.score * 100).toFixed(1) : 'N/A';
  };

  // Get candidate screening classification
  const getScreeningClass = (candidate) => {
    return candidate.screening_classification?.screening_class || 'Non classé';
  };

  return (
    <div className="page">
      <style jsx>{`
        .page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        h1 {
          color: #2c3e50;
          text-align: center;
          margin-bottom: 30px;
          font-size: 2.5rem;
          font-weight: 300;
        }

        .form-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
          border: 1px solid #e1e8ed;
        }

        .form-group {
          margin-bottom: 0;
        }

        label {
          display: block;
          margin-bottom: 10px;
          font-weight: 600;
          color: #2c3e50;
          font-size: 1.1rem;
        }

        select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e1e8ed;
          border-radius: 8px;
          font-size: 1rem;
          background: white;
          transition: all 0.3s ease;
        }

        select:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        select:disabled {
          background-color: #f8f9fa;
          opacity: 0.7;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #6c757d;
          font-size: 1.1rem;
        }

        .message {
          padding: 16px;
          border-radius: 8px;
          margin: 20px 0;
          font-weight: 500;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .message.info {
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }

        .candidate-list {
          display: grid;
          gap: 20px;
          margin-top: 30px;
        }

        .candidate-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-left: 6px solid #3498db;
          transition: all 0.3s ease;
          border: 1px solid #e1e8ed;
        }

        .candidate-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
        }

        .candidate-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .candidate-header h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.4rem;
          font-weight: 600;
        }

        .candidate-badges {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .score-badge {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
        }

        .class-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .class-badge.ambitieux {
          background: linear-gradient(135deg, #ffc107, #ffb300);
          color: #000;
        }

        .class-badge.motivé {
          background: linear-gradient(135deg, #17a2b8, #138496);
          color: #fff;
        }

        .class-badge.non.classé {
          background: linear-gradient(135deg, #6c757d, #5a6268);
          color: #fff;
        }

        .candidate-details {
          color: #555;
        }

        .candidate-details p {
          margin: 8px 0;
          line-height: 1.5;
        }

        .candidate-details strong {
          color: #2c3e50;
        }

        .skills-section {
          margin: 15px 0;
        }

        .skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        .skill-tag {
          background: linear-gradient(135deg, #e9ecef, #dee2e6);
          color: #495057;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 0.8rem;
          font-weight: 500;
          border: 1px solid #ced4da;
        }

        .engagement-info {
          margin-top: 15px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #6c757d;
        }

        .engagement-motivé {
          color: #28a745;
          font-weight: 600;
          margin-left: 8px;
        }

        .engagement-risque.de.turnover {
          color: #dc3545;
          font-weight: 600;
          margin-left: 8px;
        }

        .refresh-section {
          text-align: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 2px solid #e9ecef;
        }

        .refresh-btn {
          background: linear-gradient(135deg, #6c757d, #5a6268);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(108, 117, 125, 0.3);
        }

        .refresh-btn:hover {
          background: linear-gradient(135deg, #5a6268, #495057);
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(108, 117, 125, 0.4);
        }

        .refresh-btn:active {
          transform: translateY(0);
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .page {
            padding: 15px;
          }

          h1 {
            font-size: 2rem;
          }

          .candidate-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .candidate-badges {
            width: 100%;
            justify-content: flex-start;
          }

          .form-card {
            padding: 20px;
          }

          .candidate-card {
            padding: 20px;
          }
        }

        @media (max-width: 480px) {
          h1 {
            font-size: 1.75rem;
          }

          .candidate-header h3 {
            font-size: 1.2rem;
          }

          .score-badge,
          .class-badge {
            font-size: 0.8rem;
            padding: 6px 12px;
          }
        }

        /* Animation for loading state */
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .loading p {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>

      <h1>Top 5 des Candidats</h1>

      {/* Job Selection */}
      <div className="form-card">
        <div className="form-group">
          <label htmlFor="job-select">
            Sélectionner une offre pour voir les meilleurs candidats
          </label>
          <select
            id="job-select"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            disabled={loading}
          >
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title} {job.company ? `- ${job.company}` : ''}
                </option>
              ))
            ) : (
              <option value="">Aucune offre disponible</option>
            )}
          </select>
        </div>
      </div>

      {/* Loading and Messages */}
      {loading && (
        <div className="loading">
          <p>Chargement des candidats...</p>
        </div>
      )}
      
      {message && (
        <div className={`message ${message.includes('Erreur') ? 'error' : 'info'}`}>
          {message}
        </div>
      )}

      {/* Candidates List */}
      <div className="candidate-list">
        {candidates.map((candidate, index) => (
          <div key={candidate._id} className="candidate-card">
            <div className="candidate-header">
              <h3>
                {index + 1}. {candidate.firstName} {candidate.lastName}
              </h3>
              <div className="candidate-badges">
                <span className="score-badge">
                  Score: <strong>{getCandidateScore(candidate)}%</strong>
                </span>
                <span className={`class-badge ${getScreeningClass(candidate).toLowerCase().replace(' ', '.')}`}>
                  {getScreeningClass(candidate)}
                </span>
              </div>
            </div>
            
            <div className="candidate-details">
              <p><strong>Email:</strong> {candidate.email}</p>
              <p><strong>Localisation:</strong> {candidate.location || 'Non spécifiée'}</p>
              <p><strong>Expérience:</strong> {candidate.experienceYears || 0} an(s)</p>
              
              <div className="skills-section">
                <strong>Compétences principales:</strong>
                <div className="skills-tags">
                  {candidate.skills?.slice(0, 5).map((skill, idx) => (
                    <span key={idx} className="skill-tag">
                      {skill.name} ({Math.round(skill.level * 100)}%)
                    </span>
                  )) || 'Aucune compétence'}
                </div>
              </div>

              {/* Engagement Prediction */}
              {candidate.engagement_prediction && (
                <div className="engagement-info">
                  <strong>Engagement:</strong> 
                  <span className={`engagement-${candidate.engagement_prediction.engagement_label.toLowerCase().replace(' ', '.')}`}>
                    {candidate.engagement_prediction.engagement_label}
                  </span>
                  <span style={{marginLeft: '10px', color: '#6c757d'}}>
                    (Confiance: {(candidate.engagement_prediction.engagement_score * 100).toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      {selectedJob && !loading && (
        <div className="refresh-section">
          <button 
            onClick={() => fetchTopCandidates(selectedJob)}
            className="refresh-btn"
          >
            🔄 Actualiser les résultats
          </button>
        </div>
      )}
    </div>
  );
}

export default TopCandidates;