import { Navigate, Route, Routes } from 'react-router-dom';
import { homeFor, useAuth } from './AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import WardenDashboard from './pages/WardenDashboard.jsx';
import TechnicianDashboard from './pages/TechnicianDashboard.jsx';

function Protected({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to={user ? homeFor(user.role) : '/login'} replace />} />
          <Route path="/login" element={user ? <Navigate to={homeFor(user.role)} replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to={homeFor(user.role)} replace /> : <Register />} />
          <Route path="/student" element={<Protected role="STUDENT"><StudentDashboard /></Protected>} />
          <Route path="/warden" element={<Protected role="WARDEN"><WardenDashboard /></Protected>} />
          <Route path="/technician" element={<Protected role="TECHNICIAN"><TechnicianDashboard /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
