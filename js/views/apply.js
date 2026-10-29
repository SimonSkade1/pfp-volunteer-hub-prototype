// The apply page (Spec 7, 17), shared by streams, groups and vacancies. A stream or group: the lead's expectations
// text (as the lead view last saved it) and a text field; streams also ask you to state that you can commit (Spec 7.2).
// Where the lead lets Claude accept clear cases (Spec 14, 21), a Demo-tagged line says you're in on submit. A vacancy
// (Spec 17.4): one field, why you'd be a good fit.

import { findItem, firstName } from '../data.js'
import { href } from '../router.js'
import { membership } from '../state.js'
import { crumb, html, richParagraphs } from '../ui.js'
import { hubPage } from './layout.js'
import { notFound } from './stream.js'

const KINDS = { stream: 'Stream', group: 'Local group', vacancy: 'Vacancy' }

export function applyView(id) {
  const item = findItem(id)
  if (!item || item.kind === 'start') return notFound()
  const isVacancy = item.kind === 'vacancy'

  if (membership(item.id) !== 'none')
    return hubPage(html`
      ${crumb(href.item(item), item.title)}
      <div class="page-head"><h1>You’ve already applied</h1><p class="lead"><a class="link" href="${href.item(item)}">Back to ${item.title}</a></p></div>
    `)

  return hubPage(html`
    ${crumb(href.item(item), item.title)}
    <div class="page-head">
      <p class="eyebrow">${isVacancy ? 'Apply' : 'Apply to join'} · ${KINDS[item.kind]}</p>
      <h1>${item.title}</h1>
    </div>
    ${isVacancy
      ? ''
      : html`<section class="block">
          <h2 class="block-title">What ${firstName(item.lead)} expects from you</h2>
          <blockquote class="expectations" data-testid="expectations">
            ${richParagraphs(item.expectations)}
            <footer>${item.lead}, ${item.kind === 'group' ? 'group lead' : 'stream lead'}</footer>
          </blockquote>
        </section>`}
    <form class="form card" data-form="apply" data-id="${item.id}" data-testid="apply-form">
      <label class="field">
        <span class="label">${isVacancy ? 'Why would you be a good fit?' : 'Your application'}</span>
        <textarea name="text" rows="${isVacancy ? 6 : 4}" required data-testid="apply-text" placeholder="${item.applyPlaceholder}"></textarea>
      </label>
      ${item.kind === 'stream'
        ? html`<label class="check">
            <input type="checkbox" name="commit" required data-testid="apply-commit">
            <span>${item.commitmentText}</span>
          </label>`
        : ''}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit" data-testid="apply-submit">Send application</button>
        <a class="btn btn-link" href="${href.item(item)}">Cancel</a>
      </div>
      ${item.claudeAccepts
        ? html`<p class="demo-line" data-testid="claude-accepts"><span class="demo-tag">Demo</span> ${firstName(item.lead)} lets Claude accept clear cases, and the demo counts yours as clear: you’re in on submit.</p>`
        : ''}
    </form>
  `)
}
