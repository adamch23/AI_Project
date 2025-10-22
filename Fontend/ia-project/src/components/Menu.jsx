import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TalentMatchSelection() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    
    setTimeout(() => {
      if (role === 'candidate') {
        navigate('/upload-cv');
      } else if (role === 'recruiter') {
        navigate('/admin/add-job');
      }
    }, 500);
  };

  return (
    <div style={styles.container}>
      {/* Animated Background Pattern */}
      <div style={styles.background}>
        <div style={styles.backgroundPattern} />
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <div style={styles.wrapper}>
          {/* Logo */}
          <div style={styles.logo}>🎯</div>

          {/* Title */}
          <h1 style={styles.title}>TalentMatch AI</h1>

          {/* Subtitle */}
          <p style={styles.subtitle}>
            Révolutionner le recrutement  l'IA
          </p>

          {/* Role Cards */}
          <div style={styles.cardsGrid}>
            {/* Candidate Card */}
            <div
              onClick={() => handleRoleSelect('candidate')}
              style={{...styles.card, ...styles.candidateCard}}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-15px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 30px 80px rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.3)';
              }}
            >
              <div style={styles.icon}>👤</div>
              <h2 style={styles.cardTitle}>Je suis Candidat</h2>
              <p style={styles.description}>
                Trouvez l'emploi de vos rêves grâce au matching IA qui comprend vos compétences et aspirations
              </p>

              <ul style={styles.featuresList}>
                {[
                  'Recommandations intelligentes d\'emplois',
                  'Analyse et optimisation de CV',
                  'Suivi des candidatures en temps réel',
                  'Analyse des écarts de compétences',
                  'Outils de préparation aux entretiens'
                ].map((feature, index) => (
                  <li key={index} style={styles.featureItem}>
                    <span style={{...styles.checkmark, ...styles.checkmarkGreen}}>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button style={{...styles.button, ...styles.buttonGreen}}>
                COMMENCER
              </button>
            </div>

            {/* Recruiter Card */}
            <div
              onClick={() => handleRoleSelect('recruiter')}
              style={{...styles.card, ...styles.recruiterCard}}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-15px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 30px 80px rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.3)';
              }}
            >
              <div style={styles.icon}>💼</div>
              <h2 style={styles.cardTitle}>Je suis Recruteur</h2>
              <p style={styles.description}>
                Trouvez les candidats parfaits plus rapidement grâce aux algorithmes de matching intelligents
              </p>

              <ul style={styles.featuresList}>
                {[
                  'Matching de candidats propulsé par l\'IA',
                  'Processus de sélection automatisé',
                  'Tableau de bord analytique avancé',
                  'Traitement en masse de candidats',
                  'Outils de gestion de pipeline'
                ].map((feature, index) => (
                  <li key={index} style={styles.featureItem}>
                    <span style={{...styles.checkmark, ...styles.checkmarkBlue}}>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button style={{...styles.button, ...styles.buttonBlue}}>
                COMMENCER
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes moveBackground {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  },
  background: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  backgroundPattern: {
    position: 'absolute',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
    backgroundSize: '50px 50px',
    animation: 'moveBackground 20s linear infinite',
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
  },
  wrapper: {
    maxWidth: '1200px',
    width: '100%',
    textAlign: 'center',
  },
  logo: {
    fontSize: '4em',
    marginBottom: '20px',
    animation: 'float 3s ease-in-out infinite',
  },
  title: {
    fontSize: '3.5em',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #fff, #a8edea)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '15px',
    textShadow: '0 0 40px rgba(255,255,255,0.3)',
  },
  subtitle: {
    fontSize: '1.3em',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: '60px',
    fontWeight: 300,
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '40px',
    marginTop: '50px',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '30px',
    padding: '60px 40px',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  candidateCard: {
    border: '3px solid #10b981',
  },
  recruiterCard: {
    border: '3px solid #3b82f6',
  },
  icon: {
    fontSize: '5em',
    marginBottom: '25px',
    animation: 'bounce 2s ease-in-out infinite',
  },
  cardTitle: {
    fontSize: '2.5em',
    fontWeight: 800,
    marginBottom: '15px',
    color: '#1f2937',
  },
  description: {
    fontSize: '1.1em',
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: '30px',
  },
  featuresList: {
    listStyle: 'none',
    textAlign: 'left',
    margin: '30px 0',
    padding: 0,
  },
  featureItem: {
    padding: '12px 0',
    color: '#4b5563',
    fontSize: '1.05em',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  checkmark: {
    fontWeight: 'bold',
    fontSize: '1.3em',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkmarkGreen: {
    color: '#10b981',
    background: 'rgba(16, 185, 129, 0.1)',
  },
  checkmarkBlue: {
    color: '#3b82f6',
    background: 'rgba(59, 130, 246, 0.1)',
  },
  button: {
    padding: '18px 50px',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1.2em',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  buttonGreen: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
  },
  buttonBlue: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  },
};