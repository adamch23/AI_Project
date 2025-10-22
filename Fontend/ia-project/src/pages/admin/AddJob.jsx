import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook-test/bafec242-e4fa-42cc-9210-bd920b49a90e';

function AddJob() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [minExperience, setMinExperience] = useState(0);
  const [requiredSkills, setRequiredSkills] = useState('');
  const [description, setDescription] = useState('');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [workplaceType, setWorkplaceType] = useState('ON_SITE');
  const [salary, setSalary] = useState('');
  const [message, setMessage] = useState('');
  const [jobId, setJobId] = useState(null);
  
  // États pour le modal We Are Hiring
  const [showWeAreHiringModal, setShowWeAreHiringModal] = useState(false);
  const [weAreHiringData, setWeAreHiringData] = useState({
    companyName: '',
    positions: [''],
    benefits: [''],
    applicationEmail: '',
    customMessage: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const skillsList = requiredSkills.split(',')
      .map(skill => skill.trim())
      .filter(skill => skill)
      .map(skillName => ({ name: skillName, level: 0.8 }));

    const jobData = {
      title,
      location,
      min_experience: parseInt(minExperience, 10),
      required_skills: skillsList,
      description,
      employment_type: employmentType,
      workplace_type: workplaceType,
      salary
    };

    try {
      const response = await axios.post(`${API_URL}/add_job`, jobData);
      const newJobId = response.data.id;
      setJobId(newJobId);
      setMessage(`✅ Offre ajoutée avec succès ! ID: ${newJobId}`);
      resetForm();
    } catch (error) {
      setMessage(`❌ Erreur: ${error.response?.data?.detail || error.message}`);
    }
  };

  const resetForm = () => {
    setTitle('');
    setLocation('');
    setMinExperience(0);
    setRequiredSkills('');
    setDescription('');
    setEmploymentType('FULL_TIME');
    setWorkplaceType('ON_SITE');
    setSalary('');
  };

  // Fonctions pour gérer le modal We Are Hiring
  const openWeAreHiringModal = () => {
    // Pré-remplir avec les données du formulaire principal si disponibles
    setWeAreHiringData({
      companyName: 'Votre Entreprise',
      positions: title ? [title] : [''],
      benefits: requiredSkills ? [requiredSkills] : [''],
      applicationEmail: 'recrutement@entreprise.com',
      customMessage: description || ''
    });
    setShowWeAreHiringModal(true);
  };

  const closeWeAreHiringModal = () => {
    setShowWeAreHiringModal(false);
  };

  const updateWeAreHiringField = (field, value) => {
    setWeAreHiringData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addPosition = () => {
    setWeAreHiringData(prev => ({
      ...prev,
      positions: [...prev.positions, '']
    }));
  };

  const updatePosition = (index, value) => {
    const newPositions = [...weAreHiringData.positions];
    newPositions[index] = value;
    setWeAreHiringData(prev => ({
      ...prev,
      positions: newPositions
    }));
  };

  const removePosition = (index) => {
    const newPositions = weAreHiringData.positions.filter((_, i) => i !== index);
    setWeAreHiringData(prev => ({
      ...prev,
      positions: newPositions.length > 0 ? newPositions : ['']
    }));
  };

  const addBenefit = () => {
    setWeAreHiringData(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  const updateBenefit = (index, value) => {
    const newBenefits = [...weAreHiringData.benefits];
    newBenefits[index] = value;
    setWeAreHiringData(prev => ({
      ...prev,
      benefits: newBenefits
    }));
  };

  const removeBenefit = (index) => {
    const newBenefits = weAreHiringData.benefits.filter((_, i) => i !== index);
    setWeAreHiringData(prev => ({
      ...prev,
      benefits: newBenefits.length > 0 ? newBenefits : ['']
    }));
  };

  const publishWeAreHiring = async () => {
    setMessage('Publication "We Are Hiring" sur LinkedIn...');

    try {
      // Filtrer les positions et avantages vides
      const filteredPositions = weAreHiringData.positions.filter(pos => pos.trim());
      const filteredBenefits = weAreHiringData.benefits.filter(benefit => benefit.trim());

      // Construire le message LinkedIn
      let linkedinMessage = `🚀 WE ARE HIRING! 🚀\n\n`;
      
      if (weAreHiringData.companyName) {
        linkedinMessage += `Chez ${weAreHiringData.companyName}, nous recrutons !\n\n`;
      }

      if (filteredPositions.length > 0) {
        linkedinMessage += `💼 POSTES OUVERTS :\n`;
        filteredPositions.forEach(position => {
          linkedinMessage += `• ${position}\n`;
        });
        linkedinMessage += `\n`;
      }

      if (filteredBenefits.length > 0) {
        linkedinMessage += `✨ CE QUE NOUS OFFRONS :\n`;
        filteredBenefits.forEach(benefit => {
          linkedinMessage += `• ${benefit}\n`;
        });
        linkedinMessage += `\n`;
      }

      if (weAreHiringData.customMessage) {
        linkedinMessage += `${weAreHiringData.customMessage}\n\n`;
      }

      linkedinMessage += `📨 Pour postuler : ${weAreHiringData.applicationEmail || 'contact@entreprise.com'}\n\n`;
      linkedinMessage += `#hiring #recruitment #careers #emploi #recrutement #wearehiring #jobs`;

      const weAreHiringDataToSend = {
        action: 'we_are_hiring',
        message: linkedinMessage,
        company: weAreHiringData.companyName,
        positions: filteredPositions,
        benefits: filteredBenefits,
        application_email: weAreHiringData.applicationEmail,
        post_type: "we_are_hiring"
      };

      const n8nResponse = await axios.post(N8N_WEBHOOK_URL, weAreHiringDataToSend);
      
      setMessage('✅ Publication "We Are Hiring" publiée avec succès sur LinkedIn !');
      closeWeAreHiringModal();
      
    } catch (error) {
      console.error('Erreur publication:', error);
      setMessage(`❌ Erreur lors de la publication: ${error.response?.data?.message || error.message}`);
    }
  };

  const triggerN8nLinkedIn = async () => {
    if (!jobId) {
      setMessage('Veuillez d\'abord créer une offre d\'emploi');
      return;
    }

    setMessage('Déclenchement du workflow n8n LinkedIn...');

    try {
      const jobResponse = await axios.get(`${API_URL}/jobs/${jobId}`);
      const jobDetails = jobResponse.data;

      const n8nData = {
        action: 'publish_to_linkedin',
        job_id: jobId,
        job_data: {
          title: jobDetails.title,
          location: jobDetails.location,
          description: jobDetails.description || `${jobDetails.title} - ${jobDetails.location}`,
          experience: jobDetails.min_experience,
          skills: jobDetails.required_skills.map(skill => skill.name).join(', '),
          company: "Votre entreprise",
          employmentType: "FULL_TIME",
          workplaceType: "ON_SITE"
        }
      };

      await axios.post(N8N_WEBHOOK_URL, n8nData);
      setMessage('✅ Workflow n8n LinkedIn déclenché avec succès !');
      
    } catch (error) {
      console.error('Erreur n8n:', error);
      setMessage(`❌ Erreur lors du déclenchement n8n: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="page">
      <h1>Ajouter une Nouvelle Offre d'Emploi</h1>
      
      {/* Section Publication We Are Hiring */}
      <div className="quick-action-section">
        <h3>Publication Rapide LinkedIn</h3>
        <button 
          onClick={openWeAreHiringModal}
          className="btn btn-hiring"
        >
          🚀 Publier "We Are Hiring" sur LinkedIn
        </button>
        <p className="quick-action-desc">
          Créez un post attractif "We are hiring" avec vos offres actuelles
        </p>
      </div>

      {/* Formulaire principal */}
      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label>Titre du poste *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Lieu</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Expérience minimum (années)</label>
            <input type="number" value={minExperience} onChange={(e) => setMinExperience(e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Type de contrat</label>
            <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
              <option value="FULL_TIME">Temps plein</option>
              <option value="PART_TIME">Temps partiel</option>
              <option value="CONTRACT">Contrat</option>
              <option value="REMOTE">Télétravail</option>
            </select>
          </div>
          <div className="form-group">
            <label>Salaire</label>
            <input type="text" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="ex: 45k-55k€" />
          </div>
        </div>

        <div className="form-group">
          <label>Compétences requises (séparées par des virgules)</label>
          <input type="text" value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)} placeholder="ex: Python, React, FastAPI" />
        </div>

        <div className="form-group">
          <label>Description du poste</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Décrivez les missions, responsabilités et exigences du poste..."
            rows="4"
          />
        </div>
        
        <div className="button-group">
          <button type="submit" className="btn btn-primary">
            💼 Ajouter l'Offre
          </button>
        </div>
      </form>

      {jobId && (
        <div className="n8n-section">
          <h3>Publication Automatique de l'Offre</h3>
          <p>Offre créée avec l'ID: {jobId}</p>
          <button onClick={triggerN8nLinkedIn} className="btn btn-n8n">
            📤 Publier cette offre sur LinkedIn via n8n
          </button>
        </div>
      )}

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : 'info'}`}>
          {message}
        </div>
      )}

      {/* Modal We Are Hiring */}
      {showWeAreHiringModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>🚀 Publication "We Are Hiring"</h2>
              <button className="close-btn" onClick={closeWeAreHiringModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Nom de l'entreprise *</label>
                <input 
                  type="text" 
                  value={weAreHiringData.companyName}
                  onChange={(e) => updateWeAreHiringField('companyName', e.target.value)}
                  placeholder="ex: Tech Solutions Inc."
                  required
                />
              </div>

              <div className="form-group">
                <label>Postes à pourvoir *</label>
                {weAreHiringData.positions.map((position, index) => (
                  <div key={index} className="input-with-remove">
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => updatePosition(index, e.target.value)}
                      placeholder="ex: Développeur Full Stack"
                    />
                    {weAreHiringData.positions.length > 1 && (
                      <button type="button" className="remove-btn" onClick={() => removePosition(index)}>
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-more-btn" onClick={addPosition}>
                  + Ajouter un autre poste
                </button>
              </div>

              <div className="form-group">
                <label>Avantages et bénéfices</label>
                {weAreHiringData.benefits.map((benefit, index) => (
                  <div key={index} className="input-with-remove">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder="ex: Télétravail, Mutuelle, Équipe dynamique"
                    />
                    {weAreHiringData.benefits.length > 1 && (
                      <button type="button" className="remove-btn" onClick={() => removeBenefit(index)}>
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-more-btn" onClick={addBenefit}>
                  + Ajouter un avantage
                </button>
              </div>

              <div className="form-group">
                <label>Email de candidature</label>
                <input 
                  type="email" 
                  value={weAreHiringData.applicationEmail}
                  onChange={(e) => updateWeAreHiringField('applicationEmail', e.target.value)}
                  placeholder="recrutement@entreprise.com"
                />
              </div>

              <div className="form-group">
                <label>Message personnalisé</label>
                <textarea 
                  value={weAreHiringData.customMessage}
                  onChange={(e) => updateWeAreHiringField('customMessage', e.target.value)}
                  placeholder="Ajoutez un message personnalisé pour votre post..."
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeWeAreHiringModal}>
                Annuler
              </button>
              <button type="button" className="btn btn-hiring" onClick={publishWeAreHiring}>
                📤 Publier sur LinkedIn
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .quick-action-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 25px;
          border-radius: 10px;
          margin-bottom: 30px;
          text-align: center;
          color: white;
        }

        .quick-action-section h3 {
          margin: 0 0 15px 0;
          color: white;
          font-size: 1.3em;
        }

        .quick-action-desc {
          margin: 10px 0 0 0;
          opacity: 0.9;
          font-size: 0.9em;
        }

        .form-card {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #333;
        }

        input, select, textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
        }

        textarea {
          resize: vertical;
          min-height: 80px;
        }

        .button-group {
          margin-top: 20px;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s;
          margin: 5px;
        }

        .btn-primary {
          background-color: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background-color: #0056b3;
        }

        .btn-hiring {
          background-color: #28a745;
          color: white;
          font-size: 16px;
          padding: 15px 30px;
        }

        .btn-hiring:hover {
          background-color: #1e7e34;
          transform: translateY(-2px);
        }

        .btn-n8n {
          background-color: #ff6b0f;
          color: white;
        }

        .btn-n8n:hover {
          background-color: #e55a0a;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background-color: #545b62;
        }

        .n8n-section {
          margin-top: 30px;
          padding: 20px;
          border: 2px dashed #ff6b0f;
          border-radius: 8px;
          background-color: #fff4ec;
          text-align: center;
        }

        .message {
          margin-top: 20px;
          padding: 15px;
          border-radius: 5px;
          font-weight: 500;
          text-align: center;
        }

        .message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 10px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .modal-header h2 {
          margin: 0;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }

        .modal-body {
          padding: 20px;
        }

        .modal-footer {
          padding: 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .input-with-remove {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .input-with-remove input {
          flex: 1;
        }

        .remove-btn {
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 5px;
          width: 40px;
          cursor: pointer;
        }

        .add-more-btn {
          background: none;
          border: 1px dashed #007bff;
          color: #007bff;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 12px;
        }

        .add-more-btn:hover {
          background: #007bff;
          color: white;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .modal-footer {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default AddJob;