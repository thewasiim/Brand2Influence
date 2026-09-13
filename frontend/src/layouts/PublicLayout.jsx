import React from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserAvatarMenu } from '../components/UserAvatarMenu'
import StaggeredMenu from '../components/StaggeredMenu/StaggeredMenu'

const menuItems = [
  { label: 'Search Influencers / Creators', ariaLabel: 'Find and browse creator profiles', link: '/influencers' },
  { label: 'Search Brands', ariaLabel: 'Find and explore brand profiles', link: '/brands' },
  { label: 'Brand Deals & Campaigns', ariaLabel: 'View open sponsorship briefs', link: '/campaigns' },
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
  const { user } = useAuth()

  return (
    <>
      <header className="navbar">
        <Link to="/" className="brand">
          Brand2Influence
        </Link>

        <div className="nav-actions">
          <UserAvatarMenu />
          <StaggeredMenu
            items={menuItems}
            socialItems={socialItems}
            displaySocials={true}
            displayItemNumbering={true}
            colors={['#3B401C', '#7C3AED', '#2C3015']}
            panelBg="#2C3015"
            accentColor="#7C3AED"
            openMenuButtonColor="#FDFAE2"
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
