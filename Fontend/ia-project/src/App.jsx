// App.js
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import NavbarClient from './components/NavbarClient';

// Pages Admin
import AddJob from './pages/admin/AddJob';
import TopCandidates from './pages/admin/TopCandidates';
import AiCommandInterface from './pages/admin/AiCommandInterface';
import AskN8n from './pages/admin/AskN8n';
import ScreeningClassification from './pages/admin/ScreeningClassification';
import CVQuizGenerator from './pages/admin/CVQuizGenerator';
import CVMatching from './pages/admin/CVMatching';
import CandidatesList from './pages/admin/CandidatesList';

// Pages Client
import UploadCV from './pages/client/UploadCV';
import CVChallengeGenerator from './pages/client/CVChallengeGenerator';
import ApplicationForm from './pages/client/ApplicationForm';

import './App.css';
import Menu from './components/Menu';

function App() {
  const location = useLocation();
  
  // Déterminer si on est sur la page Menu
  const isMenuPage = location.pathname === '/';
  
  // Déterminer quelle navbar afficher selon l'espace
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isClientRoute = !isAdminRoute && !isMenuPage;

  return (
    <div className="App">
      {/* Afficher la Navbar appropriée seulement si on n'est pas sur la page Menu */}
      {!isMenuPage && (
        <>
          {isAdminRoute && <Navbar />}
          {isClientRoute && <NavbarClient />}
        </>
      )}
      
      <main className={`container ${isMenuPage ? 'menu-page' : ''}`}>
        <Routes>
          {/* Route par défaut */}
          <Route path="/" element={<Menu />} />
          
          {/* Espace Candidat */}
          <Route path="/upload-cv" element={<UploadCV />} />
          <Route path="/cv-challenge-generator" element={<CVChallengeGenerator />} />
          <Route path="/CVChallengeGenerator" element={<CVChallengeGenerator />} />
          <Route path="/application-form" element={<ApplicationForm />} />

          {/* Espace Admin */}
          <Route path="/admin/add-job" element={<AddJob />} />
          <Route path="/admin/top-candidates" element={<TopCandidates />} />
          <Route path="/admin/ai-command" element={<AiCommandInterface />} />
          <Route path="/admin/ask-n8n" element={<AskN8n />} />
          <Route path="/admin/screening-classification" element={<ScreeningClassification />} />
          <Route path="/admin/cv-quiz-generator" element={<CVQuizGenerator />} />
          <Route path="/admin/CVQuizGenerator" element={<CVQuizGenerator />} />
          <Route path="/admin/cv-matching" element={<CVMatching />} />
          <Route path="/admin/CVMatching" element={<CVMatching />} />
          <Route path="/admin/candidates-list" element={<CandidatesList />} />

          {/* Redirections par défaut */}
          <Route path="/admin" element={<Navigate to="/admin/add-job" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;