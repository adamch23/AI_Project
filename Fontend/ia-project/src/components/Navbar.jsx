import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaCloudUploadAlt, FaPlusCircle, FaUsers, FaRobot, FaClipboardList } from 'react-icons/fa';

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-brand">
        Recruit AI
      </NavLink>
      <div className="nav-sections">
        <div className="nav-links">
          <span className="nav-section-title">Espace Candidat</span>
          <NavLink to="/upload-cv">
            <FaCloudUploadAlt /> Déposer un CV
          </NavLink>
          <NavLink to="/CVChallengeGenerator">
            <FaCloudUploadAlt /> CVChallengeGenerator
          </NavLink>
        </div>
        <div className="nav-links">
          <span className="nav-section-title">Espace Admin</span>
          <NavLink to="/admin/add-job">
            <FaPlusCircle /> Ajouter une Offre
          </NavLink>
          <NavLink to="/admin/top-candidates">
            <FaUsers /> Top Candidats
          </NavLink>
          <NavLink to="/admin/ask-n8n">
            <FaRobot /> Assitant Virtuel
          </NavLink>
          <NavLink to="/admin/screening-classification">
            <FaClipboardList /> Screening Classification
          </NavLink>
           <NavLink to="/admin/CVQuizGenerator">
            <FaClipboardList /> CVQuizGenerator
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
