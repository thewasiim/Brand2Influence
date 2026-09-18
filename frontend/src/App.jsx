import { Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from './layouts/PublicLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { OnboardingLayout } from './layouts/OnboardingLayout'
import { UserLayout } from './layouts/UserLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { ProtectedRoute, RoleProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import { LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage, AuthCallbackPage } from './pages/auth/AuthPages'
import RoleSelectionPage from './pages/RoleSelectionPage'
import { BrandOnboardingPage, BrandDiscoveryPage, BrandProfilePage } from './pages/brand/BrandPages'
import { InfluencerOnboardingPage, DiscoveryPage, InfluencerProfilePage } from './pages/influencer/InfluencerPages'
import { CampaignDiscoveryPage, CampaignDetailPage, BrandCampaignsPage } from './pages/campaign/CampaignPages'
import DashboardPage from './pages/DashboardPage'
import ProfileManagementPage from './pages/ProfileManagementPage'
import { ConversationsPage, ConversationThreadPage } from './pages/ConversationsPage'
import { AdminDashboardPage, AdminUsersPage, AdminCampaignsPage, ReportsPage, SettingsPage } from './pages/admin/AdminPages'
import GlowCursor from './components/GlowCursor/GlowCursor'
import ExplorePage from './pages/social/ExplorePage'
import SearchPage from './pages/social/SearchPage'

export default function App() {
  return (
    <GlowCursor
      color="#18181B"
      secondaryColor="#71717A"
      trailLength={35}
      trailWidth={10}
      trailTaper={0.7}
      followSpeed={0.2}
      glowIntensity={1.4}
      glowSpread={1.2}
      hotspot={0.5}
      brightness={1.0}
      opacity={1}
      pulseSpeed={1.2}
      noiseStrength={0.02}
      idleFade={false}
      idleTimeout={2000}
      fadeDuration={800}
      blendMode="normal"
    >
      <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<LandingPage />} />
        <Route path="/projects" element={<CampaignDiscoveryPage />} />
        <Route path="/contact" element={<LandingPage />} />
        <Route path="/discover" element={<DiscoveryPage />} />
        <Route path="/creators" element={<DiscoveryPage />} />
        <Route path="/creators/:id" element={<InfluencerProfilePage />} />
        <Route path="/influencers" element={<DiscoveryPage />} />
        <Route path="/influencers/:id" element={<InfluencerProfilePage />} />
        <Route path="/brands" element={<BrandDiscoveryPage />} />
        <Route path="/brands/:id" element={<BrandProfilePage />} />
        <Route path="/brand-deals" element={<CampaignDiscoveryPage />} />
        <Route path="/how-it-works" element={<LandingPage />} />
        <Route path="/for-brands" element={<LandingPage />} />
        <Route path="/for-influencers" element={<LandingPage />} />
        <Route path="/campaigns" element={<CampaignDiscoveryPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/role-select" element={<RoleSelectionPage />} />
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
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/search" element={<SearchPage />} />
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
    </GlowCursor>
  )
}
