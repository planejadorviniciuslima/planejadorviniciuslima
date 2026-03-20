/**
 * Verificador de links internos do site
 * Execução: node check-links.js
 * Sem dependências externas.
 *
 * Verifica todos os href/src que apontam para arquivos locais
 * e reporta links quebrados.
 */

const fs             = require('fs');
const path           = require('path');
const child_process  = require('child_process');

const DIR = __dirname;

// Usar apenas arquivos rastreados pelo git (exclui entradas do .gitignore)
function getTrackedHtmlFiles() {
  try {
    const out = child_process.execSync('git ls-files "*.html"', { cwd: DIR, encoding: 'utf8' });
    return out.trim().split('\n').filter(Boolean);
  } catch {
    // Fallback se não estiver num repo git
    return fs.readdirSync(DIR).filter(f => f.endsWith('.html'));
  }
}

const HTML_FILES = getTrackedHtmlFiles();

// Regex para capturar href e src com valores relativos
const LINK_RE = /(?:href|src)="([^"#?]+)"/g;

// Prefixos que indicam link externo ou não-arquivo
const EXTERNAL = ['http://', 'https://', 'mailto:', 'tel:', 'data:'];

let errors = 0;
let checked = 0;

console.log(`\nVerificando links em ${HTML_FILES.length} arquivos HTML...\n`);

for (const file of HTML_FILES) {
  const content = fs.readFileSync(path.join(DIR, file), 'utf8');
  const broken  = [];
  let match;

  LINK_RE.lastIndex = 0;
  while ((match = LINK_RE.exec(content)) !== null) {
    const href = match[1].trim();

    // Ignorar links externos
    if (EXTERNAL.some(p => href.startsWith(p))) continue;
    // Ignorar âncoras puras
    if (href.startsWith('#')) continue;
    // Ignorar caminhos vazios
    if (!href) continue;

    checked++;
    const target = path.join(DIR, href);
    if (!fs.existsSync(target)) {
      broken.push(href);
    }
  }

  if (broken.length > 0) {
    console.error(`\x1b[31m✗ ${file}\x1b[0m`);
    broken.forEach(b => console.error(`    → "${b}" não encontrado`));
    errors += broken.length;
  } else {
    console.log(`\x1b[32m✓\x1b[0m ${file}`);
  }
}

console.log(`\n${'─'.repeat(50)}`);
console.log(`${checked} links verificados.`);
if (errors === 0) {
  console.log(`\x1b[32m✓ Nenhum link quebrado encontrado.\x1b[0m\n`);
} else {
  console.error(`\x1b[31m✗ ${errors} link(s) quebrado(s) encontrado(s).\x1b[0m\n`);
  process.exit(1);
}
