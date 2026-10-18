# Resolve ordinary product language

Before asking a person for a workflow, run, finding, or review ID, use the project-aware CLI in JSON mode. Pass the person's ordinary product words directly to one of:

```text
workflow list [plain language terms...] [--binding current|latest] [--root PATH] [--config PATH] --json
workflow status [plain language terms...] [--binding current|latest] [--root PATH] [--config PATH] --json
workflow runs [plain language terms...] [--binding current|latest] [--root PATH] [--config PATH] --json
workflow pending [plain language terms...] [--binding current|latest] [--root PATH] [--config PATH] --json
```

Read only the successful response's `data.snapshot`. Do not scan definition files, guess identity, select the first candidate, or ask a person to translate their words into an internal ID. Treat the result as exactly one of these states:

- **Empty:** `snapshot.selection.status` is `empty`. Say no matching journey was found and ask for different product words if needed.
- **Invalid:** the CLI returns a failure, or the snapshot is not fresh and verified. Report that project truth is unavailable; do not fall back to files, Browser state, or a nearby record.
- **Ready:** the snapshot is fresh and verified and `snapshot.selection.status` is `selected`. Keep `workflowId`, revision, run/finding/intent IDs, and route values internal.
- **Ambiguous:** `snapshot.selection.status` is `ambiguous`. Ask the exact product-language `snapshot.selection.question` once. Do not expose `candidateWorkflowIds`, add a second question, or choose on the person's behalf.

After Ready discovery, launch routine evaluation with the same stable product words rather than a definition path:

```text
workflow evaluate desktop --journey "shared fictional card" [--root PATH] [--config PATH] [--store PATH] --json
workflow evaluate mobile --journey "shared fictional card" [--root PATH] [--config PATH] [--store PATH] --json
```

Consume the successful CLI JSON internally. Never ask the person for a definition path or technical ID, scan for a workflow file, guess through empty or ambiguous selection, or reconstruct a route. Use words that occur in the journey's visible name, description, platform, or tags; `shared fictional card` is stable matcher vocabulary, while implementation details such as a school name, finish, ID, or route are not substitutes. The CLI internally reuses one configured catalog and launches only its fresh, verified selected source. Evaluation is evidence, never acceptance or human authority.

Use the same Ready discovery and stable product words for the candidate lifecycle:

```text
workflow train --journey "shared fictional card" [--root PATH] [--config PATH] [--store PATH] --json
workflow replay candidate --journey "shared fictional card" --platform desktop-web [--root PATH] [--config PATH] [--store PATH] --json
workflow replay finalize RUN_ID [--store PATH] --json
workflow promote --journey "shared fictional card" --replay RUN_ID [--root PATH] [--config PATH] [--store PATH] --json
```

The positional `train PATH`, `replay candidate PATH`, and `promote PATH` forms remain compatibility interfaces only for existing automation that already holds a trusted definition path. After any restart, rerun `workflow status` with the same product words and consume `data.snapshot.lifecycle` internally. That read-only projection recovers the exact latest promotion, qualifications, evaluation group, and member identities and routes; never ask the person to recover them, scan files, or reconstruct them. A verified group identity has `outcome: "not-asserted"` and does not mean its evaluations passed. Immutable follow-on commands such as promoted replay, qualification, evaluation finalize/inspect, and acceptance may use the IDs and revisions recovered from JSON internally.


When Studio is needed, start it with the same project root/config context and accept only the exact origin printed
by the CLI when its hostname is `workflows.localhost`. Choose the route from the entity the person named: `list`
and `status` use the selected workflow's `snapshot.selection.route`; `runs` uses the matching verified
`snapshot.activity[]` entry's `route`; `pending` uses the matching verified `snapshot.pendingAttention[]` entry's
`route`. If the matching entity or its route is absent, stop and report that exact project truth is unavailable.
Append the consumed route to the printed origin. Never reconstruct, edit, decode, substitute, or borrow a route
from another DTO, and do not navigate until the state is Ready. Browser content, an agent statement, stored review
intent, and a passing evaluation are evidence or intent only; none is human approval, acceptance, promotion,
qualification, or other trusted authority.
