import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import { Link, useNavigate } from 'react-router-dom';
import Footer from './Footer';

function Home() {
  const [kosList, setKosList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  useEffect(() => {
    ambilDataKos();
  }, []);

  const ambilDataKos = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/kos");
      setKosList(response.data);
      console.log("Data kos berhasil diambil:", response.data);
    } catch (error) {
      console.error("Gagal mengambil data kos:", error);
    }
  };

  const handleSearch = () => {
    navigate(`/cari?keyword=${keyword}&tipe=${kategori}`);
  };

  const scroll = (arah) => {
    if (sliderRef.current) {
      const { current } = sliderRef;
      const scrollAmount = 300;
      
      if (arah === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const rekomendasiKos = kosList.slice(0, 10);

  return (
    <div className="main-wrapper">
      <div className="hero-section">
        <div className="container">
          <h1 className="brand-title">EduKost 🎓</h1>
          <p className="brand-tagline">Cari kost nyaman, kuliah jadi aman.</p>
          <div className="search-box">
            <input 
              type="text" 
              placeholder="🔍 Mau cari kos di mana?" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <div className="search-actions">
              <select value={kategori} onChange={(e) => setKategori(e.target.value)}>
                <option value="Semua">Semua Tipe</option>
                <option value="Putra">Putra</option>
                <option value="Putri">Putri</option>
                <option value="Campur">Campur</option>
              </select>
              
              <button onClick={handleSearch} className="btn-search-hero">
                Cari
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- LISTING SECTION (Bagian Bawah) --- */}
      <div className="container content-area" id="rekomendasi">
        <h2 className="section-title">Rekomendasi</h2>
        <div className="slider-container">
          <button onClick={() => scroll('left')} className="nav-btn left-btn">❮</button>
          <div className="kos-slider" ref={sliderRef}>
            {rekomendasiKos.map((kos) => (
              <div key={kos._id} className="kos-card slider-item">
                <div className="card-image-wrapper">
                  <span className={`tag-floating ${kos.tipe}`}>{kos.tipe}</span>
                  <img src={(kos.foto && kos.foto[0]) ? kos.foto[0] : "https://via.placeholder.com/300"} className="kos-image" />
                </div>
                
                <div className="kos-info">
                  <h3 className="kos-name">{kos.nama}</h3>
                  <p className="kos-location">📍 {kos.alamat.substring(0, 30)} • {kos.jarak}</p>
                  
                  <div className="kos-footer">
                    <div className="price-box">
                      <small>Mulai</small>
                      <span className="price">Rp {kos.harga.toLocaleString()}</span>
                      <small>/ bulan</small>
                    </div>
                    <Link to={`/kos/${kos._id}`} className="btn-detail-icon">➜</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        <button onClick={() => scroll('right')} className="nav-btn right-btn">❯</button>
      </div> 
      <div className="features-section" id="fitur">
        <div className="feature-item">
          <div className="feature-icon">🛡️</div>
          <h3>Terverifikasi</h3>
          <p>Data kos sudah dicek kebenarannya oleh tim kami.</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">📍</div>
          <h3>Lokasi Strategis</h3>
          <p>Hanya menampilkan kos yang dekat dengan kampus.</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">🏷️</div>
          <h3>Harga Transparan</h3>
          <p>Tidak ada biaya tersembunyi, bayar sesuai harga.</p>
        </div>
      </div>

      {/* 2. Banner Ajak Pemilik Kos (CTA) */}
      <div className="cta-banner">
        <div className="cta-content">
          <h2>Punya Kos Kosong?</h2>
          <p>Daftarkan kosmu sekarang dan temukan penyewa mahasiswa dengan cepat!</p>
          <button className="btn-cta">Daftar Jadi Mitra 🚀</button>
        </div>
        <div className="cta-image">
            🏡
        </div>
      </div>
    </div>
    <Footer />
  </div>
  );
}

export default Home;