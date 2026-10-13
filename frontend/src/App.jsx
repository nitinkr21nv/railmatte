import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RootLayout from './layouts/RootLayout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import SeatExchangePage from './pages/SeatExchangePage';
import ExchangeDetailPage from './pages/ExchangeDetailPage';
import JourneyAssistancePage from './pages/JourneyAssistancePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="exchanges" element={<SeatExchangePage />} />
            <Route path="proposals/:id" element={<ExchangeDetailPage />} />
            <Route path="assistance" element={<JourneyAssistancePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
