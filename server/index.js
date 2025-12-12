// server/index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // BARU: Panggil Mongoose
require('dotenv').config(); // BARU: Panggil config .env
const Kos = require('./models/Kos'); // BARU: Panggil model Kos

const app = express();
const port = process.env.PORT || 5000; // Kita pakai port 5000 (karena React biasanya port 3000)

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

// --- Routes (Jalur Akses) ---
app.get('/', (req, res) => {
  res.send('Halo Sahabat! API Server Kos Mahasiswa sudah jalan! 🚀');
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

// --- Jalankan Server ---
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});