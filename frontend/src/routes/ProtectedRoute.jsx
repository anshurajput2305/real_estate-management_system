import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = ({ roles }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles?.length && !roles.includes(user.role)) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return <Outlet />;
};
