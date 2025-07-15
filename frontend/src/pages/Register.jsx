import { useState } from 'react';

function Register({ onRegisterSuccess }) {
  const [form, setForm] = useState({ username: '', password: '', role: 'user' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      alert(data.message || 'Registro concluído');
      if (res.ok && onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (err) {
      alert("Erro ao conectar com o servidor.");
      console.error("Erro no registro:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registrar</h2>
      <input
        name="username"
        placeholder="Usuário"
        onChange={handleChange}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Senha"
        onChange={handleChange}
        required
      />
      <select name="role" onChange={handleChange} required>
        <option value="user">Usuário</option>
        <option value="admin">Administrador</option>
      </select>
      <button type="submit">Registrar</button>
    </form>
  );
}

export default Register;
