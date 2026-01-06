const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary');
const multerCloudinary = require('multer-storage-cloudinary');
const CloudinaryStorage = multerCloudinary.CloudinaryStorage || multerCloudinary;
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('./models/User');
require('dotenv').config();

const Kos = require('./models/Kos');

const app = express();
const port = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- Middleware (Satpam/Perantara) ---
app.use(cors());              // Bolehkan akses dari luar
app.use(express.json());      // Agar server bisa baca data format JSON
app.use(express.urlencoded({ extended: true }));

// --- Koneksi ke Database MongoDB ---
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
  .then(() => {
    console.log("✅ Berhasil connect ke Database MongoDB!");
  })
  .catch((err) => {
    console.error("❌ Gagal connect ke Database:", err);
  });

// --- Setup Rate Limiter ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // Batasi tiap IP maksimal 100 request per windowMs
  message: "Terlalu banyak permintaan daftar/login dari IP ini, silakan coba lagi nanti."
});

// Storage Engine Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'edukost_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage: storage });

// --- FUNGSI BARU: HAPUS FOTO DARI CLOUDINARY (YANG SUDAH DIPERBAIKI) ---
const hapusFotoLama = async (fotoArray) => {
  if (!fotoArray || !Array.isArray(fotoArray) || fotoArray.length === 0) return;

  const deletePromises = fotoArray.map(async (fileUrl) => {
    try {
      if (!fileUrl.includes('cloudinary.com')) return;

      // --- LOGIKA BARU: EKSTRAK PUBLIC ID YANG LEBIH AMAN ---
      // 1. Kita potong URL berdasarkan kata kunci "upload/"
      // Contoh URL: https://res.cloudinary.com/.../image/upload/v1767727262/edukost_uploads/gambar123.jpg
      const splitUrl = fileUrl.split('upload/');
      
      if (splitUrl.length < 2) {
        console.log("⚠️ URL Cloudinary tidak standar, lewati:", fileUrl);
        return;
      }

      // Ambil bagian belakangnya: "v1767727262/edukost_uploads/gambar123.jpg"
      let publicIdWithExtension = splitUrl[1];

      // 2. Hapus nomor versi ("v12345/") jika ada di depan
      // Regex ini mencari huruf 'v' diikuti angka, lalu garis miring
      const versionRegex = /^v\d+\//;
      if (versionRegex.test(publicIdWithExtension)) {
        publicIdWithExtension = publicIdWithExtension.replace(versionRegex, '');
      }
      // Sekarang sisanya: "edukost_uploads/gambar123.jpg"

      // 3. Hapus ekstensi file (.jpg, .png, dll) dari belakang
      const parts = publicIdWithExtension.split('.');
      parts.pop(); // Buang elemen terakhir (ekstensi)
      const publicId = parts.join('.'); // Gabung lagi (jaga-jaga kalau nama file ada titik lain)

      // Hasil Akhir Public ID: "edukost_uploads/gambar123" (Ini yang benar!)

      // --- EKSEKUSI HAPUS ---
      // Pastikan pakai cloudinary.uploader (bukan v2 langsung jika importnya beda, tapi codinganmu pakai v2 oke)
      const result = await cloudinary.v2.uploader.destroy(publicId);
      
      console.log(`🗑️ Mencoba hapus ID: ${publicId} -> Hasil: ${result.result}`);
      
    } catch (error) {
      console.error(`❌ Gagal hapus foto (${fileUrl}):`, error.message);
    }
  });

  await Promise.all(deletePromises);
};

