export default async function handler(req, res) {
  // Accepter uniquement les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  // 🎨 LE TEMPLATE HTML RICHE EST ICI
  const richHtmlTemplate = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      
      <div style="background-color: #1A8C82; padding: 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 1px;">📋 KanbanRT</h1>
      </div>
      
      <div style="padding: 32px; background-color: #ffffff; color: #334155; font-size: 16px; line-height: 1.6;">
        ${html}
      </div>
      
      <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 13px; color: #64748b;">
          Cet e-mail a été envoyé automatiquement par votre application KanbanRT.
        </p>
      </div>
      
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'KanbanRT <onboarding@resend.dev>',
        to: ['gabrielcb.1283@gmail.com'], // Toujours votre adresse pour le mode gratuit
        subject,
        html: richHtmlTemplate, // 👈 On injecte le beau design ici
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
