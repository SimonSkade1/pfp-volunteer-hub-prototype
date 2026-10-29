// The one onboarding step on the first visit (Spec 5): a short description of yourself, then "Next" to the main page.

import { volunteer } from '../data.js'
import { state } from '../state.js'
import { html } from '../ui.js'
import { hubPage } from './layout.js'

export function onboardingView() {
  const { about, hopes } = state.profile
  return hubPage(html`
    <div class="page-head">
      <p class="eyebrow">You’re signed in</p>
      <h1>Welcome, ${volunteer.firstName}</h1>
      <p class="lead">One quick step before you start. Leads of local groups and streams see your answer when you apply to join them.</p>
    </div>
    <form class="form card" data-form="onboarding" data-testid="onboarding-form">
      <label class="field">
        <span class="label">Tell us about yourself and why you care about AI risk</span>
        <span class="hint">A few sentences are enough.</span>
        <textarea name="about" rows="5" data-testid="onboarding-about" placeholder="e.g. I’m a nurse in Ann Arbor and a mom of two. I read that AI companies are racing to build superintelligence, and it worries me that nobody is stopping them.">${about}</textarea>
      </label>
      <label class="field">
        <span class="label">What would you like to do with us? <span class="optional">Optional</span></span>
        <textarea name="hopes" rows="2" data-testid="onboarding-hopes" placeholder="e.g. talk to my representatives, write, organize events, or not sure yet">${hopes}</textarea>
      </label>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit" data-testid="onboarding-next">Next</button>
      </div>
    </form>
  `)
}
