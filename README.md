# Neko Chinese (猫娘中文) Language Pack

猫娘风格的 Visual Studio Code 简体中文语言包（`zh-cn-neko`）。
以微软官方简体中文语言包为底本，术语与官方一致，仅叠加猫娘语气与颜文字。

## 特性

- 以官方 `zh-cn` 语言包为底本，Git / Workspace / 断点等专业术语保持官方译法，保证正确性。
- 分层猫娘化：
  - **短界面文本**（按钮 / 菜单 / 命令标题 / 通知 / 对话框）：重度猫娘化，追加「喵 / 喵~ / 呢 / 啊呜」与颜文字。
  - **长文本**（设置说明 / 错误消息）：保留官方翻译，仅在句尾轻量加语气词。
  - **技术串**（含 `{0}` 占位符、Markdown 链接、命令 ID、路径、`&&X` 助记键）：保持官方原文，确保功能不受影响。
- 覆盖核心 UI（`main.i18n.json`）与全部 93 个内置扩展。

## 安装

1. 在扩展面板执行 `Extensions: Install from VSIX...`，选择打包产物 `.vsix`。
2. 按 `Ctrl+Shift+P`，运行 `Configure Display Language`，选择 **猫娘中文(猫咪酱)**。
3. 重启 VS Code 生效。

## 构建

```bash
npm install -g @vscode/vsce
npx @vscode/vsce package
```

## 与官方语言包的关系

本包衍生自 MIT 协议下的官方仓库 [microsoft/vscode-loc](https://github.com/microsoft/vscode-loc)，
仅修改了语气风格，术语遵循微软官方译审。详见 `LICENSE.md`。

## 免责声明

本语言包为社区非官方产物，与微软无关。
