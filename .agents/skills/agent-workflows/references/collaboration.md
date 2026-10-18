# Preserve durable collaboration

Resolve every workflow, run, review, and acceptance identity from the shared JSON snapshot and keep it internal. Never ask the person to copy an ID from Studio or the CLI. Put strict mutation input in a JSON file, then use:

```text
workflow review-intent record --file PATH [--root PATH] [--config PATH] --json
workflow review-intent list [WORKFLOW_ID] [--root PATH] [--config PATH] --json
workflow review-intent show INTENT_ID [--root PATH] [--config PATH] --json
workflow run pause RUN_ID --file PATH [--store PATH] --json
workflow run stop RUN_ID --file PATH [--store PATH] --json
workflow run emergency-stop RUN_ID --file PATH [--store PATH] --json
workflow run resume RUN_ID --file PATH [--store PATH] --json
workflow acceptance record --file PATH [--root PATH] [--config PATH] --json
workflow acceptance list [WORKFLOW_ID] [--root PATH] [--config PATH] --json
workflow acceptance show ACCEPTANCE_ID [--root PATH] [--config PATH] --json
```

Before revising or rerunning a journey, read `workflow review-intent list WORKFLOW_ID --json`. Source-bound feedback includes the verified Training or evaluation run, step, and optional screenshot artifact in `source`; use that tuple to inspect the exact evidence without asking the person to copy an ID.

Review-intent input contains only workflow/run identity, an optional verified `source`, expected revision, opaque `req_...` idempotency key, action, and optional supersession. The CLI owns neutral `cli` provenance. Pause, stop, and emergency-stop input contains expected revision, opaque idempotency key, reason, and the current active lease ID only for emergency stop. Identical retries are safe; on a revision or idempotency conflict, inspect current JSON truth and rebuild with a new key only if the intended bytes changed.
