# PFP volunteer hub — prototype

A click-through prototype of the People for a Pause volunteer hub, for Ben and Felix to decide on the onboarding flow:
the welcome email after the website signup → the one onboarding step → the hub's main page → applying to a local group
or a stream → pending → accepted → the stream's or group's page. Front end only: mock data, no backend, nothing is sent;
all people, numbers and dates are made up (real links are marked with an external-link icon).

Live: https://simonskade1.github.io/pfp-volunteer-hub-prototype/

## Demo state and reset

The volunteer's progress (onboarding answer, applications, steps done, claimed tasks, lead applications) lives in the
browser's `localStorage` under `pfp-volunteer-hub-prototype:v1` (bump the version in `js/state.js` whenever the stored
shape changes). A first visit starts at the welcome email. To start over:

1. "Restart demo" in the black prototype bar at the top, or
2. open the site with `?reset=1`: https://simonskade1.github.io/pfp-volunteer-hub-prototype/?reset=1

"Skip ahead: … accepts you" (dashed, tagged *Demo*) on a pending stream or group stands in for the lead's or Claude's
acceptance.

## Run and deploy

No build step and no dependencies: plain HTML, CSS and JavaScript modules.

```sh
python3 -m http.server 8765        # then open http://127.0.0.1:8765/
```

Every push to `main` deploys: GitHub Pages serves the branch's root as it is (`.nojekyll`), about a minute after the
push. Pages caches files for up to 10 minutes; a fresh browser context (or a hard reload) sees the new version.

## Code layout

| File | What it holds |
|---|---|
| `js/data.js` | **Data**: all mock content — the demo volunteer, the welcome email, `streams` (Getting started is `kind: 'start'`), `groups` with their team `projects`, the two lead forms. Views read these objects on every render, so in-page edits (e.g. a lead view's mock editing) can change them directly; nothing in here is persisted. |
| `js/state.js` | **State**: the volunteer's progress in `localStorage`, selectors that combine it with the data (`membership`, `progress`, `teamTask`, …) and the actions that change it. `update(fn)` saves and re-renders. |
| `js/views/*.js` | **Views**: one function per screen, returning HTML (`email`, `onboarding`, `home` = main page, `stream` = stream and task pages, `group`, `apply` = apply-to-join and the two apply-to-lead forms, `layout` = prototype bar, top bar, page frame). |
| `js/app.js` | Boot and wiring: hash route → view, re-render on route or state change, and two delegated handlers: clicks on `[data-action]` (the `actions` object) and submits of `form[data-form]` (the `forms` object). Also `toast()`. |
| `js/router.js` | Hash routes (`#/email`, `#/welcome`, `#/hub`, `#/s/<stream>`, `#/s/<stream>/<task>`, `#/g/<group>`, `#/apply/<id>`, `#/lead/group`, `#/lead/stream`) and the `href` helpers. |
| `js/ui.js` | The `html` template tag (escapes interpolations; `raw()` opts out), icons, small shared pieces (badge, back link, progress bar). |
| `css/style.css` | All styles. Look: a loose cue from peopleforapause.org (its red `#d7263d`, blue `#173a8f`, ink, fonts Schibsted Grotesk and Source Serif 4, in `fonts/` under the OFL). |

Two kinds of task lists: a stream's `tasks` are an individual pipeline (the same steps for everyone; your progress is
`state.done`), a group project's `tasks` are a team board (`owner` in the data; your own claims are `state.claims`).

## Walkthrough script and test ids

`python3 scripts/walkthrough.py [url] [out_dir]` (Python Playwright with Chromium) clicks through the whole demo path at
1440×900 and 390×844, screenshots every screen into `out_dir` (default `/tmp/pfp-hub-walkthrough`) and fails on a
missing element, a console error or a page error. Default url: the live site. It finds elements by `data-testid`
(`page.get_by_test_id(…)`); the main ones: `open-hub`, `onboarding-next`, `card-<id>` (a card; its title link opens
the page), `apply-<id>` and `apply` (apply buttons), `apply-text`, `apply-commit`, `apply-submit`, `accept-demo`,
`step-<task>`, `task-action`, `mark-done`, `team-task-<task>` with `claim` / `claim-done` / `unclaim` inside,
`lead-group`, `lead-stream`, `lead-submit`, `home`, `back`, `toast`, `restart-demo`.
