import { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './App.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(res.data.user, res.data.token);
      if (res.data.user.role === 'admin') {
        alert("Selamat datang, Bos Admin! 🫡");
        navigate('/admin');
      } else {
        alert(`Selamat datang kembali, ${res.data.user.username}!`);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Email atau password salah");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Masuk ke Akun 🔐</h2>
        <p>Lanjutkan pencarian kos impianmu</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-auth">Masuk</button>
        </form>
        <p className="auth-footer">Belum punya akun? <Link to="/register">Daftar dulu</Link></p>
      </div>
    </div>
  );
}
export default Login;