// --- ROUTE API ---

  // Route Authentikasi (Register & Login) dengan Rate Limiter
  // 1. Register
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Cek apakah user/email sudah terdaftar
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ message: "Username atau email sudah terdaftar." });

    // Hash password sebelum disimpan
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan user baru
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User berhasil didaftarkan." });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 2. Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const {email, password } = req.body;

    // Cek apakah user ada
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email atau password salah." });

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Email atau password salah." });

    // Buat token JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Kirim token ke client
    res.json({ 
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }, 
      message: "Login berhasil." 
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

  // --- ROUTE GET PUBLIC (Cuma tampilkan yang disetujui) ---
app.get('/api/kos', async (req, res) => {
  try {
    // Filter status: 'approved'
    // Kalau Admin yang minta (lewat dashboard), mungkin butuh semua.
    // Tapi untuk simpelnya, API ini kita khususkan buat Public Home Page.
    const kos = await Kos.find({ status: 'approved' }); 
    res.json(kos);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Middleware untuk akses folder 'uploads' secara statis
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route untuk mendapatkan data kos berdasarkan ID
app.get('/api/kos/:id', async (req, res) => {
  try {
    const kos = await Kos.findById(req.params.id); // Cari berdasarkan ID url
    if (!kos) return res.status(404).json({ message: "Kos tidak ditemukan" });
    res.json(kos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route untuk menambahkan data kos baru
app.post('/api/kos', async (req, res) => {
  try {
    const kosBaru = new Kos({
      ...req.body,
      status: 'pending',
      pemilikId: req.body.userId
    });
    const kosTersimpan = await kosBaru.save();
    res.status(201).json(kosTersimpan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route untuk mengupdate data kos berdasarkan ID
app.put('/api/kos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Cari data lama di database dulu
    const kosLama = await Kos.findById(id);
    if (!kosLama) return res.status(404).json({ message: "Kos tidak ditemukan" });

    // Logika Sederhana: Jika admin upload foto baru, HAPUS SEMUA foto lama fisik
    // Lalu gantikan datanya dengan array foto yang baru.
    if (req.body.foto && Array.isArray(req.body.foto) && req.body.foto.length > 0) {
       // Cek apakah array foto baru beda dengan yang lama
       const isDifferent = JSON.stringify(req.body.foto) !== JSON.stringify(kosLama.foto);
       if(isDifferent) {
          hapusFotoLama(kosLama.foto);
       }
    }

    // cari ID-nya, lalu update isinya dengan data baru (req.body)
    const updatedKos = await Kos.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedKos);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route untuk menghapus data kos berdasarkan ID
app.delete('/api/kos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedKos = await Kos.findById(id);
    
    if (!deletedKos) return res.status(404).json({ message: "Kos tidak ditemukan" });
    hapusFotoLama(deletedKos.foto);

    await Kos.findByIdAndDelete(id);
    res.json({ message: "Data kos dan foto berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ROUTE UPLOAD GAMBAR (KE CLOUDINARY)
app.post('/api/upload', upload.array('images', 10), (req, res) => {
  try {
    // --- DEBUGGING ---
    // console.log("Files:", req.files); 

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Tidak ada file yang diupload" });
    }

    // PERBAIKAN DI SINI: Gunakan 'secure_url'
    const imageUrls = req.files.map(file => file.secure_url || file.url);

    console.log("✅ Sukses! URL Gambar:", imageUrls);

    res.json({
      message: 'Upload berhasil!',
      urls: imageUrls // Kirim URL yang benar ke frontend
    });
  } catch (error) {
    console.error("❌ Error Upload:", error);
    res.status(500).json({ message: "Gagal upload gambar", error: error.message });
  }
});

// --- API STATISTIK DASHBOARD ADMIN ---
app.get('/api/stats', async (req, res) => {
  try {
    const totalKos = await Kos.countDocuments();
    const totalUser = await User.countDocuments();
    
    const kosPutra = await Kos.countDocuments({ tipe: 'Putra' });
    const kosPutri = await Kos.countDocuments({ tipe: 'Putri' });
    const kosCampur = await Kos.countDocuments({ tipe: 'Campur' });

    res.json({
      totalKos,
      totalUser,
      detailTipe: { Putra: kosPutra, Putri: kosPutri, Campur: kosCampur }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- MANAJEMEN USER (ADMIN ONLY) ---

// GET ALL USERS (Ambil semua user)
app.get('/api/users', async (req, res) => {
  try {
    // .select('-password') artinya: Ambil semua data KECUALI password
    // Kita gak boleh kirim password orang lain ke frontend (bahaya!)
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE USER (Hapus user)
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "User berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- ROUTE KHUSUS ADMIN (Lihat SEMUA data, termasuk pending) ---
app.get('/api/admin/kos', async (req, res) => {
  try {
    const kos = await Kos.find().populate('pemilikId', 'nama email');
    res.json(kos);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// --- ROUTE BARU: VERIFIKASI KOS (Approve/Reject) ---
app.put('/api/kos/:id/verify', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedKos = await Kos.findByIdAndUpdate(
      req.params.id, 
      { status: status }, 
      { new: true }
    );
    res.json(updatedKos);
  } catch (error) { res.status(400).json({ message: error.message }); }
});