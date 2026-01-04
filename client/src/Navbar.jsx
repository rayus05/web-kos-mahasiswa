import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function Navbar() {
  const [sticky, setSticky] = useState(false);

  // Fungsi untuk memantau scroll
  useEffect(() => {
    const handleScroll = () => {
      // Jika scroll lebih dari 50px, aktifkan mode sticky
      if (window.scrollY > 50) {
        setSticky(true);
      } else {
        setSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Bersihkan event listener saat pindah halaman (biar gak error)
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`navbar ${sticky ? 'sticky-nav' : ''}`}>
      <div className="nav-container">
        {/* Logo Kiri */}
        <Link to="/" className="nav-logo">
          ZonaKampus🎓
        </Link>

        {/* Menu Tengah (Disembunyikan di HP nanti) */}
        <ul className="nav-links">
          <li><Link to="/">Beranda</Link></li>
          <li><a href="#rekomendasi">Rekomendasi</a></li>
          <li><a href="#fitur">Keunggulan</a></li>
          <li><Link to="/cari">Cari Kost</Link></li>
        </ul>

        {/* Tombol Kanan */}
        <div className="nav-action">
          <Link to="/admin" className="btn-login">
            Daftar Mitra
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;