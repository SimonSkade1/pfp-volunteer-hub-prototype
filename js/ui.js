// HTML helpers and the toast. Views are functions that return html`…`: interpolated values are escaped unless they
// are html`…` / raw() results themselves, arrays are joined, and null / undefined / false / true render nothing.

class Raw {
  constructor(s) {
    this.s = s
  }
  toString() {
    return this.s
  }
}

export const raw = (s) => new Raw(String(s))

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESCAPES[c])

function piece(value) {
  if (value == null || value === false || value === true) return ''
  if (value instanceof Raw) return value.s
  if (Array.isArray(value)) return value.map(piece).join('')
  return esc(value)
}

export function html(strings, ...values) {
  let out = strings[0]
  values.forEach((value, i) => {
    out += piece(value) + strings[i + 1]
  })
  return new Raw(out)
}

// Icons: Lucide paths (ISC license), drawn at 1em in the current text color.
const ICONS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  right: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  left: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  restart: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  up: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  down: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  sparkles: '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
}

export function icon(name) {
  return raw(
    `<svg class="icon" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`,
  )
}

export const paragraphs = (texts, cls = 'prose') => html`<div class="${cls}">${texts.map((t) => html`<p>${t}</p>`)}</div>`

// A text that may hold links written [label](https://…), e.g. a lead's expectations: escaped, with the links real
// (new tab, external-link icon). Plain text stays plain, so an editor can show and save the text as it is.
export function richText(text) {
  const parts = String(text).split(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/) // text, label, url, text, label, url, …
  let out = ''
  for (let i = 0; i < parts.length; i += 3) {
    out += esc(parts[i])
    if (i + 2 < parts.length)
      out += `<a href="${esc(parts[i + 2])}" target="_blank" rel="noopener">${esc(parts[i + 1])} ${icon('external')}</a>`
  }
  return raw(out)
}

export const crumb = (to, label) => html`<a class="crumb" href="${to}" data-testid="back">${icon('left')} ${label}</a>`

// A stream's or group's membership (state.js); 'sent' is an application to a vacancy.
export function statusBadge(status) {
  if (status === 'member') return html`<span class="badge badge-member">${icon('check')} Joined</span>`
  if (status === 'pending') return html`<span class="badge badge-pending">${icon('clock')} Pending</span>`
  if (status === 'sent') return html`<span class="badge badge-pending">${icon('check')} Sent</span>`
  return ''
}

export const pluralize = (n, word, plural = `${word}s`) => `${n} ${n === 1 ? word : plural}`

export function progressBar(p) {
  const pct = Math.round((100 * p.done) / p.total)
  return html`<div class="progress" role="img" aria-label="${p.done} of ${p.total} done">
      <span class="progress-fill" style="width: ${pct}%"></span>
    </div>
    <p class="progress-text">${p.done} of ${p.total} done</p>`
}

export const initialsOf = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')

// ---- Toast: a short message at the bottom of the screen, for 4 seconds ----

const toastEl = document.createElement('div')
toastEl.className = 'toast'
toastEl.setAttribute('role', 'status')
toastEl.dataset.testid = 'toast'
document.body.append(toastEl)
let toastTimer
let toastShownAt = 0

export function toast(message) {
  toastEl.innerHTML = esc(message)
  toastEl.classList.add('toast-show')
  toastShownAt = Date.now()
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toastEl.classList.remove('toast-show'), 4000)
}

// On a new page: drop an old toast, but not the one the page's own click just raised.
export function dropOldToast() {
  if (Date.now() - toastShownAt > 250) toastEl.classList.remove('toast-show')
}
