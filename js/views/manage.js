// The lead view (Spec 21), reached by the demo's "view as" switch on a stream's or group's page. First the lead's
// expectations (Spec 7.1), editable, and who accepts applications (Spec 14): the lead, or Claude for clear cases. Then
// the applications, the same for both kinds: each with the applicant's profile (Spec 5.1) and Claude's pre-screen
// (Spec 14) with its reasons, accept / reject; Claude's accepts are marked, and the lead can undo them.
// Then, for a stream: where its members are in its steps, and an editor for its description, steps and resources;
// for a group: its projects' task boards and a form to create a project. Editing is mock: it changes the content in
// data.js in place, so the volunteer side shows it at once, until the page is reloaded. No explanatory text (Spec 23.2).

import { findGroup, findItem, findStream, volunteer } from '../data.js'
import { href } from '../router.js'
import { applicationsFor, memberCount, membersByStep, rerender, setApplicationStatus, setClaudeAccepts } from '../state.js'
import { html, icon, paragraphs, richParagraphs, toast } from '../ui.js'
import { projectBoard } from './group.js'
import { hubPage, pageTop, viewSwitch } from './layout.js'
import { notFound } from './stream.js'

// The open editor, if any: { id: the stream or group, key: 'expectations' | 'description' | 'step:<task id>' |
// 'step:new' | 'resource:<index>' | 'resource:new' | 'project:new' }. One at a time; every change and every new page
// closes it.
let editing = null
const isEditing = (item, key) => editing?.id === item.id && editing.key === key
window.addEventListener('hashchange', () => {
  editing = null // registered before app.js's render on hashchange, so it runs first
})

export function manageView(id) {
  const item = findItem(id)
  if (item?.kind !== 'stream' && item?.kind !== 'group') return notFound() // Getting started and vacancies have none
  const isStream = item.kind === 'stream'

  return hubPage(html`
    ${pageTop(href.home, 'Your hub', viewSwitch(item, 'lead'))}
    <div class="page-head" data-testid="manage-${item.id}">
      <p class="eyebrow">Lead view · ${isStream ? 'Stream' : 'Local group'}</p>
      <h1>${item.title}</h1>
    </div>
    ${expectationsEditor(item)}${claudeSetting(item)}
    ${applicationsPanel(item)}
    ${isStream ? html`${membersPanel(item)}${editPanel(item)}` : projectsPanel(item)}
  `)
}

// ---- How people get in (Spec 7.1, 14): the lead's expectations and who accepts, for streams and groups ----

// The text applicants see on the apply page, and Claude checks applications against (Spec 14: a stricter text is a
// stricter filter). It may hold links written [label](https://…): the editor shows them so.
function expectationsEditor(item) {
  const open = isEditing(item, 'expectations')
  return html`<section class="edit-block" data-testid="edit-expectations">
    <div class="edit-block-head">
      <h2 class="edit-block-title">What you expect from applicants</h2>
      ${open ? '' : html`<button class="btn btn-secondary btn-small" type="button" data-action="edit" data-id="${item.id}" data-key="expectations" data-testid="expectations-edit">Edit</button>`}
    </div>
    ${open
      ? html`<form class="edit-form edit-form-box" data-form="expectations" data-id="${item.id}" data-testid="expectations-form">
          <label class="field">
            <textarea name="expectations" rows="6" required aria-label="What you expect from applicants" data-autofocus data-testid="expectations-text">${item.expectations}</textarea>
          </label>
          ${formButtons('Save')}
        </form>`
      : html`<div class="prose prose-edit">${richParagraphs(item.expectations)}</div>`}
  </section>`
}

const SETTINGS = [
  { on: false, label: 'I review every application', testid: 'setting-lead' },
  { on: true, label: 'Claude accepts clear cases, I review the rest', tag: 'Recommended', testid: 'setting-claude' },
]

// One click switches (no Save), like a radio group; the choice is the whole label.
function claudeSetting(item) {
  return html`<section class="edit-block" data-testid="claude-setting">
    <h2 class="edit-block-title" id="setting-${item.id}">Who accepts applications</h2>
    <div class="setting" role="radiogroup" aria-labelledby="setting-${item.id}">
      ${SETTINGS.map(
        (option) => html`<label class="setting-option" data-action="claude-setting" data-id="${item.id}" data-on="${option.on ? 'on' : ''}" data-testid="${option.testid}">
          <input type="radio" name="setting-${item.id}" ${Boolean(item.claudeAccepts) === option.on ? 'checked' : ''}>
          <span>${option.label}${option.tag ? html` <span class="tag tag-small tag-nudge">${option.tag}</span>` : ''}</span>
        </label>`,
      )}
    </div>
  </section>`
}

