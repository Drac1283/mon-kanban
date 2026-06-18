import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';

export default function TaskList({ boardId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');

  async function fetchTasks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*, categories(*)')
      .eq('board_id', boardId)
      .order('created_at', { ascending: false });
    if (!error) setTasks(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('realtime_tasks')
      .on('postgres', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [boardId]);

  async function handleDelete(taskId) {
    if (!window.confirm('Supprimer cette tâche ?')) return;
    await supabase.from('tasks').delete().eq('id', taskId);
    fetchTasks();
  }

  if (loading) return <p>Chargement des tâches...</p>;

  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter(
    (t) => t.status === 'in_progress',
  ).length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  let displayedTasks = tasks;
  if (statusFilter !== 'all') {
    displayedTasks = displayedTasks.filter((t) => t.status === statusFilter);
  }
  displayedTasks.sort((a, b) => {
    if (sortBy === 'priority') return a.priority.localeCompare(b.priority);
    if (sortBy === 'due_date')
      return new Date(a.due_date || '2099') - new Date(b.due_date || '2099');
    return 0;
  });

  return (
    <div>
      <TaskForm boardId={boardId} onCreated={fetchTasks} />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'white',
          padding: '1rem',
          borderRadius: '10px',
          marginBottom: '1rem',
          border: '1px solid #E2E8F0',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            fontSize: '0.9rem',
            color: '#64748B',
          }}
        >
          <span>
            📋 À faire: <strong>{todoCount}</strong>
          </span>
          <span>
            ⚙️ En cours: <strong>{inProgressCount}</strong>
          </span>
          <span>
            ✅ Terminées: <strong>{doneCount}</strong>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.4rem',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
            }}
          >
            <option value="all">Tous les statuts</option>
            <option value="todo">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="review">Validation</option>
            <option value="done">Terminées</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.4rem',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
            }}
          >
            <option value="created_at">Date de création</option>
            <option value="due_date">Échéance</option>
            <option value="priority">Priorité</option>
          </select>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {displayedTasks.map((task) => (
          <TaskCard key={task.id} task={task} onDelete={handleDelete} />
        ))}
      </div>
      {displayedTasks.length === 0 && (
        <p style={{ textAlign: 'center', color: '#94A3B8', padding: '2rem' }}>
          Aucune tâche correspondante 🚀
        </p>
      )}
    </div>
  );
}
