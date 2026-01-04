const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
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

// --- Middleware (Satpam/Perantara) ---
app.use(cors());              // Bolehkan akses dari luar
app.use(express.json());      // Agar server bisa baca data format JSON

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

// --- Setup Multer untuk Upload Gambar ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Simpan di folder 'uploads'
  },
  filename: (req, file, cb) => {
    // Beri nama unik: timestamp + ekstensi asli (misal: 17345678.jpg)
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// FUNGSI PENGHAPUS FILE FISIK
const hapusFotoLama = (fotoArray) => {
  // Cek apakah url-nya valid dan berasal dari folder uploads kita
  if (!fotoArray || !Array.isArray(fotoArray)) return;

  fotoArray.forEach(fileUrl => {
    if (fileUrl && fileUrl.includes('/uploads/')) {
      const filename = fileUrl.split('/uploads/')[1];
      const filepath = path.join(__dirname, 'uploads', filename);
      
      fs.access(filepath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(filepath, (err) => console.error("Gagal hapus:", err));
        }
      });
    }
  });
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

  // Route untuk mendapatkan semua data kos
app.get('/api/kos', async (req, res) => {
  try {
    const semuaKos = await Kos.find();
    res.json(semuaKos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
    const kosBaru = new Kos(req.body);
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

// Route Khusus Upload Banyak Gambar
app.post('/api/upload', upload.array('images', 10), (req, res) => {
  try {
    // Kembalikan Link Full ke Frontend
    const fileUrls = req.files.map(file => {
      return `http://localhost:${port}/uploads/${file.filename}`;
    });
    res.json({ urls: fileUrls });
  } catch (error) {
    res.status(500).json({ message: "Gagal upload gambar" });
  }
});

// --- Jalankan Server ---
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});