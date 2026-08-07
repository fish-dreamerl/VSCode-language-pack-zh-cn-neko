# Neko Chinese (猫娘中文) Language Pack

猫娘风格的 Visual Studio Code 简体中文语言包（`zh-cn-neko`）。
以微软官方简体中文语言包为底本，术语与官方一致，仅叠加猫娘语气与颜文字。

- 作者：fish-dreamerl
- 仓库：[https://github.com/fish-dreamerl/VSCode-language-pack-zh-cn-neko](https://github.com/fish-dreamerl/VSCode-language-pack-zh-cn-neko)

## 特性

- 以官方 `zh-cn` 语言包为底本，Git / Workspace / 断点等专业术语保持官方译法，保证正确性。
- 分层猫娘化：
  - **短界面文本**（按钮 / 菜单 / 命令标题 / 通知 / 对话框）：重度猫娘化，追加「喵 / 喵~ / 呢 / 啊呜」与颜文字。
  - **长文本**（设置说明 / 错误消息）：保留官方翻译，仅在句尾轻量加语气词。
  - **技术串**（含 `{0}` 占位符、Markdown 链接、命令 ID、路径、`&&X` 助记键）：保持官方原文，确保功能不受影响。
- 覆盖核心 UI（`main.i18n.json`）与全部 93 个内置扩展。

## 安装教程

**前置要求**：VS Code 版本 **≥ 1.131**（`engines.vscode: ^1.131.0`）。

### 一、安装语言包（三选一）

- **方法 1：VSIX 文件安装（推荐）**
  1. 打开 VS Code，按 `Ctrl+Shift+P` 打开命令面板
  2. 选择 `Extensions: Install from VSIX...`
  3. 选择打包产物 `vscode-language-pack-zh-cn-neko-1.131.4.vsix`
  4. 等待底部提示安装完成

- **方法 2：命令行安装**
  ```bash
  code --install-extension vscode-language-pack-zh-cn-neko-1.131.4.vsix --force
  ```

- **方法 3：手动放置文件**
  将解压出的扩展目录放入 VS Code 扩展目录（Windows：`%USERPROFILE%\.vscode\extensions\`）。

**二、切换显示语言**
1. 按 `Ctrl+Shift+P`，运行 **`Configure Display Language`**
2. 选择 **猫娘中文（Neko Chinese）**（languageId 为 `zh-cn-nekko`）
3. **完全退出并重新打开** VS Code（彻底退出进程，而非仅关闭窗口）

> 若列表未出现：确认已安装后重试；或在 `%USERPROFILE%\.vscode\argv.json` 写入 `"locale": "zh-cn-nekko"` 再重开。

**三、安装到另一台电脑**
把 `.vsix` 拷贝过去，重复「方法 1 或 2」即可；该机 VS Code 需 ≥ 1.131。

**四、恢复中文原版**
在 `Configure Display Language` 中改回 **简体中文**（`zh-cn`）并重启即可，本包不覆盖官方语言包。

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
