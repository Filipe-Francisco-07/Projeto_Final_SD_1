
import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

export default function App() {
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setLogado(!!token);
  }, []);

  const handleLogin = () => setLogado(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setLogado(false);
  };

  return (
    <div>
      {logado ? <Dashboard onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}
    </div>
  );
}
