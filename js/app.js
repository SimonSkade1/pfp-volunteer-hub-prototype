// Boot: render the current route into #app, re-render on every route or state change, and route clicks and form
// submits through `data-action` / `data-form` attributes (event delegation: views are plain HTML strings).

import { findItem, findStream, firstName } from './data.js'
import { href, navigate, parseRoute } from './router.js'
import { accept, apply, completeOnboarding, connectDiscord, join, progress, setClaim, setDone, state, subscribe } from './state.js'
import { dropOldToast, toast } from './ui.js'
import { applyView } from './views/apply.js'
import { emailView } from './views/email.js'
import { groupView } from './views/group.js'
import { homeView } from './views/home.js'
import { manageActions, manageForms, manageView } from './views/manage.js'
import { onboardingView } from './views/onboarding.js'
import { meView, personView } from './views/profile.js'
import { notFound, streamView, taskView } from './views/stream.js'
import { vacanciesView, vacancyView } from './views/vacancies.js'

const app = document.getElementById('app')
let lastPath = null

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
    case 'vacancies':
      return vacanciesView()
    case 'vacancy':
      return vacancyView(route.id)
    case 'apply':
      return applyView(route.id)
    case 'me':
      return meView()
    case 'person':
      return personView(route.id)
    case 'manage':
      return manageView(route.id)
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
    dropOldToast()
  }
}

// ---- Clicks: <… data-action="name" data-…> ----
// Where an action or form moves to another page, it navigates first: the state change then renders the destination
// directly (location.hash changes at once, the hashchange render follows), without a flash of the old page.

const actions = {
  restart() {
    // A fresh load with ?reset=1 (state.js): it also drops the lead view's in-page edits of the mock content.
    location.replace(`${location.pathname}?reset=1${href.email}`)
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
    toast(
      state.discord
        ? `You’re in! ${firstName(item.lead)} accepted you, and ${item.discord} on our Discord is open to you now.`
        : `You’re in! ${firstName(item.lead)} accepted you.`,
    )
  },
  join({ id }) {
    join(id)
    toast(`You joined ${findItem(id).title}.`)
  },
  'connect-discord'({ channel }) {
    connectDiscord()
    toast(`Connected. In the hub, you’d sign in to Discord once, and our bot would add you to our server with ${channel} open to you.`)
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
  ...manageActions, // the lead view's
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
    completeOnboarding({ about: data.get('about').trim(), hours: data.get('hours') })
  },
  apply(data, { id }) {
    const item = findItem(id)
    navigate(href.item(item))
    if (!apply(id, data.get('text').trim())) toast('Application sent.')
    else if (state.discord) toast(`You’re in! Claude accepted your application, and ${item.discord} on our Discord is open to you now.`)
    else toast('You’re in! Claude accepted your application.')
  },
  ...manageForms, // the lead view's
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
