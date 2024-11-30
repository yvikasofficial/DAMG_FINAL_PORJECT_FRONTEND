import { Navigate } from "react-router-dom";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const adminData = localStorage.getItem("adminData");
  const isAdmin = adminData !== null;

  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" />;
};

export default AdminRoute;
