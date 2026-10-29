// A stream's page (Spec 18): description, task list, resources. Before you're accepted it shows what you'd do and how
// to join; once you're in, your own progress through the stream's pipeline (Spec 19: the same steps for everyone).
// The task page: the how-to of one step, which you can mark done; the stream page then shows the next one.
// A stream's page has the demo's switch to its lead view (views/manage.js); Getting started has no lead.

import { findStream, firstName } from '../data.js'
import { href } from '../router.js'
import { isTaskDone, memberCount, membership, progress, state } from '../state.js'
import { crumb, html, icon, paragraphs, pluralize, progressBar, statusBadge } from '../ui.js'
import { hubPage, pageTop, viewSwitch } from './layout.js'

export function streamView(id) {
  const stream = findStream(id)
  if (!stream) return notFound()
  const status = membership(stream.id)
  const isStart = stream.kind === 'start'

  let body
  if (status === 'member') {
    const parts = [taskList(stream), resourceList(stream)]
    body = html`${stream.resourcesFirst ? parts.reverse() : parts}${stream.discord ? discordLine(stream) : ''}`
  } else if (status === 'pending') {
    body = html`${pendingBox(stream)}${preview(stream)}`
  } else {
    body = html`${preview(stream)}${joinBox(stream)}`
  }

  return hubPage(html`
    ${pageTop(href.home, 'Your hub', isStart ? '' : viewSwitch(stream, 'volunteer'))}
    <div class="page-head" data-testid="stream-${stream.id}">
      <p class="eyebrow">${isStart ? 'Your roadmap' : 'Stream'}</p>
      <h1>${stream.title} ${isStart ? '' : statusBadge(status)}</h1>
      <p class="lead">${stream.tagline}</p>
      ${isStart ? '' : streamMeta(stream)}
    </div>
    ${paragraphs(stream.description)}
    ${body}
  `)
}

export function streamMeta(stream) {
  return html`<ul class="meta-list">
    <li>${icon('user')} Led by ${stream.lead}</li>
    <li>${icon('users')} ${pluralize(memberCount(stream), 'volunteer')}</li>
    <li>${icon('clock')} ${stream.commitment}</li>
    <li>${icon('pin')} ${stream.where}</li>
  </ul>`
}

// Your pipeline: done steps, the next one (highlighted), later ones. Every step opens its how-to.
function taskList(stream) {
  const p = progress(stream)
  return html`<section class="block" data-testid="task-list">
    <div class="block-head">
      <h2 class="block-title">${stream.kind === 'start' ? 'Your first steps' : 'Your steps'}</h2>
    </div>
    ${progressBar(p, false)}
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
            ${isNext ? html`<p class="step-summary">${task.summary}</p>` : ''}
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
    <p>Plan with the others in <strong>${item.discord}</strong> on our Discord: you got access when you were accepted.</p>
    <button class="btn btn-secondary btn-small" type="button" data-action="mock" data-msg="This would open ${item.discord} on our Discord.">Open</button>
  </div>`
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

// How to join: the lead's own text on what they expect from applicants (Spec 7.1). After a rejection (in the lead
// view) you can apply again.
export function joinBox(item) {
  const rejected = state.applications[item.id]?.status === 'rejected'
  return html`<section class="join-box" data-testid="join-box">
    <h2 class="block-title">How to join</h2>
    ${rejected ? html`<p class="rejected-note" data-testid="rejected-note">${firstName(item.lead)} didn’t accept your last application. You can apply again.</p>` : ''}
    <blockquote class="expectations">
      <p>${item.expectations}</p>
      <footer>${item.lead}, ${item.kind === 'group' ? 'group lead' : 'stream lead'}</footer>
    </blockquote>
    <a class="btn btn-primary" href="${href.apply(item.id)}" data-testid="apply">Apply to join</a>
  </section>`
}

export function pendingBox(item) {
  const application = state.applications[item.id]
  return html`<section class="pending-box" data-testid="pending-box">
    <p class="pending-title">${icon('clock')} Application sent</p>
    <p>${item.lead.split(' ')[0]} reviews applications, usually within two days. Meanwhile, go on with <a href="${href.stream('getting-started')}">Getting started</a>.</p>
    ${application?.text ? html`<p class="pending-text">“${application.text}”</p>` : ''}
    <div class="demo-control">
      <span class="demo-tag">Demo</span>
      <button class="btn btn-demo" type="button" data-action="accept" data-id="${item.id}" data-testid="accept-demo">Skip ahead: ${item.lead.split(' ')[0]} accepts you</button>
    </div>
  </section>`
}

export function taskView(streamId, taskId) {
  const stream = findStream(streamId)
  const index = stream ? stream.tasks.findIndex((t) => t.id === taskId) : -1
  if (index < 0) return notFound()
  const task = stream.tasks[index]
  const member = membership(stream.id) === 'member'
  const done = isTaskDone(stream.id, task)
  const auto = task.doneWhen === 'applied' && done

  let buttons
  if (!member) {
    buttons = html`<p class="muted">Join ${stream.title} to track your steps. <a href="${href.stream(stream.id)}">How to join</a></p>`
  } else if (done) {
    const next = progress(stream).next
    buttons = html`<p class="done-line" data-testid="task-done">${icon('check')} Done${auto ? ': you’ve applied.' : '.'}</p>
      ${next ? html`<a class="btn btn-primary" href="${href.task(stream.id, next.id)}" data-testid="next-step">Next: ${next.title} ${icon('right')}</a>` : ''}
      ${auto ? '' : html`<button class="btn btn-link" type="button" data-action="undo" data-stream="${stream.id}" data-task="${task.id}" data-testid="undo-done">Undo</button>`}`
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
