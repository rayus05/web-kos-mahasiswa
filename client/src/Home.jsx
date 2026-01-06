import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import { AuthContext } from './AuthContext'; // Import Context untuk cek login
import "./css/Home.css";

function Home() {
  const [kosList, setKosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [kategori, setKategori] = useState("Semua");
  
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const { user } = useContext(AuthContext); // Ambil status user

  useEffect(() => {
    ambilDataKos();
  }, []);

  const ambilDataKos = async () => {
    try {
      // Endpoint ini sebaiknya sudah difilter di backend (status: approved)
      const response = await axios.get("https://edukost.vercel.app/api/kos");
      setKosList(response.data);
    } catch (error) {
      console.error("Gagal mengambil data kos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    navigate(`/cari?keyword=${keyword}&tipe=${kategori}`);
  };

  const scroll = (arah) => {
    if (sliderRef.current) {
      const { current } = sliderRef;
      const scrollAmount = 320; // Sesuaikan dengan lebar kartu + gap
      if (arah === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Logika Tombol CTA (Call to Action)
  const handleMitraClick = () => {
    if (user) {
      navigate('/tambah-kos'); // Kalau sudah login, langsung pasang iklan
    } else {
      navigate('/register'); // Kalau belum, daftar dulu
    }
  };

  // Logika untuk menampilkan gambar (bisa Cloudinary atau Lokal)
const getFotoSrc = (foto) => {
  if (!foto) return "https://via.placeholder.com/300"; // Placeholder
  
  // Jika foto adalah URL lengkap (Cloudinary), pakai langsung
  if (foto.startsWith('http')) {
    return foto;
  } 
  
  // Jika foto cuma nama file (Lokal), tambahkan localhost
  return `https://edukost.vercel.app/uploads/${foto}`;
};

  // Ambil 10 data pertama untuk rekomendasi
  const rekomendasiKos = kosList.slice(0, 10);

  return (
    <div className="main-wrapper">
      
      {/* --- HERO SECTION --- */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1 className="brand-title-hero">EduKost 🎓</h1>
          <p className="brand-tagline-hero">Cari kost nyaman, kuliah jadi aman.</p>
          
          {/* Box Pencarian */}
          <div className="search-box-hero">
            <div className="input-group-hero">
              <span className="icon">🔍</span>
              <input 
                type="text" 
                placeholder="Mau cari kos di mana?" 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div className="search-actions-hero">
              <select value={kategori} onChange={(e) => setKategori(e.target.value)} className="select-hero">
                <option value="Semua">Semua Tipe</option>
                <option value="Putra">Putra</option>
                <option value="Putri">Putri</option>
                <option value="Campur">Campur</option>
              </select>
              
              <button onClick={handleSearch} className="btn-search-hero">
                Cari Kos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- REKOMENDASI SLIDER --- */}
      <div className="container content-area" id="rekomendasi" style={{paddingTop: '60px'}}>
        <div className="section-header">
          <h2 className="section-title">Rekomendasi Pilihan</h2>
          <Link to="/cari" className="see-all-link">Lihat Semua ➜</Link>
        </div>

        {loading ? (
          <p className="loading-text">⏳ Sedang memuat rekomendasi...</p>
        ) : (
          <div className="slider-container">
            <button onClick={() => scroll('left')} className="nav-btn left-btn">❮</button>
            
            <div className="kos-slider" ref={sliderRef}>
              {rekomendasiKos.length > 0 ? (
                rekomendasiKos.map((kos) => (
                  <div key={kos._id} className="kos-card slider-item">
                    <div className="card-image-wrapper">
                      <span className={`tag-floating ${kos.tipe}`}>{kos.tipe}</span>
                      <img 
                        src={getFotoSrc(kos.foto[0])} 
                        alt={kos.nama}
                        className="kos-image" 
                      />
                    </div>
                    
                    <div className="kos-info">
                      <h3 className="kos-name">{kos.nama}</h3>
                      <p className="kos-location">📍 {kos.alamat ? kos.alamat.substring(0, 25) + '...' : 'Lokasi'}</p>
                      
                      <div className="kos-footer">
                        <div className="price-box">
                          <span className="price">Rp {kos.harga.toLocaleString()}</span>
                          <small>/bln</small>
                        </div>
                        <Link to={`/kos/${kos._id}`} className="btn-detail-icon">➜</Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">Belum ada data kos yang tersedia.</div>
              )}
            </div>

            <button onClick={() => scroll('right')} className="nav-btn right-btn">❯</button>
          </div> 
        )}
      </div>

      {/* --- FITUR SECTION --- */}
      <div className="container features-section">
        <div className="feature-item">
          <div className="feature-icon-circle">🛡️</div>
          <h3>Terverifikasi</h3>
          <p>Data kos dicek manual oleh tim admin.</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon-circle">📍</div>
          <h3>Strategis</h3>
          <p>Lokasi dekat dengan area kampus utama.</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon-circle">💬</div>
          <h3>Chat Langsung</h3>
          <p>Hubungi pemilik kos via WhatsApp.</p>
        </div>
      </div>

      {/* --- CTA BANNER (AJAK MITRA) --- */}
      <div className="container">
        <div className="cta-banner">
          <div className="cta-content">
            <h2>Punya Kamar Kosong?</h2>
            <p>Daftarkan kosmu sekarang dan temukan penyewa mahasiswa dengan cepat!</p>
            <button className="btn-cta" onClick={handleMitraClick}>
              {user ? 'Pasang Iklan Sekarang 🚀' : 'Daftar Jadi Mitra 🚀'}
            </button>
          </div>
          <div className="cta-decoration">🏡</div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;