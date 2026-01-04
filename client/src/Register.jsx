import {useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './App.css';

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response.data.message || 'Terjadi kesalahan');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Daftar Akun Baru 🚀</h2>
        <p>Gabung komunitas ZonaKampus sekarang</p>
        
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" required onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <button type="submit" className="btn-auth">Daftar Sekarang</button>
        </form>
        <p className="auth-footer">Sudah punya akun? <Link to="/login">Login di sini</Link></p>
      </div>
    </div>
  );
}
export default Register;