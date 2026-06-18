import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function UserTable({ users, onRefresh }) {
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setLoading(true);
    await supabase
      .from('profiles')
      .insert([{ email: newEmail, full_name: newName, role: 'member' }]);
    setNewEmail('');
    setNewName('');
    onRefresh();
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    await supabase.from('profiles').delete().eq('id', id);
    onRefresh();
  }

  return (
    <div className="space-y-6">
      {/* Formulaire */}
      <form
        onSubmit={handleCreate}
        className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-200"
      >
        <input
          type="email"
          placeholder="Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
          className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand/50 outline-none"
        />
        <input
          placeholder="Nom complet"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand/50 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-brand text-white font-medium rounded-md hover:bg-teal-700 transition"
        >
          {loading ? '...' : '+ Ajouter'}
        </button>
      </form>

      {/* Tableau Responsive */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider border-b border-slate-200">
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Nom</th>
              <th className="p-4 font-semibold">Rôle</th>
              <th className="p-4 font-semibold">Créé le</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium">{u.email}</td>
                <td className="p-4">{u.full_name || '—'}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-brand/10 text-brand'}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-500">
                  {new Date(u.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-red-500 hover:text-red-700 bg-red-50 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center p-8 text-slate-500">
            Aucun utilisateur pour l'instant.
          </p>
        )}
      </div>
    </div>
  );
}
