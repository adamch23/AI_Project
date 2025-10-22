import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

function ScreeningClassification() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      setMessage('');
      try {
        const res = await axios.get(`${API_URL}/screening_classification`);
        const data = res.data.screening_classification_candidates || [];
        setCandidates(data);
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

  return (
    <div className="page">
      <h1>Candidats - Screening Classification</h1>
      {loading && <p>Chargement des candidats...</p>}
      {message && <p className="message">{message}</p>}
      <div className="candidate-list">
        {candidates.map((c, index) => (
          <div key={c._id} className="card candidate-card">
            <h3>{index + 1}. {c.firstName} {c.lastName}</h3>
            <p><strong>Email:</strong> {c.email}</p>
            <p>
              <strong>Screening Class:</strong> {c.screening_classification?.screening_class || 'N/A'} 
              (Confidence: {c.screening_classification?.confidence?.toFixed(2) || 'N/A'})
            </p>
            <p>
              <strong>Engagement Prediction:</strong> {c.engagement_prediction?.engagement_label || 'N/A'} 
              (Score: {c.engagement_prediction?.engagement_score?.toFixed(2) || 'N/A'})
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScreeningClassification;
