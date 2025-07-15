import React, { useState } from "react";

export default function Registro() {
  const [titulo, setTitulo] = useState("");
  const [artista, setArtista] = useState("");
  const [produtor, setProdutor] = useState("");
  const [percentual, setPercentual] = useState("");

  const token = localStorage.getItem("token");

  const registrar = async () => {
  if (!titulo || !artista || !produtor || !percentual) {
    alert("Preencha todos os campos!");
    return;
  }

  const resposta = await fetch("http://localhost:8000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: titulo,
      artist: artista,
      producer: produtor,
      revenue_split: parseFloat(percentual) || 0,
    }),
  });

  if (resposta.ok) {
    setTitulo("");
    setArtista("");
    setProdutor("");
    setPercentual("");
    alert("Música registrada!");
  } else {
    const erro = await resposta.json();
    alert("Erro ao registrar música: " + (erro.message || "Erro desconhecido"));
  }
  };


  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", color: "white" }}>
      <div style={{ width: "300px" }}>
        <h2>Registrar Nova Música</h2>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título" style={{ width: "100%", marginBottom: "0.5rem" }} />
        <input value={artista} onChange={(e) => setArtista(e.target.value)} placeholder="Artista" style={{ width: "100%", marginBottom: "0.5rem" }} />
        <input value={produtor} onChange={(e) => setProdutor(e.target.value)} placeholder="Produtor" style={{ width: "100%", marginBottom: "0.5rem" }} />
        <input value={percentual} onChange={(e) => setPercentual(e.target.value)} placeholder="% Receita (ex: 70)" style={{ width: "100%", marginBottom: "0.5rem" }} />
        <button onClick={registrar}>Registrar</button>
      </div>
    </div>
  );
}
