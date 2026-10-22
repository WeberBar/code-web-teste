/**
 * Script que compila automaticamente o Palco (picode-palco) e o Code/Upload (code_hub)
 * e copia os builds estáticos para public/iframes/palco e public/iframes/code.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_IFRAMES_DIR = path.join(ROOT_DIR, 'public', 'iframes');

const TARGETS = [
  {
    id: 'palco',
    name: 'PiCode Palco (Stage Mode)',
    candidates: [
      path.resolve(ROOT_DIR, '..', '..', 'picode-palco'),
      path.resolve(ROOT_DIR, '..', 'picode-palco'),
      path.join(ROOT_DIR, 'picode-palco'),
    ],
    gitUrl: 'https://github.com/WeberBar/picode-palco.git',
    outputDir: path.join(PUBLIC_IFRAMES_DIR, 'palco'),
  },
  {
    id: 'code',
    name: 'Code Hub (Upload Mode)',
    candidates: [
      path.resolve(ROOT_DIR, '..', 'code_hub'),
      path.resolve(ROOT_DIR, '..', '..', 'code_hub'),
      path.join(ROOT_DIR, 'code_hub'),
    ],
    gitUrl: 'https://github.com/WeberBar/code_hub.git',
    outputDir: path.join(PUBLIC_IFRAMES_DIR, 'code'),
  },
];

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  if (!exists) return;
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

function removeDirSync(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

function resolveRepoDir(target) {
  for (const candidate of target.candidates) {
    if (fs.existsSync(path.join(candidate, 'package.json'))) {
      return candidate;
    }
  }
  // Em ambientes de deploy (ex: Vercel) onde os repositórios privados irmãos não estão presentes,
  // utiliza o build já gerado em public/iframes/<id> se existir.
  if (fs.existsSync(path.join(target.outputDir, 'index.html'))) {
    return null;
  }
  const cloneDest = path.join(ROOT_DIR, '.cache-repos', target.id);
  fs.mkdirSync(path.dirname(cloneDest), { recursive: true });
  console.log(`[${target.id}] Repositório não encontrado localmente. Clonando ${target.gitUrl}...`);
  const cloneRes = spawnSync('git', ['clone', '--depth', '1', target.gitUrl, cloneDest], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (cloneRes.status !== 0) {
    throw new Error(`Falha ao clonar ${target.gitUrl}`);
  }
  return cloneDest;
}

function ensureDependencies(repoDir, target) {
  const webpackBin = path.join(repoDir, 'node_modules', 'webpack', 'bin', 'webpack.js');
  if (fs.existsSync(webpackBin)) {
    return webpackBin;
  }
  console.log(`[${target.id}] Instalando dependências em ${repoDir}...`);
  const installRes = spawnSync('npm', ['install', '--legacy-peer-deps'], {
    cwd: repoDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (installRes.status !== 0) {
    throw new Error(`Falha ao instalar dependências em ${repoDir}`);
  }
  return webpackBin;
}

function buildTarget(target) {
  const startTime = Date.now();
  const repoDir = resolveRepoDir(target);
  if (!repoDir) {
    console.log(`✅ [${target.name}] Usando build pré-compilado em ${target.outputDir}`);
    return;
  }
  const webpackBin = ensureDependencies(repoDir, target);

  console.log(`\n============================================================`);
  console.log(`🔨 Buildando iframe [${target.name}]`);
  console.log(`📂 Origem: ${repoDir}`);
  console.log(`🎯 Destino: ${target.outputDir}`);
  console.log(`============================================================\n`);

  const env = {
    ...process.env,
    NODE_ENV: 'production',
    BUILD_MODE: 'standalone',
    ROOT: '',
    CI: 'true',
    NODE_OPTIONS: '--openssl-legacy-provider --max-old-space-size=4096',
  };

  // Testa se o Node atual aceita --openssl-legacy-provider; em versões antigas pode não precisar
  const nodeCheck = spawnSync(process.execPath, ['--openssl-legacy-provider', '-e', '1'], { stdio: 'ignore' });
  if (nodeCheck.status !== 0) {
    env.NODE_OPTIONS = '--max-old-space-size=4096';
  }

  const buildRes = spawnSync(process.execPath, [webpackBin, '--bail'], {
    cwd: repoDir,
    env,
    stdio: 'inherit',
  });

  if (buildRes.status !== 0) {
    throw new Error(`Erro ao compilar ${target.name} (código ${buildRes.status})`);
  }

  const repoBuildDir = path.join(repoDir, 'build');
  if (!fs.existsSync(path.join(repoBuildDir, 'index.html'))) {
    throw new Error(`Build de ${target.name} não gerou ${path.join(repoBuildDir, 'index.html')}`);
  }

  removeDirSync(target.outputDir);
  fs.mkdirSync(target.outputDir, { recursive: true });
  copyRecursiveSync(repoBuildDir, target.outputDir);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`✅ [${target.name}] compilado e copiado para ${target.outputDir} em ${elapsed}s!`);
}

function buildAllIframes() {
  const totalStart = Date.now();
  if (!fs.existsSync(PUBLIC_IFRAMES_DIR)) {
    fs.mkdirSync(PUBLIC_IFRAMES_DIR, { recursive: true });
  }

  for (const target of TARGETS) {
    buildTarget(target);
  }

  const totalElapsed = ((Date.now() - totalStart) / 1000).toFixed(1);
  console.log(`\n🎉 Ambos os iframes (Palco + Code Hub) foram gerados com sucesso em ${totalElapsed}s!\n`);
}

if (require.main === module) {
  try {
    buildAllIframes();
  } catch (err) {
    console.error('\n❌ Erro durante o build dos iframes:', err.message || err);
    process.exit(1);
  }
}

module.exports = { buildAllIframes };

