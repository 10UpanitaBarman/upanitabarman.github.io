# Abselion Conference Lead Management

A polished, fully clickable **prototype** of a HubSpot-style CRM, built for Abselion's
commercial team to demonstrate how conference leads (e.g. ESACT 2026, Salzburg) could be
tracked from badge scan to commercial decision — without every contact silently turning
into a deal.

> **Prototype · Fictional data.** This is a standalone front-end demo. There is no HubSpot
> account, no backend, no database, and no real customer data anywhere in this project.
> Every company, person, deal and email address is invented for demonstration purposes.

---

## Why this exists

The commercial team collects contacts at conferences. Today, some of those contacts get a
deal, some get an open follow-up task and nothing else, and some get nothing at all. The
SVP of Commercial has no single view of which conference leads are progressing and which
have gone cold.

This prototype shows how a HubSpot workflow could catch that gap automatically —
**without ever creating a deal on its own**. A deal is only ever created by a person,
after:

1. A relevant Amperia use case has been identified.
2. The prospect has a real protein-quantification challenge.
3. Meaningful engagement has occurred.
4. A demo, technical call or evaluation has been agreed.

The automation's job is to make sure nobody falls through the cracks and to force a
timely human decision: **Create Deal**, **Nurture**, or **Close Out**.

## Tech stack

- React 18 + TypeScript (strict mode, no `any`)
- Vite 5
- Tailwind CSS
- Lucide React icons
- React Router (client-side routing only)
- Local component state + React Context — no backend, no external API calls
- `localStorage` to persist demo edits across page reloads (Reset demo data restores the
  original seed)

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`). The app opens on
**Contacts**, the default screen.

Other useful commands:

```bash
npm run build     # type-check (tsc -b) and produce a production build in dist/
npm run preview   # serve the production build locally
npm run lint       # ESLint (TypeScript + React Hooks rules)
```

## Deploying to Vercel

1. Push this repository to GitHub (already done if you're reading this from the repo).
2. In Vercel, click **Add New… → Project** and import the repository.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
   (Vercel usually detects these automatically.)
4. No environment variables are required — the app has no backend.
5. A `vercel.json` is included with a catch-all rewrite to `index.html` so client-side
   routes (`/deals`, `/tasks`, `/workflows/:id`, etc.) work correctly on refresh and direct
   link.
6. Deploy. That's it — the whole app is static.

You can also deploy with the Vercel CLI: `npx vercel` (or `npx vercel --prod`).

## What's in the prototype

| Area | What it does |
|---|---|
| **Contacts** | Saved views (All, ESACT 2026, Decision required, Missing follow-up, Escalated, Nurture, Closed out), search, owner/conference/status filters, column editor, data quality panel, and a right-side record preview panel with full "About this contact" properties, activity timeline, associations, and a commercial-decision box. |
| **Deals** | Board view (default) with 9 pipeline stages, per-stage totals, and cards you can move with a dropdown or the next-stage arrow; a table view toggle; a right-side deal preview panel. |
| **Tasks** | Queue tabs (All, Conference Follow-up, Conference Deal Decisions, Management Review, Overdue, Due Today, Upcoming, Completed) with inline complete/due-date/owner controls. |
| **Workflows** | A workflow index page and a full visual workflow-builder canvas modelled on HubSpot's workflow editor: trigger card, property-update card, task-creation card, notification card, delay card, and a three-way if/then branch (deal created / nurture-or-closed / escalate). Includes a working **Test workflow** dry-run panel and a **Run Workflow Demo** button that actually evaluates every fictional contact and updates the whole app. |
| **Dashboards** | "Conference Lead Performance" — metric tiles plus six simple visual reports, all computed live from the in-memory demo data and explicitly labelled as demo data. |

### The core automation, in plain English

`Conference Follow-up – Open Task Without Deal` enrols a contact when: their conference is
known, they have an open **Conference Follow-up** task, they have zero associated deals,
and their qualification status isn't already a final one (Nurture / Closed Out / Deal
Created). On enrolment it sets **Conference exception status → Decision Required**,
creates a high-priority **DECISION REQUIRED** task due in two working days, and notifies
the contact owner. If two working days pass with no decision, the contact is escalated: a
management-review task is created and the commercial manager is notified. If a deal is
created, or the contact is nurtured/closed out, the exception status resolves itself.
Separately, a conference contact with **no task and no deal at all** is flagged as
**Missing Follow-up** — a data-quality catch the trigger alone wouldn't find, since it
requires an *existing* task to fire on.

Click **Run Workflow Demo** (on the Contacts page or the Dashboard) to run this against
every seeded contact in one pass. Click **Test** inside the workflow builder to dry-run it
against a single contact you pick, with a step-by-step pass/fail readout.

### Seed data

Eight primary fictional contacts exercise every branch of the logic (a contact with a
deal already, one with an overdue follow-up, one with an overdue decision that should
escalate, one with no follow-up at all, one nurture case, one closed-out student enquiry,
and two deliberately broken data-quality cases surfaced via the **Data quality** link).
Five more fictional contacts and deals round out the pipeline board so it doesn't look
empty. Every record carries fictional, clearly invented names, emails and companies.

**Resetting the demo:** open the user menu (top right, "UB") and choose **Reset demo
data** to wipe `localStorage` and restore the original seeded state.

## Project structure

```
src/
  components/
    layout/       Sidebar, Topbar, AppShell
    ui/            Badge, Modal, Button, Tabs, FilterSelect, Toast, Avatar, ...
    contacts/      Contacts table, record preview panel, decision modals
    deals/         Deal card, deal preview panel, standalone create-deal modal
    workflow/      Workflow canvas cards, test panel, run-demo button, results modal
    dashboard/     Metric cards, simple bar-chart reports
  pages/           One file per route (Contacts, Companies, Deals, Tasks, Workflows,
                   WorkflowBuilder, Dashboard)
  context/         AppContext — all CRM state, actions and localStorage persistence
  data/            seedData.ts — every fictional contact, company, deal and task
  lib/             Business logic: workflowEngine.ts, badge/status maps, date helpers
  types/           Shared TypeScript types