// ---- Applications (Spec 13, 14), the same for streams and groups ----

const SCREENS = { accept: 'Accept', review: 'Needs your review', spam: 'Spam' }

function applicationsPanel(item) {
  const all = applicationsFor(item)
  const waiting = all.filter((a) => a.status === 'pending')
  const decided = all.filter((a) => a.status !== 'pending')
  return html`<section class="block" data-testid="applications">
    <h2 class="block-title">Applications${waiting.length ? html` <span class="count">${waiting.length}</span>` : ''}</h2>
    ${waiting.length
      ? html`<ul class="applications">${waiting.map((a) => applicationCard(item, a))}</ul>`
      : html`<p class="empty" data-testid="no-applications">No applications are waiting for you.</p>`}
    ${decided.length
      ? html`<h3 class="subhead">Decided</h3>
          <ul class="decided" data-testid="decided">
            ${decided.map((a) => html`<li data-testid="decided-${a.id}">
              <span class="decided-name">${a.name}</span>
              ${decidedBadge(a)}
              <button class="btn-link" type="button" ${decideAttrs(item, a, 'pending')} data-testid="undo-decision">Undo</button>
            </li>`)}
          </ul>`
      : ''}
  </section>`
}

function decidedBadge(a) {
  if (a.status === 'rejected') return html`<span class="badge badge-rejected">Rejected</span>`
  if (a.by === 'claude') return html`<span class="badge badge-member">${icon('sparkles')} Accepted by Claude</span>`
  return html`<span class="badge badge-member">${icon('check')} Accepted</span>`
}

const decideAttrs = (item, a, status) => html`data-action="decide" data-id="${item.id}" data-app="${a.id}" data-status="${status}"`

function applicationCard(item, a) {
  return html`<li class="application" data-testid="application-${a.id}">
    <div class="application-head">
      <p class="application-name">${a.name}</p>
      <p class="application-meta">${[a.place, a.hours && `${a.hours} a week`, a.when].filter(Boolean).join(' · ')}</p>
    </div>
    <p class="mini-label">Application</p>
    <p class="application-text">${a.text}</p>
    <p class="mini-label">Profile</p>
    <p class="application-about">${a.about || html`<span class="muted">Left empty.</span>`}</p>
    ${screenBox(a)}
    <div class="application-actions">
      <button class="btn btn-outline btn-small" type="button" ${decideAttrs(item, a, 'accepted')} data-testid="accept-application">${icon('check')} Accept</button>
      <button class="btn btn-secondary btn-small" type="button" ${decideAttrs(item, a, 'rejected')} data-testid="reject-application">Reject</button>
    </div>
  </li>`
}

// Claude's suggestion and its reasons. Your own application is the demo's exception: nothing judged what you typed.
function screenBox(a) {
  if (a.screen === 'demo')
    return html`<div class="screen screen-demo" data-testid="screen">
      <p class="screen-head">${icon('sparkles')} Claude’s pre-screen <span class="demo-tag">Demo</span></p>
      <p class="screen-text">In the hub, Claude pre-screens this one too. The prototype can’t judge what you typed, so it’s your call.</p>
    </div>`
  return html`<div class="screen screen-${a.screen}" data-testid="screen">
    <p class="screen-head">${icon('sparkles')} Claude’s pre-screen: <strong>${SCREENS[a.screen]}</strong></p>
    <ul class="screen-reasons">${a.reasons.map((reason) => html`<li>${reason}</li>`)}</ul>
  </div>`
}

// ---- A stream: where its members are, and the editor for its content ----

function membersPanel(stream) {
  const rows = membersByStep(stream)
  const row = (mark, title, people, testid) => html`<li class="funnel-row" data-testid="${testid}">
    <div class="funnel-head">${mark}<span class="funnel-title">${title}</span><span class="funnel-count">${people.length}</span></div>
    ${people.length ? html`<ul class="chips">${people.map((p) => html`<li class="chip ${p.you ? 'chip-you' : ''}">${p.name}</li>`)}</ul>` : ''}
  </li>`
  return html`<section class="block" data-testid="members-progress">
    <h2 class="block-title">Members <span class="count count-quiet">${memberCount(stream)}</span></h2>
    <ol class="funnel">
      ${stream.tasks.map((task, i) => row(html`<span class="funnel-mark">${i + 1}</span>`, task.title, rows[i], `funnel-${task.id}`))}
      ${row(html`<span class="funnel-mark funnel-mark-done">${icon('check')}</span>`, 'All steps done', rows[stream.tasks.length], 'funnel-done')}
    </ol>
  </section>`
}

