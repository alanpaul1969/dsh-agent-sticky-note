/**
 * dsh-sticky-note — Host half.
 *
 * Serves the agent's sticky-note file over `ctx.webServer` at
 * `GET /api/sticky-note` → `{ ok, content, mtime, path }`.
 *
 * The note file is maintained by the DSH agent (watcher / headless worker /
 * in-session catch-up): pending Alan decisions, notices, version updates.
 * Default path: ~/Desktop/DSH-便條紙.md — override with STICKY_NOTE_FILE env.
 *
 * Read-only by design: the agent writes the note; humans read it here (or on
 * the machine's Desktop). No telemetry, no external calls.
 */
import { readFileSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const NOTE_PATH = process.env.STICKY_NOTE_FILE
  || join(homedir(), 'Desktop', 'DSH-便條紙.md')

export default {
  inject: ['webServer'],
  apply(ctx) {
    const webServer = ctx.webServer

    function handler(req, res) {
      let body
      try {
        const st = statSync(NOTE_PATH)
        const content = readFileSync(NOTE_PATH, 'utf8')
        body = { ok: true, content, mtime: Math.round(st.mtimeMs), path: NOTE_PATH }
      } catch (err) {
        body = { ok: false, content: '', mtime: 0, path: NOTE_PATH, error: String(err && err.message || err) }
      }
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify(body))
    }

    ctx.effect(() => webServer.register({ kind: 'exact', path: '/api/sticky-note', handler }))
  },
}
