# PFP volunteer hub — prototype

"Spec N" in this README, the code comments and the scripts refers to the project's archived spec (vault note `;archived spec of rounds 1 to 3 for the onboarding prototype`, Spec 1–25), not to the project's current Spec, rewritten on 2026-10-29.

A click-through prototype of the People for a Pause volunteer hub, for Ben and Felix to decide on the onboarding flow:
the welcome email after the website signup → the one onboarding step (about you, hours a week) → the hub's main page
(your groups and streams; join a local group; join a stream, Getting started last; "Want to do more?" → vacancies) → a
stream's, group's or vacancy's page with Apply in its head → the apply page → pending → accepted (skip ahead) → first
Discord's own "Connect Discord" button in the page head (mock), then the stream's steps or the group's Team projects (a
card per project, which opens the project's page with its task board). A group's next meeting and Town halls' next
workshops carry made-up Luma links (a toast). Profiles: yours from your initials in the top bar, a lead's from their
name. A "View as: Volunteer | Lead" switch on stream, group and project pages opens the lead view: the
lead's expectations (editable; the apply page shows them) and who accepts applications ("I review every application" /
"Claude accepts clear cases, I review the rest": Op-eds is set to Claude, Town halls and Detroit area to their leads);
applications with the applicant's profile and hours, Claude's pre-screen and accept / reject, Claude's accepts marked
and undoable; for a stream, its members by step and an editor for its description, steps and resources; for a group, its
projects' cards, each opening the project's lead page with its task board, and a form for a new project. Front end
only: mock data, no backend, nothing is sent; all people, numbers and dates are made up (real links are marked with an
external-link icon, and so are the made-up Luma links, which only open a toast).

Live: https://simonskade1.github.io/pfp-volunteer-hub-prototype/

## Demo state and reset

The volunteer's progress (onboarding answers, what you joined or applied to, steps done, claimed tasks, the Discord
connect) lives in the browser's `localStorage` under `pfp-volunteer-hub-prototype:v3` (bump the version in
`js/state.js` whenever the stored shape changes). A first visit starts at the welcome email. To start over:

1. "Restart demo" in the black prototype bar at the top, or
2. open the site with `?reset=1`: https://simonskade1.github.io/pfp-volunteer-hub-prototype/?reset=1

"Skip ahead: … accepts you" (dashed, tagged *Demo*) on a pending stream or group stands in for the lead's acceptance;
the lead view lists your application too, and accepting or rejecting it there changes your state the same way (after a
rejection you can apply again). Where the lead lets Claude accept clear cases (Op-eds, or any stream or group switched
to it in the lead view), the apply page says so in a *Demo* line and you're in on submit: the demo counts every
application as clear. Switching a stream or group to Claude accepts its waiting applications Claude rates Accept, yours
too; the lead's Undo puts one back with the lead. A vacancy you applied to stays "Application sent" (no acceptance in
the demo).

