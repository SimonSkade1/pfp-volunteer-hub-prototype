#!/usr/bin/env python3
"""Click through the volunteer side's demo path and screenshot every screen, at desktop and phone width.

Usage: scripts/walkthrough.py [url] [out_dir]
  url      default: the GitHub Pages site
  out_dir  default: /tmp/pfp-hub-walkthrough (screenshots desktop-NN-name.png, phone-NN-name.png)

Fails (exit 1) on a missing element, a console error or a page error. Needs Python Playwright with Chromium.
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


def run(browser, name, options):
    context = browser.new_context(**options)
    page = context.new_page()
    errors = []
    page.on("console", lambda msg: errors.append(f"console: {msg.text}") if msg.type == "error" else None)
    page.on("pageerror", lambda err: errors.append(f"pageerror: {err}"))
    shot_no = [0]

    def shot(label, full=True):
        shot_no[0] += 1
        page.wait_for_timeout(150)
        page.screenshot(path=OUT / f"{name}-{shot_no[0]:02d}-{label}.png", full_page=full)

    def tid(test_id):
        return page.get_by_test_id(test_id)

    def open_card(card_id):
        tid(f"card-{card_id}").locator("a.stretched").click()

    def home():
        tid("home").click()
        expect(tid("your-streams")).to_be_visible()

    page.goto(URL + "?reset=1")
    expect(tid("welcome-email")).to_be_visible()
    shot("email")

    # Onboarding: the one step of Spec 5.
    tid("open-hub").click()
    expect(tid("onboarding-form")).to_be_visible()
    tid("onboarding-about").fill("I'm a high school teacher in Ann Arbor. My students will grow up with whatever AI companies build next, and nobody asked them.")
    tid("onboarding-hopes").fill("Talk to my representatives, maybe write.")
    shot("onboarding")
    tid("onboarding-next").click()

    # Main page (Spec 6).
    expect(tid("no-group-near")).to_be_visible()
    shot("hub")

    # Getting started: first action -> done -> next.
    tid("start-next").click()
    expect(tid("task-message")).to_be_visible()
    shot("first-action")
    tid("mark-done").click()
    expect(tid("stream-getting-started")).to_be_visible()
    expect(tid("step-learn")).to_have_class(re.compile(r"\bstep-next\b"))
    shot("getting-started")

    # A stream: apply -> pending -> accepted -> its pipeline.
    home()
    open_card("town-halls")
    expect(tid("join-box")).to_be_visible()
    shot("town-halls")
    tid("apply").click()
    expect(tid("apply-form")).to_be_visible()
    tid("apply-text").fill("I'm signed up for the workshop on Nov 7.")
    tid("apply-commit").check()
    shot("apply-town-halls")
    tid("apply-submit").click()
    expect(tid("pending-box")).to_be_visible()
    shot("town-halls-pending")
    tid("accept-demo").click()
    expect(tid("task-list")).to_be_visible()
    shot("town-halls-accepted")
    tid("step-find").locator("a").click()
    expect(tid("task-find")).to_be_visible()
    tid("task-action").click()
    expect(tid("toast")).to_contain_text("Not part of the prototype")
    shot("find-a-town-hall", full=False)
    tid("mark-done").click()
    expect(tid("step-question")).to_have_class(re.compile(r"\bstep-next\b"))
    shot("town-halls-next")

    # A mostly-resources stream.
    home()
    open_card("op-eds")
    tid("apply").click()
    tid("apply-text").fill("The Ann Arbor News, as a teacher.")
    tid("apply-commit").check()
    tid("apply-submit").click()
    tid("accept-demo").click()
    expect(tid("resources")).to_be_visible()
    shot("op-eds-accepted")

    # A local group: apply -> accepted -> team project with claimable tasks.
    home()
    open_card("detroit")
    expect(tid("join-box")).to_be_visible()
    shot("group")
    tid("apply").click()
    tid("apply-text").fill("I live in Ann Arbor and could make the Zoom meetings.")
    tid("apply-submit").click()
    expect(tid("pending-box")).to_be_visible()
    tid("accept-demo").click()
    expect(tid("project-evening")).to_be_visible()
    shot("group-member")
    tid("team-task-flyer").get_by_test_id("claim").click()
    expect(tid("team-task-flyer").get_by_test_id("claim-done")).to_be_visible()
    shot("group-claimed")
    tid("team-task-flyer").get_by_test_id("claim-done").click()
    expect(tid("team-task-flyer")).to_have_class(re.compile(r"\bis-done\b"))

    # The main page with everything joined.
    home()
    expect(tid("your-detroit")).to_be_visible()
    shot("hub-joined")

    # Apply to lead a local group / a stream (Spec 6.3, 6.5, 8).
    tid("lead-group").click()
    expect(tid("lead-warning")).to_be_visible()
    tid("lead-why").fill("I organized a neighborhood association for five years.")
    shot("lead-group")
    tid("lead-submit").click()
    expect(tid("lead-sent")).to_be_visible()
    shot("lead-group-sent")
    home()
    tid("lead-stream").click()
    tid("idea-screenings").check()
    tid("lead-pitch").fill("Monthly screenings in public libraries, with a discussion.")
    tid("lead-about").fill("I run a film club.")
    shot("lead-stream")
    tid("lead-submit").click()
    expect(tid("lead-sent")).to_be_visible()

    # Restart goes back to the email.
    tid("restart-demo").click()
    expect(tid("welcome-email")).to_be_visible()

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
