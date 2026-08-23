# Agent Protocol — How agents write & maintain the sticky note

> 本文件給「任何要維護便條紙的 agent / 自動化腳本」看。
> 便條檔案預設路徑：`~/Desktop/DSH-便條紙.md`（可用環境變數 `STICKY_NOTE_FILE` 覆蓋，
> host 端與寫入端必須指向同一個檔）。

## 檔案結構約定

```markdown
# 📌 DSH 便條紙
> （說明 header，可有可無）

## ⏳ 待 Alan 決策 / 注意          ← 需要 Alan 決策/批准/知情的項目
- <MM-DD HH:MM> <topic>: <一句話摘要>（需要：<具體要 Alan 做什麼>）

## ℹ️ 通知（不需動作）              ← 純告知，不需要 Alan 回應
- <日期> <一句話>

## 🗄️ 已解決歸檔（可選）            ← 解決的項目移到這裡（或直接刪除）
```

## 維護規則（給 agent）

1. **誰該寫**：任何流程產生「需要 Alan 決策／批准／注意」的事項時——背景
   watcher、headless worker、對話中的 session 都一樣。
2. **怎麼插入**：在 `⏳ 待 Alan 決策 / 注意` 標題後插入一行，格式：
   `- <MM-DD HH:MM> <topic>: <summary>（需要：<what decision>）`
   shell 範例：
   ```bash
   sed -i "/^## ⏳ 待 Alan 決策/a - $(date +'%m-%d %H:%M') openrouter: 新版本發佈（需要：說「升級」）" "$NOTE"
   ```
3. **怎麼結案**：Alan 在「任何 session 的對話」或直接編輯檔案回覆後，agent：
   - 執行決策內容 → 把該行從待決策區移除（或移入歸檔區）
   - 同步更新 GUI 的 Todo list（`todo_write`），讓面板與便條一致
4. **絕對禁止**：刪除別的 writer 寫入且未解決的項目；重複貼同一件事
   （貼之前先 grep 檢查是否已存在）。
5. **純通知**（不需 Alan 動作）：寫進 `ℹ️ 通知` 區，例如版本更新、系統狀態。

## 多寫入方共存

| Writer | 觸發 | 典型內容 |
|---|---|---|
| `a2a-watch.sh`（systemd timer 每 20 分鐘） | npm 發現新版 dsh | ⬆️ 版本更新通知 |
| headless A2A worker | inbox 有需 Alan 決策的信 | ⏳ 決策請求 |
| 對話中的 session | catch-up / 使用者要求 | 全部類型 |
| Alan 本人 | 直接編輯 | 回覆、手動備註 |

併發保護：多個 writer 同時 `sed -i` 可能互相覆蓋。高頻 writer 建議用
`flock` 鎖同一個 lockfile（參考 `a2a-watch.sh` 的做法）。

## GUI 顯示端

本 repo 的插件部分（`lib/index.js` + `lib/client.js`）只是**唯讀顯示器**：
host 提供 `GET /api/sticky-note`，client 在設定 → 📌 便條紙 渲染，30 秒自動更新。
它不改檔案、不做決策——所有內容都來自上述協議的寫入方。
