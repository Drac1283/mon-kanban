import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);
    let result;
    if (isRegister) result = await supabase.auth.signUp({ email, password });
    else result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) setError(result.error.message);
    setLoading(false);
  }

  async function handleResetPassword() {
    if (!email) return setError("Veuillez saisir votre email d'abord.");
    setError('');
    setMsg('');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setError(error.message);
    else setMsg('Un e-mail de réinitialisation vous a été envoyé !');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F172A',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          width: '380px',
        }}
      >
        <h1 style={{ color: '#1A8C82', marginBottom: '1.5rem' }}>
          {isRegister ? '📝 Créer un compte' : '🔐 Connexion'}
        </h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {msg && <p style={{ color: '#16A34A', marginBottom: '1rem' }}>{msg}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Mot de passe (min. 6 caractères)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading
            ? 'En cours...'
            : isRegister
              ? 'Créer le compte'
              : 'Se connecter'}
        </button>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '1rem',
            gap: '0.5rem',
          }}
        >
          <span
            style={{ cursor: 'pointer', color: '#1A8C82' }}
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister
              ? 'Déjà un compte ? Connexion'
              : 'Pas de compte ? S inscrire'}
          </span>
          {!isRegister && (
            <span
              style={{
                cursor: 'pointer',
                color: '#64748B',
                fontSize: '0.85rem',
                textDecoration: 'underline',
              }}
              onClick={handleResetPassword}
            >
              Mot de passe oublié ?
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  marginBottom: '1rem',
  border: '1px solid #CBD5E1',
  borderRadius: '8px',
  fontSize: '1rem',
  boxSizing: 'border-box',
};
const btnStyle = {
  width: '100%',
  padding: '0.75rem',
  background: '#1A8C82',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  cursor: 'pointer',
};
