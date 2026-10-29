// The demo volunteer's progress, kept in localStorage; the mock content itself is in data.js.
// Reset: open the site with ?reset=1, or use "Restart demo" in the prototype bar (which does just that).

import { findItem, volunteer } from './data.js'

const KEY = 'pfp-volunteer-hub-prototype:v3' // bump when the stored shape changes: old state is dropped

const seed = () => ({
  onboarded: false,
  profile: { about: '', hours: '' }, // the onboarding step (Spec 5); your profile shows it
  joined: {}, // id -> true: what you joined without an application (Getting started)
  applications: {}, // stream, group or vacancy id -> { status: 'pending' | 'accepted' | 'rejected', text, by }
  // (by: 'claude' where Claude accepted it, Spec 14)
  done: {}, // 'streamId/taskId' -> true: your own progress in a stream's pipeline
  claims: {}, // 'groupId/projectId/taskId' -> 'claimed' | 'done': team tasks you took
  discord: false, // the mock "Connect Discord" (Spec 22): once connected, channel lines offer "Open"
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

export const state = load()
const listeners = new Set()

export function subscribe(listener) {
  listeners.add(listener)
}

// Mutate the state in place, then save and re-render.
export function update(fn) {
  fn(state)
  save()
  rerender()
}

// Re-render without saving: after the lead view's mock edits, which change data.js in place (Spec 21: they live only
// in the page), and when the lead view opens or closes an editor.
export function rerender() {
  listeners.forEach((listener) => listener())
}

// ---- Selectors: content combined with the volunteer's state ----

// 'member' | 'pending' | 'none'. Getting started: 'member' once you joined it. A vacancy you applied to stays
// 'pending' (no acceptance in the demo). After a rejection you can apply again: 'none'.
export function membership(id) {
  if (findItem(id)?.kind === 'start') return state.joined[id] ? 'member' : 'none'
  const status = state.applications[id]?.status
  if (status === 'accepted') return 'member'
  if (status === 'pending') return 'pending'
  return 'none'
}

// The mock applicants the lead accepted in the lead view: they count as members from then on.
export const acceptedApplicants = (item) => item.applications.filter((a) => a.status === 'accepted')

// A stream's or group's member count: its mock members, the applicants its lead accepted, and you once you're in.
export function memberCount(item) {
  return item.members.length + acceptedApplicants(item).length + (membership(item.id) === 'member' ? 1 : 0)
}

export function isTaskDone(streamId, task) {
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

// ---- The lead view (Spec 21) ----

// A stream's or group's applications as its lead sees them: yours first (once you've applied), then the mock ones.
// Yours has no pre-screen: the prototype can't run Claude on what you typed (`screen: 'demo'`). Your profile (the
// onboarding's answers, Spec 5.1) comes with it.
export function applicationsFor(item) {
  const own = state.applications[item.id]
  if (!own) return item.applications
  const yours = {
    id: 'you',
    name: `${volunteer.name} (you)`,
    place: volunteer.place,
    when: 'Just now',
    text: own.text,
    about: state.profile.about,
    hours: state.profile.hours,
    screen: 'demo',
    reasons: [],
    status: own.status,
    by: own.by,
    you: true,
  }
  return [yours, ...item.applications]
}

// Where a stream's members are in its pipeline: rows[i] lists those whose next step (the first not done) is tasks[i];
// the last row, those who did every step. Accepted applicants start at the first step; you are where your own progress
// puts you.
export function membersByStep(stream) {
  const total = stream.tasks.length
  const rows = Array.from({ length: total + 1 }, () => [])
  const nextIndex = (isDone) => {
    const i = stream.tasks.findIndex((task) => !isDone(task))
    return i < 0 ? total : i
  }
  stream.members.forEach((member) => rows[nextIndex((task) => member.done.includes(task.id))].push({ name: member.name }))
  acceptedApplicants(stream).forEach((a) => rows[0].push({ name: a.name }))
  if (membership(stream.id) === 'member')
    rows[nextIndex((task) => isTaskDone(stream.id, task))].push({ name: `${volunteer.name} (you)`, you: true })
  return rows
}

// The lead accepts or rejects an application, or undoes that (status 'pending'), also Claude's accept. Yours is your
// own progress and is saved; a mock one changes data.js in place, until a reload.
export function setApplicationStatus(item, applicationId, status) {
  const decide = (application) => {
    application.status = status
    delete application.by // the lead's decision from now on
  }
  if (applicationId === 'you') {
    update((s) => decide(s.applications[item.id]))
    return
  }
  decide(item.applications.find((a) => a.id === applicationId))
  rerender()
}

// The lead's setting (Spec 14): "I review every application" (off) or "Claude accepts clear cases, I review the rest"
// (on). Switched on, Claude accepts the waiting applications it rates Accept, yours too: the demo counts yours as clear
// (Spec 21). Mock, like the lead's other edits; yours is saved. Returns the names of those Claude accepted.
export function setClaudeAccepts(item, on) {
  item.claudeAccepts = on
  const names = []
  if (on)
    for (const application of item.applications)
      if (application.status === 'pending' && application.screen === 'accept') {
        Object.assign(application, { status: 'accepted', by: 'claude' })
        names.push(application.name)
      }
  update((s) => {
    const own = s.applications[item.id]
    if (!on || own?.status !== 'pending') return
    Object.assign(own, { status: 'accepted', by: 'claude' })
    names.unshift(`${volunteer.name} (you)`)
  })
  return names
}

// ---- Actions ----

// Pending, or, where the lead lets Claude accept clear cases (Spec 14, 21), in at once: the demo counts every
// application as clear. Returns true when Claude accepted it.
export function apply(id, text) {
  const byClaude = Boolean(findItem(id).claudeAccepts)
  update((s) => {
    s.applications[id] = byClaude ? { status: 'accepted', text, by: 'claude' } : { status: 'pending', text }
  })
  return byClaude
}

export function accept(id) {
  update((s) => {
    if (s.applications[id]) s.applications[id].status = 'accepted'
  })
}

// Getting started: one click, no form, no pending (Spec 6.3.3).
export function join(id) {
  update((s) => {
    s.joined[id] = true
  })
}

export function connectDiscord() {
  update((s) => {
    s.discord = true
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
