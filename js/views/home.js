// The hub's main page (Spec 6), top to bottom: Your groups and streams; Join a local group (while you're in no group
// and wait on none): the groups within the radius, nearest first, then a quiet line linking the start-a-group vacancy;
// Join a stream: the streams you're not in, Getting started last; last a quiet line linking the vacancies ("Want to do
// more?"; Spec 25). Cards have no buttons: a card opens its page, whose head holds Apply (Getting started: Join).

import { RADIUS_MI, firstName, groups, streams, volunteer } from '../data.js'
import { href } from '../router.js'
import { memberCount, membership, progress, projectCounts } from '../state.js'
import { html, icon, pluralize, statusBadge } from '../ui.js'
import { hubPage } from './layout.js'

export function homeView() {
  const start = streams.find((s) => s.kind === 'start')
  const nationwide = streams.filter((s) => s.kind === 'stream')
  const yours = [...groups, ...nationwide, start].filter((item) => membership(item.id) !== 'none')
  const groupFree = groups.every((g) => membership(g.id) === 'none')
  const nearby = groups.filter((g) => g.distance <= RADIUS_MI).sort((a, b) => a.distance - b.distance)
  const toJoin = [...nationwide, start].filter((s) => membership(s.id) === 'none')

  return hubPage(
    html`
      <div class="page-head"><h1>Hi ${volunteer.firstName}</h1></div>

      <section class="section" data-testid="your-items">
        <h2 class="section-title">Your groups and streams</h2>
        ${yours.length
          ? html`<div class="grid">${yours.map(yourCard)}</div>`
          : html`<p class="empty" data-testid="your-empty">You’re in no group or stream yet.</p>`}
      </section>

      ${groupFree
        ? html`<section class="section" data-testid="join-group">
            <h2 class="section-title">Join a local group</h2>
            ${nearby.length
              ? html`<div class="grid">${nearby.map(groupCard)}</div>`
              : html`<p class="empty" data-testid="no-group-near">No local groups nearby.</p>`}
            <p class="quiet-line">Want to start a local group where you live? <a href="${href.vacancy('start-group')}" data-testid="start-group">You can apply to lead one.</a></p>
          </section>`
        : ''}

      ${toJoin.length
        ? html`<section class="section" data-testid="join-stream">
            <h2 class="section-title">Join a stream</h2>
            <div class="grid">${toJoin.map(streamCard)}</div>
          </section>`
        : ''}

      <p class="section quiet-line" data-testid="do-more">Want to do more? <a href="${href.vacancies}" data-testid="vacancies-link">Check out our volunteer vacancies.</a></p>
    `,
    'wide',
  )
}

// The title is the card's link (stretched over the card); the arrow only shows that the card opens a page.
export const cardTitle = (item) =>
  html`<h3 class="card-title"><a class="stretched" href="${href.item(item)}">${item.title}</a>${icon('right')}</h3>`

const KINDS = { group: 'Local group', stream: 'Stream', start: 'Roadmap' }

// A group or stream you're in or have applied to: only a pending one carries a badge (Spec 17.5).
function yourCard(item) {
  const status = membership(item.id)
  let line
  if (status === 'pending') line = html`<p class="card-text muted">Application sent. ${firstName(item.lead)} gets back to you soon.</p>`
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
  return html`<article class="card" data-testid="card-${item.id}">
    <div class="card-top"><span class="card-kind">${KINDS[item.kind]}</span>${status === 'pending' ? statusBadge(status) : ''}</div>
    ${cardTitle(item)}
    ${line}
  </article>`
}

function groupCard(group) {
  return html`<article class="card" data-testid="card-${group.id}">
    ${cardTitle(group)}
    ${metaLine('pin', [`${group.distance} mi from you`, group.place])}
    <p class="card-text">${group.tagline}</p>
    ${metaLine('users', [pluralize(memberCount(group), 'member')])}
    ${metaLine('calendar', [group.meets])}
  </article>`
}

function streamCard(stream) {
  if (stream.kind === 'start')
    return html`<article class="card" data-testid="card-${stream.id}">
      ${cardTitle(stream)}
      <p class="card-text">${stream.tagline}</p>
      ${metaLine('clock', [`${pluralize(stream.tasks.length, 'step')}, about 20 minutes in all`])}
      <p class="card-tags"><span class="tag" data-testid="no-application">No application required</span></p>
    </article>`
  return html`<article class="card" data-testid="card-${stream.id}">
    ${cardTitle(stream)}
    <p class="card-text">${stream.tagline}</p>
    ${metaLine('clock', [stream.commitment])}
    ${metaLine('pin', [stream.where])}
    ${metaLine('users', [pluralize(memberCount(stream), 'volunteer'), `led by ${stream.lead}`])}
  </article>`
}

export const metaLine = (iconName, parts) =>
  html`<p class="card-meta">${icon(iconName)}${parts.map((part) => html`<span>${part}</span>`)}</p>`
