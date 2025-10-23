import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

function ScreeningClassification() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    byScreeningClass: {},
    byEngagement: {},
    avgConfidence: 0,
    avgEngagement: 0
  });

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      setMessage('');
      try {
        const res = await axios.get(`${API_URL}/screening_classification?limit=50`);
        const data = res.data.screening_classification_candidates || [];
        setCandidates(data);
        
        // Calcul des statistiques
        calculateStats(data);
        
        if (data.length === 0) setMessage('Aucun candidat trouvé.');
      } catch (err) {
        console.error(err);
        setMessage(`Erreur: ${err.response?.data?.detail || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const calculateStats = (candidatesData) => {
    const screeningClasses = {};
    const engagementLabels = {};
    let totalConfidence = 0;
    let totalEngagement = 0;
    let validConfidence = 0;
    let validEngagement = 0;

    candidatesData.forEach(candidate => {
      // Statistiques par screening class
      const screeningClass = candidate.screening_classification?.screening_class || 'Non classé';
      screeningClasses[screeningClass] = (screeningClasses[screeningClass] || 0) + 1;

      // Statistiques par engagement
      const engagement = candidate.engagement_prediction?.engagement_label || 'Non évalué';
      engagementLabels[engagement] = (engagementLabels[engagement] || 0) + 1;

      // Calcul des moyennes
      if (candidate.screening_classification?.confidence) {
        totalConfidence += candidate.screening_classification.confidence;
        validConfidence++;
      }

      if (candidate.engagement_prediction?.engagement_score) {
        totalEngagement += candidate.engagement_prediction.engagement_score;
        validEngagement++;
      }
    });

    setStats({
      total: candidatesData.length,
      byScreeningClass: screeningClasses,
      byEngagement: engagementLabels,
      avgConfidence: validConfidence > 0 ? totalConfidence / validConfidence : 0,
      avgEngagement: validEngagement > 0 ? totalEngagement / validEngagement : 0
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return '#28a745';
    if (confidence >= 0.5) return '#ffc107';
    return '#dc3545';
  };

  const getEngagementColor = (engagement) => {
    switch (engagement) {
      case 'Motivé': return '#28a745';
      case 'Risque de turnover': return '#dc3545';
      case 'Neutre': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getScreeningClassColor = (screeningClass) => {
    switch (screeningClass) {
      case 'Motivé': return '#17a2b8';
      case 'Ambitieux': return '#ffc107';
      case 'Stable': return '#28a745';
      case 'À risque': return '#dc3545';
      default: return '#6c757d';
    }
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

        h2 {
          color: #34495e;
          margin: 30px 0 20px 0;
          font-size: 1.8rem;
          font-weight: 400;
          border-bottom: 2px solid #ecf0f1;
          padding-bottom: 10px;
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

        /* Statistics Section */
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
          border-top: 4px solid #3498db;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2c3e50;
          margin: 10px 0;
        }

        .stat-label {
          color: #7f8c8d;
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 40px;
        }

        .distribution-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .distribution-card h3 {
          color: #2c3e50;
          margin-bottom: 20px;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .distribution-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #ecf0f1;
        }

        .distribution-item:last-child {
          border-bottom: none;
        }

        .distribution-label {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .color-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
        }

        .distribution-count {
          font-weight: 600;
          color: #2c3e50;
        }

        .distribution-percentage {
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        /* Candidates List */
        .candidate-list {
          display: grid;
          gap: 20px;
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
          font-size: 1.3rem;
          font-weight: 600;
        }

        .candidate-badges {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .screening-badge, .engagement-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .confidence-badge {
          background: #6c757d;
          color: white;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .candidate-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .detail-group {
          margin-bottom: 15px;
        }

        .detail-group strong {
          color: #2c3e50;
          display: block;
          margin-bottom: 5px;
          font-size: 0.9rem;
        }

        .detail-value {
          color: #555;
          font-size: 1rem;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #ecf0f1;
          border-radius: 4px;
          margin-top: 5px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .page {
            padding: 15px;
          }

          h1 {
            font-size: 2rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .candidate-details {
            grid-template-columns: 1fr;
          }

          .candidate-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .candidate-badges {
            width: 100%;
            justify-content: flex-start;
          }

          .stats-section {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }
        }

        @media (max-width: 480px) {
          h1 {
            font-size: 1.75rem;
          }

          .stat-number {
            font-size: 2rem;
          }

          .candidate-header h3 {
            font-size: 1.1rem;
          }

          .screening-badge, .engagement-badge {
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

        .refresh-section {
          text-align: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 2px solid #e9ecef;
        }

        .refresh-btn {
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(52, 152, 219, 0.3);
        }

        .refresh-btn:hover {
          background: linear-gradient(135deg, #2980b9, #2471a3);
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(52, 152, 219, 0.4);
        }
      `}</style>

      <h1>Candidats - Screening Classification</h1>

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

      {/* Statistics Section */}
      {candidates.length > 0 && (
        <>
          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-label">Total Candidats</div>
              <div className="stat-number">{stats.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Confiance Moyenne</div>
              <div className="stat-number">{(stats.avgConfidence * 100).toFixed(1)}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Engagement Moyen</div>
              <div className="stat-number">{(stats.avgEngagement * 100).toFixed(1)}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Candidats Motivés</div>
              <div className="stat-number">{stats.byEngagement['Motivé'] || 0}</div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="distribution-card">
              <h3>Répartition par Screening Class</h3>
              {Object.entries(stats.byScreeningClass).map(([className, count]) => (
                <div key={className} className="distribution-item">
                  <div className="distribution-label">
                    <span 
                      className="color-dot" 
                      style={{ backgroundColor: getScreeningClassColor(className) }}
                    ></span>
                    {className}
                  </div>
                  <div>
                    <span className="distribution-count">{count}</span>
                    <span className="distribution-percentage">
                      {' '}({((count / stats.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="distribution-card">
              <h3>Répartition par Engagement</h3>
              {Object.entries(stats.byEngagement).map(([engagement, count]) => (
                <div key={engagement} className="distribution-item">
                  <div className="distribution-label">
                    <span 
                      className="color-dot" 
                      style={{ backgroundColor: getEngagementColor(engagement) }}
                    ></span>
                    {engagement}
                  </div>
                  <div>
                    <span className="distribution-count">{count}</span>
                    <span className="distribution-percentage">
                      {' '}({((count / stats.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h2>Liste des Candidats</h2>
        </>
      )}

      {/* Candidates List */}
      <div className="candidate-list">
        {candidates.map((candidate, index) => (
          <div key={candidate._id} className="candidate-card">
            <div className="candidate-header">
              <h3>{index + 1}. {candidate.firstName} {candidate.lastName}</h3>
              <div className="candidate-badges">
                <div 
                  className="screening-badge"
                  style={{ backgroundColor: getScreeningClassColor(candidate.screening_classification?.screening_class) }}
                >
                  {candidate.screening_classification?.screening_class || 'Non classé'}
                </div>
                <div 
                  className="engagement-badge"
                  style={{ backgroundColor: getEngagementColor(candidate.engagement_prediction?.engagement_label) }}
                >
                  {candidate.engagement_prediction?.engagement_label || 'Non évalué'}
                </div>
              </div>
            </div>
            
            <div className="candidate-details">
              <div className="detail-group">
                <strong>Email</strong>
                <div className="detail-value">{candidate.email}</div>
              </div>
              
              <div className="detail-group">
                <strong>Localisation</strong>
                <div className="detail-value">{candidate.location || 'Non spécifiée'}</div>
              </div>

              <div className="detail-group">
                <strong>Screening Classification</strong>
                <div className="detail-value">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>{candidate.screening_classification?.screening_class || 'N/A'}</span>
                    <span 
                      className="confidence-badge"
                      style={{ backgroundColor: getConfidenceColor(candidate.screening_classification?.confidence || 0) }}
                    >
                      {(candidate.screening_classification?.confidence * 100)?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${(candidate.screening_classification?.confidence || 0) * 100}%`,
                        backgroundColor: getConfidenceColor(candidate.screening_classification?.confidence || 0)
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="detail-group">
                <strong>Engagement Prediction</strong>
                <div className="detail-value">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>{candidate.engagement_prediction?.engagement_label || 'N/A'}</span>
                    <span 
                      className="confidence-badge"
                      style={{ backgroundColor: getConfidenceColor(candidate.engagement_prediction?.engagement_score || 0) }}
                    >
                      {(candidate.engagement_prediction?.engagement_score * 100)?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${(candidate.engagement_prediction?.engagement_score || 0) * 100}%`,
                        backgroundColor: getConfidenceColor(candidate.engagement_prediction?.engagement_score || 0)
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      {candidates.length > 0 && !loading && (
        <div className="refresh-section">
          <button 
            onClick={() => window.location.reload()}
            className="refresh-btn"
          >
            🔄 Actualiser les données
          </button>
        </div>
      )}
    </div>
  );
}

export default ScreeningClassification;