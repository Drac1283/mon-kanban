import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import UserTable from '../components/UserTable';
import TaskList from '../components/TaskList';
import Navbar from '../components/Navbar';

export default function DashboardPage({ session }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tasks');
  const [boardId, setBoardId] = useState(null);

  async function fetchUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
    supabase
      .from('boards')
      .select('id')
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) setBoardId(data[0].id);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar session={session} />

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Navigation par onglets */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-lg shadow-sm border border-slate-200 inline-flex">
          {[
            ['tasks', '🗂 Tâches'],
            ['users', '👥 Utilisateurs'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-md font-medium text-sm transition-all ${
                tab === key
                  ? 'bg-brand text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'tasks' && boardId && <TaskList boardId={boardId} />}
        {tab === 'tasks' && !boardId && (
          <div className="text-center p-12 bg-white rounded-xl border border-slate-200 text-slate-500">
            Aucun tableau trouvé.
          </div>
        )}
        {tab === 'users' &&
          (loading ? (
            <p className="text-slate-500 animate-pulse">Chargement...</p>
          ) : (
            <UserTable users={users} onRefresh={fetchUsers} />
          ))}
      </main>
    </div>
  );
}
