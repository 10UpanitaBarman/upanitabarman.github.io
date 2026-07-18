# upanitabarman.github.io

## [`followup-drafter/`](./followup-drafter) -- daily HubSpot follow-up email drafter

Pulls Kim's overdue HubSpot tasks every morning, resolves each prospect's
context from a Notion page or a logged HubSpot email, drafts a short
follow-up with OpenAI, validates it against a style rubric, and posts the
digest to Slack for review. Nothing is ever sent automatically. Scheduled
daily via [`.github/workflows/daily-followup-drafts.yml`](./.github/workflows/daily-followup-drafts.yml).
See [`followup-drafter/README.md`](./followup-drafter/README.md) for setup.