import { Navigate, useLocation } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.is_staff) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;
