import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Logo } from '../components/Logo.jsx';
import { useAuth } from '../hooks/useAuth.js';

export const PublicLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="shell flex h-16 items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            <NavLink to="/properties" className={({ isActive }) => (isActive ? 'text-emerald' : 'hover:text-emerald')}>Properties</NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'text-emerald' : 'hover:text-emerald')}>About</NavLink>
            <NavLink to="/contact" className={({ isActive }) => (isActive ? 'text-emerald' : 'hover:text-emerald')}>Contact</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link className="btn-secondary hidden sm:inline-flex" to={`/${user.role}/dashboard`}>Dashboard</Link>
                <button className="btn-primary" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link className="btn-secondary hidden sm:inline-flex" to="/login">Login</Link>
                <Link className="btn-primary" to="/signup">Signup</Link>
              </>
            )}
            <Menu className="md:hidden" size={22} />
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
};
