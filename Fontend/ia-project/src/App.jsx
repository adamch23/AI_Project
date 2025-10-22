import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';

// Pages Admin
import AddJob from './pages/admin/AddJob';
import TopCandidates from './pages/admin/TopCandidates';
import AiCommandInterface from './pages/admin/AiCommandInterface';
import AskN8n from './pages/admin/AskN8n';
import ScreeningClassification from './pages/admin/ScreeningClassification';

// Pages Client
import UploadCV from './pages/client/UploadCV';

import './App.css';
import CVChallengeGenerator from './pages/client/CVChallengeGenerator';
import CVQuizGenerator from './pages/admin/CVQuizGenerator';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="container">
        <Routes>
          {/* Redirection par défaut vers UploadCV */}
          <Route path="/" element={<Navigate to="/upload-cv" />} />

          {/* Espace Candidat */}
          <Route path="/upload-cv" element={<UploadCV />} />
          <Route path="/CVChallengeGenerator" element={<CVChallengeGenerator />} />

          {/* Espace Admin */}
          <Route path="/admin/add-job" element={<AddJob />} />
          <Route path="/admin/top-candidates" element={<TopCandidates />} />
          <Route path="/admin/AiCommande" element={<AiCommandInterface />} />
          <Route path="/admin/ask-n8n" element={<AskN8n />} />
          <Route path="/admin/screening-classification" element={<ScreeningClassification />} />
          <Route path="/admin/CVQuizGenerator" element={<CVQuizGenerator />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
