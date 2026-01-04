import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './App.css';

function Logout({ onClose }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = async () => {
    logout();
    onClose();
    navigate('/login');
    alert('Berhasil logout! Sampai jumpa 👋');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card logout-card" onClick={(e) => e.stopPropagation()}>
        <div className="icon-logout">👋</div>
        <h2>Konfirmasi Logout</h2>
        <p>Apakah kamu yakin ingin keluar dari aplikasi?</p>
        
        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">
            Batal
          </button>
          
          <button onClick={handleLogout} className="btn-confirm-logout">
            Ya, Keluar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Logout;