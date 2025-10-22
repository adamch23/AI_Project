import React, { useState } from 'react';
import axios from 'axios';
import './AskN8n.css';

const API_URL = 'http://127.0.0.1:8000';

function AskN8n() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question) return;

    setLoading(true);
    setError('');
    setResponse([]);

    try {
      const res = await axios.post(`${API_URL}/ask_n8n`, { question });
      // Vérifier si la réponse est un tableau
      const data = Array.isArray(res.data.response) ? res.data.response : [res.data.response];
      setResponse(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCandidate = (output) => {
    if (!output) return null;
    const lines = output.split('\n').filter(line => line.trim() !== '');
    return (
      <ul>
        {lines.map((line, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*/g, '') }} />
        ))}
      </ul>
    );
  };

  return (
    <div className="page">
      <h1>Assitant Virtuel</h1>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label>Votre question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Posez une question..."
          />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Envoi en cours...' : 'Envoyer'}
        </button>
      </form>

      {error && <p className="message error">{error}</p>}

      {response.length > 0 && (
        <div className="results-container">
          {response.map((item, index) => (
            <div key={index} className="candidate-card">
              <h3> {index + 1}</h3>
              {renderCandidate(item.output)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AskN8n;
