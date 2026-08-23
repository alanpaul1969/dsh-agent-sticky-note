# dsh-sticky-note 📌

[English](#english) | [中文](#中文)

<a id="english"></a>
## What is this?

A **DeepSeek Harness** plugin that shows your agent's **sticky-note file** inside the
DSH Web GUI as a Settings tab — so pending decisions, notices and version
updates are never buried in chat message floods, and stay visible even when you
access the harness remotely (e.g., over Tailscale) from a machine that cannot
see the server's Desktop.

The note file lives on the harness machine (`~/Desktop/DSH-便條紙.md` by default)
and is written/maintained by your agent (background watchers, headless workers,
or the agent itself). This plugin simply renders it in the GUI:

- 🟡 Sticky-paper styling, dark-mode aware
- 🔄 Auto-refresh every 30 s while open + manual refresh button
- 🔌 Zero dependencies — plain Node ESM + browser React from DSH's module table
- 🙈 Read-only, no telemetry, no external calls

<a id="中文"></a>
## 這是什麼？

一個 **DeepSeek Harness（DSH）插件**：把 agent 維護的「便條紙便條紙檔案」顯示在 DSH
Web GUI 的設定分區裡。重要決策事項、通知、版本更新不再被對話訊息淹沒——
透過 Tailscale 遠端連回 GUI 時也看得到。

便條檔案預設在 harness 主機的 `~/Desktop/DSH-便條紙.md`，由你的 agent
（背景 watcher / headless worker / 對話中的 agent）負責寫入與維護；本插件
只負責在 GUI 呈現：

- 🟡 便利貼樣式，支援深色模式
- 🔄 開啟時每 30 秒自動更新 + 手動重新整理
- 🔌 零依賴 — 純 Node ESM + DSH module table 的瀏覽器 React
- 🙈 唯讀、無遙測、無外部連線

---

## Install 安裝

### From a local directory 從本地目錄

```bash
git clone https://github.com/alanpaul1969/dsh-sticky-note.git
dsh plugin --profile web add /path/to/dsh-sticky-note
systemctl --user restart dsh.service   # or restart your harness
```

### From GitHub 固定 commit（建議）

```bash
dsh plugin --profile web add github:alanpaul1969/dsh-sticky-note#<40-char-commit>
systemctl --user restart dsh.service
```

> Requires pnpm ≥ 11 on the host for profile installs.
> Host 需有 pnpm 11+（自動嘗試 corepack pnpm）。

Then open **Settings → 📌 便條紙** in the DSH Web GUI.
安裝後打開 DSH Web GUI 的 **設定 → 📌 便條紙**。

## Configuration 設定

| Env | Default | 說明 |
|---|---|---|
| `STICKY_NOTE_FILE` | `~/Desktop/DSH-便條紙.md` | Note file path / 便條檔案路徑 |

Point the agent's writer at the same path, and the GUI always shows the
latest state. 想換路徑：host 端環境變數 + agent 寫入端設同一個檔即可。

## Note format 便條格式（建議）

Any Markdown works. The convention used by our A2A pipeline:

```markdown
# 📌 DSH 便條紙

## ⏳ 待 Alan 決策 / 注意
- <MM-DD HH:MM> <from>: <one-line summary>（需要：<what decision>）

## ℹ️ 通知（不需動作）
- ...
```

## How it works 運作原理

- **Host half** (`lib/index.js`): registers `GET /api/sticky-note` on
  `ctx.webServer`, returning `{ ok, content, mtime, path }`.
- **Client half** (`lib/client.js`): injects a `settings.section` slot
  (id `sticky-note`) rendering the note; polls every 30 s while open.

## Uninstall 移除

```bash
dsh plugin --profile web remove dsh-sticky-note
```

## License

MIT
