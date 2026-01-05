import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Footer from './Footer';
import './App.css';

function TambahKos() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nama: '', 
    tipe: 'Campur', 
    harga: '', 
    alamat: '', 
    jarak: '', 
    fasilitas: '', 
    kontak: '', 
    deskripsi: '', 
    foto: []
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
      // 1. Upload Foto
      let finalFotoUrls = [];
      if (imageFiles.length > 0) {
        const uploadData = new FormData();
        for (let i = 0; i < imageFiles.length; i++) uploadData.append('images', imageFiles[i]);
        
        const uploadRes = await axios.post('http://localhost:5000/api/upload', uploadData);
        finalFotoUrls = uploadRes.data.urls;
      } else {
        alert("Wajib upload minimal 1 foto!");
        setLoading(false);
        return;
      }

      // 2. Simpan Data Kos (Status otomatis 'pending' di backend)
      await axios.post('http://localhost:5000/api/kos', {
        ...formData,
        foto: finalFotoUrls,
        userId: user.id
      });

      alert("🎉 Data Berhasil Dikirim! Iklan akan tayang setelah disetujui Admin.");
      navigate('/'); 
    } catch (err) {
      alert("Gagal upload kos: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="main-wrapper" style={{background: '#f5f7fa'}}>
      <div className="detail-header-bg"></div>
        <div className="container" style={{paddingTop: '100px', maxWidth:'800px', paddingBottom:'50px'}}>

            <div className="admin-card">
                <h2 style={{textAlign:'center', marginBottom:'10px'}}>📝 Pasang Iklan Kos Baru</h2>
                <p style={{textAlign:'center', color:'#666', marginBottom:'30px'}}>
                    Isi data selengkap mungkin agar penyewa tertarik dan admin cepat menyetujui.
                </p>
            
                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group full-width">
                        <label>Nama Kos</label>
                        <input type="text" name="nama" required onChange={handleChange} placeholder="Contoh: Wisma Melati Indah" />
                    </div>

                    <div className="form-group">
                        <label>Tipe Kos</label>
                        <select name="tipe" value={formData.tipe} onChange={handleChange}>
                            <option value="Campur">Campur</option>
                            <option value="Putra">Putra</option>
                            <option value="Putri">Putri</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Harga per Bulan (Rp)</label>
                        <input type="number" name="harga" required onChange={handleChange} placeholder="Contoh: 850000" />
                    </div>

                    <div className="form-group full-width">
                        <label>Alamat Lengkap</label>
                        <input type="text" name="alamat" required onChange={handleChange} placeholder="Jalan, Nomor, RT/RW, Kelurahan..." />
                    </div>

                    <div className="form-group">
                        <label>Jarak ke Kampus Terdekat</label>
                        <input type="text" name="jarak" required onChange={handleChange} placeholder="500m dari ('nama kampus')" />
                    </div>

                    <div className="form-group">
                        <label>Kontak WhatsApp Pemilik (Format: 628...)</label>
                        <input type="number" name="kontak" required onChange={handleChange} placeholder="628123456789" />
                    </div>

                    <div className="form-group full-width">
                        <label>Fasilitas (Pisahkan dengan koma)</label>
                        <input type="text" name="fasilitas" required onChange={handleChange} placeholder="WiFi, Kasur, Lemari, AC, Kamar Mandi Dalam" />
                    </div>

                    <div className="form-group full-width">
                        <label>Deskripsi Lengkap</label>
                        <textarea 
                            name="deskripsi" 
                            required 
                            onChange={handleChange} 
                            rows="5" 
                            placeholder="Ceritakan kelebihan kos Anda, aturan, lingkungan sekitar, dll."
                        ></textarea>
                    </div>

                    <div className="form-group full-width">
                        <label>Foto Kos (Upload Banyak Sekaligus)</label>
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*"
                            onChange={(e) => setImageFiles(e.target.files)} 
                            required 
                        />
                        <small style={{color:'#666'}}>*Minimal 3 foto(Bagian Depan Kos, Dalam kos, fasilitas, dsb), disarankan 5 foto agar tampilan bagus.</small>
                    </div>

                    <div className="form-actions full-width" style={{marginTop:'10px', marginBottom:'-10px'}}>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Sedang Mengirim...' : 'Kirim Iklan Sekarang 🚀'}
                        </button>
                    </div>
                    <div className='form-group full-width'>
                        <small style={{color:'#666'}}>*Tim admin akan melakukan survey ke tempat anda terlebih dahulu sebelum menyetujui, mohon tunggu dalam 3x24 jam waktu kerja</small>
                    </div>

                </form>
            </div>
        </div>
        <Footer />
    </div>
  );
}
export default TambahKos;