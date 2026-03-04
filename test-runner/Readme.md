# Test Runner

A visual regression testing tool that compares two versions of your site by loading the same pages on both environments, taking screenshots, and highlighting pixel-level differences. Great for catching unexpected UI changes before they reach users.

When you run a test, the tool opens both sites in a headless browser, captures screenshots at the same viewport size, and overlays them to produce a diff image. Each test gets a match percentage — if it drops below your threshold, the test fails.

Results stream to the UI in real time so you can watch tests pass or fail as they happen.

---

## Setup

**1. Rename the template config files**

```bash
cp runner_config.template.json runner_config.json
cp test_cases.template.json test_cases.json
```

These files tell the runner which sites to compare and which pages to test. Without them the runner won't start.

**2. Start the service**

```bash
docker compose up test-runner
```

Visit `http://<your-domain>/test-run` — you should see the test runner UI.

---

## Settings

Open the **Settings** tab before your first run. This is where you configure the two environments you want to compare.

**Sites**
Enter a name and base URL for each site. The base URL is the root of the site — page paths get appended to it when each test runs. For example if Site A is `https://staging.example.com` and you test the path `/about`, the runner will load `https://staging.example.com/about`.

**Authentication**
If either site sits behind HTTP basic auth, enable it and enter the credentials. This is per-site so you can have auth on one and not the other.

**Runner behaviour**

- **Diff threshold** — how strict the pixel comparison is. `0.1` means a 10% colour difference per pixel is acceptable before it counts as a changed pixel. Lower = stricter.
- **Max diff pixels** — how many changed pixels are allowed before a test is marked as failed. `0` means any difference fails the test.
- **Page timeout** — how long to wait for a page to fully load before giving up. Default is 2 minutes — increase this for slow pages.
- **Viewport** — the browser window size used for screenshots. Both sites are screenshotted at the same size so the comparison is fair.
- **Capture all screenshots** — by default only diff images are saved. Turn this on to also save the individual screenshots for passing tests.
- **Fail fast** — stop the entire run as soon as one test fails instead of continuing through the rest.
- **Clean old results** — delete previous screenshots and diffs before each run so results don't accumulate. Leave this on unless you need to keep historical images.

Click **Save Settings** when done. Settings are written to `runner_config.json`.

---

## Test Cases

Open the **Test Cases** tab to manage the pages you want to compare.

Each test case has:
- **ID** — a unique identifier, auto-generated when you add a new test
- **Test name** — a human-readable label shown in the results sidebar (e.g. `Homepage`, `Search Results`)
- **URI** — the page path to test, starting with `/` (e.g. `/en/`, `/collections/all`)
- **Description** — optional notes about what the page is or what to look out for

Click **+ Add Test** to add a row, fill in the name and URI, then click **Save All**. Test cases are written to `test_cases.json`.

> You can edit test cases between runs but not while a run is in progress.

---

## Running tests

Hit **Execute Tests** on the Run tab. The runner will work through your test cases one by one — you'll see each test move from queued → running → passed or failed in the sidebar as it completes.

Click any test in the sidebar to see:
- **Match percentage** — how similar the two screenshots are
- **Diff image** — a visual overlay showing exactly what changed (red pixels = differences)
- **Screenshots** — side by side images of both sites (only shown if Capture all screenshots is on, or if the test failed)
- **Load times** — how long each site took to load the page
- **Error details** — if a test couldn't run, the reason is shown here

Once all tests complete, a summary bar appears at the top showing totals for passed, failed, and errors.

---

## Troubleshooting

**Tests are stuck in queue after a run**
The runner crashed before it could start. Check the Console Output panel at the bottom of the Run tab — the error message will tell you what went wrong. Most commonly it's a missing or invalid `runner_config.json`.

**A test shows execution error**
The runner couldn't load the page — usually a network issue, bad URL, or the page timing out. Check the error message in the test detail panel and make sure the URL is reachable from inside Docker.

**Settings or test cases aren't saving**
Make sure `runner_config.json` and `test_cases.json` exist in the `test-runner/` folder. If you skipped Step 1 of setup, go back and create them from the templates.

**The service won't start**
```bash
docker compose build test-runner
docker compose up test-runner
```
A rebuild is usually needed after the first install or if dependencies have changed.