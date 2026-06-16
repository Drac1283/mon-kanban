// api/send-email.js
// Ceci est une fonction serverless Vercel — elle s'exécute côté serveur
import { Resend } from 'resend';

export default async function handler(req, res) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  // Accepter uniquement les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Récupérer les données envoyées par le client React
  const { to, subject, html } = req.body;

  // Validation basique
  if (!to || !subject || !html) {
    return res
      .status(400)
      .json({ error: 'Champs manquants : to, subject,html' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'KanbanRT <onboarding@resend.dev>', // à remplacer si domaine vérifié
      to, // ex: ['destinataire@exemple.com']
      subject, // ex: 'Nouvelle tâche assignée'
      html, // contenu HTML de l'e-mail
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
