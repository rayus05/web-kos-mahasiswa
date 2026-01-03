// server/index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // BARU: Panggil Mongoose
const multer = require('multer'); // BARU: Panggil Multer untuk upload file
const path = require('path');
const fs = require('fs');
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

    if (!kosLama) return res.status(404).json({ message: "Not found" });

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
    const fileUrls = req.file.files.map(file => {
      return `http://localhost:${port}/uploads/${file.filename}`;
    });
    res.json({ url: fileUrls });
  } catch (error) {
    res.status(500).json({ message: "Gagal upload gambar" });
  }
});

// --- Jalankan Server ---
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});