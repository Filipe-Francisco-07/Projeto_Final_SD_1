import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function Musicas({ onPlay, onBuy, onRegister, onLicense, refresh }) {
  const [musicas, setMusicas] = useState([]);
  const [multiplicadoresSelecionados, setMultiplicadoresSelecionados] = useState({});
  const [role, setRole] = useState(null);

  const multiplicadores = ["x1", "x10", "x100", "x1000"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
      } catch (err) {
        console.error("Erro ao decodificar token:", err);
        setRole(null);
      }
    }
  }, []);

  const carregarMusicas = () => {
    fetch("http://localhost:8000/musics")
      .then((res) => res.json())
      .then(setMusicas)
      .catch((err) => console.error("Erro ao carregar músicas:", err));
  };

  useEffect(() => {
    carregarMusicas();
  }, [refresh]);

  const handleSelectChange = (id, valor) => {
    setMultiplicadoresSelecionados((prev) => ({
      ...prev,
      [id]: valor,
    }));
  };

  return (
    <div style={{
      width: "100%",
      display: "flex",
      justifyContent: "center",
      padding: "2rem 1rem",
      boxSizing: "border-box",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "900px",
        color: "white",
        textAlign: "left"
      }}>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem", textAlign: "center" }}>
          <span role="img" aria-label="musica">🎵</span> Músicas Registradas
        </h2>
        {musicas.map((m) => {
          const valorMultiplicador = multiplicadoresSelecionados[m._id] || "x1";
          const valorNumerico = parseInt(valorMultiplicador.replace("x", ""));

          return (
            <div key={m._id} style={{
              marginBottom: "2rem",
              borderBottom: "1px solid #444",
              paddingBottom: "1rem"
            }}>
              <strong>{m.title}</strong> - {m.artist}
              <p>Produtor: {m.producer}</p>
              <p>Plays: {m.plays}</p>
              <p>Receita gerada: R$ {m.artist_revenue?.toFixed(2)}</p>
              <div style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                justifyContent: "center"
              }}>
                <select
                  value={valorMultiplicador}
                  onChange={(e) => handleSelectChange(m._id, e.target.value)}
                >
                  {multiplicadores.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>

                <button onClick={() => onPlay(m._id, valorNumerico)}>Reproduzir</button>
                <button onClick={() => onBuy(m._id, valorNumerico)}>Comprar</button>
                <button onClick={() => onLicense(m._id, valorNumerico)}>Licenciar</button>

                {role === "admin" && (
                  <button onClick={() => onRegister(m._id)}>Registrar na Blockchain</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
