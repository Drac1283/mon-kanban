export default async function handler(req, res) {
  // Accepter uniquement les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 👇 C'est ici que se trouvait la coquille : on ajoute ${ }
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'KanbanRT <onboarding@resend.dev>',
        to: ['gabrielcb.1283@gmail.com'],
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.message });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('🚨 ERREUR SERVEUR :', err);
    return res.status(500).json({ error: err.message });
  }
}
