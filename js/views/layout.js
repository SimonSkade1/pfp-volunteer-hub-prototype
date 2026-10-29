// The frame around every screen: the prototype bar, the hub's top bar and the page container; on a stream's or group's
// page, the back link and the demo's "view as" switch to its lead view.

import { volunteer } from '../data.js'
import { href } from '../router.js'
import { applicationsFor } from '../state.js'
import { crumb, html, icon, raw } from '../ui.js'

export function prototypeBar() {
  return html`<div class="proto-bar" role="note">
    <span><strong>Prototype</strong><span class="proto-long"> of the PFP volunteer hub: all people and data are made up, nothing is sent.</span><span class="proto-short"> · made-up data</span></span>
    <button class="proto-restart" type="button" data-action="restart" data-testid="restart-demo">${icon('restart')} Restart demo</button>
  </div>`
}

function topBar() {
  return html`<header class="topbar">
    <div class="wrap topbar-inner">
      <a class="brand" href="${href.home}" data-testid="home">
        <span class="wordmark">People for a Pause<span class="dot">.</span></span>
        <span class="brand-sub">Volunteer hub</span>
      </a>
      <div class="me" data-testid="me" title="${volunteer.name} · ${volunteer.place}">
        <span class="avatar">${volunteer.initials}</span><span class="me-name">${volunteer.name}</span>
      </div>
    </div>
  </header>`
}

// width: 'wide' for the card grids of the main page, 'narrow' for reading pages.
export function hubPage(content, width = 'narrow') {
  return html`${prototypeBar()}${topBar()}<main class="wrap main main-${width}">${content}</main>`
}

// The row above a page's head: its back link and, to the right (below it on a phone), e.g. the view switch.
export function pageTop(to, label, extra = '') {
  return html`<div class="page-top">${crumb(to, label)}${extra}</div>`
}

// The demo's switch between a stream's or group's page as volunteers see it and its lead view (Spec 21). In the hub,
// only the lead would have it. "Lead" shows how many applications wait for a decision.
export function viewSwitch(item, active) {
  const waiting = applicationsFor(item).filter((a) => a.status === 'pending').length
  const segment = (name, to, label) =>
    html`<a class="seg ${name === active ? 'is-active' : ''}" href="${to}" ${name === active ? raw('aria-current="page"') : ''} data-testid="view-${name}">${label}</a>`
  return html`<div class="view-switch" data-testid="view-switch">
    <span class="demo-tag">Demo</span>
    <span class="view-switch-label">View as</span>
    <span class="segs">
      ${segment('volunteer', href.item(item), 'Volunteer')}${segment('lead', href.manage(item.id), html`Lead${waiting ? html`<span class="seg-count">${waiting}</span>` : ''}`)}
    </span>
  </div>`
}
