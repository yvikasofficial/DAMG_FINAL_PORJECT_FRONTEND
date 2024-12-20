import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminLogin from "./components/AdminLogin";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import StaffTable from "./components/admin/StaffTable";
import SponsorshipTable from "./components/admin/SponsorshipTable";
import StreamingTable from "./components/admin/StreamingTable";
import ArtistsTable from "./components/admin/ArtistsTable";
import VenuesTable from "./components/admin/VenuesTable";
import ConcertsPage from "./components/admin/ConcertsPage";
import CreateConcertPage from "./components/admin/CreateConcertPage";
import DashboardPage from "./components/client/DashboardPage";
import AdminDashboardPage from "./components/admin/DashboardPage";
import ConcertPage from "./components/admin/ConcertPage";
import EditConcertPage from "./components/admin/EditConcertPage";
import ClientLayout from "./components/client/ClientLayout";
import TicketsPage from "./components/client/TicketsPage";

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
                    index
                    element={<Navigate to="/admin/dashboard" replace />}
                  />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="concerts" element={<ConcertsPage />} />
                  <Route
                    path="concerts/create"
                    element={<CreateConcertPage />}
                  />
                  <Route path="/users" element={<div>Users Management</div>} />
                  <Route path="/staff" element={<StaffTable />} />
                  <Route path="/sponsorships" element={<SponsorshipTable />} />
                  <Route path="/streaming" element={<StreamingTable />} />
                  <Route path="/artists" element={<ArtistsTable />} />
                  <Route path="/venues" element={<VenuesTable />} />
                  <Route path="/settings" element={<div>Admin Settings</div>} />
                  <Route path="concerts/:id" element={<ConcertPage />} />
                  <Route
                    path="concerts/edit/:id"
                    element={<EditConcertPage />}
                  />
                </Routes>
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <ClientLayout>
                <Routes>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route
                    path="concerts"
                    element={<ConcertsPage isClientView={true} />}
                  />
                  <Route
                    path="concerts/:id"
                    element={<ConcertPage isClientView={true} />}
                  />
                  <Route path="tickets" element={<TicketsPage />} />
                </Routes>
              </ClientLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
