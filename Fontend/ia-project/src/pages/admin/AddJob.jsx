import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000'; // URL de votre backend FastAPI

function AddJob() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [minExperience, setMinExperience] = useState(0);
  const [requiredSkills, setRequiredSkills] = useState(''); // Comma-separated
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Transformer les compétences en format attendu par l'API
    const skillsList = requiredSkills.split(',')
      .map(skill => skill.trim())
      .filter(skill => skill)
      .map(skillName => ({ name: skillName, level: 0.8 })); // niveau par défaut

    const jobData = {
      title,
      location,
      min_experience: parseInt(minExperience, 10),
      required_skills: skillsList,
      // Vous pouvez ajouter des champs pour preferred_skills, education_preference, etc.
    };

    try {
      const response = await axios.post(`${API_URL}/add_job`, jobData);
      setMessage(`Offre ajoutée avec succès ! ID: ${response.data.id}`);
      // Vider le formulaire
      setTitle('');
      setLocation('');
      setMinExperience(0);
      setRequiredSkills('');
    } catch (error) {
      setMessage(`Erreur: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <div className="page">
      <h1>Ajouter une Nouvelle Offre d'Emploi</h1>
      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label>Titre du poste</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Lieu</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Expérience minimum (années)</label>
          <input type="number" value={minExperience} onChange={(e) => setMinExperience(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Compétences requises (séparées par une virgule)</label>
          <input type="text" value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)} placeholder="ex: Python, React, FastAPI" />
        </div>
        <button type="submit" className="btn">Ajouter l'Offre</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default AddJob;