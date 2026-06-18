import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Navbar({ session }) {
  const location = useLocation();
  const avatarUrl = session?.user?.user_metadata?.avatar_url;

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  function linkStyle(path) {
    const isActive = location.pathname === path;
    return {
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      textDecoration: 'none',
      fontWeight: isActive ? 700 : 400,
      background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
      color: 'white',
    };
  }

  return (
    <nav
      style={{
        background: '#1A8C82',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <span style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
        KanbanRT
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Link to="/dashboard" style={linkStyle('/dashboard')}>
          Tableau de bord
        </Link>
        <Link to="/profile" style={linkStyle('/profile')}>
          Mon profil
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.85rem',
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid rgba(255,255,255,0.4)',
              }}
            />
          ) : (
            <span style={{ fontSize: '1.2rem' }}>👤</span>
          )}
          {session?.user?.email}
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.4)',
            color: 'white',
            borderRadius: '6px',
            padding: '0.4rem 0.9rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
