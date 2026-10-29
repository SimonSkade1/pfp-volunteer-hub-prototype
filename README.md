# PFP volunteer hub — prototype

A click-through prototype of the People for a Pause volunteer hub, for Ben and Felix to decide on the onboarding flow:
the welcome email after the website signup → the one onboarding step (about you, hours a week) → the hub's main page
(your groups and streams; join a local group; join a stream, Getting started last; "Want to do more?" → vacancies) →
a stream's, group's or vacancy's page with Apply in its head → the apply page → pending → accepted (skip ahead) →
the stream's steps or the group's task board, and a mock "Connect Discord". Profiles: yours from your initials in the
top bar, a lead's from their name. A "View as: Volunteer | Lead" switch on stream and group pages opens the lead view:
applications with Claude's pre-screen (accept / reject); for a stream, its members by step and an editor for its
description, steps and resources; for a group, its task boards and a form for a new project. Front end only: mock data,
no backend, nothing is sent; all people, numbers and dates are made up (real links are marked with an external-link
icon).

Live: https://simonskade1.github.io/pfp-volunteer-hub-prototype/

## Demo state and reset

The volunteer's progress (onboarding answers, what you joined or applied to, steps done, claimed tasks, the Discord
connect) lives in the browser's `localStorage` under `pfp-volunteer-hub-prototype:v2` (bump the version in
`js/state.js` whenever the stored shape changes). A first visit starts at the welcome email. To start over:

1. "Restart demo" in the black prototype bar at the top, or
2. open the site with `?reset=1`: https://simonskade1.github.io/pfp-volunteer-hub-prototype/?reset=1

