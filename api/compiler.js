const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

function loadLocalEnvIfNeeded() {
  if (process.env.COMPILER_API_URL && process.env.COMPILER_API_KEY) return;
  const rootDir = path.resolve(__dirname, '..');
  const envFiles = [
    path.resolve(rootDir, '..', 'code_hub', '.env'),
    path.join(rootDir, '.env'),
  ];
  for (const envPath of envFiles) {
    if (!fs.existsSync(envPath)) continue;
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const val = trimmed.slice(eqIndex + 1).trim();
      if (key && val && !process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

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

async function proxyToCompiler(req, res, forcedEndpoint) {
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
    loadLocalEnvIfNeeded();

    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const queryEndpoint = (req.query && req.query.endpoint) || parsedUrl.searchParams.get('endpoint');
    const pathEndpoint = parsedUrl.pathname
      .replace(/^\/api\/compiler\/?/, '/')
      .replace(/^\/api\//, '/');
    const endpoint = forcedEndpoint || queryEndpoint || pathEndpoint;

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

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const targetUrl = new URL(`${baseUrl}${cleanEndpoint}`);
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
}

module.exports = (req, res) => proxyToCompiler(req, res);
module.exports.proxyToCompiler = proxyToCompiler;
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
