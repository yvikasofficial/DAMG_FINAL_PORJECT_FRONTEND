import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminLogin from "./components/AdminLogin";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import StaffTable from "./components/admin/StaffTable";
import SponsorshipTable from "./components/admin/SponsorshipTable";
import StreamingTable from "./components/admin/StreamingTable";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout>
                <Routes>
                  <Route
                    path="/"
                    element={<div>Admin Dashboard Content</div>}
                  />
                  <Route path="/users" element={<div>Users Management</div>} />
                  <Route path="/staff" element={<StaffTable />} />
                  <Route path="/sponsorships" element={<SponsorshipTable />} />
                  <Route path="/streaming" element={<StreamingTable />} />
                  <Route path="/settings" element={<div>Admin Settings</div>} />
                </Routes>
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <div>Protected Home Page</div>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
