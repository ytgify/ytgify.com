## YTgify Landing Page

### Local Checks

```bash
npm run validate
```

The pre-push gate runs linting, formatting, TypeScript, production Knip, unit tests, a production build, and a check that the canonical video-to-GIF route exists without a duplicate `/studio` route:

```bash
npm run pre-push
```

See [`docs/engineering-standards.md`](docs/engineering-standards.md) for module-size limits, test layers, CI path boundaries, and acceptance expectations.

### Video-to-GIF Development

The browser tool is served from `/video-to-gif`. Its focused test command covers the real media workflow across Chromium, Firefox, WebKit, and a 390x844 mobile viewport, plus accessibility and SEO checks:

```bash
npm run test:studio
```
