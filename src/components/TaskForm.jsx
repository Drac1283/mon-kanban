import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function TaskForm({ boardId, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [categoryId, setCategoryId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .then(({ data }) => setCategories(data || []));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim()) return setError('Le titre est obligatoire.');
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from('tasks').insert([
      {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        board_id: boardId,
        category_id: categoryId || null,
        due_date: dueDate || null,
        created_by: user.id,
      },
    ]);

    setLoading(false);
    if (error) return setError(error.message);

    if (dueDate) {
      const formattedDate = new Date(dueDate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: [user.email],
          subject: `📋 Tâche créée : ${title}`,
          html: `
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #1A8C82; margin: 0;">Nouvelle tâche planifiée ! 🚀</h2>
            </div>
            <p>Une nouvelle tâche a été ajoutée avec succès à votre tableau de bord :</p>
            <ul style="list-style-type: none; padding: 0; margin: 20px 0;">
              <li style="margin-bottom: 10px; font-size: 15px;">📌 <strong>Titre :</strong> ${title}</li>
              <li style="margin-bottom: 10px; font-size: 15px;">🏷 <strong>Priorité :</strong> ${priority.toUpperCase()}</li>
              <li style="margin-bottom: 10px; font-size: 15px;">📅 <strong>Échéance :</strong> ${formattedDate}</li>
            </ul>
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://mon-kanban.vercel.app/dashboard" style="background-color: #1A8C82; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Accéder au tableau</a>
            </div>
          `,
        }),
      });
    }

    setTitle('');
    setDescription('');
    setStatus('todo');
    setPriority('medium');
    setCategoryId('');
    setDueDate('');
    onCreated();
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '10px',
        marginBottom: '1.5rem',
        border: '1px solid #E2E8F0',
      }}
    >
      <h3 style={{ marginTop: 0, color: '#1A8C82' }}>➕ Nouvelle tâche</h3>
      {error && <p style={{ color: '#DC2626' }}>{error}</p>}
      <input
        placeholder="Titre de la tâche *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        style={{ ...inputStyle, width: '100%', marginBottom: '0.75rem' }}
      />
      <textarea
        placeholder="Description (optionnelle)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        style={{
          ...inputStyle,
          width: '100%',
          marginBottom: '0.75rem',
          resize: 'vertical',
        }}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <div>
          <label style={labelStyle}>Statut</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={inputStyle}
          >
            <option value="todo">📋 À faire</option>
            <option value="in_progress">⚙ En cours</option>
            <option value="review">👀 Validation</option>
            <option value="done">✅ Terminée</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Priorité</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={inputStyle}
          >
            <option value="low">🟢 Basse</option>
            <option value="medium">🟡 Moyenne</option>
            <option value="high">🔴 Haute</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Catégorie</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            style={inputStyle}
          >
            <option value="">— Aucune —</option>{' '}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Échéance</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{
          background: '#1A8C82',
          color: 'white',
          border: 'none',
          padding: '0.6rem 1.5rem',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.95rem',
        }}
      >
        {loading ? 'Enregistrement...' : 'Créer la tâche'}
      </button>
    </form>
  );
}

const inputStyle = {
  padding: '0.5rem 0.75rem',
  border: '1px solid #CBD5E1',
  borderRadius: '6px',
  fontSize: '0.9rem',
  width: '100%',
  boxSizing: 'border-box',
};
const labelStyle = {
  display: 'block',
  marginBottom: '0.3rem',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#64748B',
};
