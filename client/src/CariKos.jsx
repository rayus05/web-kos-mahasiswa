import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import Footer from './Footer';
import './App.css';

function CariKos() {
  const [kosList, setKosList] = useState([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialKeyword = queryParams.get('keyword') || '';
  const initialTipe = queryParams.get('tipe') || 'Semua';
  const [keyword, setKeyword] = useState(initialKeyword);
  const [tipe, setTipe] = useState(initialTipe);

  useEffect(() => {
    ambilDataKos();
  }, []);

  const ambilDataKos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/kos');
      setKosList(response.data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    }
  };

  const handleSearch = () => {
    navigate(`/cari?keyword=${keyword}&tipe=${kategori}`);
  };

  const filteredKos = kosList.filter((kos) => {
    const matchKeyword = kos.nama.toLowerCase().includes(keyword.toLowerCase()) || 
                         kos.alamat.toLowerCase().includes(keyword.toLowerCase());
    const matchTipe = tipe === "Semua" || kos.tipe === tipe;
    return matchKeyword && matchTipe;
  });

  return (
    <div className="search-page-wrapper">
      
      {/* --- BAGIAN ATAS (HEADER HIJAU) --- */}
      <div className="search-page-header">
        <div className="container">
          <h2 className="search-title">Temukan Kos Impianmu 🔍</h2>
          <div className="search-bar-wide">
            <input 
              type="text" 
              className="input-wide"
              placeholder="🔍 Ketik lokasi atau nama kos..." 
              value={keyword} 
              onChange={(e) => setKeyword(e.target.value)} 
            />
            
            <select 
              className="select-wide"
              value={tipe} 
              onChange={(e) => setTipe(e.target.value)}
            >
              <option value="Semua">Semua Tipe</option>
              <option value="Putra">Putra</option>
              <option value="Putri">Putri</option>
              <option value="Campur">Campur</option>
            </select>

            <button onClick={handleSearch} className="btn-search-hero">
              Cari
            </button>
          </div>
          
          <p className="search-result-count">
            Menampilkan <strong>{filteredKos.length}</strong> kos tersedia
          </p>
        </div>
      </div>

      {/* --- BAGIAN BAWAH (LISTING ABU-ABU) --- */}
      <div className="search-page-content">
        <div className="container">
          <div className="search-grid">
            {filteredKos.length > 0 ? (
              filteredKos.map((kos) => (
                <div key={kos._id} className="kos-card">
                  <div className="card-image-wrapper">
                    <span className={`tag-floating ${kos.tipe}`}>{kos.tipe}</span>
                    <img 
                      src={(kos.foto && kos.foto[0]) ? kos.foto[0] : "https://via.placeholder.com/300"} 
                      alt={kos.nama} 
                      className="kos-image"
                      onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/300?text=No+Image" }}
                    />
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
              ))
            ) : (
              // Tampilan jika kosong
              <div className="empty-state-search">
                <div className="empty-icon">😢</div>
                <h3>Yah, pencarian tidak ditemukan</h3>
                <p>Coba gunakan kata kunci lain atau ubah filter tipe kos.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CariKos;