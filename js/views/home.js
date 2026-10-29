// The hub's main page (Spec 6), top to bottom: Your streams (with Getting started), Local groups (near you, then not
// too far away), "Apply to lead a local group", Current streams, "Apply to lead a stream". A card opens its page.

import { FAR_MI, NEAR_MI, groups, leadForms, streams, volunteer } from '../data.js'
import { href } from '../router.js'
import { memberCount, membership, progress, projectCounts, state } from '../state.js'
import { html, icon, pluralize, progressBar, statusBadge } from '../ui.js'
import { hubPage } from './layout.js'

export function homeView() {
  const start = streams.find((s) => s.kind === 'start')
  const nationwide = streams.filter((s) => s.kind === 'stream')
  const yours = [...groups, ...nationwide].filter((item) => membership(item.id) !== 'none')
  const near = groups.filter((g) => g.distance <= NEAR_MI)
  const notFar = groups.filter((g) => g.distance > NEAR_MI && g.distance <= FAR_MI)

  return hubPage(
    html`
      <div class="page-head">
        <h1>Hi ${volunteer.firstName}</h1>
        <p class="lead">Start with your first action, then find a local group or a stream to join.</p>
      </div>

      <section class="section" data-testid="your-streams">
        <h2 class="section-title">Your streams</h2>
        <div class="grid">${startCard(start)}${yours.map(yourCard)}</div>
      </section>

      <section class="section" data-testid="local-groups">
        <h2 class="section-title">Local groups</h2>
        <p class="section-lead">Groups meet in person and run events where they live.</p>
        <h3 class="subhead">Near you</h3>
        ${near.length
          ? html`<div class="grid">${near.map(groupCard)}</div>`
          : html`<p class="empty" data-testid="no-group-near">No local group near ${volunteer.place} yet.</p>`}
        ${notFar.length ? html`<h3 class="subhead">Not too far away</h3><div class="grid">${notFar.map(groupCard)}</div>` : ''}
        ${leadBox('group', near.length ? 'Want to start a group?' : 'No group near you? Start one.', 'Leading a local group is a lot of work, and we interview every applicant.')}
      </section>

      <section class="section" data-testid="current-streams">
        <h2 class="section-title">Current streams</h2>
        <p class="section-lead">Nationwide efforts you can join from anywhere.</p>
        <div class="grid">${nationwide.map(streamCard)}</div>
        ${leadBox('stream', 'Have an idea for a stream?', 'Lead one of ours or pitch a new one. We interview every applicant.')}
      </section>
    `,
    'wide',
  )
}

// Getting started: everyone is in it; its card leads straight to the next action.
function startCard(stream) {
  const p = progress(stream)
  return html`<article class="card card-start" data-testid="card-${stream.id}">
    <h3 class="card-title"><a class="stretched" href="${href.stream(stream.id)}">${stream.title}</a></h3>
    <p class="card-text">${stream.tagline}</p>
    ${progressBar(p)}
    ${p.next
      ? html`<p class="card-next"><span class="card-next-label">${p.done ? 'Up next' : 'Your first action'} · ${p.next.time}</span>${p.next.title}</p>
          <div class="card-actions"><a class="btn btn-inverse" href="${href.task(stream.id, p.next.id)}" data-testid="start-next">${p.done ? 'Continue' : 'Start'} ${icon('right')}</a></div>`
      : html`<p class="card-next">${icon('check')} All done. ${stream.doneNote}</p>`}
  </article>`
}

// A group or stream you're in or have applied to.
function yourCard(item) {
  const status = membership(item.id)
  let line
  if (status === 'pending') line = html`<p class="card-text muted">Application sent. ${item.lead.split(' ')[0]} gets back to you soon.</p>`
  else if (item.kind === 'group') {
    const [project] = item.projects
    const counts = projectCounts(item, project)
    line = html`<p class="card-text">${icon('calendar')} Next meeting: ${item.nextMeeting}</p>
      <p class="card-text muted">${project.title}: ${pluralize(counts.open, 'open task')}</p>`
  } else {
    const p = progress(item)
    line = p.next
      ? html`<p class="card-text"><strong>Up next:</strong> ${p.next.title}</p><p class="card-text muted">${p.done} of ${p.total} steps done</p>`
      : html`<p class="card-text">${icon('check')} All steps done</p>`
  }
  return html`<article class="card" data-testid="your-${item.id}">
    <div class="card-top">${statusBadge(status)}<span class="card-kind">${item.kind === 'group' ? 'Local group' : 'Stream'}</span></div>
    <h3 class="card-title"><a class="stretched" href="${href.item(item)}">${item.title}</a></h3>
    ${line}
  </article>`
}

function groupCard(group) {
  return html`<article class="card" data-testid="card-${group.id}">
    <h3 class="card-title"><a class="stretched" href="${href.group(group.id)}">${group.title}</a></h3>
    ${metaLine('pin', [`${group.distance} mi from you`, group.place])}
    <p class="card-text">${group.tagline}</p>
    ${metaLine('users', [pluralize(memberCount(group), 'member')])}
    ${metaLine('calendar', [group.meets])}
    ${applyArea(group)}
  </article>`
}

function streamCard(stream) {
  return html`<article class="card" data-testid="card-${stream.id}">
    <h3 class="card-title"><a class="stretched" href="${href.stream(stream.id)}">${stream.title}</a></h3>
    <p class="card-text">${stream.tagline}</p>
    ${metaLine('clock', [stream.commitment])}
    ${metaLine('pin', [stream.where])}
    ${metaLine('users', [pluralize(stream.members, 'volunteer'), `led by ${stream.lead}`])}
    ${applyArea(stream)}
  </article>`
}

const metaLine = (iconName, parts) => html`<p class="card-meta">${icon(iconName)}${parts.map((part) => html`<span>${part}</span>`)}</p>`

function applyArea(item) {
  const status = membership(item.id)
  if (status === 'none')
    return html`<div class="card-actions"><a class="btn btn-primary over-stretched" href="${href.apply(item.id)}" data-testid="apply-${item.id}">Apply to join</a></div>`
  return html`<div class="card-actions">${statusBadge(status)}</div>`
}

function leadBox(kind, title, text) {
  const form = leadForms[kind]
  const sent = state.leadApplications[kind]
  return html`<div class="lead-box" data-testid="lead-box-${kind}">
    <div>
      <h3 class="lead-box-title">${title}</h3>
      <p class="lead-box-text">${sent ? form.sent : text}</p>
    </div>
    ${sent
      ? html`<span class="badge badge-pending">${icon('clock')} Sent</span>`
      : html`<a class="btn btn-secondary" href="${href.lead(kind)}" data-testid="lead-${kind}">${form.title} ${icon('right')}</a>`}
  </div>`
}
