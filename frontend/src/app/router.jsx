import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
        <Route path="/appointments" element={<MyAppointmentsPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
