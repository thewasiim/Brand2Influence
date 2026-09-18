import React from 'react'
import { Outlet } from 'react-router-dom'
import { InstagramSidebar } from '../components/InstagramSidebar/InstagramSidebar'

export function UserLayout() {
  return (
    <div className="portal portal-ig-layout">
      <InstagramSidebar />
      <main className="portal-main-section">
        <Outlet />
      </main>
    </div>
  )
}

export default UserLayout

