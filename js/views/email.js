// The demo's first screen: the welcome email a new volunteer gets after signing up on the website (Spec 3, 17).

import { volunteer, welcomeEmail as mail } from '../data.js'
import { href } from '../router.js'
import { html } from '../ui.js'
import { prototypeBar } from './layout.js'

export function emailView() {
  return html`${prototypeBar()}
    <main class="email-stage">
      <p class="email-caption">${volunteer.firstName} signed up on peopleforapause.org with their name, email and location. A minute later, this email arrives:</p>
      <article class="email" data-testid="welcome-email">
        <header class="email-head">
          <h1 class="email-subject">${mail.subject}</h1>
          <dl class="email-meta">
            <div><dt>From</dt><dd>${mail.from}</dd></div>
            <div><dt>To</dt><dd>${mail.to}</dd></div>
          </dl>
        </header>
        <div class="email-banner">People for a Pause<span class="dot">.</span></div>
        <div class="email-body">
          ${mail.before.map((p) => html`<p>${p}</p>`)}
          <p class="email-cta"><a class="btn btn-primary btn-big" href="${href.onboarding}" data-testid="open-hub">${mail.button}</a></p>
          <p class="email-small">${mail.buttonNote}</p>
          ${mail.after.map((p) => html`<p>${p}</p>`)}
          <p>${mail.signature}</p>
          <p class="email-ps">${mail.ps}</p>
        </div>
      </article>
    </main>`
}
