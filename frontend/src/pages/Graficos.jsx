import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Graficos() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/musics")
      .then((res) => res.json())
      .then((musicas) => {
        const porMusica = [];
        let play = 0;
        let buy = 0;
        let license = 0;

        musicas.forEach((m) => {
          if (!m.title) return;

          porMusica.push({
            name: m.title,
            receita: m.artist_revenue || 0,
          });

          if (Array.isArray(m.history)) {
            m.history.forEach((h) => {
              const valor = parseFloat(h.value) || 0;
              if (h.type === "play") play += valor;
              else if (h.type === "buy") buy += valor;
              else if (h.type === "license") license += valor;
            });
          }
        });

        setDados({
          porMusica,
          porTipo: [
            { name: "Streaming", value: play },
            { name: "Compra", value: buy },
            { name: "Licença", value: license },
          ],
        });
      });
  }, []);

  const cores = ["#00c49f", "#0088fe", "#ffa500"];

  if (!dados.porMusica || dados.porMusica.length === 0) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "2rem" }}>
        Nenhuma música registrada para exibir gráficos.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", padding: "2rem", color: "white", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2rem" }}>
      <h2 style={{ width: "100%", textAlign: "center", marginBottom: "2rem" }}>
        Gráficos e Estatísticas
      </h2>

      <ResponsiveContainer width="45%" height={300}>
        <BarChart data={dados.porMusica}>
          <XAxis dataKey="name" angle={-20} textAnchor="end" height={80} interval={0} />
          <YAxis />
          <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
          <Legend />
          <Bar dataKey="receita" fill="#0088fe" name="Receita por Música (R$)" />
        </BarChart>
      </ResponsiveContainer>

      <ResponsiveContainer width="45%" height={300}>
        <PieChart>
          <Pie
            data={dados.porTipo}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            label={({ value }) => `R$ ${value.toFixed(2)}`}
            labelLine={{ stroke: "#fff" }}
          >
            {dados.porTipo.map((entry, index) => (
              <Cell key={index} fill={cores[index % cores.length]} />
            ))}
          </Pie>
          <Legend />
          <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
