// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Navbar({ session }) {
  const location = useLocation();

  async function handleLogout() {
    await supabase.auth.signOut();
    // App.jsx détecte session=null → redirige /login automatiquement
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
      {/* ── Logo / titre ── */}
      <span style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
        KanbanRT
      </span>

      {/* ── Liens de navigation ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Link to="/dashboard" style={linkStyle('/dashboard')}>
          Tableau de bord
        </Link>

        <Link to="/profile" style={linkStyle('/profile')}>
          Mon profil
        </Link>
      </div>

      {/* ── Email + bouton déconnexion ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
          {session?.user?.email}
        </span>

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
