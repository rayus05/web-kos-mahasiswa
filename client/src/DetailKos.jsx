import { use, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Footer from './Footer'; // Jangan lupa Footer
import './App.css';

function DetailKos() {
  const { id } = useParams();
  const [kos, setKos] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Scroll ke paling atas saat halaman dibuka
    window.scrollTo(0, 0);

    axios.get(`http://localhost:5000/api/kos/${id}`)
      .then(res => setKos(res.data))
      .catch(err => console.error(err));
  }, [id]);

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

  const photos = Array.isArray(kos.foto) ? kos.foto : [kos.foto].filter(Boolean);
  const pesanWA = `Halo, saya lihat info *${kos.nama}* di ZonaKampus. Apakah kamar ini masih tersedia?`;
  const linkWA = `https://wa.me/${kos.kontak}?text=${encodeURIComponent(pesanWA)}`;
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(kos.alamat)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  
  // --- LOGIKA SLIDESHOW ---
  const openModal = (index) => {
    setCurrentImageIndex(index);
    setShowModal(true);
  };

  const nextImage = (e) => {
    if(e) e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1)); // Loop ke awal
  };

  const prevImage = (e) => {
    if(e) e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1)); // Loop ke akhir
  };

  return (
    <div className="main-wrapper" style={{background: '#f5f7fa'}}>
      <div className="detail-header-bg"></div>
      <div className="container detail-container">
        {/* --- KOLOM KIRI: KONTEN UTAMA --- */}
        <div className="detail-main">
          {/* === GALERI FOTO BARU (GRID 1+3) === */}
          <div className="gallery-wrapper">
            {photos.length > 0 ? (
              <div className="gallery-grid">
                <div className="gallery-main" onClick={() => openModal(0)}>
                  <img src={photos[0]} alt="Main" className="img-cover" />
                  <span className={`tag-badge ${kos.tipe}`}>{kos.tipe}</span>
                </div>
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
              <div className="gallery-empty"><img src="https://via.placeholder.com/800x400" className="img-cover" /></div>
            )}
          </div>
          {/* === AKHIR GALERI === */}

          {/* 2. Judul & Info Dasar */}
          <div className="detail-section">
            <h1 className="detail-title">{kos.nama}</h1>
            <p className="detail-address">📍 {kos.alamat}</p>
            <div className="detail-meta">
              <span>📏 Jarak ke kampus: <strong>{kos.jarak}</strong></span>
              <span>📅 Post: {kos.updatedAt ? new Date(kos.updatedAt).toLocaleDateString('id-ID') : 'Baru saja'}</span>
            </div>
          </div>

          {/* 3. Fasilitas */}
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

          {/* 4. Deskripsi */}
          <div className="detail-section">
            <h3>Deskripsi</h3>
            <p className="detail-desc">
              {kos.deskripsi || "Pemilik kos belum menambahkan deskripsi detail. Silakan hubungi via WhatsApp untuk info lebih lanjut."}
            </p>
          </div>

          {/* 5. Lokasi (Google Maps Embed) */}
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

        {/* --- KOLOM KANAN: STICKY BOOKING CARD --- */}
        <div className="detail-sidebar">
          <div className="booking-card">
            <p className="booking-label">Harga Sewa Mulai</p>
            <h2 className="booking-price">Rp {kos.harga.toLocaleString()} <span className="per-month">/ bulan</span></h2>
            
            <hr className="divider" />
            
            <div className="owner-info">
              <div className="owner-avatar">👤</div>
              <div>
                <p className="owner-label">Dikelola oleh</p>
                <p className="owner-name">Pemilik Kos</p>
              </div>
            </div>

            <a href={linkWA} target="_blank" rel="noreferrer" className="btn-chat-wa">
              <span className="wa-icon">💬</span> Chat Pemilik via WA
            </a>

            <p className="safety-note">
              🛡️ <strong>Tips:</strong> Jangan transfer uang sebelum melihat lokasi kos secara langsung.
            </p>
          </div>
        </div>

      </div>

      <Footer />

      {/* --- MODAL GALERI FOTO --- */}
      {/* === MODAL LIGHTBOX BARU (SLIDESHOW) === */}
      {showModal && (
        <div className="lightbox-overlay" onClick={() => setShowModal(false)}>
          
          {/* Tombol Close */}
          <button className="lightbox-btn close-btn" onClick={() => setShowModal(false)}>✖</button>

          {/* Tombol Kiri */}
          <button className="lightbox-btn prev-btn" onClick={prevImage}>❮</button>

          {/* Container Gambar */}
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

          {/* Tombol Kanan */}
          <button className="lightbox-btn next-btn" onClick={nextImage}>❯</button>
        </div>
      )}
    </div>
  );
}

export default DetailKos;