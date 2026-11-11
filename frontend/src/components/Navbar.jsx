import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <span className="brand">🏠 HostelSync</span>
      {user && (
        <div className="nav-right">
          <span className="muted">
            {user.name} · {user.role.toLowerCase()}
          </span>
          <button
            className="btn btn-outline"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
