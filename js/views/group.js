// A local group's page (Spec 20): description and the projects it runs. A project is a team project (Spec 19):
// members are in it by default and claim different tasks. Before you're accepted you see what the group works on.
// The page has the demo's switch to the group's lead view (views/manage.js), which shows the same task boards.

import { findGroup, firstName, volunteer } from '../data.js'
import { href } from '../router.js'
import { acceptedApplicants, memberCount, membership, projectCounts, teamTask, teamTaskKey } from '../state.js'
import { html, icon, paragraphs, pluralize, statusBadge } from '../ui.js'
import { hubPage, pageTop, viewSwitch } from './layout.js'
import { joinBox, notFound, pendingBox } from './stream.js'

export function groupView(id) {
  const group = findGroup(id)
  if (!group) return notFound()
  const status = membership(group.id)

  let body
  if (status === 'member') {
    body = html`${meetingLine(group)}${group.projects.map((project) => projectBoard(group, project))}${memberList(group)}`
  } else if (status === 'pending') {
    body = html`${pendingBox(group)}${projectPreview(group)}`
  } else {
    body = html`${projectPreview(group)}${joinBox(group)}`
  }

  return hubPage(html`
    ${pageTop(href.home, 'Your hub', viewSwitch(group, 'volunteer'))}
    <div class="page-head" data-testid="group-${group.id}">
      <p class="eyebrow">Local group · ${group.distance} mi from you</p>
      <h1>${group.title} ${statusBadge(status)}</h1>
      <p class="lead">${group.tagline}</p>
      <ul class="meta-list">
        <li>${icon('user')} Led by ${group.lead}</li>
        <li>${icon('users')} ${pluralize(memberCount(group), 'member')}</li>
        <li>${icon('calendar')} ${group.meets}</li>
        <li>${icon('pin')} ${group.place}</li>
      </ul>
    </div>
    ${paragraphs(group.description)}
    ${body}
  `)
}

function meetingLine(group) {
  return html`<div class="info-row">
    <div class="info-cell">${icon('calendar')}<p><strong>Next meeting</strong><br>${group.nextMeeting}</p></div>
    <div class="info-cell">${icon('chat')}<p><strong>${group.discord}</strong> on our Discord<br><button class="btn-link" type="button" data-action="mock" data-msg="This would open ${group.discord} on our Discord.">Open channel</button></p></div>
  </div>`
}

// The team board: who claimed what, what is open. You can claim open tasks and finish your own. The lead view shows
// it read-only (asLead): every owner by name, you included, and "Open" for unclaimed tasks.
export function projectBoard(group, project, asLead = false) {
  const counts = projectCounts(group, project)
  const claimed = counts.total - counts.done - counts.open
  return html`<section class="block" data-testid="project-${project.id}">
    <p class="eyebrow">Team project${asLead ? '' : ' · everyone in the group is in it'}</p>
    ${asLead ? html`<h3 class="block-title">${project.title}</h3>` : html`<h2 class="block-title">${project.title}</h2>`}
    ${project.description ? html`<p class="prose-sm">${project.description}</p>` : ''}
    <p class="board-summary">${asLead
      ? html`${counts.done} of ${counts.total} done · ${claimed} claimed · <strong>${counts.open} open</strong>`
      : html`${counts.done} of ${counts.total} done · <strong>${pluralize(counts.open, 'open task')}</strong>: claim one`}</p>
    <ul class="board">
      ${project.tasks.map((task) => {
        const view = teamTask(group, project, task)
        const key = teamTaskKey(group.id, project.id, task.id)
        return html`<li class="board-task ${view.done ? 'is-done' : ''} ${view.mine ? 'is-mine' : ''} ${view.owner ? '' : 'is-open'}" data-testid="team-task-${task.id}">
          <span class="board-check">${view.done ? icon('check') : ''}</span>
          <div class="board-body">
            <p class="board-title">${task.title}</p>
            ${task.note ? html`<p class="board-note">${task.note}</p>` : ''}
          </div>
          <div class="board-owner">${asLead ? leadOwnerArea(view) : ownerArea(view, key)}</div>
        </li>`
      })}
    </ul>
  </section>`
}

function leadOwnerArea(view) {
  if (!view.owner) return html`<span class="open-tag">Open</span>`
  const name = view.mine ? volunteer.name : view.owner
  return html`<span class="person">${initials(name)} ${name}${view.mine ? ' (you)' : ''}${view.done ? '' : html`<span class="person-status">is on it</span>`}</span>`
}

function ownerArea(view, key) {
  if (!view.owner)
    return html`<button class="btn btn-primary btn-small" type="button" data-action="claim" data-key="${key}" data-testid="claim">Claim</button>`
  if (!view.mine) return html`<span class="person">${initials(view.owner)} ${firstName(view.owner)}${view.done ? '' : html`<span class="person-status">is on it</span>`}</span>`
  if (view.done)
    return html`<span class="person person-you">You</span><button class="btn-link" type="button" data-action="reopen" data-key="${key}" data-testid="reopen">Undo</button>`
  return html`<span class="person person-you">You</span>
    <button class="btn btn-secondary btn-small" type="button" data-action="claim-done" data-key="${key}" data-testid="claim-done">${icon('check')} Done</button>
    <button class="btn-link" type="button" data-action="unclaim" data-key="${key}" data-testid="unclaim">Unclaim</button>`
}

const initials = (name) =>
  html`<span class="person-avatar" aria-hidden="true">${name
    .split(' ')
    .map((part) => part[0])
    .join('')}</span>`

// The mock members, then the applicants the lead accepted in the lead view, then you.
function memberList(group) {
  const names = [...group.members, ...acceptedApplicants(group).map((a) => a.name)]
  return html`<section class="block" data-testid="members">
    <h2 class="block-title">Members</h2>
    <ul class="members">
      ${names.map((name) => html`<li>${initials(name)}<span>${name}${name === group.lead ? html` <span class="muted">· lead</span>` : ''}</span></li>`)}
      <li><span class="person-avatar person-avatar-you" aria-hidden="true">You</span><span>You</span></li>
    </ul>
  </section>`
}

// Before you're in: what the group currently works on, without the task board.
function projectPreview(group) {
  return html`<section class="block" data-testid="preview">
    <h2 class="block-title">What we’re working on</h2>
    ${group.projects.map((project) => html`<div class="preview-project"><p class="board-title">${project.title}</p>${project.description ? html`<p class="prose-sm">${project.description}</p>` : ''}</div>`)}
  </section>`
}
