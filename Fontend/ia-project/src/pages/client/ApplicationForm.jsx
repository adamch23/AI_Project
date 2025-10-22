import React, { useState } from "react";
import axios from "axios";

function ApplicationForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    cv: null,
    diploma: null,
    certificates: [],
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "certificates") setFormData({ ...formData, certificates: Array.from(files) });
    else setFormData({ ...formData, [name]: files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "certificates") value.forEach((f) => data.append("certificates", f));
      else if (value) data.append(key, value);
    });

    try {
      const res = await axios.post("http://127.0.0.1:8000/uploadcertif", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("✅ Réponse backend:", res.data);
      setStatus("✅ Analyse IA terminée avec succès !");
    } catch (error) {
      console.error("❌ Erreur backend:", error);
      setStatus("❌ Erreur lors de l'envoi du CV.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        minHeight: "100vh",
        color: "white",
        padding: "50px 20px",
        textAlign: "center",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", color: "#38bdf8" }}>🧠 Analyse Automatique de CV</h1>
      <p style={{ color: "#cbd5e1", maxWidth: "600px", margin: "10px auto 40px" }}>
        Dépose ton CV et découvre l'analyse complète par notre modèle IA (BART + LanguageTool).
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(8px)",
          borderRadius: "16px",
          padding: "30px",
          maxWidth: "480px",
          margin: "auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}
      >
        {[
          { label: "Nom complet", name: "fullName", type: "text" },
          { label: "Adresse e-mail", name: "email", type: "email" },
        ].map((field, idx) => (
          <div key={idx} style={{ marginBottom: "20px", textAlign: "left" }}>
            <label style={{ fontWeight: 500 }}>{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={`Entrer ${field.label.toLowerCase()}`}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                marginTop: "5px",
              }}
            />
          </div>
        ))}

        <div style={{ marginBottom: "20px", textAlign: "left" }}>
          <label>CV (PDF)</label>
          <input
            type="file"
            name="cv"
            accept=".pdf"
            required
            onChange={handleFileChange}
            style={{ display: "block", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "20px", textAlign: "left" }}>
          <label>Diplôme / Attestation</label>
          <input
            type="file"
            name="diploma"
            accept=".pdf,.png,.jpg"
            onChange={handleFileChange}
            style={{ display: "block", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "25px", textAlign: "left" }}>
          <label>Certificats (Google, AWS...)</label>
          <input
            type="file"
            name="certificates"
            multiple
            accept=".pdf,.png,.jpg"
            onChange={handleFileChange}
            style={{ display: "block", marginTop: "5px" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: "linear-gradient(90deg, #06b6d4, #3b82f6)",
            color: "white",
            border: "none",
            padding: "12px",
            width: "100%",
            borderRadius: "8px",
            fontSize: "1rem",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
        >
          {loading ? "⏳ Analyse en cours..." : "🚀 Lancer l'analyse IA"}
        </button>
      </form>

      {status && (
        <p
          style={{
            marginTop: "25px",
            fontSize: "1.1rem",
            color: status.includes("✅") ? "#22c55e" : "#ef4444",
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
}

export default ApplicationForm;