function editPanel(stream) {
  return html`<section class="block" data-testid="edit-stream">
    <h2 class="block-title">Edit the stream</h2>
    ${descriptionEditor(stream)}${stepsEditor(stream)}${resourcesEditor(stream)}
  </section>`
}

function descriptionEditor(stream) {
  const open = isEditing(stream, 'description')
  return html`<div class="edit-block" data-testid="edit-description">
    <div class="edit-block-head">
      <h3 class="edit-block-title">Description</h3>
      ${open ? '' : html`<button class="btn btn-secondary btn-small" type="button" data-action="edit" data-id="${stream.id}" data-key="description" data-testid="description-edit">Edit</button>`}
    </div>
    ${open
      ? html`<form class="edit-form edit-form-box" data-form="description" data-id="${stream.id}" data-testid="description-form">
          <label class="field">
            <textarea name="description" rows="8" required aria-label="Description" data-autofocus data-testid="description-text">${stream.description.join('\n\n')}</textarea>
          </label>
          ${formButtons('Save')}
        </form>`
      : paragraphs(stream.description, 'prose prose-edit')}
  </div>`
}

// The task sequence: move, edit, remove, add. A stream keeps at least one step.
function stepsEditor(stream) {
  const last = stream.tasks.length - 1
  const adding = isEditing(stream, 'step:new')
  return html`<div class="edit-block" data-testid="edit-steps">
    <h3 class="edit-block-title">Steps</h3>
    <ol class="edit-list">
      ${stream.tasks.map((task, i) =>
        isEditing(stream, `step:${task.id}`)
          ? html`<li class="edit-row is-editing">${stepForm(stream, task)}</li>`
          : html`<li class="edit-row" data-testid="edit-step-${task.id}">
              <span class="edit-num">${i + 1}</span>
              <div class="edit-main">
                <p class="edit-title">${task.title}</p>
                <p class="edit-sub">${[task.time, task.summary].filter(Boolean).join(' · ')}</p>
              </div>
              <div class="edit-tools">
                <button class="icon-btn" type="button" data-action="move-step" data-id="${stream.id}" data-task="${task.id}" data-by="-1" aria-label="Move up" ${i === 0 ? 'disabled' : ''} data-testid="step-up">${icon('up')}</button>
                <button class="icon-btn" type="button" data-action="move-step" data-id="${stream.id}" data-task="${task.id}" data-by="1" aria-label="Move down" ${i === last ? 'disabled' : ''} data-testid="step-down">${icon('down')}</button>
                <button class="btn-link" type="button" data-action="edit" data-id="${stream.id}" data-key="step:${task.id}" data-testid="step-edit">Edit</button>
                <button class="btn-link remove" type="button" data-action="remove-step" data-id="${stream.id}" data-task="${task.id}" ${last === 0 ? 'disabled' : ''} data-testid="step-remove">Remove</button>
              </div>
            </li>`,
      )}
      ${adding ? html`<li class="edit-row is-editing">${stepForm(stream, null)}</li>` : ''}
    </ol>
    ${adding ? '' : addButton(stream, 'step:new', 'Add a step', 'add-step')}
  </div>`
}

function stepForm(stream, task) {
  return html`<form class="edit-form" data-form="step" data-id="${stream.id}" data-task="${task?.id}" data-testid="step-form">
    <p class="edit-form-title">${task ? 'Edit step' : 'New step'}</p>
    <div class="field-row">
      <label class="field field-grow"><span class="label-sm">Title</span>
        <input name="title" value="${task?.title}" required data-autofocus data-testid="step-title"></label>
      <label class="field field-narrow"><span class="label-sm">Time</span>
        <input name="time" value="${task?.time}" placeholder="e.g. 30 min" data-testid="step-time"></label>
    </div>
    <label class="field"><span class="label-sm">Summary</span>
      <input name="summary" value="${task?.summary}" placeholder="One line: what this step is about" data-testid="step-summary"></label>
    <label class="field"><span class="label-sm">How to do it</span>
      <textarea name="howto" rows="5" required placeholder="One instruction per line" data-testid="step-howto">${task ? task.steps.join('\n') : ''}</textarea></label>
    ${formButtons(task ? 'Save' : 'Add step')}
  </form>`
}

