import { HashRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import {
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  HomepageOwner,
  HomepageTenant,
  Landing,
  AboutPage,
  PrivacyPoliciesPage,
  NotFound,
  PostRealEstate,
  RealEstateDetail,
  PersonalRealEstateDetail,
  SavedRealEstate,
  ProfilePageTenant,
  ProfilePageOwner,
  UserDetailPage,
  UpdateRealEstateDetail,
  AllContacts,
  CreateLeasePage,
  LeaseAgreementPage,
  LeaseDetailPage,
  AllRentDetailPage,
  CreateRentDetail,
  SingleRentDetail,
  AllRentalProperties,
  RentalPropertyDetail,
  LeaseDetailPageTenant,
  SendPaymentEmailPage,
  CreatePaymentHistory,
  RentDetailTenantPage,
  SendComplaint,
  VerifyEmailPage,
  VerificationMessagePage,
  OwnerChat,
  TenantChat,
  LeaseTenantInfoForm,
  TenantDashboard,
  TenantAnalyticsPage,
  PropertyDetailPage,
  AdminDashboard,
  AdminAnalyticsPage,
  LandlordAnalyticsPage,
} from "./pages";
import { SharedLayout, ProtectedRoutes, ScrollToTop } from "./components";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { SocketProvider } from "./utils/SocketContext";

const theme = createTheme({
  palette: {
    primary: {
      main: "#ada2ff",
    },
    secondary: {
      main: "#EE9B01",
    },
    tertiary: {
      main: "#00ACCF",
      dark: "#0496b4",
    },

    tonalOffset: 0.2,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route
            path="/owner"
            element={
              <SocketProvider>
                <ProtectedRoutes source={"owner"}>
                  <Outlet />
                </ProtectedRoutes>
              </SocketProvider>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<HomepageOwner />} />
            <Route path="analytics" element={<LandlordAnalyticsPage />} />
            <Route element={<SharedLayout />}>
              <Route path="property/post" element={<PostRealEstate />} />
              <Route path="real-estate/:slug" element={<PersonalRealEstateDetail />} />
              <Route path="real-estate/update/:slug" element={<UpdateRealEstateDetail />} />
              <Route path="profile" element={<ProfilePageOwner />} />
              <Route path="tenant-user/:slug" element={<UserDetailPage userType={"owner"} />} />
              <Route path="contacts/all" element={<AllContacts userType={"owner"} />} />
              <Route path="lease/create/:slug" element={<CreateLeasePage />} />
              <Route path="lease/:realEstateId/:slug" element={<LeaseDetailPage />} />
              <Route path="rentDetail" element={<AllRentDetailPage />} />
              <Route path="rentDetail/create" element={<CreateRentDetail />} />
              <Route path="rentDetail/:rentDetailId/:slug" element={<SingleRentDetail />} />
              <Route path="rentDetail/send-payment-email/:rentDetailId" element={<SendPaymentEmailPage />} />
              <Route path="rentDetail/paymentHistory/:rentDetailId/create" element={<CreatePaymentHistory />} />
              <Route path="chat" element={<OwnerChat />} />
            </Route>
          </Route>

          <Route
            path="/landlord"
            element={
              <SocketProvider>
                <ProtectedRoutes source={"landlord"}>
                  <Outlet />
                </ProtectedRoutes>
              </SocketProvider>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<HomepageOwner />} />
            <Route path="analytics" element={<LandlordAnalyticsPage />} />
            <Route element={<SharedLayout />}>
              <Route path="property/post" element={<PostRealEstate />} />
              <Route path="real-estate/:slug" element={<PersonalRealEstateDetail />} />
              <Route path="real-estate/update/:slug" element={<UpdateRealEstateDetail />} />
              <Route path="profile" element={<ProfilePageOwner />} />
              <Route path="tenant-user/:slug" element={<UserDetailPage userType={"owner"} />} />
              <Route path="contacts/all" element={<AllContacts userType={"owner"} />} />
              <Route path="lease/create/:slug" element={<CreateLeasePage />} />
              <Route path="lease/:realEstateId/:slug" element={<LeaseDetailPage />} />
              <Route path="rentDetail" element={<AllRentDetailPage />} />
              <Route path="rentDetail/create" element={<CreateRentDetail />} />
              <Route path="rentDetail/:rentDetailId/:slug" element={<SingleRentDetail />} />
              <Route path="rentDetail/send-payment-email/:rentDetailId" element={<SendPaymentEmailPage />} />
              <Route path="rentDetail/paymentHistory/:rentDetailId/create" element={<CreatePaymentHistory />} />
              <Route path="chat" element={<OwnerChat />} />
            </Route>
          </Route>

          <Route
            path="/tenant"
            element={
              <SocketProvider>
                <ProtectedRoutes source={"tenant"}>
                  <Outlet />
                </ProtectedRoutes>
              </SocketProvider>
            }
          >
            <Route element={<SharedLayout />}>
              <Route index element={<HomepageTenant />} />
              <Route path="real-estate/:slug" element={<RealEstateDetail />} />
              <Route path="real-estate/saved/all" element={<SavedRealEstate />} />
              <Route path="profile" element={<ProfilePageTenant />} />
              <Route path="owner-user/:slug" element={<UserDetailPage userType={"tenant"} />} />
              <Route path="lease-form/:realEstateId" element={<LeaseTenantInfoForm />} />
              <Route path="lease-agreement/:realEstateId" element={<LeaseAgreementPage />} />
              <Route path="rental-properties/all" element={<AllRentalProperties />} />
              <Route path="rental-properties/:slug" element={<RentalPropertyDetail />} />
              <Route path="lease/:realEstateId/:slug" element={<LeaseDetailPageTenant />} />
              <Route path="rentDetail/:realEstateId/:slug" element={<RentDetailTenantPage />} />
              <Route path="send-complaint/:slug" element={<SendComplaint />} />
              <Route path="contacts/all" element={<AllContacts userType={"tenant"} />} />
              <Route path="chat" element={<TenantChat />} />
            </Route>
            <Route path="dashboard" element={<TenantDashboard />} />
            <Route path="analytics" element={<TenantAnalyticsPage />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoutes source={"admin"}>
                <Outlet />
              </ProtectedRoutes>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
          </Route>

          <Route path="/login/:role" element={<Login />} />
          <Route path="/register/:role" element={<Register />} />
          <Route path="/forgot-password/:role" element={<ForgotPassword />} />
          <Route path="/reset-password/:role/:token" element={<ResetPassword />} />
          <Route path="/account-created/:role" element={<VerificationMessagePage />} />
          <Route path="/verify-account/:role/:token" element={<VerifyEmailPage />} />
          <Route index element={<Landing />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="privacy" element={<PrivacyPoliciesPage />} />
          <Route
            path="/property/:id"
            element={
              <SocketProvider>
                <ProtectedRoutes source={"tenant"}>
                  <PropertyDetailPage />
                </ProtectedRoutes>
              </SocketProvider>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
