import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [kosList, setKosList] = useState([]);

  useEffect(() => {
    ambilDataKos();
  }, []);

  const ambilDataKos = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/kos");
      setKosList(response.data);
      console.log("Data kos berhasil diambil:", response.data);
    } catch (error) {
      console.error("Gagal mengambil data kos:", error);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Info Kos Mahasiswa 🎓</h1>
        <p>Temukan hunian nyaman di sekitar kampus</p>
      </header>

      <div className="kos-grid">
        {kosList.map((kos) => (
          <div key={kos._id} className="kos-card">
            <img src={kos.foto} alt={kos.nama} className="kos-image" />
            <div className="kos-info">
              <span className={'tag ${kos.tipe}'}>{kos.tipe}</span>
              <h3>{kos.nama}</h3>
              <p className="harga">Rp {kos.harga.toLocaleString()} / bulan</p>
              <p className="lokasi">📍 {kos.alamat} ({kos.jarak})</p>
              <button className="btn-detail">Lihat Detail</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;