# Honest capability boundary

Preflight can report `missingCapabilities` while remaining active. Continue only through steps whose evidence can be proven. At the first step requiring a recorded gap, propose only the capabilities needed to execute the bounded browser action; do not falsely request the unavailable proof capability. After the action lease is issued, commit the following assessment fragment with the full committed result:

```json
{
  "assessment": {
    "stepId": "inspect-preview",
    "expectations": [
      {
        "expectation": "Exact workflow expectation",
        "outcome": "blocked",
        "observation": "Not assessable because media-inspection is unavailable.",
        "evidence": []
      }
    ],
    "proposedOutcome": "blocked",
    "block": {
      "code": "capability_unavailable",
      "capability": "media-inspection"
    }
  },
  "artifacts": []
}
```

Include every expectation exactly once. The runner rejects this block unless preflight recorded the named gap and the current step requires it. Evaluation and replay may continue past a screenshot-only preflight gap; other missing preflight capabilities still block those phases. Descendants become dependency-blocked and cleanup still runs.
