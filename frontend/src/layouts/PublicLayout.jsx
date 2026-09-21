import React from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserAvatarMenu } from '../components/UserAvatarMenu'
import StaggeredMenu from '../components/StaggeredMenu/StaggeredMenu'

const menuItems = [
  { label: 'Search Influencers', ariaLabel: 'Find and browse creator profiles', link: '/influencers' },
  { label: 'Search Brands', ariaLabel: 'Find and explore brand profiles', link: '/brands' },
  { label: 'Brand Campaigns', ariaLabel: 'View open sponsorship briefs', link: '/campaigns' },
  { label: 'How It Works', ariaLabel: 'Learn how the platform works', link: '/how-it-works' },
  { label: 'For Brands', ariaLabel: 'Info for brands', link: '/for-brands' },
  { label: 'For Influencers', ariaLabel: 'Info for influencers', link: '/for-influencers' }
]

const socialItems = [
  { label: 'GitHub', link: 'https://github.com' },
  { label: 'Twitter', link: 'https://twitter.com' },
  { label: 'LinkedIn', link: 'https://linkedin.com' }
]

export function PublicLayout() {
  const { user, profile } = useAuth()

  return (
    <>
      <header className="navbar">
        <Link to={user ? "/?view=site" : "/"} className="brand">
          Brand2Influence
        </Link>

        <div className="nav-actions">
          {user && (
            <Link
              to={profile?.role === 'admin' ? '/admin' : '/dashboard'}
              className="ui-button ui-button-sm ui-button-primary"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '999px',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 600,
                background: '#FFFFFF',
                color: '#0A0A0A',
              }}
            >
              <span>Dashboard</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          )}
          <UserAvatarMenu />
          <StaggeredMenu
            items={menuItems}
            socialItems={socialItems}
            displaySocials={true}
            displayItemNumbering={true}
            colors={['#EEF2FF', '#DBEAFE', '#FFFFFF']}
            panelBg="#FFFFFF"
            textColor="#1D4ED8"
            accentColor="#2563EB"
            menuButtonColor="#1D4ED8"
            openMenuButtonColor="#1D4ED8"
            loginLabel={user ? 'Dashboard' : 'Log In'}
            loginLink={user ? '/dashboard' : '/login'}
            ctaLabel={user ? 'My Profile' : 'Get Started'}
            ctaLink={user ? '/profile' : '/signup'}
            onMenuOpen={() => console.log('Menu opened')}
            onMenuClose={() => console.log('Menu closed')}
          />
        </div>
      </header>
      <Outlet />
    </>
  )
}
