import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

const COLUMNS = [
  { id: 'todo', title: '📋 À faire', color: '#E2E8F0' },
  { id: 'in_progress', title: '⚙️ En cours', color: '#DBEAFE' },
  { id: 'review', title: '👀 Validation', color: '#FEF3C7' },
  { id: 'done', title: '✅ Terminées', color: '#DCFCE7' },
];

export default function TaskList({ boardId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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

    // Bonus Realtime maintenu !
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
    fetchTasks(); // Met à jour localement
  }

  async function onDragEnd(result) {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const newStatus = destination.droppableId;

    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === draggableId ? { ...t, status: newStatus } : t,
      ),
    );

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', draggableId);

    if (error) {
      console.error('Erreur de mise à jour :', error);
      fetchTasks();
    }
  }

  if (loading) return <p>Chargement des tâches...</p>;

  return (
    <div>
      <TaskForm boardId={boardId} onCreated={fetchTasks} />

      {/* Le contexte global du Glisser-Déposer */}
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Grille des 4 colonnes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            alignItems: 'start',
          }}
        >
          {COLUMNS.map((col) => {
            // On filtre les tâches pour ne garder que celles de cette colonne
            const columnTasks = tasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: `1px solid ${col.color}`,
                  borderTop: `4px solid ${col.color}`,
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: '1rem',
                    color: '#1E293B',
                    fontSize: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  {col.title}
                  <span
                    style={{
                      background: col.color,
                      padding: '0.1rem 0.5rem',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                    }}
                  >
                    {columnTasks.length}
                  </span>
                </h3>

                {/* La zone où on peut lâcher la carte */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        minHeight: '150px',
                        background: snapshot.isDraggingOver
                          ? 'rgba(0,0,0,0.03)'
                          : 'transparent',
                        borderRadius: '8px',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      {columnTasks.map((task, index) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          index={index}
                          onDelete={handleDelete}
                        />
                      ))}
                      {provided.placeholder}{' '}
                      {/* Espace réservé pendant le drag */}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
