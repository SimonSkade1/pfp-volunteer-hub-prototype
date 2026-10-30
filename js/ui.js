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

// Brand marks, filled: Discord's logo (Simple Icons, CC0), on the Discord button (Spec 22, round 4).
const MARKS = {
  discord: '<path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>',
}

export function icon(name) {
  const paint = MARKS[name]
    ? 'fill="currentColor"'
    : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
  return raw(
    `<svg class="icon" viewBox="0 0 24 24" width="1em" height="1em" ${paint} aria-hidden="true">${MARKS[name] || ICONS[name]}</svg>`,
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

// A text of paragraphs split by an empty line, each a richText: a lead's expectations.
export const richParagraphs = (text) =>
  String(text)
    .split(/\n\s*\n/)
    .map((paragraph) => html`<p>${richText(paragraph)}</p>`)

// A group's next meeting or a stream's next workshops (round 4): date, place and the event's Luma link. The links are
// made up: styled as the real hub's, they open the "not part of the prototype" toast.
export function eventsCell(label, events, testid) {
  return html`<div class="info-cell" data-testid="${testid}">${icon('calendar')}<div>
    <p><strong>${label}</strong></p>
    <ul class="events">${events.map((event) => html`<li><span>${event.date} · ${event.place}</span>
      <button class="luma-link" type="button" data-action="mock" data-msg="This would open ${event.luma}." data-testid="luma-link">${event.luma} ${icon('external')}</button></li>`)}</ul>
  </div></div>`
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
