import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import HomePage from '../pages/HomePage/loginPage.jsx';
import LoginPage from '../pages/LoginPage/adminPage.jsx';
import BookingPage from '../pages/BookingPage/bookingPage.jsx';
import MyAppointmentsPage from '../pages/MyAppointmentsPage/myAppointmentsPage.jsx';
import AdminDashboardPage from '../pages/AdminDashboardPage/adminDashboardPage.jsx';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <MyAppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
