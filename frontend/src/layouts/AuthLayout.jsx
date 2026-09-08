import { Link, Outlet } from 'react-router-dom'
export function AuthLayout() { return <main className="auth-layout"><Link to="/" className="brand">Brand2Influence</Link><Outlet/></main> }
