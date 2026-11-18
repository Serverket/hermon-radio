#!/usr/bin/env node
/**
 * Release script: bumps version references, validates lint/types/build,
 * commits all pending changes with the release title, and creates the Git tag.
 *
 * Usage:
 *   bun run release <x.y.z> --note "Release summary" [--force] [--push]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync, execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '..');

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT, stdio: 'inherit', ...opts });
}

function runGit(gitArgs) {
  return execFileSync('git', gitArgs, { cwd: ROOT, stdio: 'inherit' });
}

function capture(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function patch(file, fn) {
  const abs = resolve(ROOT, file);
  if (!existsSync(abs)) {
    console.log(`  (skip) ${file} — not found`);
    return;
  }
  const orig = readFileSync(abs, 'utf8');
  const next = fn(orig);
  if (next === orig) {
    console.log(`  (no change) ${file}`);
    return;
  }
  writeFileSync(abs, next, 'utf8');
  console.log(`  ✓ ${file}`);
}

const args = process.argv.slice(2);
const force = args.includes('--force');
const shouldPush = args.includes('--push');
const version = args.find((a) => /^\d+\.\d+\.\d+$/.test(a));

let releaseNote = '';
const noteIdx = args.indexOf('--note');
if (noteIdx !== -1 && noteIdx + 1 < args.length) {
  releaseNote = args[noteIdx + 1].trim();
}

if (!version) {
  console.error('Uso: bun run release <x.y.z> --note "Descripción" [--force] [--push]');
  process.exit(1);
}

if (!releaseNote && !force) {
  console.error('Error: --note "Descripción" es obligatorio (o pasa --force).');
  process.exit(1);
}

const tag = `v${version}`;
const noteText = releaseNote || `Release ${tag}`;
const commitMsg = `release: ${tag} - ${noteText}`;

// 1. Validate git repository and tag uniqueness (working-tree changes are included automatically)
try {
  const inside = capture('git rev-parse --is-inside-work-tree');
  if (inside !== 'true') throw new Error('Not a git repository');
} catch {
  console.error('Error: Este directorio no es un repositorio Git válido.');
  process.exit(1);
}

let tagExists = false;
try {
  execFileSync('git', ['rev-parse', '-q', '--verify', `refs/tags/${tag}`], { cwd: ROOT, stdio: 'ignore' });
  tagExists = true;
} catch {
  tagExists = false;
}

if (tagExists && !force) {
  console.error(`Error: El tag ${tag} ya existe. Usa una nueva versión o --force para moverlo.`);
  process.exit(1);
}

const pendingCount = capture('git status --porcelain').split('\n').filter(Boolean).length;

try {
  console.log(`\n🚀  Preparando ${tag} — ${noteText}`);
  if (pendingCount > 0) {
    console.log(`📦  Se incluirán ${pendingCount} cambios pendientes automáticamente en el commit del release.`);
  }
  console.log('');

  // 2. Bump version references across web & optional native targets
  patch('package.json', (src) => {
    const pkg = JSON.parse(src);
    pkg.version = version;
    return JSON.stringify(pkg, null, 2) + '\n';
  });

  patch('src-tauri/tauri.conf.json', (src) => {
    const conf = JSON.parse(src);
    if (conf.package?.version) conf.package.version = version;
    if (conf.version) conf.version = version;
    return JSON.stringify(conf, null, 2) + '\n';
  });

  patch('README.md', (src) =>
    src
      .replace(/release-v[\d]+\.[\d]+\.[\d]+(-[\w.-]+)?/g, (_, color) => `release-${tag}${color || '-d97706.svg'}`)
      .replace(/version-[\d.]+-[\w]+\.svg/g, `version-${version}-22d3ee.svg`)
  );

  patch('public/releases.json', (src) => {
    const data = JSON.parse(src);
    if (data.current?.version) {
      data.history = data.history || [];
      data.history.unshift({ ...data.current });
    }
    data.current = { version, note: noteText };
    return JSON.stringify(data, null, 2) + '\n';
  });

  // 3. Write live release-info.json BEFORE building (excluded from SW precache)
  writeFileSync(
    resolve(ROOT, 'public/release-info.json'),
    JSON.stringify(
      {
        version,
        note: noteText,
        date: new Date().toISOString(),
      },
      null,
      2
    ) + '\n'
  );
  console.log('  ✓ public/release-info.json');

  // 4. Environment dependency sanity check + lint + typecheck + build targets
  console.log('\n🔎  Verificando dependencias, lint, tipos y compilación...');
  run('bun install --frozen-lockfile || bun install');
  run('npm run lint');
  run('node ./node_modules/.bin/tsc --noEmit');
  run('bun run build');

  if (existsSync(resolve(ROOT, 'src-tauri/Cargo.toml'))) {
    console.log('\n🦀  Detectado Tauri: compilando artefacto nativo...');
    run('bun run tauri build');
  }

  // 5. Commit all changes with release title & create tag
  runGit(['add', '-A']);
  runGit(['commit', '-m', commitMsg]);
  runGit(force ? ['tag', '-f', tag] : ['tag', tag]);

  const currentBranch = capture('git branch --show-current') || 'HEAD';
  console.log(`\n📦  Commit "${commitMsg}" y tag ${tag} creados localmente en la rama "${currentBranch}".`);

  if (shouldPush) {
    runGit(['push', 'origin', currentBranch, '--tags']);
    console.log(`\n✅  ${tag} publicado en origin/${currentBranch}.\n`);
  } else {
    console.log(`\nPara publicar ejecuta:\n  git push origin ${currentBranch} --tags\n`);
  }
} catch (err) {
  console.error('\n❌  Fallo durante la creación del release:', err.message);
  process.exitCode = 1;
}
