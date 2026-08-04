'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'translations');

const SUFFIX_SHORT = ['喵~', '喵', '呢喵~', '喵！', '喵喵~', '喵～'];
const SUFFIX_MED = ['喵', '呢', '喵~'];
const MAX = 200;

function cjkCount(s) { const m = s.match(/[\u4e00-\u9fff]/g); return m ? m.length : 0; }
function cjkRatio(s) { const t = s.replace(/\s/g, ''); return t.length ? cjkCount(t) / t.length : 0; }

function isTechnical(v) {
  if (/\]\((https?:|#|vscode:|command:)/.test(v)) return true;       // markdown links
  if (/&&[A-Za-z]/.test(v)) return true;                              // mnemonics
  if (v.includes('`')) return true;                                   // code spans
  if (v.includes('%')) return true;                                   // percent/format
  if (/[\r\n]/.test(v)) return true;                                  // multiline
  if (/[<>]/.test(v)) return true;                                    // tags/placeholders
  if (/\$\(/.test(v)) return true;                                    // icon refs $(...)
  if (/\{(?!\d+\})[^{}]*\}/.test(v)) return true;                     // non-numeric braces
  if (/\$\{\{/.test(v)) return true;                                  // mcp-style nested placeholder
  if (/^[\sA-Za-z0-9_:\\/.\-+@#()']+$/.test(v)) return true;          // pure ascii-ish
  return false;
}

function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

const PARTICLE = /喵|～|~|呢|にゃ|ω/;
function styled(v) { return PARTICLE.test(v); }

function heavy(v) {
  if (v.length >= MAX) return light(v);
  if (styled(v)) return v;
  if (v.endsWith('...')) return v.slice(0, -3) + '喵~...';
  if (v.endsWith('…')) return v.slice(0, -1) + '喵~…';
  if (/[。！？]$/.test(v)) return v.slice(0, -1) + '喵' + v.slice(-1);
  let s = SUFFIX_SHORT[hash(v) % SUFFIX_SHORT.length];
  if (v.length <= 8 && hash(v) % 5 === 4) s = '喵~(>^ω^<)';
  return v + s;
}
function medium(v) {
  if (v.length >= MAX) return light(v);
  if (styled(v)) return v;
  if (/[。！？]$/.test(v)) return v.slice(0, -1) + '喵' + v.slice(-1);
  if (v.endsWith('...')) return v.slice(0, -3) + '喵~...';
  return v + SUFFIX_MED[hash(v) % SUFFIX_MED.length];
}
function light(v) {
  if (styled(v)) return v;
  if (/[。！？]$/.test(v)) return v.slice(0, -1) + '喵' + v.slice(-1);
  if (v.endsWith('.')) return v.slice(0, -1) + '喵。';
  return v + '喵';
}

function transformValue(v) {
  if (typeof v !== 'string' || !v) return v;
  if (isTechnical(v)) return v;
  const r = cjkRatio(v);
  if (r < 0.4) return v;                       // mostly non-Chinese: keep
  if (v.length <= 24) return heavy(v);
  if (v.length <= 60) return medium(v);
  return light(v);
}

function walkContents(node) {
  for (const k of Object.keys(node)) {
    const v = node[k];
    if (v && typeof v === 'object') walkContents(v);
    else if (typeof v === 'string') node[k] = transformValue(v);
  }
}

function collect() {
  const out = [];
  const walkDir = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walkDir(p);
      else if (e.name.endsWith('.i18n.json')) out.push(p);
    }
  };
  walkDir(SRC);
  return out;
}

let modifiedCount = 0;
const files = collect();
for (const f of files) {
  const raw = fs.readFileSync(f, 'utf8');
  const doc = JSON.parse(raw);
  walkContents(doc.contents);
  fs.writeFileSync(f, JSON.stringify(doc, null, '\t') + '\n');
  const changed = JSON.stringify(doc) !== raw.replace(/\s+/g, '');
  if (changed) modifiedCount++;
  console.log('transformed', path.relative(ROOT, f));
}
console.log('files modified:', modifiedCount, '/', files.length);
