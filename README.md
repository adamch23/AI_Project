# Documentation Technique - Quiz et Challenges Techniques

## 📋 Table des Matières
- [Aperçu du Projet](#aperçu-du-projet)
- [Architecture Technique](#architecture-technique)
- [Modules Principaux](#modules-principaux)
- [Installation et Déploiement](#installation-et-déploiement)
- [API Documentation](#api-documentation)
- [Structure des Données](#structure-des-données)
- [Configuration](#configuration)

## 🚀 Aperçu du Projet

### Objectif
Plateforme interactive d'évaluation technique générant automatiquement des quiz et défis de programmation personnalisés basés sur l'analyse de CV.

### Stack Technique
- **Frontend**: React.js avec hooks modernes
- **IA Models**: TinyLlama, Gemini, CodeBERT, DeepSeek-Coder
- **Traitement Documents**: PDF.js, Mammoth.js
- **Styling**: CSS3 avec gradients modernes
- **Export**: PDF, JSON

## 🏗️ Architecture Technique

### Diagramme d'Architecture

┌─────────────────┐ ┌──────────────────┐ ┌─────────────────┐
│ Frontend │ │ API Gateway │ │ AI Services │
│ React.js │◄──►│ Node.js │◄──►│ TinyLlama │
│ │ │ │ │ Gemini │
└─────────────────┘ └──────────────────┘ └─────────────────┘
│
▼
┌─────────────────┐ ┌──────────────────┐
│ File Processing│ │ Data Storage │
│ PDF.js │ │ JSON/State │
│ Mammoth.js │ │ │
└─────────────────┘ └──────────────────┘

## 📊 Modules Principaux

### 1. Quiz Basé sur le CV
#### Modèle IA: TinyLlama/TinyLlama-1.1B-Chat-v1.0

**Fonctionnalités:**
- Génération de quiz personnalisé basé sur l'analyse complète du CV
- Configuration flexible: choix du nombre de questions (5-20) et difficulté
- Quatre niveaux de difficulté: Facile, Moyen, Difficile, Mixte
- Types de questions variés: QCM, Questions ouvertes, Techniques, Situations

**Prompt Engineering:**
javascript
const quizPrompt = `
Tu es un expert en recrutement et évaluation des compétences. 
Analyse le CV et génère un quiz personnalisé avec:
- Questions techniques sur les compétences mentionnées
- Questions sur les expériences et réalisations  
- Questions de mise en situation basées sur le profil
- Questions sur les outils et technologies utilisés
- Questions comportementales liées aux responsabilités

Format JSON strict avec:
- Langue détectée
- Profil résumé (2-3 phrases)
- Compétences principales [liste]
- Questions [id, question, type, options, réponse_correcte, 
  explication, difficulté, catégorie]
`;
