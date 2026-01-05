const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Pastikan path ini benar
require('dotenv').config();

// Ganti URI ini sesuai dengan yang di .env kamu atau hardcode sementara
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edukost';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🔌 Terhubung ke MongoDB...");

    // Cek apakah admin sudah ada?
    const adminExists = await User.findOne({ email: 'admin@edukost.com' });
    if (adminExists) {
      console.log("⚠️ Admin sudah ada! Tidak perlu dibuat lagi.");
      return;
    }

    // Buat Password Hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Buat User Admin
    const newAdmin = new User({
      username: 'superadmin123',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin'
    });

    await newAdmin.save();
    console.log("✅ SUKSES! Akun Admin berhasil dibuat.");
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log("🔑 Password: (Sesuai yang ada di .env)");

  } catch (error) {
    console.error("❌ Gagal:", error);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();