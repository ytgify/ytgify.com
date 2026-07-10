## YTgify Landing Page

### Local Checks

```bash
npm run lint
npm run typecheck
npm run knip
npm run build
npm test
```

### Studio Development

The Studio implementation is intentionally not exposed in the public export yet. Its route is parked at `app/studio/page.disabled.tsx`; rename it back to `page.tsx` when Studio is ready to launch.

Studio-specific browser coverage is currently skipped in the default test suite and can be re-enabled when the route is public again:

```bash
npm run test:studio
```
