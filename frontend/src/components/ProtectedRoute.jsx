import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl max-w-md">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-sm opacity-90">
            Your account role (<strong>{user.role.replace('_', ' ')}</strong>) does not have permission to access this screen.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
