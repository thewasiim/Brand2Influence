import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { PublicLayout } from './layouts/PublicLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { OnboardingLayout } from './layouts/OnboardingLayout'
import { UserLayout } from './layouts/UserLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { ProtectedRoute, RoleProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import { LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage, AuthCallbackPage, AuthPortalPage } from './pages/auth/AuthPages'
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

function AdaptiveCampaignsRoute() {
  const { user } = useAuth()
  return user ? <UserLayout><CampaignDiscoveryPage /></UserLayout> : <PublicLayout><CampaignDiscoveryPage /></PublicLayout>
}

function AdaptiveCampaignDetailRoute() {
  const { user } = useAuth()
  return user ? <UserLayout><CampaignDetailPage /></UserLayout> : <PublicLayout><CampaignDetailPage /></PublicLayout>
}

function AdaptiveDiscoveryRoute() {
  const { user } = useAuth()
  return user ? <UserLayout><DiscoveryPage /></UserLayout> : <PublicLayout><DiscoveryPage /></PublicLayout>
}

function AdaptiveInfluencerProfileRoute() {
  const { user } = useAuth()
  return user ? <UserLayout><InfluencerProfilePage /></UserLayout> : <PublicLayout><InfluencerProfilePage /></PublicLayout>
}

function AdaptiveBrandDiscoveryRoute() {
  const { user } = useAuth()
  return user ? <UserLayout><BrandDiscoveryPage /></UserLayout> : <PublicLayout><BrandDiscoveryPage /></PublicLayout>
}

function AdaptiveBrandProfileRoute() {
  const { user } = useAuth()
  return user ? <UserLayout><BrandProfilePage /></UserLayout> : <PublicLayout><BrandProfilePage /></PublicLayout>
}

export default function App() {
  return (
    <GlowCursor
      color="#FFFFFF"
      secondaryColor="#71717A"
      trailLength={30}
      trailWidth={8}
      trailTaper={0.7}
      followSpeed={0.2}
      glowIntensity={0.8}
      glowSpread={0.9}
      hotspot={0.4}
      brightness={0.9}
      opacity={0.35}
      pulseSpeed={1.0}
      noiseStrength={0.015}
      idleFade={true}
      idleTimeout={1000}
      fadeDuration={500}
      blendMode="normal"
    >
      <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<LandingPage />} />
        <Route path="/contact" element={<LandingPage />} />
        <Route path="/how-it-works" element={<LandingPage />} />
        <Route path="/for-brands" element={<LandingPage />} />
        <Route path="/for-influencers" element={<LandingPage />} />
        <Route path="/portal" element={<Navigate to="/auth/portal" replace />} />
        <Route path="/auth" element={<Navigate to="/auth/portal" replace />} />
      </Route>

      {/* Adaptive Creator & Brand Routes (UserLayout with sidebar when logged-in, PublicLayout when guest) */}
      <Route path="/discover" element={<AdaptiveDiscoveryRoute />} />
      <Route path="/creators" element={<AdaptiveDiscoveryRoute />} />
      <Route path="/influencers" element={<AdaptiveDiscoveryRoute />} />
      <Route path="/creators/:id" element={<AdaptiveInfluencerProfileRoute />} />
      <Route path="/influencers/:id" element={<AdaptiveInfluencerProfileRoute />} />
      <Route path="/brands" element={<AdaptiveBrandDiscoveryRoute />} />
      <Route path="/brands/:id" element={<AdaptiveBrandProfileRoute />} />

      {/* Adaptive Campaign Routes (UserLayout with sidebar when logged-in, PublicLayout when guest) */}
      <Route path="/campaigns" element={<AdaptiveCampaignsRoute />} />
      <Route path="/campaigns/:id" element={<AdaptiveCampaignDetailRoute />} />
      <Route path="/projects" element={<AdaptiveCampaignsRoute />} />
      <Route path="/brand-deals" element={<AdaptiveCampaignsRoute />} />

      <Route element={<AuthLayout />}>
        {/* Primary Instagram-inspired Authentication & Onboarding Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup/brand" element={<BrandOnboardingPage />} />
        <Route path="/signup/creator" element={<InfluencerOnboardingPage />} />
        <Route path="/signup/creator/social-accounts" element={<InfluencerOnboardingPage />} />
        <Route path="/signup/creator/metrics" element={<InfluencerOnboardingPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Backward-compatible /auth routes */}
        <Route path="/auth/portal" element={<AuthPortalPage />} />
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
