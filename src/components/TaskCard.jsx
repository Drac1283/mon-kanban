import { useState } from 'react';
import { supabase } from '../lib/supabase';

const PRIORITY_COLORS = {
  high: { bg: '#FEF2F2', border: '#DC2626', label: '🔴 Haute' },
  medium: { bg: '#FFFBEB', border: '#F59E0B', label: '🟡 Moyenne' },
  low: { bg: '#F0FDF4', border: '#16A34A', label: '🟢 Basse' },
};

const STATUS_LABELS = {
  todo: { label: '📋 À faire', color: '#64748B' },
  in_progress: { label: '⚙ En cours', color: '#3B82F6' },
  review: { label: '👀 Validation', color: '#F59E0B' },
  done: { label: '✅ Terminée', color: '#16A34A' },
};

export default function TaskCard({ task, onDelete }) {
  const priority = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.low;
  const status = STATUS_LABELS[task.status] || STATUS_LABELS.todo;

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const dueLabel = task.due_date
    ? new Date(task.due_date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== 'done';

  async function handleSaveTitle() {
    if (editTitle.trim() === '') return setIsEditing(false);
    await supabase.from('tasks').update({ title: editTitle }).eq('id', task.id);
    setIsEditing(false);
  }

  return (
    <div
      style={{
        background: priority.bg,
        border: `2px solid ${priority.border}`,
        borderRadius: '10px',
        padding: '1rem',
        marginBottom: '0.75rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
        transition: 'transform 0.15s',
      }}
    >
      <style>{`@keyframes blink { 0% {opacity:1;} 50% {opacity:0.3;} 100% {opacity:1;} }`}</style>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '0.5rem',
        }}
      >
        {isEditing ? (
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
            autoFocus
            style={{
              fontSize: '1rem',
              padding: '0.2rem',
              width: '100%',
              borderRadius: '4px',
              border: '1px solid #1A8C82',
            }}
          />
        ) : (
          <h3
            onClick={() => setIsEditing(true)}
            style={{
              margin: 0,
              fontSize: '1rem',
              color: '#1E293B',
              cursor: 'pointer',
              borderBottom: '1px dashed #CBD5E1',
            }}
            title="Cliquez pour modifier"
          >
            {task.title}
          </h3>
        )}
        <button
          onClick={() => onDelete(task.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#94A3B8',
            fontSize: '1.1rem',
            padding: '0',
          }}
        >
          ✕
        </button>
      </div>

      {task.description && (
        <p
          style={{
            margin: '0.5rem 0',
            color: '#64748B',
            fontSize: '0.875rem',
            lineHeight: '1.4',
          }}
        >
          {task.description}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          marginTop: '0.75rem',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: status.color,
            background: 'rgba(0,0,0,0.05)',
            padding: '0.2rem 0.5rem',
            borderRadius: '999px',
          }}
        >
          {status.label}
        </span>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: priority.border,
            background: 'rgba(0,0,0,0.05)',
            padding: '0.2rem 0.5rem',
            borderRadius: '999px',
          }}
        >
          {priority.label}
        </span>
        {task.categories && (
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              background: task.categories.color + '33',
              color: task.categories.color,
              fontWeight: 600,
            }}
          >
            🏷 {task.categories.name}
          </span>
        )}
        {dueLabel && (
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              background: isOverdue ? '#DC2626' : '#F1F5F9',
              color: isOverdue ? 'white' : '#64748B',
              fontWeight: 600,
              animation: isOverdue ? 'blink 1.5s infinite' : 'none',
            }}
          >
            📅 {isOverdue ? '⚠ En retard : ' : ''}
            {dueLabel}
          </span>
        )}
      </div>
    </div>
  );
}
