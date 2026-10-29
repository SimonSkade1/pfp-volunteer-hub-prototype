# PFP volunteer hub — prototype

A click-through prototype of the People for a Pause volunteer hub, for Ben and Felix to decide on the onboarding flow:
the welcome email after the website signup → the one onboarding step → the hub's main page → applying to a local group
or a stream → pending → accepted → the stream's or group's page. A "View as: Volunteer | Lead" switch on those pages
opens the lead view: applications with Claude's pre-screen (accept / reject); for a stream, its members by step and an
editor for its description, steps and resources; for a group, its task boards and a form for a new project. Front end
only: mock data, no backend, nothing is sent; all people, numbers and dates are made up (real links are marked with an
external-link icon).

Live: https://simonskade1.github.io/pfp-volunteer-hub-prototype/

## Demo state and reset

The volunteer's progress (onboarding answer, applications, steps done, claimed tasks, lead applications) lives in the
browser's `localStorage` under `pfp-volunteer-hub-prototype:v1` (bump the version in `js/state.js` whenever the stored
shape changes). A first visit starts at the welcome email. To start over:

1. "Restart demo" in the black prototype bar at the top, or
2. open the site with `?reset=1`: https://simonskade1.github.io/pfp-volunteer-hub-prototype/?reset=1

"Skip ahead: … accepts you" (dashed, tagged *Demo*) on a pending stream or group stands in for the lead's or Claude's
acceptance; the lead view lists your application too, and accepting or rejecting it there changes your state the same
way (after a rejection you can apply again).

The lead view's other changes (decisions on the made-up applicants, edits of a stream, new projects) are mock, as the
spec says: they change the objects in `js/data.js` in place, so the volunteer side shows them at once, and a reload
drops them. "Restart demo" is such a reload (`?reset=1`).

## Run and deploy

No build step and no dependencies: plain HTML, CSS and JavaScript modules.

```sh
python3 -m http.server 8765        # then open http://127.0.0.1:8765/
```

Every push to `main` deploys: GitHub Pages serves the branch's root as it is (`.nojekyll`), about a minute after the
push; `gh api repos/SimonSkade1/pfp-volunteer-hub-prototype/pages/builds/latest --jq '.status + " " + .commit'` says
when (`built`, `building` or `errored`). Pages caches files for up to 10 minutes; a fresh browser context (or a hard
reload) sees the new version.

## Code layout

| File | What it holds |
|---|---|
| `js/data.js` | **Data**: all mock content — the demo volunteer, the welcome email, `streams` (Getting started is `kind: 'start'`), `groups` with their team `projects`, the two lead forms. For the lead view: every stream's and group's `members` (a stream member's progress: the ids of the steps they did, `done`, filled from `steps` at load) and mock `applications` with Claude's pre-screen (`screen`: `accept` / `review` / `spam`, and `reasons`). Views read these objects on every render; the lead view changes them in place; nothing in here is persisted. |
| `js/state.js` | **State**: the volunteer's progress in `localStorage`, selectors that combine it with the data (`membership`, `progress`, `memberCount`, `teamTask`, and for the lead view `applicationsFor`, `membersByStep`) and the actions that change it. `update(fn)` saves and re-renders; `rerender()` only re-renders (after the lead view's in-place edits). |
| `js/views/*.js` | **Views**: one function per screen, returning HTML (`email`, `onboarding`, `home` = main page, `stream` = stream and task pages, `group`, `apply` = apply-to-join and the two apply-to-lead forms, `manage` = the lead view of a stream or group, with its own click and submit handlers and the open-editor state, `layout` = prototype bar, top bar, page frame, back link row and the view switch). |
| `js/app.js` | Boot and wiring: hash route → view, re-render on route or state change, and two delegated handlers: clicks on `[data-action]` (the `actions` object, plus `manageActions`) and submits of `form[data-form]` (the `forms` object, plus `manageForms`). |
| `js/router.js` | Hash routes (`#/email`, `#/welcome`, `#/hub`, `#/s/<stream>`, `#/s/<stream>/<task>`, `#/g/<group>`, `#/apply/<id>`, `#/lead/group`, `#/lead/stream` = the apply-to-lead forms, `#/manage/<id>` = the lead view) and the `href` helpers. |
| `js/ui.js` | The `html` template tag (escapes interpolations; `raw()` opts out), icons, small shared pieces (badge, back link, progress bar), `toast()`. |
| `css/style.css` | All styles. Look: a loose cue from peopleforapause.org (its red `#d7263d`, blue `#173a8f`, ink, fonts Schibsted Grotesk and Source Serif 4, in `fonts/` under the OFL). |

Two kinds of task lists: a stream's `tasks` are an individual pipeline (the same steps for everyone; your progress is
`state.done`), a group project's `tasks` are a team board (`owner` in the data; your own claims are `state.claims`).

## Walkthrough script and test ids

`python3 scripts/walkthrough.py [url] [out_dir]` (Python Playwright with Chromium) clicks through the whole demo path,
volunteer side and lead view, at 1440×900 and 390×844, screenshots every screen into `out_dir` (default
`/tmp/pfp-hub-walkthrough`) and fails on a missing element, a console error or a page error. Default url: the live
site. It finds elements by `data-testid` (`page.get_by_test_id(…)`); the main ones: `open-hub`, `onboarding-next`,
`card-<id>` (a card; its title link opens the page), `apply-<id>` and `apply` (apply buttons), `apply-text`,
`apply-commit`, `apply-submit`, `accept-demo`, `rejected-note`, `step-<task>`, `task-action`, `mark-done`,
`team-task-<task>` with `claim` / `claim-done` / `unclaim` inside, `lead-group`, `lead-stream`, `lead-submit`, `home`,
`back`, `toast`, `restart-demo`.

Lead view: `view-volunteer` / `view-lead` (the switch), `manage-<id>`, `application-<id>` (yours: `application-you`)
with `accept-application` / `reject-application` inside, `decided-<id>` with `undo-decision`, `funnel-<task>` and
`funnel-done` (members by step), `description-edit` / `description-text`, `add-step`, `edit-step-<task>` with `step-up`
/ `step-down` / `step-edit` / `step-remove`, `step-title` / `step-time` / `step-summary` / `step-howto`, `add-resource`,
`edit-resource-<index>` with `resource-edit` / `resource-remove`, `resource-title` / `resource-type` / `resource-note` /
`resource-link`, `create-project`, `project-name` / `project-description` / `project-tasks`, `project-<id>` (a task
board), and `edit-save` / `edit-cancel` in every editor.
