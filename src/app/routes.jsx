// Pages
import LoginPage from "@/features/auth/pages/LoginPage";
import MskOrdersPage from "@/features/msk/pages/MskOrdersPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import StatisticsPage from "@/features/statistics/pages/StatisticsPage";
import AdminsPage from "@/features/admin-management/pages/AdminsPage";
import MskOrderDetailPage from "@/features/msk/pages/MskOrderDetailPage";
import RequestsListPage from "@/features/requests/pages/RequestsListPage";
import RequestDetailPage from "@/features/requests/pages/RequestDetailPage";
import ServiceReportsPage from "@/features/services/pages/ServiceReportsPage";
import AdminDetailPage from "@/features/admin-management/pages/AdminDetailPage";
import AdminInfoTab from "@/features/admin-management/pages/tabs/AdminInfoTab";
import RegionTab from "@/features/admin-management/pages/tabs/RegionTab";
import RequestsTab from "@/features/admin-management/pages/tabs/RequestsTab";
import ServicesTab from "@/features/admin-management/pages/tabs/ServicesTab";
import MskTab from "@/features/admin-management/pages/tabs/MskTab";
import ServiceReportDetailPage from "@/features/services/pages/ServiceReportDetailPage";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import ProfileInfoTab from "@/features/profile/pages/tabs/ProfileInfoTab";
import ProfilePermissionsTab from "@/features/profile/pages/tabs/ProfilePermissionsTab";
import ProfilePasswordTab from "@/features/profile/pages/tabs/ProfilePasswordTab";
import UserStatsPage from "@/features/users/pages/UserStatsPage";
import UsersPage from "@/features/users/pages/UsersPage";

// Guards
import AuthGuard from "@/shared/components/guards/AuthGuard";
import GuestGuard from "@/shared/components/guards/GuestGuard";

// Layouts
import AdminLayout from "@/shared/layouts/AdminLayout";

// Router
import { Routes as RoutesWrapper, Route, Navigate } from "react-router-dom";

const Routes = () => {
  return (
    <RoutesWrapper>
      {/* Guest only */}
      <Route element={<GuestGuard />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<AuthGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users-stats" element={<UserStatsPage />} />
          <Route path="/requests" element={<RequestsListPage />} />
          <Route path="/requests/:id" element={<RequestDetailPage />} />
          <Route path="/service-reports" element={<ServiceReportsPage />} />
          <Route
            path="/service-reports/:id"
            element={<ServiceReportDetailPage />}
          />
          <Route path="/msk/orders" element={<MskOrdersPage />} />
          <Route path="/msk/orders/:id" element={<MskOrderDetailPage />} />
          <Route path="/admins" element={<AdminsPage />} />
          <Route path="/admins/:id" element={<AdminDetailPage />}>
            <Route index element={<Navigate to="malumotlar" replace />} />
            <Route path="malumotlar" element={<AdminInfoTab />} />
            <Route path="hudud-ruxsati" element={<RegionTab />} />
            <Route path="murojaat-ruxsati" element={<RequestsTab />} />
            <Route path="servis-ruxsati" element={<ServicesTab />} />
            <Route path="msk-ruxsati" element={<MskTab />} />
          </Route>
          <Route path="/profile" element={<ProfilePage />}>
            <Route index element={<Navigate to="malumotlar" replace />} />
            <Route path="malumotlar" element={<ProfileInfoTab />} />
            <Route path="ruxsatlar" element={<ProfilePermissionsTab />} />
            <Route path="parol" element={<ProfilePasswordTab />} />
          </Route>
        </Route>
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </RoutesWrapper>
  );
};

export default Routes;
