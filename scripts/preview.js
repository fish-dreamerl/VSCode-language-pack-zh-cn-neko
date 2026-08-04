'use strict';
const fs = require('fs');
const A = JSON.parse(fs.readFileSync('D:/vscode-language-pack-zh-cn-neko/translations/main.i18n.json', 'utf8')).contents;
const B = JSON.parse(fs.readFileSync('D:/vscode-language-pack-zh-cn-neko/base-ref/main.i18n.json', 'utf8')).contents;

const pairs = [];
for (const m of Object.keys(A)) {
  for (const k of Object.keys(A[m])) {
    const ov = A[m][k], bv = B[m] && B[m][k];
    if (typeof ov === 'string' && ov !== bv) pairs.push([m + '.' + k, bv, ov]);
    if (pairs.length > 4000) break;
  }
  if (pairs.length > 4000) break;
}
console.log('total modified (sampled):', pairs.length);
const dist = {};
pairs.forEach(p => { const c = p[2].length <= 24 ? '<=24' : p[2].length <= 60 ? '25-60' : '>60'; dist[c] = (dist[c] || 0) + 1; });
console.log('distribution:', JSON.stringify(dist));

function show(tag, lo, hi, grab) {
  console.log('=== ' + tag + ' ===');
  pairs.filter(p => p[2].length >= lo && p[2].length <= hi).slice(0, grab)
    .forEach(p => console.log('  [' + p[0] + ']\n    ' + p[1] + '  ->  ' + p[2]));
}
show('短字符串(重度, <=24)', 1, 24, 8);
show('中(25-60)', 25, 60, 6);
show('长(>60, 轻量)', 61, 9999, 5);
