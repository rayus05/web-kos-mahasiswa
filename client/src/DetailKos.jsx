import { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from './Footer';
import { AuthContext } from './AuthContext';
import './css/DetailKos.css';

function DetailKos() {
  const { id } = useParams();
  const [kos, setKos] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    axios.get(`https://edukost1.vercel.app/api/kos/${id}`)
      .then(res => setKos(res.data))
      .catch(err => console.error(err));
  }, [id]);

  // Handle Keyboard Navigation untuk Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showModal) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setShowModal(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  if (!kos) return <div className="loading-state">⏳ Sedang memuat data kos...</div>;

  const photos = Array.isArray(kos.foto) ? kos.foto.filter(Boolean) : [kos.foto].filter(Boolean);
  
  const pesanWA = `Halo, saya lihat info *${kos.nama}* di EduKost. Apakah kamar ini masih tersedia?`;
  const linkWA = `https://wa.me/${kos.kontak}?text=${encodeURIComponent(pesanWA)}`;
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(kos.alamat)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // --- LOGIKA SLIDESHOW ---
  const openModal = (index) => {
    setCurrentImageIndex(index);
    setShowModal(true);
  };

  const nextImage = (e) => {
    if(e) e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    if(e) e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleChatWA = (e) => {
    e.preventDefault();

    if (!user) {
      const mauLogin = window.confirm("🔒 Fitur Terkunci!\n\nAnda harus Login terlebih dahulu untuk menghubungi pemilik kos demi keamanan. Mau login sekarang?");
      if (mauLogin) {
        navigate('/login');
      }
    } else {
      window.open(linkWA, '_blank');
    }
  };

  return (
    <div className="main-wrapper" style={{background: '#f5f7fa'}}>
      <div className="detail-header-bg"></div>
      
      <div className="container detail-container">
        <div className="detail-main">
          {/* --- GALLERY SECTION --- */}
          <div className="gallery-wrapper">
            {photos.length > 0 ? (
              <div className="gallery-grid">
                {/* Foto Utama Besar */}
                <div className="gallery-main" onClick={() => openModal(0)}>
                  <img src={photos[0]} alt="Main" className="img-cover" />
                  <span className={`tag-badge ${kos.tipe}`}>{kos.tipe}</span>
                </div>
                
                {/* Foto Samping Kecil */}
                <div className="gallery-side">
                  {photos[1] && <div className="gallery-item" onClick={() => openModal(1)}><img src={photos[1]} className="img-cover" /></div>}
                  {photos[2] && <div className="gallery-item" onClick={() => openModal(2)}><img src={photos[2]} className="img-cover" /></div>}
                  {photos[3] && (
                    <div className="gallery-item" onClick={() => openModal(3)}>
                      <img src={photos[3]} className="img-cover" />
                      {photos.length > 4 && <div className="overlay-more">+{photos.length - 4} Foto</div>}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="gallery-empty">
                 <img src="https://via.placeholder.com/800x400?text=Tidak+Ada+Foto" className="img-cover" />
              </div>
            )}
          </div>

          {/* --- INFO UTAMA --- */}
          <div className="detail-section">
            <h1 className="detail-title">{kos.nama}</h1>
            <p className="detail-address">📍 {kos.alamat}</p>
            <div className="detail-meta">
              <span>📏 Jarak ke kampus: <strong>{kos.jarak}</strong></span>
              <span>📅 Diupdate: {kos.createdAt ? new Date(kos.createdAt).toLocaleDateString('id-ID') : 'Baru saja'}</span>
            </div>
          </div>

          {/* --- FASILITAS --- */}
          <div className="detail-section">
            <h3>Fasilitas Kos</h3>
            <div className="facilities-grid">
              {kos.fasilitas.length > 0 ? (
                kos.fasilitas.map((item, index) => (
                  <div key={index} className="facility-item">
                    ✅ {item}
                  </div>
                ))
              ) : (
                <p>-</p>
              )}
            </div>
          </div>

          {/* --- DESKRIPSI --- */}
          <div className="detail-section">
            <h3>Deskripsi</h3>
            <p className="detail-desc">
              {kos.deskripsi || "Pemilik kos belum menambahkan deskripsi detail. Silakan hubungi via WhatsApp untuk info lebih lanjut."}
            </p>
          </div>

          {/* --- LOKASI MAPS --- */}
          <div className="detail-section">
            <h3>Lokasi Peta</h3>
            <div className="map-frame">
              <iframe 
                title="Lokasi Kos"
                width="100%" 
                height="300" 
                frameBorder="0" 
                src={mapUrl}
                allowFullScreen
              ></iframe>
            </div>
            <small className="map-note">*Titik peta berdasarkan alamat yang terdaftar.</small>
          </div>

        </div>

        {/* --- SIDEBAR KANAN (BOOKING CARD) --- */}
        <div className="detail-sidebar">
          <div className="booking-card">
            <p className="booking-label">Harga Sewa Mulai</p>
            <h2 className="booking-price">Rp {kos.harga.toLocaleString()} <span className="per-month">/ bulan</span></h2>
            
            <hr className="divider" />
            
            <div className="owner-info">
              <div className="owner-avatar">👤</div>
              <div>
                <p className="owner-label">Dikelola oleh</p>
                {/* Tampilkan Nama Pemilik jika ada (dari User), kalau tidak ada tampilkan default */}
                <p className="owner-name">{kos.pemilikId?.username || 'Admin / Pemilik'}</p>
              </div>
            </div>

            {/* TOMBOL WA PINTAR (Locked/Unlocked) */}
            <a 
              href={linkWA} 
              onClick={handleChatWA} 
              className={`btn-chat-wa ${!user ? 'locked' : ''}`}
            >
              {user ? (
                <>
                  <span className="wa-icon">💬</span> Chat Pemilik via WA
                </>
              ) : (
                <>
                  <span className="wa-icon">🔒</span> Masuk untuk Chat
                </>
              )}
            </a>

            <p className="safety-note">
              🛡️ <strong>Tips:</strong> {user ? "Jangan transfer uang sebelum cek lokasi." : "Login diperlukan untuk menghindari spam."}
            </p>
          </div>
        </div>
      </div>

      <Footer />

      {/* --- MODAL LIGHTBOX (SLIDESHOW) --- */}
      {showModal && (
        <div className="lightbox-overlay" onClick={() => setShowModal(false)}>
          <button className="lightbox-btn close-btn" onClick={() => setShowModal(false)}>✖</button>
          <button className="lightbox-btn prev-btn" onClick={prevImage}>❮</button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={photos[currentImageIndex]} 
              alt={`Foto ${currentImageIndex + 1}`} 
              className="lightbox-image" 
            />
            <div className="lightbox-counter">
              {currentImageIndex + 1} / {photos.length}
            </div>
          </div>

          <button className="lightbox-btn next-btn" onClick={nextImage}>❯</button>
        </div>
      )}
    </div>
  );
};

export default DetailKos;