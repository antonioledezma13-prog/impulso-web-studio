const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares ──────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Ruta de salud (para que Render sepa que el server vive) ──
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Impulso Web Studio Backend' });
});

// ── Ruta de contacto / cotización ────────────────────────
app.post('/api/contacto', async (req, res) => {
  const { nombre, empresa, contacto, plan, mensaje } = req.body;

  // Validación básica
  if (!nombre || !contacto || !mensaje) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }

  // Mensaje formateado para WhatsApp
  const texto =
    `📩 *NUEVA SOLICITUD – Impulso Web Studio*\n\n` +
    `👤 *Nombre:* ${nombre}\n` +
    `🏢 *Empresa:* ${empresa || 'No especificada'}\n` +
    `📱 *Contacto:* ${contacto}\n` +
    `📦 *Plan:* ${plan || 'No especificado'}\n\n` +
    `💬 *Mensaje:*\n${mensaje}`;

  // Envío vía CallMeBot
  const phone   = process.env.CALLMEBOT_PHONE;
  const apikey  = process.env.CALLMEBOT_APIKEY;

  if (!phone || !apikey) {
    console.error('❌ Faltan variables de entorno CALLMEBOT_PHONE / CALLMEBOT_APIKEY');
    return res.status(500).json({ error: 'Configuración de notificaciones incompleta.' });
  }

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(texto)}&apikey=${apikey}`;
    await axios.get(url);
    console.log(`✅ Notificación enviada para: ${nombre}`);
    res.json({ ok: true, mensaje: 'Solicitud recibida. Te contactaremos pronto.' });
  } catch (error) {
    console.error('❌ Error enviando notificación:', error.message);
    res.status(500).json({ error: 'No se pudo enviar la notificación. Intenta de nuevo.' });
  }
});

// ── Iniciar servidor ──────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
