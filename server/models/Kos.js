const mongoose = require('mongoose');

const kosSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true,
    },
    tipe: {
        type: String,
        enum: ['Putra', 'Putri', 'Campur'],
        required: true,
    },
    harga: {
        type: Number,
        required: true,
    },
    alamat: {
        type: String,
        required: true,
    },
    jarak: {
        type: String,
        required: true,
    },
    fasilitas: {
        type: [String],
        default: [],
    },
    deskripsi: {
        type: String,
    },
    foto: {
        type: String,
        default: "https://via.placeholder.com/300",
    },
    kontak: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

const Kos = mongoose.model('Kos', kosSchema);

module.exports = Kos;