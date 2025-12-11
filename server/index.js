// server/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000; // Kita pakai port 5000 (karena React biasanya port 3000)

// --- Middleware (Satpam/Perantara) ---
app.use(cors());              // Bolehkan akses dari luar
app.use(express.json());      // Agar server bisa baca data format JSON

// --- Routes (Jalur Akses) ---
app.get('/', (req, res) => {
  res.send('Halo Sahabat! API Server Kos Mahasiswa sudah jalan! 🚀');
});

// --- Jalankan Server ---
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});