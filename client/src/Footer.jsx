import './App.css';

const year = new Date().getFullYear();

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        
        {/* Kolom 1: Brand & Deskripsi */}
        <div className="footer-section brand-area">
          <h2 className="footer-logo">ZonaKampus🎓</h2>
          <p>
            Platform pencarian kos mahasiswa nomor #1 di Palembang. 
            Aman, nyaman, dan dekat kampus.
          </p>
        </div>

        {/* Kolom 2: Link Cepat */}
        <div className="footer-section">
          <h3>Navigasi</h3>
          <ul>
            <li><a href="#">Beranda</a></li>
            <li><a href="#">Cari Kos</a></li>
            <li><a href="#">Tentang Kami</a></li>
            <li><a href="#">Pusat Bantuan</a></li>
          </ul>
        </div>

        {/* Kolom 3: Kontak */}
        <div className="footer-section">
          <h3>Hubungi Kami</h3>
          <p>📍 Jl. Kampus Merdeka No. 45</p>
          <p>📞 +62 812-3456-7890</p>
          <p>📧 support@zonakampus.com</p>
          
          <div className="social-icons">
            <span>📷</span> <span>🐦</span> <span>📘</span>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p id="footer-text">&copy; {year} ZonaKampus Mahasiswa - Cari Kost Nyaman, Kuliah jadi Aman.</p>
      </div>
    </footer>
  );
}

export default Footer;