import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './css/AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ totalKos: 0, totalUser: 0 });
  const [kosList, setKosList] = useState([]);
  const [selectedVerifyKos, setSelectedVerifyKos] = useState(null);
  const [editId, setEditId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: '', tipe: 'Campur', harga: '', alamat: '', 
    jarak: '', fasilitas: '', deskripsi: '', foto: [], kontak: ''
  });
  const { user, logout } = useContext(AuthContext);
  const [userList, setUserList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Kalau belum login sama sekali -> Tendang ke Login
    if (!user) {
      navigate('/login');
      return;
    }

    // 2. Kalau sudah login TAPI bukan admin -> Tendang ke Home
    if (user.role !== 'admin') {
      alert("⚠️ Eits! Kamu bukan Admin. Dilarang masuk area terlarang.");
      navigate('/'); 
    }

    // Kalau lolos, baru ambil data
    if (user && user.role === 'admin') {
      fetchStats();
      fetchData();
      fetchUsers();
    }
  }, [user, activeTab]);

  const fetchStats = async () => {
    try {
      const res = await axios.get('https://edukost.vercel.app/api/stats');
      setStats(res.data);
    } catch (err) { console.error("Gagal ambil stats"); }
  };

  // FUNGSI AMBIL DATA USER
  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://edukost.vercel.app/api/users');
      setUserList(res.data);
    } catch (error) {
      console.error("Gagal ambil user:", error);
    }
  };

  // FUNGSI HAPUS USER
  const handleDeleteUser = async (id, usernameUser) => {
    if (window.confirm(`Yakin ingin memblokir/menghapus user "${usernameUser}"?`)) {
      try {
        await axios.delete(`https://edukost.vercel.app/api/users/${id}`);
        alert("User berhasil dihapus!");
        fetchUsers();
        fetchStats();
      } catch (error) {
        alert("Gagal menghapus user.");
      }
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('https://edukost.vercel.app/api/admin/kos');
      setKosList(response.data);
    } catch (error) {
      console.error("Error ambil data:", error);
    }
  };

  const handleVerify = async (id, statusBaru) => {
    if(!window.confirm(`Yakin ingin ${statusBaru === 'approved' ? 'Menerima' : 'Menolak'} iklan ini?`)) return;

    try {
      await axios.put(`https://edukost.vercel.app/api/kos/${id}/verify`, { status: statusBaru });
      alert(`Sukses! Iklan telah di-${statusBaru}.`);
      setSelectedVerifyKos(null); // Tutup modal
      fetchData(); // Refresh data
    } catch (error) {
      alert("Gagal update status.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalFotoUrls = formData.foto || []; // Pakai foto lama kalau tidak upload baru

      // --- LANGKAH 1: UPLOAD FOTO KE CLOUDINARY (Jika ada file dipilih) ---
      if (imageFiles.length > 0) {
        console.log("1. Mengupload foto ke Cloudinary...");
        
        const uploadData = new FormData();
        for (let i = 0; i < imageFiles.length; i++) {
          uploadData.append('images', imageFiles[i]); // Kuncinya wajib 'images'
        }

        const uploadRes = await axios.post('https://edukost.vercel.app/api/upload', uploadData);
        
        // Ambil URL dari respon backend
        const newUrls = uploadRes.data.urls; 
        
        if (newUrls && newUrls.length > 0) {
           finalFotoUrls = newUrls; // Pakai URL baru dari Cloudinary
        }
      }

      // --- LANGKAH 2: SIAPKAN DATA UNTUK DISIMPAN ---
      const payload = {
        ...formData,
        foto: finalFotoUrls, // Masukkan array URL foto (bukan file fisik)
        userId: user.id      // PENTING: Masukkan ID Admin sebagai pemilik
      };

      console.log("2. Mengirim data ke Database:", payload);

      // --- LANGKAH 3: PILIH UPDATE ATAU CREATE ---
      if (editId) {
        // Mode Edit (PUT)
        await axios.put(`https://edukost.vercel.app/api/kos/${editId}`, payload);
        alert("✅ Data kos berhasil diperbarui!");
      } else {
        // Mode Tambah Baru (POST)
        await axios.post('https://edukost.vercel.app/api/kos', payload);
        alert("✅ Data kos baru berhasil disimpan!");
      }

      // --- LANGKAH 4: RESET FORM & REFRESH ---
      setFormData({
        nama: '', tipe: 'Campur', harga: '', alamat: '', 
        jarak: '', fasilitas: '', kontak: '', deskripsi: '', foto: []
      });
      setImageFiles([]);
      setEditId(null);
      
      fetchData(); // Ambil data terbaru biar tabel langsung update

    } catch (err) {
      console.error("Gagal menyimpan:", err);
      // Tampilkan pesan error yang jelas dari backend
      alert("Gagal menyimpan data: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Yakin hapus "${nama}"?`)) {
      try {
        await axios.delete(`https://edukost.vercel.app/api/kos/${id}`);
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
    <div className="admin-wrapper">
      <div className="admin-sidebar">
        <h2 className="admin-logo">AdminPanel ⚙️</h2>
        <ul className="admin-menu">
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            📊 Ringkasan
          </li>
          <li className={activeTab === 'kelola-kos' ? 'active' : ''} onClick={() => setActiveTab('kelola-kos')}>
            🏠 Kelola Data Kos
          </li>
          <li className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            👥 Data Pengguna
          </li>
          <li className={activeTab === 'verifikasi' ? 'active' : ''} onClick={() => setActiveTab('verifikasi')}>
            ✅ Verifikasi Mitra
            {kosList.filter(k => k.status === 'pending').length > 0 && (
               <span className="badge-pending">{kosList.filter(k => k.status === 'pending').length}</span>
            )}
          </li>
        </ul>
        <button onClick={logout} className="btn-logout-admin">Keluar</button>
      </div>

      {/* KONTEN UTAMA */}
      <div className="admin-content">
        
        {/* === TAB 1: DASHBOARD STATISTIK === */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-stats">
            <h1>Selamat Datang, Admin! 👋</h1>
            <p>Berikut adalah ringkasan data EduKost hari ini.</p>
            
            <div className="stats-grid">
              <div className="stat-card blue">
                <h3>Total Kos</h3>
                <div className="stat-number">{stats.totalKos}</div>
                <p>Unit terdaftar</p>
              </div>
              <div className="stat-card green">
                <h3>Total Pengguna</h3>
                <div className="stat-number">{stats.totalUser}</div>
                <p>Akun terdaftar</p>
              </div>
              <div className="stat-card orange">
                <h3>Kunjungan</h3>
                <div className="stat-number">1,240</div>
                <p>Bulan ini (Dummy)</p>
              </div>
            </div>
          </div>
        )}

        {/* === TAB 2: KELOLA KOS (FORMULIR LAMA KAMU) === */}
        {activeTab === 'kelola-kos' && (
          <div className="kelola-kos-section">
            <h2>Manajemen Data Kos</h2>
            <div className="empty-placeholder-note">
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
                  rows="5"
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
                  onChange={(e) => setImageFiles(e.target.files)}
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
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? '⏳ Sedang Menyimpan...' : (editId ? 'Update Data' : 'Simpan Data')}
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
        )}

        {/* === TAB 3: DATA PENGGUNA (Next Project) === */}
        {activeTab === 'users' && (
          <div className="users-section">
            <h2 style={{marginBottom: '20px'}}>Manajemen Pengguna ({userList.length})</h2>
            
            <div className="table-responsive admin-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Bergabung</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map((u, index) => (
                    <tr key={u._id}>
                      <td>{index + 1}</td>
                      <td>
                        <div style={{fontWeight: 'bold'}}>{u.username}</div>
                        {/* Tandai kalau ini akun sendiri */}
                        {u.email === user.email && <small style={{color:'#0f766e'}}>(Akun Saya)</small>}
                      </td>
                      <td>{u.email}</td>
                      <td>
                        {/* Badge Role */}
                        <span className={`role-badge ${u.role}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {/* Jangan biarkan admin menghapus dirinya sendiri! */}
                        {u.email !== user.email && (
                          <button 
                            onClick={() => handleDeleteUser(u._id, u.username)} 
                            className="btn-delete"
                            title="Hapus User"
                          >
                            Hapus 🗑️
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {userList.length === 0 && (
                <p style={{textAlign:'center', padding:'20px'}}>Belum ada user lain terdaftar.</p>
              )}
            </div>
          </div>
        )}

        {/* === TAB 4: VERIFIKASI (APPROVAL) === */}
        {activeTab === 'verifikasi' && (
          <div className="verifikasi-section">
            <h2>Permintaan Verifikasi Iklan</h2>
            <p className="subtitle">Setujui iklan mitra agar tayang di halaman depan.</p>
            
            {kosList.filter(k => k.status === 'pending').length === 0 ? (
              <div className="empty-state-admin">
                 <p>🎉 Semua aman! Tidak ada antrian verifikasi.</p>
              </div>
            ) : (
              <div className="grid-verifikasi">
                {kosList.filter(k => k.status === 'pending').map(kos => (
                  <div key={kos._id} className="card-verify clickable" onClick={() => setSelectedVerifyKos(kos)}>
                    
                    {/* Gambar Thumbnail */}
                    <div className="verify-img-wrapper">
                       <img 
                         src={kos.foto && kos.foto[0] ? kos.foto[0] : "https://via.placeholder.com/300"} 
                         alt={kos.nama} 
                       />
                       <span className={`tag-verify ${kos.tipe}`}>{kos.tipe}</span>
                    </div>

                    <div className="verify-body">
                      <h4>{kos.nama}</h4>
                      <p className="verify-owner">
                        👤 Oleh: <strong>{kos.pemilikId ? kos.pemilikId.username : 'Admin'}</strong>
                      </p>
                      <p className="verify-price">Rp {kos.harga.toLocaleString()}</p>
                      
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* === MODAL POPUP VERIFIKASI === */}
      {selectedVerifyKos && (
        <div className="modal-overlay" onClick={() => setSelectedVerifyKos(null)}>
          <div className="verify-modal-content" onClick={(e) => e.stopPropagation()}>
            
            <div className="verify-modal-header">
              <h3>Review Iklan Kos</h3>
              <button className="close-btn-text" onClick={() => setSelectedVerifyKos(null)}>✖ Tutup</button>
            </div>

            <div className="verify-modal-body">
              {/* Kolom Kiri: Gambar */}
              <div className="vm-left">
                <img src={selectedVerifyKos.foto[0]} alt="Main" className="vm-main-img" />
                <div className="vm-gallery">
                  {selectedVerifyKos.foto.slice(1).map((f, i) => (
                    <img key={i} src={f} alt="thumb" className="vm-thumb" />
                  ))}
                  
                </div>
              </div>

              {/* Kolom Kanan: Detail Data */}
              <div className="vm-right">
                <h2>{selectedVerifyKos.nama}</h2>
                <h3 className="vm-price">Rp {selectedVerifyKos.harga.toLocaleString()} <small>/ bulan</small></h3>
                
                <div className="vm-info-grid">
                   <div><strong>Pemilik:</strong><br/>{selectedVerifyKos.pemilikId?.nama || 'Admin'}</div>
                   <div><strong>Kontak:</strong><br/>{selectedVerifyKos.kontak}</div>
                   <div><strong>Jarak:</strong><br/>{selectedVerifyKos.jarak}</div>
                   <div><strong>Tipe:</strong><br/>{selectedVerifyKos.tipe}</div>
                   <div style={{gridColumn:'1/-1'}}><strong>Alamat:</strong><br/>{selectedVerifyKos.alamat}</div>
                </div>

                <div className="vm-desc-box">
                  <strong>Fasilitas:</strong> {selectedVerifyKos.fasilitas.toString()}
                  <br/><br/>
                  <strong>Deskripsi:</strong><br/>
                  {selectedVerifyKos.deskripsi}
                </div>
              </div>
            </div>

            {/* Footer: Tombol Eksekusi */}
            <div className="verify-modal-footer">
               <button 
                 className="btn-reject-big"
                 onClick={() => handleVerify(selectedVerifyKos._id, 'rejected')}
               >
                 🚫 Tolak Iklan
               </button>
               <button 
                 className="btn-approve-big"
                 onClick={() => handleVerify(selectedVerifyKos._id, 'approved')}
               >
                 ✅ Setujui & Tayangkan
               </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;