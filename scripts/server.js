/**
 * Servidor HTTP para o simulador do Hub Web PiCode.
 * Ao subir o site (`npm start` ou `npm run dev`), compila automaticamente
 * o Palco (picode-palco) e o Code (code_hub) para os iframes antes de iniciar,
 * a menos que a flag `--skip-build` seja informada.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { buildAllIframes } = require('./build-iframes');

const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const PORT = Number(process.env.PORT) || 3000;

const isVercel = Boolean(process.env.VERCEL);
const skipBuild = process.argv.includes('--skip-build') || isVercel;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.wasm': 'application/wasm',
  '.bin': 'application/octet-stream',
  '.hex': 'application/octet-stream',
  '.sb3': 'application/octet-stream',
  '.map': 'application/json',
};

if (!skipBuild) {
  console.log('🚀 Subindo o site Hub Web Simulator — iniciando build automático do Palco e do Code para os iframes...');
  buildAllIframes();
} else {
  const palcoIndex = path.join(PUBLIC_DIR, 'iframes', 'palco', 'index.html');
  const codeIndex = path.join(PUBLIC_DIR, 'iframes', 'code', 'index.html');
  if (!fs.existsSync(palcoIndex) || !fs.existsSync(codeIndex)) {
    console.log('⚠️ Iframes ainda não encontrados em public/iframes — executando build inicial...');
    buildAllIframes();
  }
}

const server = http.createServer((req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // Redireciona /iframes/palco -> /iframes/palco/ para preservar caminhos relativos
    if (pathname === '/iframes/palco' || pathname === '/iframes/code') {
      res.writeHead(302, { Location: `${pathname}/${parsedUrl.search}` });
      res.end();
      return;
    }

    if (pathname.endsWith('/')) {
      pathname += 'index.html';
    }

    const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    let filePath = path.join(PUBLIC_DIR, safePath);

    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      // Fallback SPA para rotas da aplicação principal (exceto arquivos dentro de /iframes/)
      if (!pathname.startsWith('/iframes/') && !path.extname(pathname)) {
        filePath = path.join(PUBLIC_DIR, 'index.html');
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`404 Não Encontrado: ${pathname}`);
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(500);
      }
      res.end('Erro interno ao ler arquivo');
    });
    stream.pipe(res);
  } catch (err) {
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`\n============================================================`);
  console.log(`🌐 Hub Web (Simulador) rodando em: http://localhost:${PORT}`);
  console.log(`🎭 Iframe Palco:                   http://localhost:${PORT}/iframes/palco/index.html`);
  console.log(`🤖 Iframe Code (Upload Mode):      http://localhost:${PORT}/iframes/code/index.html`);
  console.log(`============================================================\n`);
});

module.exports = server;

