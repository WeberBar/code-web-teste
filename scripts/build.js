/**
 * Script de build completo do site simulador do Hub Web:
 * 1. Compila os dois projetos (picode-palco e code_hub) para public/iframes/palco e public/iframes/code
 * 2. Gera a pasta final dist/ pronta para deploy estático.
 */
const fs = require('fs');
const path = require('path');
const { buildAllIframes } = require('./build-iframes');

const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    for (const child of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function main() {
  buildAllIframes();

  console.log('📦 Gerando diretório de publicação dist/...');
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
  copyRecursiveSync(PUBLIC_DIR, DIST_DIR);
  console.log(`✅ Build completo finalizado em: ${DIST_DIR}`);
}

try {
  main();
} catch (err) {
  console.error('❌ Falha no build:', err.message || err);
  process.exit(1);
}

