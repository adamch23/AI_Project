// NavbarClient.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaCloudUploadAlt } from 'react-icons/fa';

function NavbarClient() {
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
          <NavLink to="/application-form">
            <FaCloudUploadAlt /> application-form
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default NavbarClient;