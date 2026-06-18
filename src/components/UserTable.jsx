import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function UserTable({ users, onRefresh }) {
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.full_name &&
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .insert([{ email: newEmail, full_name: newName, role: newRole }]);
    if (error) {
      setError(error.message);
    } else {
      setNewEmail('');
      setNewName('');
      setNewRole('member');
      onRefresh();
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer cet utilisateur définitivement ?')) return;

    const response = await fetch('/api/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id }),
    });

    const result = await response.json();

    if (result.success) {
      onRefresh();
    } else {
      alert('Erreur lors de la suppression : ' + result.error);
    }
  }

  async function handleUpdate(id) {
    await supabase
      .from('profiles')
      .update({ full_name: editName })
      .eq('id', id);
    setEditingId(null);
    onRefresh();
  }

  return (
    <div>
      <input
        placeholder="🔍 Rechercher par email ou nom..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ ...inputStyle, width: '100%', marginBottom: '1.5rem' }}
      />

      <form
        onSubmit={handleCreate}
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <input
          placeholder="Email"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="Nom complet"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={inputStyle}
        />
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          style={inputStyle}
        >
          <option value="member">Membre</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? '...' : '+ Ajouter'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#1A8C82', color: 'white' }}>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Nom</th>
            <th style={thStyle}>Rôle</th>
            <th style={thStyle}>Créé le</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u, i) => (
            <tr
              key={u.id}
              style={{ background: i % 2 === 0 ? '#F8FAFC' : 'white' }}
            >
              <td style={tdStyle}>{u.email}</td>
              <td style={tdStyle}>
                {editingId === u.id ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ ...inputStyle, padding: '0.2rem 0.5rem' }}
                    />
                    <button
                      onClick={() => handleUpdate(u.id)}
                      style={{ ...btnStyle, padding: '0.2rem 0.5rem' }}
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {u.full_name || '—'}
                    <button
                      onClick={() => {
                        setEditingId(u.id);
                        setEditName(u.full_name || '');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </td>
              <td style={tdStyle}>
                <span
                  style={{
                    background: u.role === 'admin' ? '#DC2626' : '#1A8C82',
                    color: 'white',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                  }}
                >
                  {u.role}
                </span>
              </td>
              <td style={tdStyle}>
                {new Date(u.created_at).toLocaleDateString('fr-FR')}
              </td>
              <td style={tdStyle}>
                <button
                  onClick={() => handleDelete(u.id)}
                  style={{
                    background: '#DC2626',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredUsers.length === 0 && (
        <p style={{ textAlign: 'center', color: '#94A3B8' }}>
          Aucun utilisateur trouvé.
        </p>
      )}
    </div>
  );
}

const thStyle = { padding: '0.75rem 1rem', textAlign: 'left' };
const tdStyle = { padding: '0.75rem 1rem', borderBottom: '1px solid #E2E8F0' };
const inputStyle = {
  padding: '0.5rem 0.75rem',
  border: '1px solid #CBD5E1',
  borderRadius: '6px',
  fontSize: '0.9rem',
};
const btnStyle = {
  padding: '0.5rem 1rem',
  background: '#1A8C82',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};
