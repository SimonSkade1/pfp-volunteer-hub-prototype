// Applying to join a group or stream (Spec 7, 17): the lead's expectations text and a text field; streams also ask you
// to state that you can commit (Spec 7.2). Applying to lead a local group or a stream (Spec 6.3, 6.5, 8): simple forms.

import { findItem, hoursOptions, leadForms, volunteer } from '../data.js'
import { href } from '../router.js'
import { membership, state } from '../state.js'
import { crumb, html } from '../ui.js'
import { hubPage } from './layout.js'
import { notFound } from './stream.js'

export function applyView(id) {
  const item = findItem(id)
  if (!item || item.kind === 'start') return notFound()
  const lead = item.lead.split(' ')[0]
  const isStream = item.kind === 'stream'

  if (membership(item.id) !== 'none')
    return hubPage(html`
      ${crumb(href.item(item), item.title)}
      <div class="page-head"><h1>You’ve already applied</h1><p class="lead"><a href="${href.item(item)}">Back to ${item.title}</a></p></div>
    `)

  return hubPage(html`
    ${crumb(href.item(item), item.title)}
    <div class="page-head">
      <p class="eyebrow">Apply to join · ${isStream ? 'Stream' : 'Local group'}</p>
      <h1>${item.title}</h1>
    </div>
    <section class="block">
      <h2 class="block-title">What ${lead} expects from you</h2>
      <blockquote class="expectations">
        <p>${item.expectations}</p>
        <footer>${item.lead}, ${isStream ? 'stream lead' : 'group lead'}</footer>
      </blockquote>
    </section>
    <form class="form card" data-form="apply" data-id="${item.id}" data-testid="apply-form">
      <label class="field">
        <span class="label">Your application</span>
        <textarea name="text" rows="4" required data-testid="apply-text" placeholder="${item.applyPlaceholder}"></textarea>
      </label>
      ${isStream
        ? html`<label class="check">
            <input type="checkbox" name="commit" required data-testid="apply-commit">
            <span>${item.commitmentText}</span>
          </label>`
        : ''}
      ${state.profile.about ? html`<p class="hint">${lead} also sees what you wrote about yourself when you joined the hub: “${state.profile.about}”</p>` : ''}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit" data-testid="apply-submit">Send application</button>
        <a class="btn btn-link" href="${href.item(item)}">Cancel</a>
      </div>
    </form>
  `)
}

export function leadView(kind) {
  const form = leadForms[kind]
  if (!form) return notFound()
  const sent = state.leadApplications[kind]

  if (sent)
    return hubPage(html`
      ${crumb(href.home, 'Your hub')}
      <div class="page-head" data-testid="lead-sent">
        <p class="eyebrow">${form.title}</p>
        <h1>Thank you, ${volunteer.firstName}</h1>
        <p class="lead">${form.sent}</p>
      </div>
      <a class="btn btn-primary" href="${href.home}">Back to your hub</a>
    `)

  return hubPage(html`
    ${crumb(href.home, 'Your hub')}
    <div class="page-head">
      <p class="eyebrow">For very committed volunteers</p>
      <h1>${form.title}</h1>
    </div>
    ${kind === 'group'
      ? html`<div class="warning" data-testid="lead-warning">${form.warning.map((p) => html`<p>${p}</p>`)}</div>`
      : html`<div class="prose">${form.intro.map((p) => html`<p>${p}</p>`)}</div>`}
    <form class="form card" data-form="lead" data-kind="${kind}" data-testid="lead-form">
      ${kind === 'group' ? groupFields(form) : streamFields(form)}
      <label class="field">
        <span class="label">How much time can you give?</span>
        <select name="hours" required data-testid="lead-hours">
          <option value="" disabled selected>Choose…</option>
          ${hoursOptions.map((option) => html`<option>${option}</option>`)}
        </select>
      </label>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit" data-testid="lead-submit">Send application</button>
        <a class="btn btn-link" href="${href.home}">Cancel</a>
      </div>
    </form>
  `)
}

function groupFields(form) {
  return html`
    <label class="field">
      <span class="label">${form.placeLabel}</span>
      <input name="place" value="${volunteer.place}" required data-testid="lead-place">
    </label>
    <label class="field">
      <span class="label">${form.whyLabel}</span>
      <textarea name="why" rows="4" required data-testid="lead-why"></textarea>
    </label>
    <label class="field">
      <span class="label">${form.whoLabel}</span>
      <span class="hint">${form.whoHint}</span>
      <textarea name="who" rows="3" data-testid="lead-who"></textarea>
    </label>`
}

function streamFields(form) {
  return html`
    <fieldset class="field">
      <legend class="label">Which stream would you like to lead?</legend>
      <div class="ideas">
        ${form.ideas.map(
          (idea, i) => html`<label class="idea">
            <input type="radio" name="idea" value="${idea.id}" ${i === 0 ? 'required' : ''} data-testid="idea-${idea.id}">
            <span><strong>${idea.title}</strong><br><span class="muted">${idea.note}</span></span>
          </label>`,
        )}
      </div>
    </fieldset>
    <label class="field">
      <span class="label">${form.pitchLabel}</span>
      <textarea name="pitch" rows="4" required data-testid="lead-pitch"></textarea>
    </label>
    <label class="field">
      <span class="label">${form.aboutLabel}</span>
      <textarea name="about" rows="3" required data-testid="lead-about"></textarea>
    </label>`
}

