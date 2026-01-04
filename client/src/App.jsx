import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './Home';        // Panggil halaman Home
import CariKos from './CariKos';  // Panggil halaman CariKos
import DetailKos from './DetailKos'; // Panggil halaman Detail
import AdminDashboard from './AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Kalau user buka web utama, tampilkan Home */}
        <Route path="/" element={<Home />} />
        
        {/* Kalau user buka /kos/123, tampilkan Detail */}
        <Route path="/kos/:id" element={<DetailKos />} />
        <Route path="/cari" element={<CariKos />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;