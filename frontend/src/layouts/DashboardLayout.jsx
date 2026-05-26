import { NavLink, Outlet } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import { Logo } from '../components/Logo.jsx';
import { navByRole } from '../constants/config.js';
import { useAuth } from '../hooks/useAuth.js';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const nav = navByRole[user?.role] || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white p-5 lg:block">
        <NavLink to='/'>
        <Logo />
        </NavLink>
        <nav className="mt-8 space-y-1">
          {nav.map(([label, href]) => (
            <NavLink key={href} to={href} className={({ isActive }) => `block rounded-md px-3 py-2 text-sm font-semibold ${isActive ? 'bg-mist text-emerald' : 'text-slate-600 hover:bg-slate-50 hover:text-navy'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">{user?.role}</p>
              <h1 className="text-base font-bold text-navy">{user?.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <NavLink className="btn-secondary h-10 w-10 p-0" to={`/${user?.role}/notifications`} aria-label="Notifications">
                <Bell size={18} />
              </NavLink>
              <button className="btn-secondary h-10 w-10 p-0" onClick={logout} aria-label="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">
            {nav.map(([label, href]) => (
              <NavLink key={href} to={href} className={({ isActive }) => `whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold ${isActive ? 'bg-mist text-emerald' : 'text-slate-600'}`}>
                {label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
