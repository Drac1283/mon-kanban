import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        if (event === 'SIGNED_IN' && currentSession) {
          const userId = currentSession.user.id;
          const hasBeenWelcomed = localStorage.getItem(`welcomed_${userId}`);
          if (!hasBeenWelcomed) {
            try {
              await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: [currentSession.user.email],
                  subject: 'Bienvenue sur KanbanRT ! 🎉',
                  html: `<div style="text-align: center;"><h2 style="color: #1A8C82;">Bienvenue à bord !</h2><p>Commencez dès maintenant à gérer vos tâches sur KanbanRT.</p></div>`,
                }),
              });
              localStorage.setItem(`welcomed_${userId}`, 'true');
            } catch (err) {
              console.error('Erreur envoi email bienvenue', err);
            }
          }
        }
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route
          path="/dashboard"
          element={
            session ? (
              <DashboardPage session={session} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            session ? (
              <ProfilePage session={session} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="*"
          element={<Navigate to={session ? '/dashboard' : '/login'} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
