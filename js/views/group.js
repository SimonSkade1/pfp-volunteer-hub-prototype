// A local group's page (Spec 20): description and the projects it runs. Before you're accepted: Apply in the page head,
// and what the group works on. Once you're in: the next meeting with its Luma link and the Discord channel, then Team
// projects: a card per project, which opens the project's page (round 4), then the members.
// A project's page: its description and its task board. A project is a team project (Spec 19): the group's members
// claim different tasks. Both pages have the demo's switch to the lead view (views/manage.js), whose project page shows
// the same board as the lead sees it.
// The page of all local groups (round 5), from the main page's "Browse all local groups": every group, nearest first,
// each card with its distance, as on the main page; yours with its badge.

import { findGroup, firstName, groups, volunteer } from '../data.js'
import { href } from '../router.js'
import { acceptedApplicants, memberCount, membership, projectCounts, state, teamTask, teamTaskKey } from '../state.js'
import { crumb, eventsCell, html, icon, initialsOf, paragraphs, pluralize } from '../ui.js'
import { cardTitle, groupCard, milesFromYou } from './home.js'
import { hubPage, pageTop, viewSwitch } from './layout.js'
import { discordButton, headRow, headStatus, leadLink, notFound } from './stream.js'

export function groupsView() {
  return hubPage(html`
    ${crumb(href.home, 'Your hub')}
    <div class="page-head" data-testid="all-groups"><p class="eyebrow">Join a local group</p><h1>All local groups</h1></div>
    <div class="grid">${[...groups].sort((a, b) => a.distance - b.distance).map(groupCard)}</div>
  `)
}

export function groupView(id) {
  const group = findGroup(id)
  if (!group) return notFound()
  const status = membership(group.id)

  const body =
    status === 'member'
      ? html`${meetingLine(group)}${projectCards(group, (project) => href.project(group.id, project.id))}${memberList(group)}`
      : projectPreview(group)

  return hubPage(html`
    ${pageTop(href.home, 'Your hub', viewSwitch(group, 'volunteer'))}
    <div class="page-head" data-testid="group-${group.id}">
      <p class="eyebrow">Local group</p>
      ${headRow(group, status)}
      <p class="lead">${group.tagline}</p>
      <ul class="meta-list">
        <li>${icon('user')} Led by ${leadLink(group)}</li>
        <li>${icon('users')} ${pluralize(memberCount(group), 'member')}</li>
        <li>${icon('calendar')} ${group.meets}</li>
        <li>${icon('pin')} ${group.place} · ${milesFromYou(group)}</li>
      </ul>
      ${headStatus(group, status)}
    </div>
    ${paragraphs(group.description)}
    ${body}
  `)
}

// The next meeting, and once you've connected Discord, the channel (before that, its call to action is in the head).
function meetingLine(group) {
  return html`<div class="info-row">
    ${eventsCell('Next meeting', [group.nextMeeting], 'next-meeting')}
    ${state.discord
      ? html`<div class="info-cell" data-testid="discord-line">${icon('chat')}<div><p><strong>${group.discord}</strong> on our Discord</p>${discordButton(group)}</div></div>`
      : ''}
  </div>`
}

// A card per project: its name, its one line, open tasks and members (who claimed a task). `to` gives its page: the
// project's page here, the lead's in the lead view.
export function projectCards(group, to) {
  return html`<section class="block" data-testid="team-projects">
    <h2 class="block-title">Team projects</h2>
    <div class="grid">
      ${group.projects.map((project) => {
        const counts = projectCounts(group, project)
        return html`<article class="card" data-testid="card-${project.id}">
          ${cardTitle(project, to(project))}
          ${project.tagline ? html`<p class="card-text">${project.tagline}</p>` : ''}
          <p class="card-meta"><span class="card-open">${pluralize(counts.open, 'open task')}</span><span>${pluralize(counts.people, 'member')}</span></p>
        </article>`
      })}
    </div>
  </section>`
}

export function projectView(groupId, projectId) {
  const group = findGroup(groupId)
  const project = group?.projects.find((p) => p.id === projectId)
  if (!project) return notFound()
  return hubPage(html`
    ${pageTop(href.group(group.id), group.title, viewSwitch(group, 'volunteer', project))}
    <div class="page-head" data-testid="project-${project.id}">
      <p class="eyebrow">Team project</p>
      <h1>${project.title}</h1>
    </div>
    ${project.description ? paragraphs([project.description]) : ''}
    ${membership(group.id) === 'member'
      ? projectBoard(group, project)
      : html`<p class="block muted">Join <a class="link" href="${href.group(group.id)}">${group.title}</a> to claim a task.</p>`}
  `)
}

// The team board: who claimed what, what is open. You can claim open tasks and finish your own. The lead's project page
// shows it read-only (asLead): every owner by name, you included, and "Open" for unclaimed tasks.
export function projectBoard(group, project, asLead = false) {
  const counts = projectCounts(group, project)
  const claimed = counts.total - counts.done - counts.open
  return html`<section class="block" data-testid="board">
    <h2 class="block-title">Tasks</h2>
    <p class="board-summary">${asLead
      ? html`${counts.done} of ${counts.total} done · ${claimed} claimed · <strong>${counts.open} open</strong>`
      : html`${counts.done} of ${counts.total} done · <strong>${pluralize(counts.open, 'open task')}</strong>${counts.open ? ': claim one' : ''}`}</p>
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
    return html`<button class="btn btn-outline btn-small" type="button" data-action="claim" data-key="${key}" data-testid="claim">Claim</button>`
  if (!view.mine) return html`<span class="person">${initials(view.owner)} ${firstName(view.owner)}${view.done ? '' : html`<span class="person-status">is on it</span>`}</span>`
  if (view.done)
    return html`<span class="person person-you">You</span><button class="btn-link" type="button" data-action="reopen" data-key="${key}" data-testid="reopen">Undo</button>`
  return html`<span class="person person-you">You</span>
    <button class="btn btn-secondary btn-small" type="button" data-action="claim-done" data-key="${key}" data-testid="claim-done">${icon('check')} Done</button>
    <button class="btn-link" type="button" data-action="unclaim" data-key="${key}" data-testid="unclaim">Unclaim</button>`
}

const initials = (name) => html`<span class="person-avatar" aria-hidden="true">${initialsOf(name)}</span>`

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

// Before you're in: what the group currently works on, without the projects' pages.
function projectPreview(group) {
  return html`<section class="block" data-testid="preview">
    <h2 class="block-title">What we’re working on</h2>
    ${group.projects.map((project) => html`<div class="preview-project"><p class="board-title">${project.title}</p>${project.description ? html`<p class="prose-sm">${project.description}</p>` : ''}</div>`)}
  </section>`
}
