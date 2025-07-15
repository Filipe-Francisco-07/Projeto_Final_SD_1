import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Musicas from "./Musicas";
import Registro from "./Registro";
import Graficos from "./Graficos";
import Blockchain from "./Blockchain";

export default function Dashboard({ onLogout }) {
  const [aba, setAba] = useState("musicas");
  const [refresh, setRefresh] = useState(false);
  const [role, setRole] = useState(null);
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);


  useEffect(() => {
  if (token) {
    try {
      const decoded = jwtDecode(token); 
      setRole(decoded.role);
    } catch (e) {
      console.error("Erro ao decodificar token:", e);
      setRole(null);
    }
  }
}, [token]);

  const executarAcao = async (rota, id = null, metodo = "POST", extra = {}) => {
    const url = id ? `http://localhost:8000/${rota}/${id}` : `http://localhost:8000/${rota}`;

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) headers["Authorization"] = `Bearer ${token}`;

    const body = Object.keys(extra).length ? JSON.stringify(extra) : null;

    try {
      const res = await fetch(url, {
        method: metodo,
        headers,
        body,
      });

      const json = await res.json();

      if (res.ok) {
        setRefresh((r) => !r);
        console.log("Ação executada com sucesso:", json);
      } else {
        console.error("Erro ao executar ação:", json.message);
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
    }
  };

  const props = {
    onNavigate: setAba,
    onLogout: onLogout,
    onPlay: (id, multi) => executarAcao("play", id, "POST", { vezes: multi }),
    onBuy: (id, multi) => executarAcao("buy", id, "POST", { vezes: multi }),
    onLicense: (id, multi) => executarAcao("license", id, "POST", { vezes: multi }),
    onRegister: (id) => executarAcao("register_music", id, "POST"),
    refresh: refresh,
    role: role
  };

  const renderizarConteudo = () => {
    switch (aba) {
      case "musicas":
        return <Musicas {...props} />;
      case "registro":
        return <Registro {...props} />;
      case "graficos":
        return <Graficos {...props} />;
      case "blockchain":
        return role === "admin" ? <Blockchain {...props} /> : <p style={{ color: "white" }}>Acesso negado.</p>;
      default:
        return <Musicas {...props} />;
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: "#121212",
      color: "white",
      display: "flex",
      flexDirection: "column",
      overflowX: "hidden"
    }}>
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#1e1e1e",
        padding: "1rem 2rem",
        width: "100%",
        boxSizing: "border-box"
      }}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={() => setAba("musicas")} style={estiloBotao}>Músicas</button>
          <button onClick={() => setAba("registro")} style={estiloBotao}>Registrar</button>
          <button onClick={() => setAba("graficos")} style={estiloBotao}>Gráficos</button>
          {role === "admin" && (<button onClick={() => setAba("blockchain")} style={estiloBotao}>Blockchain</button>)}
        </div>
        <button onClick={onLogout} style={{
          background: "#8000d0",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          cursor: "pointer"
        }}>
          Sair
        </button>
      </nav>

      <main style={{
        flex: 1,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "2rem",
        boxSizing: "border-box"
      }}>
        <div style={{ width: "100%", maxWidth: "1000px" }}>
          {renderizarConteudo()}
        </div>
      </main>
    </div>
  );
}

const estiloBotao = {
  background: "#1e1e1e",
  border: "none",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
  padding: "0.5rem 1rem",
  borderRadius: "8px"
};
