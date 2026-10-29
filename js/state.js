// The demo volunteer's progress, kept in localStorage; the mock content itself is in data.js.
// Reset: open the site with ?reset=1, or use "Restart demo" in the prototype bar.

import { findItem } from './data.js'

const KEY = 'pfp-volunteer-hub-prototype:v1' // bump when the stored shape changes: old state is dropped

const seed = () => ({
  onboarded: false,
  profile: { about: '', hopes: '' }, // the onboarding step
  applications: {}, // stream or group id -> { status: 'pending' | 'accepted', text }
  done: {}, // 'streamId/taskId' -> true: your own progress in a stream's pipeline
  claims: {}, // 'groupId/projectId/taskId' -> 'claimed' | 'done': team tasks you took
  leadApplications: {}, // 'group' | 'stream' -> the submitted form fields
})

function handleResetParam() {
  const params = new URLSearchParams(location.search)
  if (params.get('reset') !== '1') return
  localStorage.removeItem(KEY)
  params.delete('reset')
  const query = params.toString()
  history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`)
}

function load() {
  handleResetParam()
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...seed(), ...JSON.parse(raw) }
  } catch {
    // unreadable state: start over
  }
  return seed()
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // storage blocked or full: the demo still works for this visit
  }
}

export let state = load()
const listeners = new Set()

export function subscribe(listener) {
  listeners.add(listener)
}

// Mutate the state in place, then save and re-render.
export function update(fn) {
  fn(state)
  save()
  listeners.forEach((listener) => listener())
}

export function restart() {
  localStorage.removeItem(KEY)
  state = seed()
}

// ---- Selectors: content combined with the volunteer's state ----

// 'member' | 'pending' | 'none'. Everyone is in Getting started.
export function membership(id) {
  if (findItem(id)?.kind === 'start') return 'member'
  const application = state.applications[id]
  if (!application) return 'none'
  return application.status === 'accepted' ? 'member' : 'pending'
}

// A group's member count, you included once you're in.
export function memberCount(group) {
  return group.members.length + (membership(group.id) === 'member' ? 1 : 0)
}

export function hasApplied() {
  return Object.keys(state.applications).length > 0
}

export function isTaskDone(streamId, task) {
  if (task.doneWhen === 'applied' && hasApplied()) return true
  return Boolean(state.done[`${streamId}/${task.id}`])
}

// Your progress through a stream's pipeline: the first task not done is the next one.
export function progress(stream) {
  const done = stream.tasks.filter((task) => isTaskDone(stream.id, task)).length
  const next = stream.tasks.find((task) => !isTaskDone(stream.id, task)) || null
  return { done, total: stream.tasks.length, next }
}

export const teamTaskKey = (groupId, projectId, taskId) => `${groupId}/${projectId}/${taskId}`

// A team task as the volunteer sees it: { owner, done, mine }. Your own claim overrides the mock data.
export function teamTask(group, project, task) {
  const claim = state.claims[teamTaskKey(group.id, project.id, task.id)]
  if (claim) return { owner: 'You', done: claim === 'done', mine: true }
  return { owner: task.owner, done: task.done, mine: false }
}

export function projectCounts(group, project) {
  const views = project.tasks.map((task) => teamTask(group, project, task))
  return {
    done: views.filter((t) => t.done).length,
    open: views.filter((t) => !t.owner).length,
    total: views.length,
  }
}

// ---- Actions ----

export function apply(id, text) {
  update((s) => {
    s.applications[id] = { status: 'pending', text }
  })
}

export function accept(id) {
  update((s) => {
    if (s.applications[id]) s.applications[id].status = 'accepted'
  })
}

export function setDone(streamId, taskId, done) {
  update((s) => {
    if (done) s.done[`${streamId}/${taskId}`] = true
    else delete s.done[`${streamId}/${taskId}`]
  })
}

export function setClaim(key, claim) {
  update((s) => {
    if (claim) s.claims[key] = claim
    else delete s.claims[key]
  })
}

export function completeOnboarding(profile) {
  update((s) => {
    s.profile = profile
    s.onboarded = true
  })
}

export function sendLeadApplication(kind, fields) {
  update((s) => {
    s.leadApplications[kind] = fields
  })
}

