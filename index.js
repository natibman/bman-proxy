const express = require('express');
const cors = require('cors');
const https = require('https');
const querystring = require('querystring');

const app = express();
const PORT = process.env.PORT || 3000;
const BMAN_DOMAIN = process.env.BMAN_DOMAIN || 'natisrl.bman.it';
const BMAN_PORT = parseInt(process.env.BMAN_PORT || '8443');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'bman proxy attivo', domain: BMAN_DOMAIN });
});

// Proxy verso bman API
app.post('/api/:metodo', (req, res) => {
  const metodo = req.params.metodo;
  const body = querystring.stringify(req.body);

  const options = {
    hostname: BMAN_DOMAIN,
    port: BMAN_PORT,
    path: `/bmanapi.asmx/${metodo}`,
    method: 'POST',
    rejectUnauthorized: false, // bman usa certificati self-signed
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', chunk => data += chunk);
    proxyRes.on('end', () => {
      // Estrai JSON dall'XML di risposta bman
      const match = data.match(/<string[^>]*>([\s\S]*?)<\/string>/);
      const jsonStr = match ? match[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"') : data;
      try {
        const parsed = JSON.parse(jsonStr);
        res.json(parsed);
      } catch {
        res.status(500).json({ errore: 'Risposta non valida da bman', raw: jsonStr.substring(0, 200) });
      }
    });
  });

  proxyReq.on('error', (err) => {
    res.status(502).json({ errore: 'Impossibile connettersi a bman: ' + err.message });
  });

  proxyReq.write(body);
  proxyReq.end();
});
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => {
  console.log(`bman proxy avviato su porta ${PORT} → ${BMAN_DOMAIN}:${BMAN_PORT}`);
});
