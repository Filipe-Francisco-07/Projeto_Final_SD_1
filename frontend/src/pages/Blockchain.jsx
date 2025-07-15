import React, { useEffect, useState } from "react";

export default function Blockchain() {
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    const carregar = async () => {
      const res = await fetch("http://localhost:8000/musics");
      const data = await res.json();
      const historico = [];

      data.forEach((m) => {
        if (m.history && Array.isArray(m.history)) {
          const registrosBlockchain = m.history.filter((h) => h.type === "blockchain");
          if (registrosBlockchain.length > 0) {
            const receitaTotal = registrosBlockchain.reduce((s, h) => s + (h.value || 0), 0);
            const ultimoRegistro = registrosBlockchain[registrosBlockchain.length - 1];

            historico.push({
              title: m.title,
              artist: m.artist,
              revenue: receitaTotal,
              tipo: "blockchain",
              txHash: ultimoRegistro.tx_hash || "-",
              timestamp: ultimoRegistro.timestamp
                ? new Date(ultimoRegistro.timestamp).toLocaleString()
                : "-",
            });
          }
        }
      });

      setRegistros(historico.reverse());
    };

    carregar();
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", padding: "2rem", color: "white" }}>
      <div style={{ maxWidth: "700px", width: "100%" }}>
        <h2>Histórico de Registros na Blockchain</h2>
        {registros.length === 0 ? (
          <p>Nenhum registro encontrado.</p>
        ) : (
          registros.map((r, i) => (
            <div key={i} style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid gray" }}>
              <strong>{r.title}</strong> - {r.artist}
              <p>Receita total registrada: R$ {parseFloat(r.revenue).toFixed(2)}</p>
              <p>Tipo: {r.tipo}</p>
              <p>TxHash: {r.txHash}</p>
              <p>{r.timestamp}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
