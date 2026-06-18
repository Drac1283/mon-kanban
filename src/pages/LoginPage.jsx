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
    let result = isRegister
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-xl"
      >
        <h1 className="text-brand text-2xl font-bold mb-6 text-center">
          {isRegister ? '📝 Créer un compte' : '🔐 Connexion'}
        </h1>

        {error && (
          <p className="text-red-500 bg-red-50 p-3 rounded-md mb-4 text-sm">
            {error}
          </p>
        )}
        {msg && (
          <p className="text-green-600 bg-green-50 p-3 rounded-md mb-4 text-sm">
            {msg}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 mb-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
        />
        <input
          type="password"
          placeholder="Mot de passe (min. 6 car.)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 mb-6 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-brand text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {loading
            ? 'En cours...'
            : isRegister
              ? 'Créer le compte'
              : 'Se connecter'}
        </button>

        <div className="flex flex-col items-center mt-6 gap-2 text-sm">
          <span
            className="cursor-pointer text-brand hover:underline font-medium"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister
              ? 'Déjà un compte ? Connexion'
              : "Pas de compte ? S'inscrire"}
          </span>
          {!isRegister && (
            <span
              className="cursor-pointer text-slate-500 hover:text-slate-700 underline"
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
