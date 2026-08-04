'use strict';
const fs = require('fs');
const path = require('path');
const DICT = require('./terms');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'translations');

const GENTLE = ['喵', '喵~', '喵~', '喵！'];
const NARRATIVE = ['喵~', '喵！', '呢喵~', '喵喵~', '喵～', '喵！'];
const KAOMOJI = ['(>^ω^<)', '(=^･ω･^=)', '(≧▽≦)', '(^ω^)', 'o(≧▽≦)o'];
const MAX = 200;

// 命令/菜单动词前缀（用于识别精简命令标题）
const VERBS = [
  '保存', '打开', '新建', '创建', '删除', '复制', '粘贴', '剪切', '撤销', '重做',
  '全选', '打印', '导出', '导入', '提交', '推送', '拉取', '同步', '暂存', '放弃',
  '发布', '更新', '安装', '卸载', '重启', '停止', '启动', '运行', '调试', '执行',
  '关闭', '切换', '显示', '隐藏', '聚焦', '折叠', '展开', '移动', '重命名', '还原',
  '恢复', '合并', '连接', '断开', '设置', '重置', '放大', '缩小', '缩放', '转到',
  '跳转', '跳到', '查找', '替换', '添加', '移除', '附加', '清除', '继续', '暂停',
  '发送', '接收', '下载', '上传', '生成', '启用', '禁用', '验证', '触发', '刷新',
  '全屏', '退出', '跳过', '撤回', '重建', '结转', '释放', '监视', '跟踪', '跳过',
  '全部保存', '全部关闭', '全部折叠', '全部展开'
];

function cjkCount(s) { const m = s.match(/[\u4e00-\u9fff]/g); return m ? m.length : 0; }
function cjkRatio(s) { const t = s.replace(/\s/g, ''); return t.length ? cjkCount(t) / t.length : 0; }

function isTechnical(v) {
  if (/\]\((https?:|#|vscode:|command:)/.test(v)) return true;
  if (/&&[A-Za-z]/.test(v)) return true;
  if (v.includes('`')) return true;
  if (v.includes('%')) return true;
  if (/[\r\n]/.test(v)) return true;
  if (/[<>]/.test(v)) return true;
  if (/\$\(/.test(v)) return true;
  if (/\{(?!\d+\})[^{}]*\}/.test(v)) return true;
  if (/\$\{\{/.test(v)) return true;
  if (/^[\sA-Za-z0-9_:\\/.\-+@#()'~]+$/.test(v)) return true;
  return false;
}

function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
const PARTICLE = /喵|～|~|呢|にゃ|ω/;
const TERM_PUNCT = /[。！？]$/;

function isVerbLead(v) { return VERBS.some(vb => v.startsWith(vb)); }

// base 串 -> 猫娘风格（字典优先，其次通用规则）
function transformValue(v, isPackage) {
  if (typeof v !== 'string' || !v) return v;
  if (isTechnical(v)) return v;
  if (cjkRatio(v) < 0.4) return v;

  if (DICT.has(v)) return DICT.get(v);

  let out = v;
  // 省略号：在省略号前插入语气词
  if (v.endsWith('...')) out = v.slice(0, -3) + '喵~...';
  else if (v.endsWith('…')) out = v.slice(0, -1) + '喵~…';
  // 句末标点：在标点前插入 喵
  else if (TERM_PUNCT.test(v)) out = v.slice(0, -1) + '喵' + v.slice(-1);
  // 标签类末尾（冒号/逗号/右括号）保持不变
  else if (!/[:：，,)]$/.test(v)) {
    const isCommand = isPackage || (isVerbLead(v) && v.length <= 18);
    if (isCommand || v.length <= 10) out = v + GENTLE[hash(v) % GENTLE.length];
    else if (v.length <= 40) out = v + NARRATIVE[hash(v) % NARRATIVE.length];
    else out = v + '喵';
  }

  // 颜文字：仅短对话类字符串，稀疏点缀（约 1/9）
  if (out !== v && !isPackage && !isVerbLead(v) && v.length <= 20 &&
      (TERM_PUNCT.test(v) || v.length <= 8) && hash(v + '~') % 9 === 0) {
    out += KAOMOJI[hash(v + '喵') % KAOMOJI.length];
  }
  return out;
}

function walkContents(node, isPackage) {
  for (const k of Object.keys(node)) {
    const v = node[k];
    if (v && typeof v === 'object') walkContents(v, isPackage);
    else if (typeof v === 'string') node[k] = transformValue(v, isPackage);
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

const files = collect();
for (const f of files) {
  const doc = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const mod of Object.keys(doc.contents)) {
    walkContents(doc.contents[mod], mod === 'package');
  }
  fs.writeFileSync(f, JSON.stringify(doc, null, '\t') + '\n');
}
console.log('transformed files:', files.length);