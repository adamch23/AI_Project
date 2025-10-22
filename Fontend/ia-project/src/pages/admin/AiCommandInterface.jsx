import { useState } from "react";

export default function AiCommandInterface() {
  const [command, setCommand] = useState("");
  const [response, setResponse] = useState("");

  const handleCommand = async () => {
    try {
      const res = await fetch("http://localhost:5678/webhook-test/2742d23f-b2b7-4443-89fb-7705a9f5111a", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: command }),
      });
      const data = await res.json();
      setResponse(data.message || "Commande exécutée !");
    } catch (err) {
      setResponse("Erreur de communication avec n8n");
    }
  };

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-4">Assistant Recrutement AI 🤖</h1>
      <input
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        placeholder="Ex: envoie un email à Yassine"
        className="border rounded-lg p-2 w-80"
      />
      <button
        onClick={handleCommand}
        className="bg-blue-500 text-white rounded-lg px-4 py-2 mt-3"
      >
        Exécuter
      </button>
      {response && (
        <p className="mt-4 text-green-600 font-semibold">{response}</p>
      )}
    </div>
  );
}