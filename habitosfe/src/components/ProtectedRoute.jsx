import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#111' }}>
        <div className="spinner-border text-danger" />
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;
  return children;
}
