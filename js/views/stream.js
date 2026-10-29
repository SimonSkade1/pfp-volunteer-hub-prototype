// A stream's page (Spec 18). Before you're in: Apply in the page head (Getting started: Join), then the description
// and the step titles; the lead's expectations show on the apply page. Once you're in: your steps first, so that on a
// phone the next step is in the first screen (Spec 19: the same steps for everyone, each marks their own progress),
// then the Discord channel, the resources and the description.
// The task page: the how-to of one step, which you can mark done; the stream page then shows the next one.
// A stream's page has the demo's switch to its lead view (views/manage.js); Getting started has no lead.

import { findStream, firstName, leadOf } from '../data.js'
import { href } from '../router.js'
import { isTaskDone, memberCount, membership, progress, state } from '../state.js'
import { crumb, html, icon, paragraphs, pluralize, progressBar, statusBadge } from '../ui.js'
import { hubPage, pageTop, viewSwitch } from './layout.js'

export function streamView(id) {
  const stream = findStream(id)
  if (!stream) return notFound()
  const status = membership(stream.id)
  const isStart = stream.kind === 'start'

  const body =
    status === 'member'
      ? html`${taskList(stream)}${stream.discord ? discordLine(stream) : ''}${resourceList(stream)}
          <section class="block" data-testid="about"><h2 class="block-title">About ${stream.title}</h2>${paragraphs(stream.description)}</section>`
      : html`${paragraphs(stream.description)}${preview(stream)}`

  return hubPage(html`
    ${pageTop(href.home, 'Your hub', isStart ? '' : viewSwitch(stream, 'volunteer'))}
    <div class="page-head" data-testid="stream-${stream.id}">
      <p class="eyebrow">${isStart ? 'Roadmap' : 'Stream'}</p>
      ${headRow(stream, status)}
      <p class="lead">${stream.tagline}</p>
      ${isStart ? '' : streamMeta(stream)}
      ${headStatus(stream, status)}
    </div>
    ${body}
  `)
}

export function streamMeta(stream) {
  return html`<ul class="meta-list">
    <li>${icon('user')} Led by ${leadLink(stream)}</li>
    <li>${icon('users')} ${pluralize(memberCount(stream), 'volunteer')}</li>
    <li>${icon('clock')} ${stream.commitment}</li>
    <li>${icon('pin')} ${stream.where}</li>
  </ul>`
}

// A lead's name opens their profile (Spec 5.1).
export function leadLink(item) {
  const lead = leadOf(item)
  return lead ? html`<a class="link" href="${href.person(lead.id)}" data-testid="lead-profile">${item.lead}</a>` : item.lead
}

// The page head's title row (Spec 18, 20): the title with your status, and while you're not in and haven't applied,
// the call to action next to it: Apply, or Getting started's Join (one click, no form).
export function headRow(item, status) {
  let cta = ''
  if (status === 'none')
    cta =
      item.kind === 'start'
        ? html`<button class="btn btn-primary" type="button" data-action="join" data-id="${item.id}" data-testid="join">Join</button>`
        : html`<a class="btn btn-primary" href="${href.apply(item.id)}" data-testid="apply">Apply to join</a>`
  return html`<div class="head-row"><h1>${item.title} ${statusBadge(status)}</h1>${cta}</div>`
}

// Below the head's meta: the pending box once you've applied, or a note after a rejection (you can apply again).
export function headStatus(item, status) {
  if (status === 'pending') return pendingBox(item)
  if (state.applications[item.id]?.status === 'rejected')
    return html`<p class="rejected-note" data-testid="rejected-note">${firstName(item.lead)} didn’t accept your last application. You can apply again.</p>`
  return ''
}

// Pending (Spec 17.5): the lead usually reviews within two days; while you're not in Getting started, it's linked.
export function pendingBox(item) {
  const application = state.applications[item.id]
  return html`<section class="pending-box" data-testid="pending-box">
    <p class="pending-title">${icon('clock')} Application sent</p>
    <p>${firstName(item.lead)} usually reviews applications within two days.</p>
    ${membership('getting-started') === 'member'
      ? ''
      : html`<p data-testid="meanwhile">Meanwhile: <a class="link" href="${href.stream('getting-started')}">Getting started</a> needs no application.</p>`}
    ${application?.text ? html`<p class="pending-text">“${application.text}”</p>` : ''}
    <div class="demo-control">
      <span class="demo-tag">Demo</span>
      <button class="btn btn-demo" type="button" data-action="accept" data-id="${item.id}" data-testid="accept-demo">Skip ahead: ${firstName(item.lead)} accepts you</button>
    </div>
  </section>`
}

// Your pipeline: done steps, the next one (highlighted, with its call to action), later ones. Every step opens its
// how-to.
function taskList(stream) {
  const p = progress(stream)
  return html`<section class="block" data-testid="task-list">
    <h2 class="block-title">Your steps</h2>
    ${progressBar(p)}
    <ol class="steps">
      ${stream.tasks.map((task, i) => {
        const done = isTaskDone(stream.id, task)
        const isNext = p.next && p.next.id === task.id
        const stepState = done ? 'done' : isNext ? 'next' : 'later'
        return html`<li class="step step-${stepState}" data-testid="step-${task.id}">
          <span class="step-mark">${done ? icon('check') : i + 1}</span>
          <div class="step-body">
            ${isNext ? html`<span class="step-label">Up next</span>` : ''}
            <a class="step-title stretched" href="${href.task(stream.id, task.id)}">${task.title}</a>
            ${isNext ? html`<p class="step-summary">${task.summary}</p><span class="step-cta" aria-hidden="true">Start ${icon('right')}</span>` : ''}
          </div>
          <span class="step-time">${done ? 'Done' : task.time}</span>
        </li>`
      })}
    </ol>
    ${p.next ? '' : html`<p class="all-done" data-testid="all-done">${icon('check')} All done. ${stream.doneNote}</p>`}
  </section>`
}

