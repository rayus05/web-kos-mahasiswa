import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Logout from './Logout';
import './App.css';

function Navbar() {
  const [sticky, setSticky] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Fungsi untuk memantau scroll
  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDetailPage = location.pathname.startsWith('/kos/');

  return (
    <>
      <nav className={`navbar ${sticky ? 'sticky-nav' : ''} ${isDetailPage ? 'navbar-detail' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            EduKost 🎓
          </Link>

          <ul className="nav-links">
            <li><Link to="/">Beranda</Link></li>
            <li><Link to="/cari">Cari Kost</Link></li>
          </ul>

          <div className="nav-action">
            {user && user.username === 'superadmin123' ? (
              // Jika Admin -> Ke Dashboard
              <Link to="/admin" className="btn-plus-kos">
                ⚙️ Dashboard Admin
              </Link>
            ) : (
              // Jika User Biasa/Guest -> Pasang Iklan
              <Link to="/tambah-kos" className="btn-plus-kos" style={{textDecoration:'none'}}>
                <span>➕</span> Iklan Kos
              </Link>
            )}

            {user ? (
              <div className="user-menu">
                <span className="user-greeting">Halo, <strong>{user.username.split(' ')[0]}</strong></span>
                <button onClick={() => setShowLogout(true)} className="btn-logout">
                  Logout ➜
                </button>
              </div>
            ) : (
              <Link to="/register" className="btn-login">
                Login / Daftar
              </Link>
            )}
          </div>
        </div>
      </nav>

      {showLogout &&  <Logout onClose={() => setShowLogout(false)} />}
    </>
  );
}

export default Navbar;