function resourcesEditor(stream) {
  const adding = isEditing(stream, 'resource:new')
  return html`<div class="edit-block" data-testid="edit-resources">
    <h3 class="edit-block-title">Resources</h3>
    ${stream.resources.length || adding
      ? html`<ul class="edit-list">
          ${stream.resources.map((resource, i) =>
            isEditing(stream, `resource:${i}`)
              ? html`<li class="edit-row is-editing">${resourceForm(stream, resource, i)}</li>`
              : html`<li class="edit-row" data-testid="edit-resource-${i}">
                  <span class="resource-type">${resource.type}</span>
                  <div class="edit-main">
                    <p class="edit-title">${resource.title}${resource.href ? html` ${icon('external')}` : ''}</p>
                    ${resource.note ? html`<p class="edit-sub">${resource.note}</p>` : ''}
                  </div>
                  <div class="edit-tools">
                    <button class="btn-link" type="button" data-action="edit" data-id="${stream.id}" data-key="resource:${i}" data-testid="resource-edit">Edit</button>
                    <button class="btn-link remove" type="button" data-action="remove-resource" data-id="${stream.id}" data-index="${i}" data-testid="resource-remove">Remove</button>
                  </div>
                </li>`,
          )}
          ${adding ? html`<li class="edit-row is-editing">${resourceForm(stream, null, '')}</li>` : ''}
        </ul>`
      : html`<p class="empty">No resources yet.</p>`}
    ${adding ? '' : addButton(stream, 'resource:new', 'Add a resource', 'add-resource')}
  </div>`
}

function resourceForm(stream, resource, index) {
  return html`<form class="edit-form" data-form="resource" data-id="${stream.id}" data-index="${index}" data-testid="resource-form">
    <p class="edit-form-title">${resource ? 'Edit resource' : 'New resource'}</p>
    <div class="field-row">
      <label class="field field-grow"><span class="label-sm">Title</span>
        <input name="title" value="${resource?.title}" required data-autofocus data-testid="resource-title"></label>
      <label class="field field-narrow"><span class="label-sm">Type</span>
        <input name="type" value="${resource?.type}" placeholder="e.g. Guide" data-testid="resource-type"></label>
    </div>
    <label class="field"><span class="label-sm">Note</span>
      <input name="note" value="${resource?.note}" placeholder="One line: what it is" data-testid="resource-note"></label>
    <label class="field"><span class="label-sm">Link <span class="optional">Optional</span></span>
      <input name="href" type="url" value="${resource?.href}" placeholder="https://" data-testid="resource-link"></label>
    ${formButtons(resource ? 'Save' : 'Add resource')}
  </form>`
}

// ---- A group: its projects' task boards, and a new project ----

function projectsPanel(group) {
  return html`<section class="block" data-testid="projects">
    <h2 class="block-title">Projects</h2>
    ${group.projects.map((project) => projectBoard(group, project, true))}
    <div class="add-project">${isEditing(group, 'project:new') ? projectForm(group) : addButton(group, 'project:new', 'Create a project', 'create-project')}</div>
  </section>`
}

function projectForm(group) {
  return html`<form class="form card" data-form="project" data-id="${group.id}" data-testid="project-form">
    <h3 class="edit-form-title">New project</h3>
    <label class="field"><span class="label">Name</span>
      <input name="title" required data-autofocus placeholder="e.g. Tabling at the Royal Oak farmers market" data-testid="project-name"></label>
    <label class="field"><span class="label">Description <span class="optional">Optional</span></span>
      <textarea name="description" rows="3" placeholder="What, when and where, and your goal." data-testid="project-description"></textarea></label>
    <label class="field"><span class="label">Tasks</span>
      <textarea name="tasks" rows="5" required placeholder="Ask the market for a table&#10;Pick up the tabling kit&#10;Run the table, Sat 9–11 am" data-testid="project-tasks"></textarea></label>
    ${formButtons('Create project')}
  </form>`
}

// ---- Shared pieces ----

const addButton = (item, key, label, testid, cls = 'btn-secondary') =>
  html`<button class="btn ${cls} btn-small add-btn" type="button" data-action="edit" data-id="${item.id}" data-key="${key}" data-testid="${testid}">${icon('plus')} ${label}</button>`

