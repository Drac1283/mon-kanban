import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Navbar({ session }) {
  const location = useLocation();
  const avatarUrl = session?.user?.user_metadata?.avatar_url;

  const linkClass = (path) => `
    px-3 py-2 rounded-md text-sm font-medium transition-colors
    ${location.pathname === path ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}
  `;

  return (
    <nav className="bg-brand px-4 sm:px-6 flex items-center justify-between h-16 shadow-md">
      <div className="flex items-center gap-6">
        <span className="text-white font-bold text-xl tracking-tight hidden sm:block">
          KanbanRT
        </span>
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className={linkClass('/dashboard')}>
            Tableau de bord
          </Link>
          <Link to="/profile" className={linkClass('/profile')}>
            Mon profil
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-white/90 text-sm">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-white/40"
            />
          ) : (
            <span className="text-xl">👤</span>
          )}
          <span>{session?.user?.email}</span>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="bg-white/10 border border-white/20 text-white text-sm font-medium rounded-md px-4 py-2 hover:bg-white/20 transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
