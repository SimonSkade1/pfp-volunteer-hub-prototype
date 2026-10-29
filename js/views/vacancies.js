// The vacancies (Spec 6.4, 17.4): the page "Want to do more?" links, a card per vacancy, and each vacancy's page with
// Apply in its head. Applying uses the shared apply page; once sent, the vacancy's page says so (no acceptance).

import { findVacancy, vacancies, vacancySent } from '../data.js'
import { href } from '../router.js'
import { membership } from '../state.js'
import { crumb, html, icon, paragraphs, statusBadge } from '../ui.js'
import { cardTitle, metaLine } from './home.js'
import { hubPage } from './layout.js'
import { notFound } from './stream.js'

const sent = (vacancy) => membership(vacancy.id) === 'pending'

export function vacanciesView() {
  return hubPage(html`
    ${crumb(href.home, 'Your hub')}
    <div class="page-head" data-testid="vacancies"><p class="eyebrow">Want to do more?</p><h1>Volunteer vacancies</h1></div>
    <div class="grid">
      ${vacancies.map(
        (vacancy) => html`<article class="card" data-testid="card-${vacancy.id}">
          ${sent(vacancy) ? html`<div class="card-top"><span></span>${statusBadge('sent')}</div>` : ''}
          ${cardTitle(vacancy)}
          <p class="card-text">${vacancy.tagline}</p>
          ${metaLine('clock', [vacancy.commitment])}
          ${metaLine('pin', [vacancy.where])}
        </article>`,
      )}
    </div>
  `)
}

export function vacancyView(id) {
  const vacancy = findVacancy(id)
  if (!vacancy) return notFound()
  return hubPage(html`
    ${crumb(href.vacancies, 'Volunteer vacancies')}
    <div class="page-head" data-testid="vacancy-${vacancy.id}">
      <p class="eyebrow">Vacancy</p>
      <div class="head-row">
        <h1>${vacancy.title} ${sent(vacancy) ? statusBadge('sent') : ''}</h1>
        ${sent(vacancy) ? '' : html`<a class="btn btn-primary" href="${href.apply(vacancy.id)}" data-testid="apply">Apply</a>`}
      </div>
      <p class="lead">${vacancy.tagline}</p>
      <ul class="meta-list">
        <li>${icon('clock')} ${vacancy.commitment}</li>
        <li>${icon('pin')} ${vacancy.where}</li>
      </ul>
      ${sent(vacancy)
        ? html`<section class="pending-box" data-testid="vacancy-sent">
            <p class="pending-title">${icon('check')} Application sent</p>
            <p>${vacancySent}</p>
          </section>`
        : ''}
    </div>
    ${vacancy.warning ? html`<div class="warning" data-testid="vacancy-warning">${vacancy.warning.map((p) => html`<p>${p}</p>`)}</div>` : ''}
    ${paragraphs(vacancy.description)}
  `)
}