```

## Five-minute interview demo script

1. **Open on Contacts.** Point out the "Prototype · Fictional data" badge in the sidebar
   and the record count. Click through a couple of saved views — **ESACT 2026**,
   **Decision required** — to show the segmentation already in place.
2. **Open Dr Maya Chen's record.** Walk through the header, the quick-action row, "About
   this contact," and the activity timeline. Note she has an *open, overdue* follow-up
   task but no deal — exactly the gap the SVP can't currently see.
3. **Click "Run Workflow Demo"** (top of the Contacts page). Show the ~1 second loading
   state, then the results modal: contacts reviewed, a decision task created, a missing
   follow-up caught, a contact escalated, and the rest skipped because they're already
   resolved. Reopen Maya Chen — she's now "Decision Required" with a highlighted
   **Commercial decision required** box and three buttons.
4. **Click "Create Deal."** Show the auto-generated deal name
   (`Company – Application/Target – Conference`), the pre-filled Amperia fields pulled
   straight from her contact record, and the default pipeline/stage. Create it — watch the
   toast, the badge change to "Deal Created," and the decision box disappear.
5. **Jump to Deals** (board view) — the new deal is sitting in *Qualified Instrument
   Opportunity*. Move it a stage with the dropdown or arrow button to show the pipeline is
   fully interactive.
6. **Open Workflows → the single workflow row → the canvas.** Walk down the trigger,
   property-set, task-creation, notification, delay, and the three-way branch. Click
   **Test**, pick a contact who already has a deal, and show the dry-run correctly
   reporting *"Contact did not meet the enrolment criteria"* — proving the rule that a
   contact must never become a deal automatically.
7. **Finish on the Dashboard.** Point out the metric tiles have already moved (Decision
   Required down, Escalated and Missing Follow-up up) and the six reports below — all
   computed live from the same underlying data, all labelled as demo data. Mention **Reset
   demo data** in the user menu as the "put it back the way it was" button for the next
   run-through.

## What this prototype intentionally does not do

- No real HubSpot account, API, or authentication.
- No backend or database — everything lives in React state, persisted only to the
  browser's `localStorage` for this device.
- A handful of UI affordances (Create contact, Export/Import/Merge, Board settings,
  the quick-action buttons on a contact record) are deliberately demo-only stubs that
  surface a toast rather than performing a real action, to keep the prototype's scope
  honest about what it is.
