import {useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './css/Auth.css';

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert("🎉 Pendaftaran Berhasil! Silakan Login dengan akun barumu.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mendaftar. Coba lagi.");
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-split">
        
        {/* --- SISI KIRI (VISUAL - BEDA GAMBAR BIAR FRESH) --- */}
        <div className="login-left">
          <div className="brand-overlay">
            <h1 className="brand-title-large">Bergabunglah 🚀</h1>
            <p className="brand-tagline-large">
              Daftar sekarang dan temukan<br/>ribuan kos nyaman di sekitar kampusmu.
            </p>
            
            {/* Ilustrasi Beda (Roket / Orang Sukses) */}
            <div className="illustration-wrapper">
              <img 
                src="https://cdni.iconscout.com/illustration/premium/thumb/sign-up-illustration-download-in-svg-png-gif-file-formats--log-register-form-user-interface-pack-design-development-illustrations-6430773.png?f=webp" 
                alt="Register Illustration" 
                className="floating-img"
              />
            </div>
          </div>
        </div>

        {/* --- SISI KANAN (FORMULIR DAFTAR) --- */}
        <div className="login-right">
          <div className="form-content">
            <div className="mobile-brand-only">EduKost🎓</div>
            
            <h2 className="login-heading">Create Account</h2>
            <p className="login-subheading">Lengkapi data untuk memulai.</p>

            {error && <div className="error-alert">⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              
              {/* INPUT NAMA (Baru) */}
              <div className="input-group-modern">
                <input 
                  type="text" 
                  name="nama"
                  placeholder="Nama Lengkap" 
                  value={formData.nama} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="input-group-modern">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email Kampus / Pribadi" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="input-group-modern">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  placeholder="Buat Password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                />
                <span 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>

              <button type="submit" className="btn-gradient-auth">
                Daftar Sekarang 🚀
              </button>

            </form>

            <div className="auth-footer-modern">
              <p>Sudah punya akun? <Link to="/login">Login di sini</Link></p>
              <small className="copyright">© 2026 EduKost Inc.</small>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;