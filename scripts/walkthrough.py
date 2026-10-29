#!/usr/bin/env python3
"""Click through the demo path (Spec 17), volunteer side and lead view, and screenshot every screen at desktop and
phone width.

Usage: scripts/walkthrough.py [url] [out_dir]
  url      default: the GitHub Pages site
  out_dir  default: /tmp/pfp-hub-walkthrough (screenshots desktop-NN-name.png, phone-NN-name.png)

Fails (exit 1) on a missing element, a console error or a page error. Needs Python Playwright with Chromium.
Then scripts/color_balance.py [out_dir] measures red and blue per screenful (Spec 23.1).
"""

import re
import sys
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "https://simonskade1.github.io/pfp-volunteer-hub-prototype/"
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else "/tmp/pfp-hub-walkthrough")
VIEWPORTS = {
    "desktop": dict(viewport={"width": 1440, "height": 900}),
    "phone": dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, device_scale_factor=2),
}
NEXT = re.compile(r"\bstep-next\b")


def run(browser, name, options):
    context = browser.new_context(**options)
    page = context.new_page()
    errors = []
    page.on("console", lambda msg: errors.append(f"console: {msg.text}") if msg.type == "error" else None)
    page.on("pageerror", lambda err: errors.append(f"pageerror: {err}"))
    shot_no = [0]

    def shot(label, full=True):
        shot_no[0] += 1
        if full:  # from the top (a full-page screenshot draws the sticky top bar where the page is scrolled to), and
            # without the toast, which would land mid-page; the screenshots with full=False show the toasts
            page.evaluate("window.scrollTo(0, 0); document.querySelector('.toast').classList.remove('toast-show')")
            page.wait_for_timeout(250)
        page.wait_for_timeout(150)
        page.screenshot(path=OUT / f"{name}-{shot_no[0]:02d}-{label}.png", full_page=full)

    def tid(test_id):
        return page.get_by_test_id(test_id)

    def open_card(card_id):
        tid(f"card-{card_id}").locator("a.stretched").click()

    def home():
        tid("home").click()
        expect(tid("your-items")).to_be_visible()

    def in_first_screen(test_id):
        # Spec 18: a member sees the steps first, so that on a phone the next step, with its Start, is in the first
        # screen.
        page.evaluate("window.scrollTo(0, 0)")
        cta = tid(test_id).locator(".step-cta")
        expect(cta).to_be_visible()
        page.wait_for_timeout(150)  # after a submit that navigates, the page renders once more (on hashchange)
        box = cta.bounding_box()
        assert box["y"] + box["height"] <= page.viewport_size["height"], f"{test_id}'s Start is below the first screen"

    def apply(text, commit=False):
        tid("apply").click()
        expect(tid("apply-form")).to_be_visible()
        tid("apply-text").fill(text)
        if commit:
            tid("apply-commit").check()

    page.goto(URL + "?reset=1")
    expect(tid("welcome-email")).to_be_visible()
    shot("email")

    # Onboarding (Spec 5): both fields are required.
    tid("open-hub").click()
    expect(tid("onboarding-form")).to_be_visible()
    tid("onboarding-next").click()
    expect(tid("onboarding-form")).to_be_visible()  # the browser keeps you here until both are filled in
    tid("onboarding-about").fill("I'm a high school teacher in Ann Arbor. My students will grow up with whatever AI companies build next, and nobody asked them.")
    tid("onboarding-hours").get_by_text("2–5 hours").click()
    shot("onboarding")
    tid("onboarding-next").click()

    # Main page (Spec 6): nothing joined yet; Getting started is the last stream, without an application.
    expect(tid("your-empty")).to_be_visible()
    expect(tid("join-group").get_by_test_id("card-detroit")).to_contain_text("40 mi from you")
    expect(tid("join-stream").locator(".card").last).to_have_attribute("data-testid", "card-getting-started")
    expect(tid("card-getting-started")).to_contain_text("No application required")
    expect(page.locator("[data-testid^=card-] .btn")).to_have_count(0)  # cards have no buttons: a card opens its page
    shot("hub")

    # Your profile, from your initials in the top bar.
    tid("me").click()
    expect(tid("profile-me")).to_contain_text("2–5 hours a week")
    shot("profile")
    home()

    # The start-a-group link opens that vacancy.
    tid("start-group").click()
    expect(tid("vacancy-warning")).to_contain_text("huge amount of work")
    shot("start-a-group")
    home()

    # A stream: Apply in the head; the lead's profile; the apply page with the workshop's Luma link; pending.
    open_card("town-halls")
    expect(tid("apply")).to_be_visible()
    expect(tid("preview")).to_be_visible()
    shot("town-halls")
    tid("lead-profile").click()
    expect(tid("profile-dana-whitfield")).to_contain_text("Leads Town halls")
    shot("lead-profile")
    tid("back").click()
    apply("I'm signed up for the workshop on Nov 7.", commit=True)
    expect(tid("expectations").get_by_role("link", name="our Luma calendar")).to_have_attribute("href", "https://luma.com/pfp")
    expect(tid("claude-accepts")).to_have_count(0)  # Dana reviews every application
    shot("apply-town-halls")
    tid("apply-submit").click()
    expect(tid("pending-box")).to_be_visible()
    expect(tid("meanwhile")).to_be_visible()  # not in Getting started yet
    shot("town-halls-pending")

    # Getting started, from the pending box: Join (no form, no pending), the first action, done, the next one.
    tid("meanwhile").get_by_role("link").click()
    expect(tid("join")).to_be_visible()
    shot("getting-started")
    tid("join").click()
    expect(tid("task-list")).to_be_visible()
    expect(tid("step-message")).to_have_class(NEXT)
    tid("step-message").locator("a").click()
    expect(tid("task-message")).to_be_visible()
    shot("first-action")
    tid("mark-done").click()
    expect(tid("step-learn")).to_have_class(NEXT)
    shot("getting-started-joined")

    # Back to the pending stream: listed once, under Your groups and streams; then accepted (skip ahead).
    home()
    expect(tid("your-items").get_by_test_id("card-town-halls")).to_contain_text("Pending")
    expect(tid("your-items").get_by_test_id("card-getting-started")).to_be_visible()
    expect(tid("join-stream").get_by_test_id("card-town-halls")).to_have_count(0)
    shot("hub-pending")
    open_card("town-halls")
    expect(tid("meanwhile")).to_have_count(0)  # in Getting started now
    tid("accept-demo").click()
    expect(tid("task-list")).to_be_visible()
    expect(tid("step-find")).to_have_class(NEXT)
    in_first_screen("step-find")
    shot("town-halls-accepted", full=False)  # the first screen
    shot("town-halls-accepted")

    # The mock Discord (Spec 22): connect once, then channel lines offer Open.
    tid("discord-connect").click()
    expect(tid("toast")).to_contain_text("our bot would add you")
    expect(tid("discord-open")).to_be_visible()
    shot("discord-connected", full=False)
    tid("step-find").locator("a").click()
    expect(tid("task-find")).to_be_visible()
    tid("task-action").click()
    expect(tid("toast")).to_contain_text("Not part of the prototype")
    shot("find-a-town-hall", full=False)
    tid("mark-done").click()
    expect(tid("step-question")).to_have_class(NEXT)
    shot("town-halls-next")

    # Op-eds, where Sam lets Claude accept clear cases (Spec 14, 21): the apply page says so (Demo), and you're in on
    # submit, no pending; its steps above its resources.
    home()
    open_card("op-eds")
    apply("The Ann Arbor News, as a teacher.", commit=True)
    expect(tid("claude-accepts")).to_contain_text("you’re in on submit")
    shot("apply-op-eds")
    tid("apply-submit").click()
    expect(tid("toast")).to_contain_text("Claude accepted your application")
    expect(tid("pending-box")).to_have_count(0)
    expect(tid("resources")).to_be_visible()
    in_first_screen("step-pick")
    shot("op-eds-accepted")

    # A local group: Apply in the head; your application rejected in the lead view; applied again; accepted.
    home()
    open_card("detroit")
    expect(tid("apply")).to_be_visible()
    shot("group")
    apply("I live in Ann Arbor and could make the Zoom meetings.")
    tid("apply-submit").click()
    expect(tid("pending-box")).to_be_visible()
    home()
    expect(tid("join-group")).to_have_count(0)  # waiting on a group: Join a local group goes
    open_card("detroit")
    tid("view-lead").click()
    expect(tid("application-you")).to_contain_text("I live in Ann Arbor")
    expect(tid("application-you")).to_contain_text("2–5 hours a week")  # your hours, from your onboarding
    expect(tid("setting-lead").locator("input")).to_be_checked()  # Maya reviews every application
    shot("lead-view-your-application")
    tid("application-you").get_by_test_id("reject-application").click()
    expect(tid("decided-you")).to_contain_text("Rejected")
    # The lead edits the expectations (mock, Spec 7.1, 21): the apply page shows the new text.
    tid("expectations-edit").click()
    expect(tid("expectations-text")).to_be_focused()
    tid("expectations-text").fill("Tell us which of our Thursday meetings you could make.\n\nEdited in the lead view.")
    tid("edit-save").click()
    expect(tid("edit-expectations")).to_contain_text("Edited in the lead view.")
    tid("view-volunteer").click()
    expect(tid("rejected-note")).to_be_visible()
    shot("group-rejected")
    apply("I live in Ann Arbor and could make most Thursday meetings, at least the ones on Zoom.")
    expect(tid("expectations").locator("p")).to_have_count(2)
    expect(tid("expectations")).to_contain_text("Edited in the lead view.")
    shot("apply-group-edited")
    tid("apply-submit").click()
    tid("accept-demo").click()
    expect(tid("project-evening")).to_be_visible()
    expect(tid("discord-open")).to_be_visible()  # connected before
    shot("group-member")
    tid("team-task-flyer").get_by_test_id("claim").click()
    expect(tid("team-task-flyer").get_by_test_id("claim-done")).to_be_visible()
    shot("group-claimed")
    tid("team-task-flyer").get_by_test_id("claim-done").click()
    expect(tid("team-task-flyer")).to_have_class(re.compile(r"\bis-done\b"))

    # The main page with everything joined: no group or stream left to join.
    home()
    expect(tid("card-detroit")).to_be_visible()
    expect(tid("join-group")).to_have_count(0)
    expect(tid("join-stream")).to_have_count(0)
    shot("hub-joined")

    # Vacancies (Spec 6.4, 17.4): the page, one vacancy, the shared apply page with one field, sent.
    tid("vacancies-link").click()
    expect(tid("vacancies").locator("h1")).to_have_text("Volunteer vacancies")
    shot("vacancies")
    open_card("onboarding")
    expect(tid("vacancy-onboarding")).to_be_visible()
    shot("vacancy")
    apply("I welcome new members at my running club and still know most of them by name.")
    expect(tid("apply-form").locator("textarea")).to_have_count(1)
    shot("apply-vacancy")
    tid("apply-submit").click()
    expect(tid("vacancy-sent")).to_be_visible()
    shot("vacancy-sent")
    tid("back").click()
    expect(tid("card-onboarding")).to_contain_text("Sent")

    # The lead view of a stream (Spec 21): applications with Claude's pre-screen, members by step, mock editing.
    home()
    open_card("town-halls")
    tid("view-lead").click()
    expect(tid("manage-town-halls")).to_be_visible()
    expect(tid("edit-expectations").get_by_role("link", name="our Luma calendar")).to_have_attribute("href", "https://luma.com/pfp")
    expect(tid("setting-lead").locator("input")).to_be_checked()
    expect(tid("application-maria")).to_contain_text("2–5 hours a week")
    expect(tid("application-signals")).to_contain_text("Spam")
    shot("lead-view-town-halls")
    tid("application-maria").get_by_test_id("accept-application").click()
    expect(tid("decided-maria")).to_contain_text("Accepted")
    tid("application-signals").get_by_test_id("reject-application").click()
    expect(tid("decided-signals")).to_contain_text("Rejected")
    expect(tid("funnel-question")).to_contain_text("Jordan Miller (you)")  # you did the first step
    expect(tid("funnel-find")).to_contain_text("Maria Gonzalez")
    tid("description-edit").click()
    expect(tid("description-text")).to_be_focused()
    tid("description-text").fill("Town halls are where elected officials face their voters.\n\nEdited in the lead view.")
    tid("edit-save").click()
    expect(tid("edit-description")).to_contain_text("Edited in the lead view.")
    tid("add-step").click()
    tid("step-title").fill("Thank them in writing")
    tid("step-time").fill("10 min")
    tid("step-howto").fill("Email the office the next day.\nThank them for the answer, and repeat your ask.")
    shot("lead-view-new-step")
    tid("edit-save").click()
    tid("edit-step-step-1").get_by_test_id("step-up").click()
    expect(tid("edit-steps").locator(".edit-row").nth(3)).to_contain_text("Thank them in writing")
    expect(tid("funnel-step-1")).to_contain_text("Wendy Carter")  # did every step before: now at the new one
    expect(tid("funnel-done")).to_contain_text("0")
    tid("add-resource").click()
    tid("resource-title").fill("Sample question on video")
    tid("resource-type").fill("Video")
    tid("resource-note").fill("A volunteer asks our question in 40 seconds.")
    tid("resource-link").fill("https://www.youtube.com/")
    tid("edit-save").click()
    tid("edit-resource-0").get_by_test_id("resource-remove").click()
    shot("lead-view-edited")
    tid("description-edit").click()  # an editor left open closes with the page
    tid("view-volunteer").click()
    tid("view-lead").click()
    expect(tid("description-text")).to_have_count(0)
    tid("view-volunteer").click()  # the volunteer side shows the edits at once
    expect(tid("stream-town-halls")).to_contain_text("25 volunteers")
    expect(page.get_by_text("Edited in the lead view.")).to_be_visible()
    expect(tid("step-step-1")).to_be_visible()
    expect(tid("resources")).to_contain_text("Sample question on video")
    expect(tid("resources")).not_to_contain_text("Town hall guide")
    shot("town-halls-after-edits")

    # The lead view where Claude accepts clear cases (Op-eds): Claude's accepts are in and marked, the lead can undo
    # them, and the setting switches in one click.
    home()
    open_card("op-eds")
    tid("view-lead").click()
    expect(tid("setting-claude").locator("input")).to_be_checked()
    expect(tid("decided-you")).to_contain_text("Accepted by Claude")
    expect(tid("decided-helen")).to_contain_text("Accepted by Claude")
    expect(tid("application-rick")).to_contain_text("Under 1 hour a week")
    shot("lead-view-op-eds")
    tid("decided-helen").get_by_test_id("undo-decision").click()
    expect(tid("application-helen")).to_contain_text("Claude’s pre-screen: Accept")  # back with the lead
    tid("setting-lead").click()
    expect(tid("toast")).to_contain_text("You now review every application")
    expect(tid("setting-lead").locator("input")).to_be_checked()
    expect(tid("decided-you")).to_contain_text("Accepted by Claude")  # those in stay in
    tid("setting-claude").click()
    expect(tid("toast")).to_contain_text("Accepted: Helen Park")
    expect(tid("decided-helen")).to_contain_text("Accepted by Claude")
    shot("lead-view-op-eds-claude", full=False)

    # The lead view of a local group: applications, the task board, a new project.
    home()
    open_card("detroit")
    tid("view-lead").click()
    expect(tid("manage-detroit")).to_be_visible()
    expect(tid("project-evening")).to_contain_text("Jordan Miller (you)")  # your claimed task
    shot("lead-view-detroit")
    tid("application-nadia").get_by_test_id("accept-application").click()
    expect(tid("decided-nadia")).to_contain_text("Accepted")
    tid("create-project").click()
    tid("project-name").fill("Tabling at the Royal Oak farmers market")
    tid("project-description").fill("Sat Nov 21, 9-11 am. Goal: 15 sign-ups.")
    tid("project-tasks").fill("Ask the market for a table\nPick up the tabling kit\nRun the table")
    shot("lead-view-new-project", full=False)
    tid("edit-save").click()
    expect(tid("project-project-1")).to_contain_text("0 of 3 done")
    shot("lead-view-detroit-project")
    tid("view-volunteer").click()
    expect(tid("members")).to_contain_text("Nadia Haddad")
    new_task = tid("project-project-1").get_by_test_id("team-task-task-1")
    new_task.get_by_test_id("claim").click()
    expect(new_task.get_by_test_id("claim-done")).to_be_visible()
    shot("group-after-lead-view")

    # Restart reloads: back to the email, and the lead view's edits are gone.
    tid("restart-demo").click()
    expect(tid("welcome-email")).to_be_visible()
    tid("open-hub").click()
    tid("onboarding-about").fill("A teacher.")
    tid("onboarding-hours").get_by_text("Under 1 hour").click()
    tid("onboarding-next").click()
    expect(tid("your-empty")).to_be_visible()
    open_card("town-halls")
    expect(tid("stream-town-halls")).to_contain_text("23 volunteers")
    expect(page.get_by_text("Edited in the lead view.")).to_have_count(0)

    context.close()
    return errors


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.png"):
        old.unlink()
    failures = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name, options in VIEWPORTS.items():
            errors = run(browser, name, options)
            failures += [f"{name}: {e}" for e in errors]
            print(f"{name}: done")
        browser.close()
    print(f"Screenshots: {OUT}")
    if failures:
        print("\n".join(failures))
        sys.exit(1)


if __name__ == "__main__":
    main()
