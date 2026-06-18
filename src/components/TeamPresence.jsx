// src/components/TeamPresence.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Composant pour afficher le compte à rebours en temps réel
function CountdownTimer({ endAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(endAt).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setTimeLeft('⚠️ Pause terminée !');
        clearInterval(interval);
        if (onExpire) onExpire();
        return;
      }

      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(`⏳ Reste : ${minutes}m ${seconds}s`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endAt]);

  return <span style={{ color: '#f1c40f', fontWeight: 'bold', marginLeft: '10px' }}>{timeLeft}</span>;
}

export default function TeamPresence({ currentUserId }) {
  const [teamStatuses, setTeamStatuses] = useState([]);
  const [myStatus, setMyStatus] = useState('Disponible');
  const [chosenDuration, setChosenDuration] = useState('15'); // 15 min par défaut
  const [loading, setLoading] = useState(true);

  const fetchStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('team_status')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setTeamStatuses(data || []);

      const myCurrent = data?.find(s => s.user_id === currentUserId);
      if (myCurrent) setMyStatus(myCurrent.status);
    } catch (error) {
      console.error("Erreur statuts d'équipe:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) fetchStatuses();
  }, [currentUserId]);

  const handleStatusChange = async (newStatus, durationMinutes = 0) => {
    if (!currentUserId) return;

    let pauseEndsAt = null;
    if (newStatus === 'En pause' && durationMinutes > 0) {
      const endDate = new Date();
      endDate.setMinutes(endDate.getMinutes() + parseInt(durationMinutes));
      pauseEndsAt = endDate.toISOString();
    }

    try {
      setMyStatus(newStatus);

      // On envoie le statut propre exigé par la contrainte + la date de fin dans sa colonne dédiée
      const { error } = await supabase
        .from('team_status')
        .upsert({ 
          user_id: currentUserId, 
          status: newStatus, 
          pause_ends_at: pauseEndsAt,
          updated_at: new Date().toISOString() 
        }, { onConflict: 'user_id' });

      if (error) throw error;
      await fetchStatuses();
    } catch (error) {
      alert("Erreur Supabase : " + error.message);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', color: '#1A8C82' }}>Chargement...</p>;

  return (
    <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <h3 style={{ marginTop: 0, color: '#1A8C82', textAlign: 'center' }}>⏱️ Configuration de ma Pause</h3>
      
      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        {/* Sélection de la durée */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ marginRight: '10px', fontWeight: '500', color: '#475569' }}>Définir la durée de pause : </label>
          <select 
            value={chosenDuration} 
            onChange={(e) => setChosenDuration(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1', marginRight: '10px' }}
          >
            <option value="5">5 Minutes</option>
            <option value="15">15 Minutes</option>
            <option value="30">30 Minutes</option>
            <option value="45">45 Minutes</option>
          </select>
          
          <button 
            onClick={() => handleStatusChange('En pause', chosenDuration)}
            style={{ padding: '8px 16px', backgroundColor: '#f1c40f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            🟡 Lancer ma Pause
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button onClick={() => handleStatusChange('Disponible')} style={{ padding: '6px 12px', backgroundColor: myStatus === 'Disponible' ? '#2ecc71' : '#E2E8F0', color: myStatus === 'Disponible' ? 'white' : '#1E293B', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
            🟢 En ligne / Disponible
          </button>
          <button onClick={() => handleStatusChange('Hors-ligne')} style={{ padding: '6px 12px', backgroundColor: myStatus === 'Hors-ligne' ? '#e74c3c' : '#E2E8F0', color: myStatus === 'Hors-ligne' ? 'white' : '#1E293B', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
            🔴 Hors-ligne
          </button>
        </div>
      </div>

      <hr style={{ border: '0', height: '1px', background: '#E2E8F0', margin: '20px 0' }} />

      <h4 style={{ color: '#475569', marginBottom: '10px' }}>Membres de l'équipe :</h4>
      <ul style={{ listStyleType: 'none', paddingLeft: 0, margin: 0 }}>
        {teamStatuses.map((member) => {
          const affichageNom = member.user_id === currentUserId ? "Moi (Vous)" : `Collaborateur (${member.user_id.slice(0, 5)})`;
          const aUnChronoActif = member.status === 'En pause' && member.pause_ends_at && new Date(member.pause_ends_at) > new Date();

          return (
            <li key={member.id} style={{ display: 'flex', justifyContente: 'space-between', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ fontWeight: member.user_id === currentUserId ? 'bold' : 'normal', color: '#1E293B' }}>{affichageNom}</span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ padding: '4px 8px', borderRadius: '4px', color: 'white', fontWeight: 'bold', fontSize: '0.85rem', backgroundColor: member.status === 'Disponible' ? '#2ecc71' : member.status === 'En pause' ? '#f1c40f' : '#e74c3c' }}>
                  {member.status}
                </span>
                
                {/* Affiche le compte à rebours si la pause est en cours */}
                {aUnChronoActif && (
                  <CountdownTimer endAt={member.pause_ends_at} onExpire={() => fetchStatuses()} />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}