function resourceList(stream) {
  if (!stream.resources?.length) return ''
  return html`<section class="block" data-testid="resources">
    <h2 class="block-title">${stream.resourcesTitle || 'Resources'}</h2>
    <ul class="resources">${stream.resources.map(resourceItem)}</ul>
  </section>`
}

function resourceItem(resource) {
  const inner = html`<span class="resource-type">${resource.type}</span>
    <span class="resource-main"><span class="resource-title">${resource.title}</span><span class="resource-note">${resource.note}</span></span>
    ${resource.href ? icon('external') : icon('right')}`
  return html`<li>${resource.href
    ? html`<a class="resource" href="${resource.href}" target="_blank" rel="noopener" data-testid="resource">${inner}</a>`
    : html`<button class="resource" type="button" data-action="mock" data-msg="“${resource.title}” would open here." data-testid="resource">${inner}</button>`}</li>`
}

function discordLine(item) {
  return html`<div class="discord-line" data-testid="discord-line">
    ${icon('chat')}
    <p>Plan with the others in <strong>${item.discord}</strong> on our Discord.</p>
    ${discordButton(item)}
  </div>`
}

// The mock Discord (Spec 22): "Connect Discord" once you're accepted; after one connect, every channel line offers
// "Open".
export function discordButton(item) {
  if (state.discord)
    return html`<button class="btn btn-secondary btn-small" type="button" data-action="mock" data-msg="This would open ${item.discord} on our Discord." data-testid="discord-open">Open</button>`
  return html`<button class="btn btn-secondary btn-small" type="button" data-action="connect-discord" data-channel="${item.discord}" data-testid="discord-connect">Connect Discord</button>`
}

// Before you're in: the steps you'd take, without progress.
function preview(stream) {
  return html`<section class="block" data-testid="preview">
    <h2 class="block-title">What you’ll do</h2>
    <ol class="steps steps-preview">
      ${stream.tasks.map((task, i) => html`<li class="step step-later"><span class="step-mark">${i + 1}</span><div class="step-body"><span class="step-title">${task.title}</span></div><span class="step-time">${task.time}</span></li>`)}
    </ol>
  </section>`
}

export function taskView(streamId, taskId) {
  const stream = findStream(streamId)
  const index = stream ? stream.tasks.findIndex((t) => t.id === taskId) : -1
  if (index < 0) return notFound()
  const task = stream.tasks[index]
  const member = membership(stream.id) === 'member'
  const done = isTaskDone(stream.id, task)

  let buttons
  if (!member) {
    buttons = html`<p class="muted">Join <a class="link" href="${href.stream(stream.id)}">${stream.title}</a> to track your steps.</p>`
  } else if (done) {
    const next = progress(stream).next
    buttons = html`<p class="done-line" data-testid="task-done">${icon('check')} Done.</p>
      ${next ? html`<a class="btn btn-primary" href="${href.task(stream.id, next.id)}" data-testid="next-step">Next: ${next.title} ${icon('right')}</a>` : ''}
      <button class="btn btn-link" type="button" data-action="undo" data-stream="${stream.id}" data-task="${task.id}" data-testid="undo-done">Undo</button>`
  } else {
    buttons = html`${actionButton(task)}
      <button class="btn ${task.action ? 'btn-secondary' : 'btn-primary'}" type="button" data-action="done" data-stream="${stream.id}" data-task="${task.id}" data-testid="mark-done">${icon('check')} Mark done</button>`
  }

  return hubPage(html`
    ${crumb(href.stream(stream.id), stream.title)}
    <div class="page-head" data-testid="task-${task.id}">
      <p class="eyebrow">Step ${index + 1} of ${stream.tasks.length} · ${icon('clock')} ${task.time}</p>
      <h1>${task.title}</h1>
      <p class="lead">${task.summary}</p>
    </div>
    <section class="block">
      <h2 class="block-title">How to do it</h2>
      <ol class="howto">${task.steps.map((step) => html`<li>${step}</li>`)}</ol>
      ${task.links?.length
        ? html`<ul class="links">${task.links.map((link) => html`<li><a href="${link.href}" target="_blank" rel="noopener">${link.label} ${icon('external')}</a></li>`)}</ul>`
        : ''}
    </section>
    <div class="task-actions">${buttons}</div>
  `)
}

function actionButton(task) {
  const action = task.action
  if (!action) return ''
  if (action.href)
    return html`<a class="btn btn-primary" href="${action.href}" target="_blank" rel="noopener" data-testid="task-action">${action.label} ${icon('external')}</a>`
  if (action.copy)
    return html`<button class="btn btn-primary" type="button" data-action="copy" data-text="${action.copy}" data-testid="task-action">${icon('copy')} ${action.label}</button>`
  if (action.route) return html`<a class="btn btn-primary" href="${action.route}" data-testid="task-action">${action.label} ${icon('right')}</a>`
  return html`<button class="btn btn-primary" type="button" data-action="mock" data-msg="${action.mock}" data-testid="task-action">${action.label}</button>`
}

export function notFound() {
  return hubPage(html`${crumb(href.home, 'Your hub')}<div class="page-head"><h1>Not found</h1><p class="lead">This page doesn’t exist in the prototype.</p></div>`)
}
