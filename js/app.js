// Boot: render the current route into #app, re-render on every route or state change, and route clicks and form
// submits through `data-action` / `data-form` attributes (event delegation: views are plain HTML strings).

import { findItem, findStream } from './data.js'
import { href, navigate, parseRoute } from './router.js'
import {
  accept,
  apply,
  completeOnboarding,
  progress,
  restart,
  sendLeadApplication,
  setClaim,
  setDone,
  state,
  subscribe,
} from './state.js'
import { esc } from './ui.js'
import { applyView, leadView } from './views/apply.js'
import { emailView } from './views/email.js'
import { groupView } from './views/group.js'
import { homeView } from './views/home.js'
import { onboardingView } from './views/onboarding.js'
import { notFound, streamView, taskView } from './views/stream.js'

const app = document.getElementById('app')
let lastPath = null

// ---- Toast ----

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
  toastTimer = setTimeout(hideToast, 4000)
}

function hideToast() {
  toastEl.classList.remove('toast-show')
}

function view(route) {
  switch (route.name) {
    case 'email':
      return emailView()
    case 'onboarding':
      return onboardingView()
    case 'home':
      return homeView()
    case 'stream':
      return streamView(route.id)
    case 'task':
      return taskView(route.streamId, route.taskId)
    case 'group':
      return groupView(route.id)
    case 'apply':
      return applyView(route.id)
    case 'lead':
      return leadView(route.kind)
    default:
      return notFound()
  }
}

function render() {
  const route = parseRoute(location.hash)
  if (route.name === 'start') {
    location.replace(state.onboarded ? href.home : href.email) // fires hashchange, which renders
    return
  }
  app.innerHTML = String(view(route))
  const path = location.hash.split('?')[0]
  if (path !== lastPath) {
    window.scrollTo(0, 0)
    lastPath = path
    if (Date.now() - toastShownAt > 250) hideToast() // a new page drops old toasts, not the one its own click just raised
  }
}

// ---- Clicks: <… data-action="name" data-…> ----
// Where an action or form moves to another page, it navigates first: the state change then renders the destination
// directly (location.hash changes at once, the hashchange render follows), without a flash of the old page.

const actions = {
  restart() {
    restart()
    lastPath = null
    if (location.hash === href.email) render()
    else navigate(href.email)
  },
  mock({ msg }) {
    toast(`Not part of the prototype. ${msg}`)
  },
  copy({ text }) {
    navigator.clipboard
      ?.writeText(text)
      .then(() => toast(`Link copied: ${text}`))
      .catch(() => toast(`Copy this link: ${text}`)) ?? toast(`Copy this link: ${text}`)
  },
  done({ stream: streamId, task: taskId }) {
    navigate(href.stream(streamId))
    setDone(streamId, taskId, true)
    const stream = findStream(streamId)
    const task = stream.tasks.find((t) => t.id === taskId)
    const next = progress(stream).next
    toast(next ? `Done: ${task.title}. Up next: ${next.title}.` : `Done: ${task.title}. That was the last step!`)
  },
  undo({ stream, task }) {
    setDone(stream, task, false)
  },
  accept({ id }) {
    accept(id)
    const item = findItem(id)
    toast(`You’re in! ${item.lead.split(' ')[0]} accepted you, and ${item.discord} on our Discord is open to you now.`)
  },
  claim({ key }) {
    setClaim(key, 'claimed')
    toast('You claimed this task. The others see it on the board.')
  },
  'claim-done'({ key }) {
    setClaim(key, 'done')
  },
  reopen({ key }) {
    setClaim(key, 'claimed')
  },
  unclaim({ key }) {
    setClaim(key, null)
  },
}

document.addEventListener('click', (event) => {
  const el = event.target.closest('[data-action]')
  if (!el || !actions[el.dataset.action]) return
  event.preventDefault()
  actions[el.dataset.action](el.dataset, el)
})

// ---- Forms: <form data-form="name" data-…> ----

const forms = {
  onboarding(data) {
    navigate(href.home)
    completeOnboarding({ about: data.get('about').trim(), hopes: data.get('hopes').trim() })
  },
  apply(data, { id }) {
    navigate(href.item(findItem(id)))
    apply(id, data.get('text').trim())
    toast('Application sent.')
  },
  lead(data, { kind }) {
    sendLeadApplication(kind, Object.fromEntries(data))
    window.scrollTo(0, 0)
  },
}

document.addEventListener('submit', (event) => {
  const form = event.target.closest('form[data-form]')
  if (!form || !forms[form.dataset.form]) return
  event.preventDefault()
  forms[form.dataset.form](new FormData(form), form.dataset)
})

window.addEventListener('hashchange', render)
subscribe(render)
render()
