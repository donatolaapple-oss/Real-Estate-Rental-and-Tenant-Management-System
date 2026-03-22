import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  Landing,
  NotFound,
  VerifyEmailPage,
  VerificationMessagePage,
  PostRealEstate,
} from "./pages";
import { ProtectedRoutes, ScrollToTop } from "./components";
import { SocketProvider } from "./utils/SocketContext";
import TenantDashboard from "./pages/stayscout/TenantDashboard";
import LandlordDashboard from "./pages/stayscout/LandlordDashboard";
import AdminDashboard from "./pages/stayscout/AdminDashboard";
import PropertyDetailPage from "./pages/stayscout/PropertyDetailPage";
import TenantChatPage from "./pages/stayscout/TenantChatPage";
import LandlordChatPage from "./pages/stayscout/LandlordChatPage";
import TenantProfilePage from "./pages/stayscout/TenantProfilePage";
import LandlordProfilePage from "./pages/stayscout/LandlordProfilePage";
import TenantAnalyticsPage from "./pages/stayscout/TenantAnalyticsPage";
import LandlordAnalyticsPage from "./pages/stayscout/LandlordAnalyticsPage";
import AdminAnalyticsPage from "./pages/stayscout/AdminAnalyticsPage";

import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#4f46e5" },
    secondary: { main: "#EE9B01" },
    tertiary: { main: "#00ACCF", dark: "#0496b4" },
    tonalOffset: 0.2,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/tenant" element={<Navigate to="/tenant/dashboard" replace />} />
          <Route
            path="/tenant/dashboard"
            element={
              <ProtectedRoutes source="tenant">
                <TenantDashboard />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/tenant/chat"
            element={
              <ProtectedRoutes source="tenant">
                <SocketProvider>
                  <TenantChatPage />
                </SocketProvider>
              </ProtectedRoutes>
            }
          />
          <Route
            path="/tenant/profile"
            element={
              <ProtectedRoutes source="tenant">
                <TenantProfilePage />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/tenant/analytics"
            element={
              <ProtectedRoutes source="tenant">
                <TenantAnalyticsPage />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/landlord/dashboard"
            element={
              <ProtectedRoutes source="landlord">
                <LandlordDashboard />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/landlord/chat"
            element={
              <ProtectedRoutes source="landlord">
                <SocketProvider>
                  <LandlordChatPage />
                </SocketProvider>
              </ProtectedRoutes>
            }
          />
          <Route
            path="/landlord/profile"
            element={
              <ProtectedRoutes source="landlord">
                <LandlordProfilePage />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/landlord/analytics"
            element={
              <ProtectedRoutes source="landlord">
                <LandlordAnalyticsPage />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/landlord/property/post"
            element={
              <ProtectedRoutes source="landlord">
                <PostRealEstate />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoutes source="admin">
                <AdminDashboard />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoutes source="admin">
                <AdminAnalyticsPage />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/property/:id"
            element={
              <ProtectedRoutes source="tenant">
                <PropertyDetailPage />
              </ProtectedRoutes>
            }
          />

          <Route path="/login/:role" element={<Login />} />
          <Route path="/register/:role" element={<Register />} />
          <Route path="/forgot-password/:role" element={<ForgotPassword />} />
          <Route path="/reset-password/:role/:token" element={<ResetPassword />} />
          <Route path="/account-created/:role" element={<VerificationMessagePage />} />
          <Route path="/verify-account/:role/:token" element={<VerifyEmailPage />} />

          <Route index element={<Landing />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
