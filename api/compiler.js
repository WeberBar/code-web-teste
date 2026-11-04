const https = require('https');
const http = require('http');

function collectRawBody(req) {
  if (Buffer.isBuffer(req.body)) {
    return Promise.resolve(req.body);
  }
  if (typeof req.body === 'string') {
    return Promise.resolve(Buffer.from(req.body, 'utf8'));
  }
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(Buffer.from(JSON.stringify(req.body), 'utf8'));
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-KEY');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const endpoint = parsedUrl.searchParams.get('endpoint') || parsedUrl.pathname.replace(/^\/api\/compiler\/?/, '/');

    const baseUrl = (process.env.COMPILER_API_URL || '').trim().replace(/\/+$/, '');
    const apiKey = (process.env.COMPILER_API_KEY || '').trim();

    if (!baseUrl || !apiKey) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          error: 'Variáveis de ambiente COMPILER_API_URL / COMPILER_API_KEY não configuradas no servidor.',
        })
      );
      return;
    }

    const targetUrl = new URL(endpoint.startsWith('/') ? endpoint : `/${endpoint}`, `${baseUrl}/`);
    const rawBody = await collectRawBody(req);

    const headers = {
      'X-API-KEY': apiKey,
      'Content-Length': Buffer.byteLength(rawBody),
    };
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'];
    } else {
      headers['Content-Type'] = 'application/json';
    }

    const client = targetUrl.protocol === 'https:' ? https : http;

    await new Promise((resolve, reject) => {
      const proxyReq = client.request(
        targetUrl,
        {
          method: 'POST',
          headers,
          timeout: 90000,
        },
        (proxyRes) => {
          const resChunks = [];
          proxyRes.on('data', (c) => resChunks.push(c));
          proxyRes.on('end', () => {
            const responseBuffer = Buffer.concat(resChunks);
            res.statusCode = proxyRes.statusCode || 200;
            res.setHeader(
              'Content-Type',
              proxyRes.headers['content-type'] || 'application/json; charset=utf-8'
            );
            res.end(responseBuffer);
            resolve();
          });
        }
      );

      proxyReq.on('error', reject);
      proxyReq.on('timeout', () => {
        proxyReq.destroy(new Error('Timeout ao conectar ao servidor de compilação'));
      });

      proxyReq.write(rawBody);
      proxyReq.end();
    });
  } catch (err) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        error: err.message || 'Servidor Offline ou Erro de Conexão',
      })
    );
  }
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
