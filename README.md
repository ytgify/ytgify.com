## YTgify Landing Page

### Local Checks

```bash
npm run validate
```

The pre-push gate runs linting, formatting, TypeScript, production Knip, unit tests, a production build, and a check that the dormant Studio route is not deployed:

```bash
npm run pre-push
```

See [`docs/engineering-standards.md`](docs/engineering-standards.md) for module-size limits, test layers, CI path boundaries, and acceptance expectations.

### Studio Development

The Studio implementation is intentionally not exposed in the public export yet. Its route is parked at `app/studio/page.disabled.tsx`; rename it back to `page.tsx` when Studio is ready to launch.

Studio browser coverage activates the route only for the duration of its test build. The production build continues to omit `/studio`:

```bash
npm run test:studio
```
