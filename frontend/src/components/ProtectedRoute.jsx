import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, canManage } = useAuth();

  if (loading) {
    return <LoadingSpinner fullscreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !canManage) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