The lead view's other changes (decisions on the made-up applicants, the expectations, the Claude setting, edits of a
stream, new projects) are mock, as the spec says: they change the objects in `js/data.js` in place, so the volunteer
side shows them at once, and a reload drops them. "Restart demo" is such a reload (`?reset=1`).

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
| `js/data.js` | **Data**: all mock content — the demo volunteer, the welcome email (same text as the vault note), `streams` (Getting started is `kind: 'start'`: joined in one click; Town halls and Op-eds are `kind: 'stream'`), `groups` with their team `projects` (each with `tagline`, its card's one line, and `description`), `vacancies` (`kind: 'vacancy'`), the leads' profiles (`leads`, matched by name to an item's `lead`), `RADIUS_MI` (groups listed on the main page), `hoursOptions` (the onboarding's choice). A text may hold a link written `[label](https://…)`; `richText` in `js/ui.js` renders it, `richParagraphs` a text of paragraphs split by an empty line (the expectations). A group's `nextMeeting` and Town halls' `workshops` are `{date, place, luma}`: `luma` is a made-up lu.ma link (`eventsCell` in `js/ui.js` renders them, the link opening a toast). For the lead view: every stream's and group's `members`, `claudeAccepts` (the lead's setting: `true` = Claude accepts clear cases) and mock `applications` with the applicant's profile (`place`, `about`, `hours`), Claude's pre-screen (`screen`: `accept` / `review` / `spam`, and `reasons`) and `status` (`by: 'claude'` where Claude accepted it). Views read these objects on every render; the lead view changes them in place; nothing in here is persisted. |
| `js/state.js` | **State**: the volunteer's progress in `localStorage` (`profile` {about, hours}, `joined`, `applications` for streams, groups and vacancies, each {status, text, by}, `done`, `claims`, `discord`), selectors that combine it with the data (`membership`, `progress`, `memberCount`, `teamTask`, `projectCounts` with a project's members, i.e. who claimed one of its tasks, and for the lead view `applicationsFor`, `membersByStep`) and the actions that change it (`apply` accepts at once where `claudeAccepts`; `setClaudeAccepts` is the lead's setting). `update(fn)` saves and re-renders; `rerender()` only re-renders (after the lead view's in-place edits). |
| `js/views/*.js` | **Views**: one function per screen, returning HTML (`email`, `onboarding`, `home` = main page and the shared card pieces, `stream` = stream and task pages plus the page head's title row with Apply / Join, the pending box and Discord's call to action, `group` = group page, project cards and project page, `apply` = the apply page of a stream, group or vacancy, `vacancies` = the vacancies page and a vacancy's page, `profile` = yours and a lead's, `manage` = the lead view of a stream or group and a project's lead page, with its own click and submit handlers and the open-editor state, `layout` = prototype bar, sticky top bar, page frame, back link row and the view switch). |
| `js/app.js` | Boot and wiring: hash route → view, re-render on route or state change, and two delegated handlers: clicks on `[data-action]` (the `actions` object, plus `manageActions`) and submits of `form[data-form]` (the `forms` object, plus `manageForms`). |
| `js/router.js` | Hash routes (`#/email`, `#/welcome` = onboarding, `#/hub` = main page, `#/s/<stream>`, `#/s/<stream>/<task>`, `#/g/<group>`, `#/g/<group>/<project>` = a project's page, `#/vacancies`, `#/v/<vacancy>`, `#/apply/<stream, group or vacancy>`, `#/me` = your profile, `#/p/<lead id>` = a lead's, `#/manage/<stream or group>` = the lead view, `#/manage/<group>/<project>` = a project's lead page) and the `href` helpers. |
| `js/ui.js` | The `html` template tag (escapes interpolations; `raw()` opts out), `richText`, icons and Discord's logo, small shared pieces (badge, back link, progress bar, `eventsCell`), `toast()`. |
| `css/style.css` | All styles. Look: a loose cue from peopleforapause.org (its red `#d7263d`, blue `#173a8f`, ink, fonts Schibsted Grotesk and Source Serif 4, in `fonts/` under the OFL). Red and blue in balance within every screenful (Spec 23.1); the color roles are in the file's first comment: the sticky top bar's ribbon carries both, a page head pairs a navy title with a red eyebrow chip and its red call to action, red marks what you can do, blue where you are and what things are; the one exception, the Discord button, keeps Discord's blurple and logo. |

Two kinds of task lists: a stream's `tasks` are an individual pipeline (the same steps for everyone; your progress is
`state.done`), a group project's `tasks` are a team board on the project's page (`owner` in the data; your own claims
are `state.claims`).

## Walkthrough, color check and test ids

`python3 scripts/walkthrough.py [url] [out_dir]` (Python Playwright with Chromium) clicks through the whole demo path,
volunteer side and lead view, at 1440×900 and 390×844, screenshots every screen into `out_dir` (default
`/tmp/pfp-hub-walkthrough`; full-page shots from the top without the toast, the others as the screen shows them) and
fails on a missing element, a console error or a page error. Default url: the live site. Then
`python3 scripts/color_balance.py [out_dir] [max_ratio]` (numpy, Pillow) cuts those screenshots into screenfuls (every
half screen, with the sticky top bar) and counts strongly red and blue pixels: it fails where one color has more than
`max_ratio` (default 3) times the other. Discord's blurple doesn't count: the Discord button keeps its brand color.

The scripts find elements by `data-testid` (`page.get_by_test_id(…)`). Main page: `your-items` (Your groups and
streams; `your-empty` while empty), `join-group` (`no-group-near`, `start-group`), `join-stream` (`no-application` on
Getting started), `do-more` (`vacancies-link`), `card-<id>` (a card: stream, group or vacancy; its title link opens
the page), `me` (your initials), `home`, `back`, `toast`, `restart-demo`. Pages: `welcome-email` / `open-hub`;
`onboarding-form` / `onboarding-about` / `onboarding-hours` / `onboarding-next`; `stream-<id>`, `group-<id>`,
`vacancy-<id>` (the page heads) with `apply` (Apply in the head) or `join` (Getting started), `lead-profile`,
`pending-box` with `meanwhile` and `accept-demo`, `discord-cta` with `discord-connect` (once you're in, until you
connect), `rejected-note`, `vacancy-warning`, `vacancy-sent`; `preview` (the step titles, or a group's projects, before
you're in), `task-list` with `step-<task>`, `discord-line` with `discord-open` (once connected), `resources`, `about`;
the task page `task-<task>` with `task-action`, `mark-done`, `task-done`, `next-step`, `undo-done`; a group's
`next-meeting` (`luma-link` inside), `team-projects` with `card-<project>`, and `members`; a project's page
`project-<id>` with `board` and `team-task-<task>` in it (`claim` / `claim-done` / `unclaim` / `reopen` inside); the
apply page `apply-form` / `expectations` / `workshops` (`luma-link` inside) / `apply-text` / `apply-commit` /
`apply-submit` / `claude-accepts` (the Demo line where Claude accepts on submit);
`vacancies`; `profile-me`, `profile-<lead id>`.

Lead view: `view-volunteer` / `view-lead` (the switch), `manage-<id>`, `edit-expectations` with `expectations-edit` /
`expectations-text`, `claude-setting` with `setting-lead` / `setting-claude` (each a label around its radio),
`application-<id>` (yours: `application-you`) with `accept-application` / `reject-application` inside, `decided-<id>`
with `undo-decision`, `funnel-<task>` and `funnel-done` (members by step), `description-edit` / `description-text`,
`add-step`, `edit-step-<task>` with `step-up` / `step-down` / `step-edit` / `step-remove`, `step-title` / `step-time` /
`step-summary` / `step-howto`, `add-resource`, `edit-resource-<index>` with `resource-edit` / `resource-remove`,
`resource-title` / `resource-type` / `resource-note` / `resource-link`, `team-projects` with `card-<project>`,
`create-project`, `project-name` / `project-summary` / `project-description` / `project-tasks`, a project's lead page
`manage-<project>` with `board`, and `edit-save` / `edit-cancel` in every editor.