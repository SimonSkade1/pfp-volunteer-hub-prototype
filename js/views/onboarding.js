// The one onboarding step on the first visit (Spec 5), About you: two required fields, a few sentences about yourself
// and how many hours a week you'd like to volunteer; then "Next" to the main page. Your profile shows both.

import { hoursOptions, volunteer } from '../data.js'
import { state } from '../state.js'
import { html } from '../ui.js'
import { hubPage } from './layout.js'

export function onboardingView() {
  const { about, hours } = state.profile
  return hubPage(html`
    <div class="page-head">
      <p class="eyebrow">You’re signed in</p>
      <h1>Welcome, ${volunteer.firstName}</h1>
    </div>
    <form class="form card" data-form="onboarding" data-testid="onboarding-form">
      <label class="field">
        <span class="label">Tell us about yourself and why you care about AI risk</span>
        <textarea name="about" rows="5" required data-testid="onboarding-about" placeholder="e.g. I’m a nurse in Ann Arbor and a mom of two. I read that AI companies are racing to build superintelligence, and it worries me that nobody is stopping them.">${about}</textarea>
      </label>
      <fieldset class="field">
        <legend class="label">How many hours a week would you like to volunteer?</legend>
        <div class="choices" data-testid="onboarding-hours">
          ${hoursOptions.map(
            (option, i) => html`<label class="choice">
              <input type="radio" name="hours" value="${option}" ${i === 0 ? 'required' : ''} ${option === hours ? 'checked' : ''}>
              <span>${option}</span>
            </label>`,
          )}
        </div>
      </fieldset>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit" data-testid="onboarding-next">Next</button>
      </div>
    </form>
  `)
}
