import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from './Footer';
import './css/CariKos.css';

function CariKos() {
  const [kosList, setKosList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate(); // ✅ Perbaikan: Tambah ini
  
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
      setLoading(true);
      // Filter 'approved' sebaiknya dilakukan di backend, tapi di sini kita filter manual dulu
      const response = await axios.get('https://edukost.vercel.app/api/kos');
      setKosList(response.data.filter(k => k.status === 'approved')); 
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // ✅ Perbaikan: Ganti 'kategori' jadi 'tipe'
    navigate(`/cari?keyword=${keyword}&tipe=${tipe}`);
  };

  // Filter Lokal (Client Side)
  const filteredKos = kosList.filter((kos) => {
    const matchKeyword = kos.nama.toLowerCase().includes(keyword.toLowerCase()) || 
                         kos.alamat.toLowerCase().includes(keyword.toLowerCase());
    const matchTipe = tipe === "Semua" || kos.tipe === tipe;
    return matchKeyword && matchTipe;
  });

  return (
    <div className="main-wrapper" style={{background: '#f5f7fa', minHeight:'100vh'}}>
      
      {/* --- HEADER SECTION (HIJAU) --- */}
      <div className="search-header-section">
        <div className="container">
          <h2 className="search-page-title">Temukan Kos Impianmu 🔍</h2>
          <p className="search-page-subtitle">Cari berdasarkan lokasi, nama, atau tipe kos.</p>
          
          {/* SEARCH BAR WIDE */}
          <div className="search-bar-container">
            <div className="search-input-group">
              <span className="search-icon">📍</span>
              <input 
                type="text" 
                placeholder="Ketik lokasi atau nama kos..." 
                value={keyword} 
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div className="search-filter-group">
              <select value={tipe} onChange={(e) => setTipe(e.target.value)}>
                <option value="Semua">Semua Tipe</option>
                <option value="Putra">Putra</option>
                <option value="Putri">Putri</option>
                <option value="Campur">Campur</option>
              </select>
            </div>

            <button onClick={handleSearch} className="btn-search-wide">
              Cari Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* --- CONTENT SECTION (HASIL) --- */}
      <div className="container" style={{marginTop: '40px', paddingBottom: '60px'}}>
        
        <div className="search-meta">
           Menampilkan <strong>{filteredKos.length}</strong> hasil pencarian
           {keyword && <span> untuk "<em>{keyword}</em>"</span>}
        </div>

        {loading ? (
          <div className="loading-state">⏳ Sedang memuat data...</div>
        ) : (
          <div className="search-grid">
            {filteredKos.length > 0 ? (
              filteredKos.map((kos) => (
                <div key={kos._id} className="kos-card">
                  <div className="card-image-wrapper">
                    <span className={`tag-floating ${kos.tipe}`}>{kos.tipe}</span>
                    <img 
                      src={(kos.foto && kos.foto.length > 0) ? kos.foto[0] : "https://via.placeholder.com/300?text=No+Image"} 
                      alt={kos.nama} 
                      className="kos-image"
                    />
                  </div>
                  
                  <div className="kos-info">
                    <h3 className="kos-name">{kos.nama}</h3>
                    <p className="kos-location">📍 {kos.alamat ? kos.alamat.substring(0, 30) + '...' : 'Lokasi'} • {kos.jarak}</p>
                    
                    <div className="kos-footer">
                      <div className="price-box">
                        <small>Mulai</small>
                        <span className="price">Rp {kos.harga.toLocaleString()}</span>
                        <small>/ bln</small>
                      </div>
                      <Link to={`/kos/${kos._id}`} className="btn-detail-icon">➜</Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Empty State
              <div className="empty-state-search">
                <div className="empty-icon">😢</div>
                <h3>Yah, kos tidak ditemukan</h3>
                <p>Coba ganti kata kunci atau ubah filter tipe kos kamu.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default CariKos;