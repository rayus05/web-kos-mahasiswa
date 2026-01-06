import { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './css/Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState('')
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
    <div className="login-page-wrapper">
      <div className="login-card-split">
        
        {/* --- SISI KIRI (VISUAL & BRANDING) --- */}
        <div className="login-left">
          <div className="brand-overlay">
            <h1 className="brand-title-large">EduKost 🎓</h1>
            <p className="brand-tagline-large">
              Kelola hunian impianmu dengan<br/>lebih mudah dan aman.
            </p>
            
            {/* Ilustrasi HP (Mockup) */}
            <div className="illustration-wrapper">
              <img 
                src="https://cdni.iconscout.com/illustration/premium/thumb/mobile-login-illustration-download-in-svg-png-gif-file-formats--user-password-security-account-access-cyber-pack-network-communication-illustrations-4309044.png" 
                alt="Login Illustration" 
                className="floating-img"
              />
            </div>
          </div>
        </div>

        {/* --- SISI KANAN (FORMULIR) --- */}
        <div className="login-right">
          <div className="form-content">
            <div className="mobile-brand-only">EduKost🎓</div> {/* Muncul cuma di HP */}
            
            <h2 className="login-heading">Sign In</h2>
            <p className="login-subheading">Masuk untuk melanjutkan pencarian kos.</p>

            {error && <div className="error-alert">⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              
              <div className="input-group-modern">
                <input 
                  type="email" 
                  id='email'
                  autoComplete='on'
                  placeholder="Email atau Username" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>

              <div className="input-group-modern">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
                <span 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>

              <div className="forgot-pass-row">
                 <Link to="/lupa-password">Lupa password?</Link>
              </div>

              <button type="submit" className="btn-gradient-auth">
                Sign In ➜
              </button>

            </form>

            <div className="auth-footer-modern">
              <p>Belum punya akun? <Link to="/register">Daftar Sekarang</Link></p>
              <small className="copyright">© 2026 EduKost Inc.</small>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;