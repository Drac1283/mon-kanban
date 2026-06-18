import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

export default function ProfilePage({ session }) {
  const user = session.user;

  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '');
  const [bio, setBio] = useState(user.user_metadata?.bio || '');
  const [infoMsg, setInfoMsg] = useState('');
  const [infoErr, setInfoErr] = useState('');

  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  const [avatarUrl, setAvatarUrl] = useState(
    user.user_metadata?.avatar_url || '',
  );
  const [uploading, setUploading] = useState(false);

  async function handleSaveInfo(e) {
    e.preventDefault();
    setInfoErr('');
    setInfoMsg('');
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, bio: bio },
    });
    if (error) setInfoErr(error.message);
    else setInfoMsg('✅ Profil mis à jour !');
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPassErr('');
    setPassMsg('');
    if (newPass.length < 6)
      return setPassErr('Le mot de passe doit faire au moins 6 caractères.');
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) setPassErr(error.message);
    else {
      setPassMsg('✅ Mot de passe mis à jour !');
      setNewPass('');
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const filePath = `${user.id}/avatar.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      alert('Erreur upload : ' + uploadError.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } });
    setAvatarUrl(data.publicUrl);
    setUploading(false);
  }

  async function handleDeleteAccount() {
    if (
      !window.confirm(
        'Voulez-vous VRAIMENT supprimer votre compte ? Cette action est irréversible.',
      )
    )
      return;
    const response = await fetch('/api/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
    const result = await response.json();
    if (result.success) {
      alert('Votre compte a été définitivement supprimé.');
      await supabase.auth.signOut();
      window.location.href = '/login';
    } else {
      alert('Erreur lors de la suppression : ' + result.error);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Navbar session={session} />
      <main
        style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}
      >
        <h1 style={{ marginBottom: '2rem' }}>Mon profil</h1>

        <section style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              overflow: 'hidden',
              margin: '0 auto 1rem',
              background: '#CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span>👤</span>
            )}
          </div>
          <label
            style={{ cursor: 'pointer', color: '#1A8C82', fontWeight: 500 }}
          >
            {uploading ? 'Envoi en cours...' : 'Changer la photo'}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
          </label>
        </section>

        <section
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          }}
        >
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
            Informations générales
          </h2>
          <p style={{ color: '#64748B', marginBottom: '1rem' }}>
            Email : {user.email}
          </p>
          <form onSubmit={handleSaveInfo}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                color: '#475569',
              }}
            >
              Nom complet
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                color: '#475569',
              }}
            >
              Bio / Poste actuel
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="3"
              placeholder="Développeur, Chef de projet..."
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '1rem',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
            {infoErr && (
              <p style={{ color: '#DC2626', marginBottom: '0.5rem' }}>
                {infoErr}
              </p>
            )}
            {infoMsg && (
              <p style={{ color: '#16A34A', marginBottom: '0.5rem' }}>
                {infoMsg}
              </p>
            )}
            <button
              type="submit"
              style={{
                background: '#1A8C82',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.6rem 1.4rem',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Sauvegarder
            </button>
          </form>
        </section>

        <section
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          }}
        >
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
            Changer le mot de passe
          </h2>
          <form onSubmit={handleChangePassword}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                color: '#475569',
              }}
            >
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="6 caractères minimum"
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
            {passErr && (
              <p style={{ color: '#DC2626', marginBottom: '0.5rem' }}>
                {passErr}
              </p>
            )}
            {passMsg && (
              <p style={{ color: '#16A34A', marginBottom: '0.5rem' }}>
                {passMsg}
              </p>
            )}
            <button
              type="submit"
              style={{
                background: '#1A8C82',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.6rem 1.4rem',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Mettre à jour
            </button>
          </form>
        </section>

        <section
          style={{
            textAlign: 'center',
            marginTop: '2rem',
            marginBottom: '2rem',
          }}
        >
          <button
            onClick={handleDeleteAccount}
            style={{
              background: 'transparent',
              color: '#DC2626',
              border: '1px solid #DC2626',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            ⚠️ Supprimer mon compte définitivement
          </button>
        </section>
      </main>
    </div>
  );
}
