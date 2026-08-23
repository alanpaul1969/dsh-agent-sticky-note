/**
 * dsh-sticky-note — Client half.
 *
 * Registers one tab in the settings dialog (`settings.section`, id
 * "sticky-note", label "📌 便條紙") that renders the agent's sticky-note file,
 * fetched from `GET /api/sticky-note`. Auto-refreshes every 30 s while the
 * settings dialog is open, plus a manual refresh button.
 */
window.__ModuleLoader__.load({
  id: 'dsh-agent-sticky-note',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports

    var React = require('react')

    // CSS — injected once, tagged for the module system's style bookkeeping.
    var STYLE_TAG = 'dsh-sticky-note/settings.css'
    if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css="' + STYLE_TAG + '"]') === null) {
      var tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-sticky-note'
      tag.dataset.pluginCss = STYLE_TAG
      tag.textContent = [
        '.dsh-sticky { display: flex; flex-direction: column; gap: 8px; padding: 12px 16px; max-width: 860px; }',
        '.dsh-sticky-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }',
        '.dsh-sticky-title { font-weight: 600; font-size: 15px; }',
        '.dsh-sticky-meta { font-size: 12px; opacity: 0.6; }',
        '.dsh-sticky-refresh { cursor: pointer; border: 1px solid currentColor; background: transparent; color: inherit; border-radius: 6px; padding: 2px 10px; font-size: 12px; }',
        '.dsh-sticky-refresh:hover { opacity: 0.85; }',
        '.dsh-sticky-paper { background: #fff9c2; color: #4a3f00; border: 1px solid #e6d87a; border-left: 6px solid #f0c93c; border-radius: 10px; padding: 16px 18px; white-space: pre-wrap; word-break: break-word; font-size: 13px; line-height: 1.65; box-shadow: 2px 3px 10px rgba(0,0,0,0.12); min-height: 120px; }',
        '@media (prefers-color-scheme: dark) { .dsh-sticky-paper { background: #3a3517; color: #f5eecb; border-color: #6b601f; border-left-color: #c9a92c; } }',
        '.dsh-sticky-error { color: #e5534b; font-size: 12px; }',
      ].join('\n')
      document.head.appendChild(tag)
    }

    function StickyTab() {
      var state = React.useState({ content: '', mtime: 0, error: null, loading: true, ts: 0 })
      var s = state[0]
      var set = state[1]

      var load = function () {
        fetch('/api/sticky-note', { cache: 'no-store' })
          .then(function (r) { return r.json() })
          .then(function (d) {
            set({
              content: (d && d.content) || '',
              mtime: (d && d.mtime) || 0,
              error: d && d.ok === false ? ((d.error || '讀取失敗') + ' · ' + (d.path || '')) : null,
              loading: false,
              ts: Date.now(),
            })
          })
          .catch(function () {
            set(function (x) { return Object.assign({}, x, { error: '網路錯誤：無法連到 /api/sticky-note', loading: false }) })
          })
      }

      React.useEffect(function () {
        load()
        var t = setInterval(load, 30000)
        return function () { clearInterval(t) }
      }, [])

      var mtimeText = s.mtime ? new Date(s.mtime).toLocaleString() : ''

      return React.createElement('div', { className: 'dsh-sticky' },
        React.createElement('div', { className: 'dsh-sticky-head' },
          React.createElement('span', { className: 'dsh-sticky-title' }, '📌 DSH 便條紙'),
          React.createElement('button', { className: 'dsh-sticky-refresh', onClick: load }, '重新整理'),
          React.createElement('span', { className: 'dsh-sticky-meta' },
            mtimeText ? ('便條更新於 ' + mtimeText) : (s.loading ? '載入中…' : '')),
        ),
        s.error
          ? React.createElement('div', { className: 'dsh-sticky-error' }, '⚠️ ' + s.error)
          : null,
        React.createElement('div', { className: 'dsh-sticky-paper' },
          s.content || (s.loading ? '載入中…' : '（便條是空的）')),
      )
    }

    var inject = ['slots']

    function apply(ctx) {
      ctx.slots.inject('settings.section', function () {
        return ctx.slots.register(
          { name: 'settings.section', id: 'sticky-note', order: 1, label: function () { return '📌 便條紙' } },
          StickyTab,
        )
      })
    }

    exports.inject = inject
    exports.apply = apply
    return module.exports
  },
})
