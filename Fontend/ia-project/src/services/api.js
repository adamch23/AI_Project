const API_BASE_URL = 'http://localhost:8000';

class RecruitAIApi {
  // Health Check
  async getHealth() {
    const response = await fetch(`${API_BASE_URL}/api/health-advanced`);
    return response.json();
  }

  // Candidats
  async getCandidates() {
    const response = await fetch(`${API_BASE_URL}/candidates`);
    return response.json();
  }

  // Offres d'emploi
  async getJobs() {
    const response = await fetch(`${API_BASE_URL}/jobs`);
    return response.json();
  }

  // Matching candidat-offre
  async matchCandidateJob(candidateId, jobId) {
    const response = await fetch(`${API_BASE_URL}/api/match-candidate-job`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_id: candidateId, job_id: jobId })
    });
    return response.json();
  }

  // Génération de questions d'entretien
  async generateInterviewQuestions(requestData) {
    const response = await fetch(`${API_BASE_URL}/api/generate-interview-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    return response.json();
  }

  // Analyse des compétences CV
  async analyzeCVSkills(candidateId) {
    const response = await fetch(`${API_BASE_URL}/api/analyze-cv-skills/${candidateId}`, {
      method: 'POST'
    });
    return response.json();
  }

  // Matching en lot
  async batchMatchCandidates(jobId, threshold = 50) {
    const response = await fetch(`${API_BASE_URL}/api/batch-match-candidates/${jobId}?threshold=${threshold}`, {
      method: 'POST'
    });
    return response.json();
  }

  // Upload CV avancé
  async uploadCVAdvanced(formData) {
    const response = await fetch(`${API_BASE_URL}/api/upload-cv-advanced`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }

  // Extraction d'expérience
  async extractExperience(text) {
    const formData = new FormData();
    formData.append('text', text);
    
    const response = await fetch(`${API_BASE_URL}/api/extract-experience`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }

  // Calcul de similarité
  async calculateSimilarity(text1, text2) {
    const formData = new FormData();
    formData.append('text1', text1);
    formData.append('text2', text2);
    
    const response = await fetch(`${API_BASE_URL}/api/calculate-similarity`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }
}

export default new RecruitAIApi();