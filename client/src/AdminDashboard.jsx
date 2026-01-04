import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [kosList, setKosList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);

  // State Formulir
  const [formData, setFormData] = useState({
    nama: '', tipe: 'Campur', harga: '', alamat: '', 
    jarak: '', fasilitas: '', deskripsi: '', foto: [], kontak: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/kos');
      setKosList(response.data);
    } catch (error) {
      console.error("Error ambil data:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Modifikasi Handle Submit untuk Upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let finalFotoUrls = formData.foto;

      // 1. Jika ada file gambar yang dipilih, UPLOAD DULU
      if (imageFiles.length > 0) {
        const uploadData = new FormData();
        for (let i = 0; i < imageFiles.length; i++) {
          uploadData.append('images', imageFiles[i]);
        }

        const uploadRes = await axios.post('http://localhost:5000/api/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        finalFotoUrls = uploadRes.data.urls;
      }

      // 2. Siapkan data akhir
      const dataSiapKirim = {
        ...formData,
        foto: finalFotoUrls,
        fasilitas: typeof formData.fasilitas === 'string' 
          ? formData.fasilitas.split(',').map(item => item.trim()) 
          : formData.fasilitas
      };

      // 3. Simpan ke Database (Sama seperti sebelumnya)
      if (editId) {
        await axios.put(`http://localhost:5000/api/kos/${editId}`, dataSiapKirim);
        alert("✅ Data berhasil diperbarui!");
      } else {
        await axios.post('http://localhost:5000/api/kos', dataSiapKirim);
        alert("✅ Data berhasil ditambahkan!");
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error(error);
      alert("❌ Gagal menyimpan data (Cek koneksi backend).");
    }
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Yakin hapus "${nama}"?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/kos/${id}`);
        fetchData();
      } catch (error) {
        alert("Gagal menghapus.");
      }
    }
  };

  const handleEditClick = (kos) => {
    setEditId(kos._id);
    setFormData({
      ...kos,
      fasilitas: kos.fasilitas.join(', '),
      foto: Array.isArray(kos.foto) ? kos.foto : [kos.foto].filter(Boolean)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditId(null);
    setImageFiles([]);
    setFormData({
      nama: '', tipe: 'Campur', harga: '', alamat: '', 
      jarak: '', fasilitas: '', deskripsi: '', foto: [], kontak: ''
    });
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Dashboard Admin 🛠️</h1>
        <p>Kelola data kos dengan mudah.</p>
      </div>

      {/* --- FORMULIR --- */}
      <div className={`admin-card form-card ${editId ? 'mode-edit' : ''}`}>
        <h3>{editId ? `✏️ Edit Data: ${formData.nama}` : '➕ Tambah Kos Baru'}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Nama Kos</label>
              <input type="text" name="nama" value={formData.nama} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Tipe</label>
              <select name="tipe" value={formData.tipe} onChange={handleChange}>
                <option value="Putra">Putra</option>
                <option value="Putri">Putri</option>
                <option value="Campur">Campur</option>
              </select>
            </div>
            <div className="form-group">
              <label>Harga (Angka)</label>
              <input type="number" name="harga" value={formData.harga} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Jarak</label>
              <input type="text" name="jarak" value={formData.jarak} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Kontak WA (62...)</label>
              <input type="text" name="kontak" value={formData.kontak} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Fasilitas (Pisahkan koma)</label>
              <input type="text" name="fasilitas" value={formData.fasilitas} onChange={handleChange} placeholder="WiFi, AC, Kasur" />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Deskripsi Lengkap</label>
            <textarea
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              placeholder="Jelaskan detail kos (misal: Lingkungan aman, dekat masjid, akses 24 jam...)"
              rows="5" /* Biar kotaknya agak tinggi */
            ></textarea>
          </div>
          
          <div className="form-group full-width">
            <label>Alamat Lengkap</label>
            <input type="text" name="alamat" value={formData.alamat} onChange={handleChange} required />
          </div>

          <div className="form-group full-width">
            <label>Foto Kos (Pilih Banyak Sekaligus)</label>
            
            {/* Tambah atribut 'multiple' */}
            <input 
              type="file" 
              accept="image/*"
              multiple // <--- PENTING!
              onChange={(e) => setImageFiles(e.target.files)} // Ambil semua files
              style={{marginBottom: '10px'}}
            />

            {/* Preview Gambar (Looping Array) */}
            {formData.foto && formData.foto.length > 0 && !imageFiles.length && (
              <div className="preview-container">
                <p style={{fontSize:'12px'}}>Foto Saat Ini ({formData.foto.length}):</p>
                <div style={{display:'flex', gap:'10px', overflowX:'auto'}}>
                  {formData.foto.map((url, index) => (
                    <img key={index} src={url} alt="Preview" className="img-preview-small" />
                  ))}
                </div>
                <small style={{color:'red'}}>*Jika upload foto baru, semua foto lama ini akan diganti.</small>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editId ? 'Update Data' : 'Simpan Data'}
            </button>
            {editId && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- TABEL --- */}
      <div className="admin-card table-card">
        <h3>📋 Daftar Kos Tersimpan</h3>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama Kos</th>
                <th>Harga</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kosList.map((kos) => (
                <tr key={kos._id}>
                  <td>
                    <span className="kos-name">{kos.nama}</span><br/>
                    <span className="kos-type">{kos.tipe}</span>
                  </td>
                  <td>Rp {kos.harga.toLocaleString()}</td>
                  <td className="action-cell">
                    <button onClick={() => handleEditClick(kos)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDelete(kos._id, kos.nama)} className="btn-delete">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;