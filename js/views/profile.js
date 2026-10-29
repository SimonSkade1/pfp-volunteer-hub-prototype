// Profiles (Spec 5.1), view only. Yours, from your initials in the top bar: your name, place and the onboarding's
// answers, which leads see with your applications. A lead's, from their name on their stream's or group's page: what
// they lead and a few lines about them.

import { findLead, ledBy, volunteer } from '../data.js'
import { href } from '../router.js'
import { state } from '../state.js'
import { crumb, html, icon, initialsOf, paragraphs } from '../ui.js'
import { hubPage } from './layout.js'
import { notFound } from './stream.js'

export function meView() {
  const { about, hours } = state.profile
  return hubPage(html`
    ${crumb(href.home, 'Your hub')}
    <div class="page-head profile-head" data-testid="profile-me">
      <span class="avatar avatar-big" aria-hidden="true">${volunteer.initials}</span>
      <div>
        <p class="eyebrow">Your profile</p>
        <h1>${volunteer.name}</h1>
        <ul class="meta-list">
          <li>${icon('pin')} ${volunteer.place}</li>
          ${hours ? html`<li>${icon('clock')} ${hours} a week</li>` : ''}
        </ul>
      </div>
    </div>
    <section class="block">
      <h2 class="block-title">About you</h2>
      ${about ? paragraphs([about]) : html`<p class="muted">Left empty.</p>`}
    </section>
  `)
}

export function personView(id) {
  const lead = findLead(id)
  if (!lead) return notFound()
  const items = ledBy(lead)
  const [first] = items
  return hubPage(html`
    ${first ? crumb(href.item(first), first.title) : crumb(href.home, 'Your hub')}
    <div class="page-head profile-head" data-testid="profile-${lead.id}">
      <span class="avatar avatar-big" aria-hidden="true">${initialsOf(lead.name)}</span>
      <div>
        <p class="eyebrow">${first?.kind === 'group' ? 'Group lead' : 'Stream lead'}</p>
        <h1>${lead.name}</h1>
        <ul class="meta-list">
          <li>${icon('pin')} ${lead.place}</li>
          ${items.map((item) => html`<li>${icon('user')} Leads <a class="link" href="${href.item(item)}">${item.title}</a></li>`)}
        </ul>
      </div>
    </div>
    ${paragraphs(lead.about)}
  `)
}
