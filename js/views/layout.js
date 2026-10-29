// The frame around every screen: the prototype bar, the hub's top bar and the page container.

import { volunteer } from '../data.js'
import { href } from '../router.js'
import { html, icon } from '../ui.js'

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
