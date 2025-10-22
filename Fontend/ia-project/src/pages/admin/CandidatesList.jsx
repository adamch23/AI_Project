import React, { useEffect, useState } from "react";
import axios from "axios";

function CandidatesList() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/candidates");
        console.log("API Response:", res.data); // Debug log
        
        // Correction ici : s'assurer que candidates est toujours un tableau
        if (Array.isArray(res.data)) {
          setCandidates(res.data);
        } else if (res.data && Array.isArray(res.data.candidates)) {
          // Si l'API retourne { candidates: [...] }
          setCandidates(res.data.candidates);
        } else if (res.data && typeof res.data === 'object') {
          // Si l'API retourne un objet avec d'autres propriétés
          setCandidates([]); // Tableau vide par défaut
        } else {
          setCandidates([]);
        }
      } catch (e) {
        console.error("Erreur chargement :", e);
        setCandidates([]); // Assurer que c'est un tableau même en cas d'erreur
      } finally {
        setLoading(false);
      }
    };
    loadCandidates();
  }, []);

  if (loading)
    return <p style={{ textAlign: "center", padding: "50px" }}>Chargement des analyses...</p>;

  // Vérification supplémentaire avant le rendu
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return (
      <div
        style={{
          background: "#f1f5f9",
          minHeight: "100vh",
          padding: "50px 20px",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#0f172a", marginBottom: "40px" }}>
          📋 Résultats de l'Analyse IA
        </h2>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Aucun candidat trouvé ou données invalides.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: "#0284c7",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: "20px"
            }}
          >
            🔄 Recharger
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#f1f5f9",
        minHeight: "100vh",
        padding: "50px 20px",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#0f172a", marginBottom: "40px" }}>
        📋 Résultats de l'Analyse IA
      </h2>

      <div style={{ maxWidth: "1000px", margin: "auto" }}>
        {candidates.map((c) => (
          <div
            key={c._id}
            style={{
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              marginBottom: "25px",
              padding: "25px",
              transition: "transform 0.3s",
              transform: selected?._id === c._id ? "scale(1.02)" : "scale(1)",
            }}
          >
            <h3 style={{ margin: 0, color: "#0f766e" }}>{c.fullName}</h3>
            <p style={{ color: "#475569" }}>📧 {c.email}</p>

            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
              <p>🧠 Score orthographe : {c.analysis?.spelling_analysis?.quality_score ?? "N/A"}%</p>
              <p>🤖 Score IA (BART) : {c.fraud_analysis?.fraud_score ?? "N/A"}%</p>
              <p>
                🔍 Similarité IA :{" "}
                {c.analysis?.similarity?.similarity_score
                  ? `${(c.analysis.similarity.similarity_score * 100).toFixed(1)}%`
                  : "N/A"}
              </p>
            </div>

            <button
              onClick={() => setSelected(selected?._id === c._id ? null : c)}
              style={{
                backgroundColor: "#0284c7",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              {selected?._id === c._id ? "🔽 Masquer détails" : "🔍 Voir détails"}
            </button>
            
            <button
              onClick={async () => {
                if (window.confirm(`Supprimer ${c.fullName} ?`)) {
                  try {
                    await axios.delete(`http://127.0.0.1:8000/delete_candidate/${c._id}`);
                    setCandidates(candidates.filter((cand) => cand._id !== c._id));
                    alert("✅ Candidat supprimé avec succès !");
                  } catch (err) {
                    console.error("Erreur suppression :", err);
                    alert("❌ Erreur lors de la suppression.");
                  }
                }
              }}
              style={{
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                marginLeft: "10px",
                cursor: "pointer",
              }}
            >
              🗑️ Supprimer
            </button>

            {selected?._id === c._id && (
              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: "10px",
                  padding: "15px",
                  marginTop: "15px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h4 style={{ color: "#0f172a" }}>🧩 Analyse complète</h4>
                <p>
                  <b>Label IA :</b> {c.fraud_analysis?.bart_analysis?.label ?? "N/A"}
                </p>
                <p>
                  <b>Confiance :</b> {c.fraud_analysis?.bart_analysis?.confidence ?? 0}%
                </p>

                <h4 style={{ color: "#3b82f6" }}>🧠 Détection IA / Similarité</h4>
                {c.analysis?.similarity ? (
                  <>
                    <p>
                      <b>Score de similarité :</b>{" "}
                      {(c.analysis.similarity.similarity_score * 100).toFixed(1)}%
                    </p>
                    <p>
                      <b>Verdict :</b> {c.analysis.similarity.verdict}
                    </p>
                  </>
                ) : (
                  <p>ℹ️ Aucune donnée de similarité disponible.</p>
                )}

                <h4 style={{ color: "#22c55e" }}>📜 Authenticité des documents</h4>
                {c.document_authenticity?.length > 0 ? (
                  c.document_authenticity.map((doc, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#fff",
                        borderRadius: "8px",
                        padding: "10px",
                        marginBottom: "10px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <p>
                        <b>Type :</b> {doc.type === "diploma" ? "🎓 Diplôme" : "📄 Certificat"}
                      </p>
                      <p>
                        <b>OCR extrait :</b> {doc.result?.ocr_text?.slice(0, 100) || "Aucun texte lu"}
                      </p>
                      <p>
                        <b>Vérification texte :</b>{" "}
                        {doc.result?.text_verification?.verdict || "N/A"}
                      </p>
                      <p>
                        <b>Authenticité image :</b>{" "}
                        {doc.result?.image_verification?.verdict || "N/A"}{" "}
                        ({doc.result?.image_verification?.confidence ?? 0}% confiance)
                      </p>
                    </div>
                  ))
                ) : (
                  <p>⚙️ Aucun diplôme ou certificat analysé.</p>
                )}

                <h4 style={{ color: "#b91c1c" }}>⚠️ Fautes détectées</h4>
                <ul>
                  {c.analysis?.spelling_analysis?.examples?.length > 0 ? (
                    c.analysis.spelling_analysis.examples.map((ex, i) => <li key={i}>{ex}</li>)
                  ) : (
                    <li>Aucune faute détectée</li>
                  )}
                </ul>

                <h4 style={{ color: "#eab308" }}>🚨 Anomalies IA</h4>
                <ul>
                  {c.fraud_analysis?.anomalies?.length > 0 ? (
                    c.fraud_analysis.anomalies.map((a, i) => <li key={i}>{a}</li>)
                  ) : (
                    <li>RAS</li>
                  )}
                </ul>

                <p style={{ color: "#64748b", marginTop: "10px" }}>
                  📅 {new Date(c.created_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CandidatesList;