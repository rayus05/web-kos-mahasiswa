import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Logout from './Logout';
import Navbar from './Navbar';
import Home from './Home';
import CariKos from './CariKos';
import DetailKos from './DetailKos';
import AdminDashboard from './AdminDashboard';
import './App.css';

function AppContent() {
  const location = useLocation();
  const hideNavbarPaths = ['/login', '/register', '/admin', '/logout'];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/" element={<Home />} />
        <Route path="/kos/:id" element={<DetailKos />} />
        <Route path="/cari" element={<CariKos />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;