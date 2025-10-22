import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

function TopCandidates() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // --- Récupération des offres ---
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${API_URL}/jobs`);
        // ✅ Vérifier si response.data est un tableau ou un objet contenant jobs
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

  // --- Récupération des top candidats ---
  const fetchTopCandidates = async (jobId) => {
    if (!jobId) return;
    setLoading(true);
    setMessage('');
    setCandidates([]);

    try {
      const response = await axios.get(`${API_URL}/get_top_candidates/${jobId}?limit=5`);
      const topCandidates = response.data.top_candidates || [];
      setCandidates(topCandidates);

      if (topCandidates.length === 0) {
        setMessage("Aucun candidat trouvé pour cette offre.");
      }
    } catch (error) {
      console.error("Erreur fetchTopCandidates:", error);
      setMessage(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Récupérer les candidats quand l'offre change ---
  useEffect(() => {
    if (selectedJob) {
      fetchTopCandidates(selectedJob);
    }
  }, [selectedJob]);

  return (
    <div className="page">
      <h1>Top 5 des Candidats</h1>

      <div className="form-card">
        <div className="form-group">
          <label>Sélectionner une offre pour voir les meilleurs candidats</label>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            {Array.isArray(jobs) && jobs.length > 0 ? (
              jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))
            ) : (
              <option>Aucune offre disponible</option>
            )}
          </select>
        </div>
      </div>

      {loading && <p>Chargement des candidats...</p>}
      {message && <p className="message">{message}</p>}

      <div className="candidate-list">
        {candidates.map((candidate, index) => {
          const scoreData = candidate.computed?.score_cache?.[`job_${selectedJob}`];
          const score = scoreData ? (scoreData.score * 100).toFixed(2) : 'N/A';

          return (
            <div key={candidate._id} className="card candidate-card">
              <h3>{index + 1}. {candidate.firstName} {candidate.lastName}</h3>
              <div className="score">Score: <strong>{score}%</strong></div>
              <p><strong>Email:</strong> {candidate.email}</p>
              <p><strong>Compétences:</strong> {candidate.skills?.map(s => s.name).join(', ') || 'N/A'}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TopCandidates;
