import './App.css';

const year = new Date().getFullYear();

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        
        {/* Kolom 1: Brand & Deskripsi */}
        <div className="footer-section brand-area">
          <h2 className="footer-logo">EduKost🎓</h2>
          <p>
            Platform pencarian kos mahasiswa nomor #1 di Palembang. 
            Aman, nyaman, dan dekat kampus.
          </p>
        </div>

        {/* Kolom 2: Link Cepat */}
        <div className="footer-section">
          <h3>Navigasi</h3>
          <ul>
            <li><a href="/">Beranda</a></li>
            <li><a href="/cari">Cari Kos</a></li>
          </ul>
        </div>

        {/* Kolom 3: Kontak */}
        <div className="footer-section">
          <h3>Hubungi Kami</h3>
          <p>📍 Jl. Banten 2 </p>
          <p>📞 +62 852-6395-9549 </p>
        </div>

      </div>

      <div className="footer-bottom">
        <p id="footer-text">&copy; {year} EduKost - Cari Kost Nyaman, Kuliah jadi Aman.</p>
      </div>
    </footer>
  );
}

export default Footer;