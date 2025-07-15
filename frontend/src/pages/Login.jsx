import React, { useState } from "react";
import "./Login.css";

export default function Login({ onLogin }) {
  const [modo, setModo] = useState("login");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("user");

  const alternarModo = (m) => {
    setModo(m);
    setUsuario("");
    setSenha("");
    setTipo("user");
  };

  const enviar = async () => {
    const rota = modo === "login" ? "/user/login" : "/user/register";
    const resposta = await fetch(`http://localhost:8000${rota}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: usuario, password: senha, role: tipo }),
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      if (modo === "login") {
        localStorage.setItem("token", dados.token);
        localStorage.setItem("role", dados.role);
        onLogin(dados.token);
      } else {
        alert("Cadastro realizado com sucesso! Faça login para continuar.");
        setModo("login");
      }
    } else {
      alert("Falha no login ou cadastro: " + (dados.message || "Erro desconhecido"));
    }
  };

  const inputEstilo = {
    width: "100%",
    marginBottom: "0.8rem",
    padding: "0.5rem",
    background: "#2a2a2a",
    border: "none",
    color: "white",
    borderRadius: "4px",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      height: "100vh",
      width: "100vw",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#121212",
    }}>
      <div style={{
        background: "#1e1e1e",
        padding: "2rem",
        borderRadius: "10px",
        width: "340px",
        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
      }}>
        <h2 style={{
          color: "white",
          textAlign: "center",
          marginBottom: "1.5rem",
        }}>
          Music Rights and Revenue
        </h2>

        <div style={{ display: "flex", marginBottom: "1rem" }}>
          <button
            onClick={() => alternarModo("login")}
            style={{
              flex: 1,
              padding: "0.5rem",
              background: modo === "login" ? "#8000d0" : "#333",
              border: "none",
              color: "white",
              cursor: "pointer",
              borderRadius: "6px 0 0 6px",
              fontWeight: "bold",
            }}
          >
            Login
          </button>
          <button
            onClick={() => alternarModo("register")}
            style={{
              flex: 1,
              padding: "0.5rem",
              background: modo === "register" ? "#8000d0" : "#333",
              border: "none",
              color: "white",
              cursor: "pointer",
              borderRadius: "0 6px 6px 0",
              fontWeight: "bold",
            }}
          >
            Cadastro
          </button>
        </div>

        <input
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          placeholder="Usuário"
          style={inputEstilo}
        />

        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Senha"
          style={inputEstilo}
        />

        {modo === "register" && (
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            style={{
              ...inputEstilo,
              appearance: "none",
            }}
          >
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
          </select>
        )}

        <button
          onClick={enviar}
          style={{
            width: "100%",
            padding: "0.6rem",
            background: "#8000d0",
            color: "white",
            fontWeight: "bold",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "0.5rem",
          }}
        >
          Entrar
        </button>
      </div>
    </div>
  );
}
