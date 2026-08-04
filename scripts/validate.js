'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'translations');
const REF = path.join(ROOT, 'base-ref');

function walkFiles(dir, out) {
  out = out || [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(p, out);
    else if (e.name.endsWith('.i18n.json')) out.push(p);
  }
  return out;
}

function placeholders(s) {
  const m = s.match(/\{\d+\}/g);
  return (m || []).sort().join(' ');
}
function markdownTargets(s) {
  const m = s.match(/\]\(([^)]+)\)/g);
  return (m || []).join(' ');
}
function mnemonics(s) {
  const m = s.match(/&&[A-Za-z]/g);
  return (m || []).join(' ');
}

function assertSameKey(nodeA, nodeB, p, issues) {
  const ka = Object.keys(nodeA).sort();
  const kb = Object.keys(nodeB).sort();
  if (ka.join('\u0001') !== kb.join('\u0001')) issues.push(`KEY MISMATCH at ${p}: [${ka}] vs [${kb}]`);
  for (const k of ka) {
    const a = nodeA[k], b = nodeB[k];
    if (a && typeof a === 'object') assertSameKey(a, b, p + '.' + k, issues);
    else if (typeof a === 'string') {
      if (typeof b !== 'string') { issues.push(`TYPE at ${p}.${k}`); continue; }
      if (placeholders(a) !== placeholders(b)) issues.push(`PLACEHOLDER ${p}.${k}: "${a}" / "${b}"`);
      if (markdownTargets(a) !== markdownTargets(b)) issues.push(`LINK ${p}.${k}`);
      if (mnemonics(a) !== mnemonics(b)) issues.push(`MNEMONIC ${p}.${k}: "${a}" / "${b}"`);
    }
  }
}

let totalIssues = 0;
const srcFiles = walkFiles(SRC);
for (const sf of srcFiles) {
  const rel = path.relative(SRC, sf);
  const rf = path.join(REF, rel);
  if (!fs.existsSync(rf)) { console.log('NO REF', rel); totalIssues++; continue; }
  const a = JSON.parse(fs.readFileSync(sf, 'utf8'));
  const b = JSON.parse(fs.readFileSync(rf, 'utf8'));
  const issues = [];
  assertSameKey(a, b, rel, issues);
  if (issues.length) {
    totalIssues += issues.length;
    console.log(rel + ': ' + issues.length + ' issue(s)');
    issues.slice(0, 5).forEach(i => console.log('   ' + i));
  } else {
    console.log('OK  ' + rel);
  }
}
console.log('\nTOTAL ISSUES:', totalIssues);
process.exit(totalIssues ? 1 : 0);