const formButtons = (label) => html`<div class="form-actions">
    <button class="btn btn-primary btn-small" type="submit" data-testid="edit-save">${label}</button>
    <button class="btn btn-link" type="button" data-action="cancel-edit" data-testid="edit-cancel">Cancel</button>
  </div>`

// ---- Clicks and submits (app.js wires them up with its own) ----

// After every change: close the editor and re-render, so every page shows the new content.
function changed(message) {
  editing = null
  rerender()
  if (message) toast(message)
}

const lines = (text) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

// An id the list doesn't use yet: prefix-1, prefix-2, …
function freshId(list, prefix) {
  let n = 1
  while (list.some((x) => x.id === `${prefix}-${n}`)) n += 1
  return `${prefix}-${n}`
}

export const manageActions = {
  'claude-setting'({ id, on }) {
    const item = findItem(id)
    const value = Boolean(on)
    if (Boolean(item.claudeAccepts) === value) return
    editing = null
    const accepted = setClaudeAccepts(item, value)
    if (!value) toast('You now review every application.')
    else toast(accepted.length ? `Claude now accepts clear cases. Accepted: ${accepted.join(', ')}.` : 'Claude now accepts clear cases.')
  },
  decide({ id, app, status }) {
    const item = findItem(id)
    const application = applicationsFor(item).find((a) => a.id === app)
    setApplicationStatus(item, app, status)
    if (status === 'accepted')
      toast(
        application.you
          ? `Accepted: as ${volunteer.firstName}, you’re in now. Switch to the volunteer view to see it.`
          : `Accepted: ${application.name} now sees the ${item.kind === 'group' ? 'group’s projects' : 'stream’s steps'}, and ${item.discord} on Discord.`,
      )
    if (status === 'rejected')
      toast(application.you ? `Rejected: as ${volunteer.firstName}, you can apply again.` : `Rejected: ${application.name}.`)
  },
  edit({ id, key }) {
    editing = { id, key }
    rerender()
    document.querySelector('[data-autofocus]')?.focus()
  },
  'cancel-edit'() {
    changed()
  },
  'move-step'({ id, task, by }) {
    const tasks = findStream(id).tasks
    const i = tasks.findIndex((t) => t.id === task)
    const j = i + Number(by)
    ;[tasks[i], tasks[j]] = [tasks[j], tasks[i]]
    changed()
  },
  'remove-step'({ id, task }) {
    const tasks = findStream(id).tasks
    const [removed] = tasks.splice(
      tasks.findIndex((t) => t.id === task),
      1,
    )
    changed(`Step removed: ${removed.title}.`)
  },
  'remove-resource'({ id, index }) {
    const [removed] = findStream(id).resources.splice(Number(index), 1)
    changed(`Resource removed: ${removed.title}.`)
  },
}

export const manageForms = {
  expectations(data, { id }) {
    findItem(id).expectations = data
      .get('expectations')
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join('\n\n')
    changed('Saved. Applicants see it when they apply, and Claude checks new applications against it.')
  },
  description(data, { id }) {
    findStream(id).description = data
      .get('description')
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
    changed('Description saved.')
  },
  step(data, { id, task: taskId }) {
    const stream = findStream(id)
    const fields = {
      title: data.get('title').trim(),
      time: data.get('time').trim(),
      summary: data.get('summary').trim(),
      steps: lines(data.get('howto')),
    }
    const task = stream.tasks.find((t) => t.id === taskId)
    if (task) Object.assign(task, fields)
    else stream.tasks.push({ id: freshId(stream.tasks, 'step'), ...fields })
    changed(task ? 'Step saved.' : 'Step added as the last one.')
  },
  resource(data, { id, index }) {
    const resources = findStream(id).resources
    const fields = {
      title: data.get('title').trim(),
      type: data.get('type').trim() || 'Link',
      note: data.get('note').trim(),
      href: data.get('href').trim() || undefined, // without a link it's a mock resource, like the made-up ones
    }
    if (index === '') resources.push(fields)
    else Object.assign(resources[Number(index)], fields)
    changed(index === '' ? 'Resource added.' : 'Resource saved.')
  },
  project(data, { id }) {
    const group = findGroup(id)
    group.projects.push({
      id: freshId(group.projects, 'project'),
      title: data.get('title').trim(),
      description: data.get('description').trim(),
      tasks: lines(data.get('tasks')).map((title, i) => ({ id: `task-${i + 1}`, title, note: '', owner: null, done: false })),
    })
    changed('Project created. Members see it on the group page and can claim its tasks.')
  },
}
