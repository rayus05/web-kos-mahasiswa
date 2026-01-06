import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Footer from './Footer';
import './css/TambahKos.css';

function TambahKos() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nama: '', tipe: 'Campur', harga: '', alamat: '', 
    jarak: '', fasilitas: '', kontak: '', deskripsi: '', foto: []
  });
  
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Redirect kalau belum login
  if (!user) {
    window.location.href = '/login';
    return null;
  }

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalFotoUrls = [];
      
      // 1. Upload Foto
      if (imageFiles.length > 0) {
        console.log("1. Mengupload foto...");
        const uploadData = new FormData();
        for (let i = 0; i < imageFiles.length; i++) {
          uploadData.append('images', imageFiles[i]); // Key wajib 'images'
        }
        
        const uploadRes = await axios.post('https://edukost.vercel.app/api/upload', uploadData);
        finalFotoUrls = uploadRes.data.urls;
      } else {
        alert("Wajib upload minimal 1 foto!");
        setLoading(false);
        return;
      }

      // 2. Simpan Data Kos
      const payload = {
        ...formData,
        foto: finalFotoUrls,
        userId: user.id
      };

      console.log("2. Menyimpan data...", payload);
      await axios.post('https://edukost.vercel.app/api/kos', payload);

      alert("🎉 Iklan Berhasil Dikirim! Menunggu verifikasi admin.");
      navigate('/'); 
    } catch (err) {
      console.error(err);
      alert("Gagal: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper" style={{background: '#f5f7fa', minHeight: '100vh'}}>
      
      {/* --- HEADER BACKGROUND HIJAU --- */}
      <div className="detail-header-bg"></div>

      {/* --- CONTAINER FORM MELAYANG --- */}
      <div className="container form-floating-container">
        
        <div className="form-card-premium">
          <div className="form-header">
            <h2>🏡 Pasang Iklan Kos</h2>
            <p>Isi data kos dengan lengkap agar cepat disetujui.</p>
          </div>

          <form onSubmit={handleSubmit} className="form-grid-layout">
             
             {/* GROUP 1: Info Dasar */}
             <div className="form-section-title">Informasi Utama</div>
             
             <div className="form-group full-width">
               <label>Nama Kos</label>
               <input type="text" name="nama" required onChange={handleChange} placeholder="Contoh: Wisma Melati Indah" className="input-modern" />
             </div>

             <div className="form-group">
               <label>Tipe Kos</label>
               <select name="tipe" value={formData.tipe} onChange={handleChange} className="input-modern">
                 <option value="Campur">Campur</option>
                 <option value="Putra">Putra</option>
                 <option value="Putri">Putri</option>
               </select>
             </div>

             <div className="form-group">
               <label>Harga per Bulan (Rp)</label>
               <input type="number" name="harga" required onChange={handleChange} placeholder="Contoh: 850000" className="input-modern" />
             </div>

             {/* GROUP 2: Lokasi & Kontak */}
             <div className="form-section-title full-width" style={{marginTop:'20px'}}>Lokasi & Kontak</div>

             <div className="form-group full-width">
               <label>Alamat Lengkap</label>
               <input type="text" name="alamat" required onChange={handleChange} placeholder="Jalan, Nomor, RT/RW, Kelurahan..." className="input-modern" />
             </div>

             <div className="form-group">
               <label>Jarak ke Kampus</label>
               <input type="text" name="jarak" required onChange={handleChange} placeholder="Contoh: 500m / 1km" className="input-modern" />
             </div>

             <div className="form-group">
               <label>WhatsApp Pemilik (628...)</label>
               <input type="number" name="kontak" required onChange={handleChange} placeholder="628123456789" className="input-modern" />
             </div>

             {/* GROUP 3: Detail & Foto */}
             <div className="form-section-title full-width" style={{marginTop:'20px'}}>Detail & Foto</div>

             <div className="form-group full-width">
               <label>Fasilitas (Pisahkan koma)</label>
               <input type="text" name="fasilitas" required onChange={handleChange} placeholder="WiFi, Kasur, Lemari, AC, Kamar Mandi Dalam" className="input-modern" />
             </div>

             <div className="form-group full-width">
               <label>Deskripsi Lengkap</label>
               <textarea 
                  name="deskripsi" 
                  required 
                  onChange={handleChange} 
                  rows="4" 
                  placeholder="Ceritakan kelebihan kos Anda..."
                  className="input-modern"
               ></textarea>
             </div>

             <div className="form-group full-width">
                <label>Foto Kos (Upload Sekaligus)</label>
                <div className="upload-box-modern">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={(e) => setImageFiles(e.target.files)} 
                    required 
                    id="file-upload"
                  />
                  <p>📸 Klik untuk pilih foto (Min. 1)</p>
                  <small>{imageFiles.length > 0 ? `${imageFiles.length} file dipilih` : 'Belum ada file dipilih'}</small>
                </div>
             </div>

             <div className="form-actions full-width">
               <button type="submit" className="btn-primary-gradient" disabled={loading}>
                 {loading ? '⏳ Mengirim...' : 'Kirim Iklan Sekarang 🚀'}
               </button>
             </div>

          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
export default TambahKos;