"Skip ahead: … accepts you" (dashed, tagged *Demo*) on a pending stream or group stands in for the lead's acceptance;
the lead view lists your application too, and accepting or rejecting it there changes your state the same way (after a
rejection you can apply again). A vacancy you applied to stays "Application sent" (no acceptance in the demo).

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
| `js/data.js` | **Data**: all mock content — the demo volunteer, the welcome email (same text as the vault note), `streams` (Getting started is `kind: 'start'`: joined in one click; Town halls and Op-eds are `kind: 'stream'`), `groups` with their team `projects`, `vacancies` (`kind: 'vacancy'`), the leads' profiles (`leads`, matched by name to an item's `lead`), `RADIUS_MI` (groups listed on the main page), `hoursOptions` (the onboarding's choice). A text may hold a link written `[label](https://…)` (Town halls' expectations link the Luma calendar); `richText` in `js/ui.js` renders it. For the lead view: every stream's and group's `members` and mock `applications` with Claude's pre-screen (`screen`: `accept` / `review` / `spam`, and `reasons`). Views read these objects on every render; the lead view changes them in place; nothing in here is persisted. |
| `js/state.js` | **State**: the volunteer's progress in `localStorage` (`profile` {about, hours}, `joined`, `applications` for streams, groups and vacancies, `done`, `claims`, `discord`), selectors that combine it with the data (`membership`, `progress`, `memberCount`, `teamTask`, and for the lead view `applicationsFor`, `membersByStep`) and the actions that change it. `update(fn)` saves and re-renders; `rerender()` only re-renders (after the lead view's in-place edits). |
| `js/views/*.js` | **Views**: one function per screen, returning HTML (`email`, `onboarding`, `home` = main page and the shared card pieces, `stream` = stream and task pages plus the page head's title row with Apply / Join, the pending box and the Discord button, `group`, `apply` = the apply page of a stream, group or vacancy, `vacancies` = the vacancies page and a vacancy's page, `profile` = yours and a lead's, `manage` = the lead view of a stream or group, with its own click and submit handlers and the open-editor state, `layout` = prototype bar, sticky top bar, page frame, back link row and the view switch). |
| `js/app.js` | Boot and wiring: hash route → view, re-render on route or state change, and two delegated handlers: clicks on `[data-action]` (the `actions` object, plus `manageActions`) and submits of `form[data-form]` (the `forms` object, plus `manageForms`). |
| `js/router.js` | Hash routes (`#/email`, `#/welcome` = onboarding, `#/hub` = main page, `#/s/<stream>`, `#/s/<stream>/<task>`, `#/g/<group>`, `#/vacancies`, `#/v/<vacancy>`, `#/apply/<stream, group or vacancy>`, `#/me` = your profile, `#/p/<lead id>` = a lead's, `#/manage/<stream or group>` = the lead view) and the `href` helpers. |
| `js/ui.js` | The `html` template tag (escapes interpolations; `raw()` opts out), `richText`, icons, small shared pieces (badge, back link, progress bar), `toast()`. |
| `css/style.css` | All styles. Look: a loose cue from peopleforapause.org (its red `#d7263d`, blue `#173a8f`, ink, fonts Schibsted Grotesk and Source Serif 4, in `fonts/` under the OFL). Red and blue in balance within every screenful (Spec 23.1); the color roles are in the file's first comment: the sticky top bar's ribbon carries both, a page head pairs a navy title with a red eyebrow chip and its red call to action, red marks what you can do, blue where you are and what things are. |

Two kinds of task lists: a stream's `tasks` are an individual pipeline (the same steps for everyone; your progress is
`state.done`), a group project's `tasks` are a team board (`owner` in the data; your own claims are `state.claims`).

## Walkthrough, color check and test ids

`python3 scripts/walkthrough.py [url] [out_dir]` (Python Playwright with Chromium) clicks through the whole demo path,
volunteer side and lead view, at 1440×900 and 390×844, screenshots every screen into `out_dir` (default
`/tmp/pfp-hub-walkthrough`; full-page shots from the top without the toast, the others as the screen shows them) and
fails on a missing element, a console error or a page error. Default url: the live site. Then
`python3 scripts/color_balance.py [out_dir] [max_ratio]` (numpy, Pillow) cuts those screenshots into screenfuls (every
half screen, with the sticky top bar) and counts strongly red and blue pixels: it fails where one color has more than
`max_ratio` (default 3) times the other.

The scripts find elements by `data-testid` (`page.get_by_test_id(…)`). Main page: `your-items` (Your groups and
streams; `your-empty` while empty), `join-group` (`no-group-near`, `start-group`), `join-stream` (`no-application` on
Getting started), `do-more` (`vacancies-link`), `card-<id>` (a card: stream, group or vacancy; its title link opens
the page), `me` (your initials), `home`, `back`, `toast`, `restart-demo`. Pages: `welcome-email` / `open-hub`;
`onboarding-form` / `onboarding-about` / `onboarding-hours` / `onboarding-next`; `stream-<id>`, `group-<id>`,
`vacancy-<id>` (the page heads) with `apply` (Apply in the head) or `join` (Getting started), `lead-profile`,
`pending-box` with `meanwhile` and `accept-demo`, `rejected-note`, `vacancy-warning`, `vacancy-sent`; `preview` (the
step titles before you're in), `task-list` with `step-<task>`, `discord-line` with `discord-connect` / `discord-open`,
`resources`, `about`; the task page `task-<task>` with `task-action`, `mark-done`, `task-done`, `next-step`,
`undo-done`; a group's `project-<id>` with `team-task-<task>` (`claim` / `claim-done` / `unclaim` / `reopen` inside)
and `members`; the apply page `apply-form` / `expectations` / `apply-text` / `apply-commit` / `apply-submit`;
`vacancies`; `profile-me`, `profile-<lead id>`.

Lead view: `view-volunteer` / `view-lead` (the switch), `manage-<id>`, `application-<id>` (yours: `application-you`)
with `accept-application` / `reject-application` inside, `decided-<id>` with `undo-decision`, `funnel-<task>` and
`funnel-done` (members by step), `description-edit` / `description-text`, `add-step`, `edit-step-<task>` with `step-up`
/ `step-down` / `step-edit` / `step-remove`, `step-title` / `step-time` / `step-summary` / `step-howto`, `add-resource`,
`edit-resource-<index>` with `resource-edit` / `resource-remove`, `resource-title` / `resource-type` / `resource-note` /
`resource-link`, `create-project`, `project-name` / `project-description` / `project-tasks`, `project-<id>` (a task
board), and `edit-save` / `edit-cancel` in every editor.
