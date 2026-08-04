'use strict';
const fs = require('fs');
const path = require('path');
const DICT = require('./terms');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'translations');

const GENTLE = ['喵！', '喵~', '喵~'];
const KAOMOJI = ['(>^ω^<)', '(=^･ω･^=)', '(≧▽≦)', '(^ω^)', 'o(≧▽≦)o'];
const MAX = 200;

// 特别重要警告 -> 喵！！！
const CRIT = /危险|致命|严重|不可逆|无法恢复|永久|数据丢失|丢失所有|损坏|无法挽回|不可撤销|将永久|覆盖所有|删除所有文件/;
// 警告 / 提示 / 信息 -> 喵！
const WARN = /警告|提示|注意|错误|失败|无法|不能|不允许|拒绝|缺少|无效|不存在|出错|异常|超时|已取消|已停止|已终止|未找到|请检查|请重试|请稍候|正在|加载|权限|禁止|断开|中断|崩溃|终止/;
const TERM_PUNCT = /[。！？?!：:,，]+$/;

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

function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

function isVerbLead(v) { return VERBS.some(vb => v.startsWith(vb)); }

// 语气分类：特别重要警告/询问/警告提示/操作/陈述
function classify(v, wasQuestion) {
  if (CRIT.test(v)) return '喵！！！';
  if (wasQuestion) return '喵？';
  if (WARN.test(v)) return '喵！';
  if (isVerbLead(v) && v.length <= 18) return GENTLE[hash(v) % GENTLE.length];
  return '喵~';
}

// base 串 -> 猫娘风格（字典优先，其次语气分类；不允许空缺）
function transformValue(v, isPackage) {
  if (typeof v !== 'string' || !v) return v;

  if (DICT.has(v)) return DICT.get(v);

  const wasQuestion = /[?？]$/.test(v) || /吗$/.test(v);

  let tail = '';
  let core = v;
  // 省略号：保留在末尾
  if (core.endsWith('...')) { tail = '...'; core = core.slice(0, -3); }
  else if (core.endsWith('…')) { tail = '…'; core = core.slice(0, -1); }
  // 句末标点（。！？：,）剥离
  core = core.replace(TERM_PUNCT, '');

  const particle = classify(core, wasQuestion);
  let out = core + particle + tail;

  // 颜文字：仅短陈述/感叹对话类字符串，稀疏点缀（约 1/9）
  if (!isPackage && !isVerbLead(core) && (particle === '喵~' || particle === '喵！') &&
      core.length <= 20 && (/[。！?？]$/.test(v) || core.length <= 8) &&
      hash(core + '~') % 9 === 0) {
    out += KAOMOJI[hash(core + '喵') % KAOMOJI.length];
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