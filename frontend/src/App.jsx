import { Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from './layouts/PublicLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { OnboardingLayout } from './layouts/OnboardingLayout'
import { UserLayout } from './layouts/UserLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { ProtectedRoute, RoleProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import { LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage } from './pages/auth/AuthPages'
import RoleSelectionPage from './pages/RoleSelectionPage'
import { BrandOnboardingPage } from './pages/brand/BrandPages'
import { InfluencerOnboardingPage, DiscoveryPage, InfluencerProfilePage } from './pages/influencer/InfluencerPages'
import { CampaignDiscoveryPage, CampaignDetailPage, BrandCampaignsPage } from './pages/campaign/CampaignPages'
import DashboardPage from './pages/DashboardPage'
import ProfileManagementPage from './pages/ProfileManagementPage'
import { ConversationsPage, ConversationThreadPage } from './pages/ConversationsPage'
import { AdminDashboardPage, AdminUsersPage, AdminCampaignsPage, ReportsPage, SettingsPage } from './pages/admin/AdminPages'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<PublicLayout />}>
        <Route path="/influencers" element={<DiscoveryPage />} />
        <Route path="/influencers/:id" element={<InfluencerProfilePage />} />
        <Route path="/campaigns" element={<CampaignDiscoveryPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<OnboardingLayout />}>
          <Route path="/onboarding/role" element={<RoleSelectionPage />} />
          <Route element={<RoleProtectedRoute roles={['brand']} />}>
            <Route path="/onboarding/brand" element={<BrandOnboardingPage />} />
          </Route>
          <Route element={<RoleProtectedRoute roles={['influencer']} />}>
            <Route path="/onboarding/influencer" element={<InfluencerOnboardingPage />} />
          </Route>
        </Route>

        <Route element={<UserLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfileManagementPage />} />
          <Route path="/conversations" element={<ConversationsPage />} />
          <Route path="/conversations/:id" element={<ConversationThreadPage />} />
          <Route element={<RoleProtectedRoute roles={['brand', 'admin']} />}>
            <Route path="/brand/campaigns" element={<BrandCampaignsPage />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/influencers" element={<AdminUsersPage role="influencer" />} />
            <Route path="/admin/brands" element={<AdminUsersPage role="brand" />} />
            <Route path="/admin/campaigns" element={<AdminCampaignsPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


