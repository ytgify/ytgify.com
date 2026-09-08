/** Avoid the crashing H.264 capability probe in Linux WebKit's media backend. */
export function canProbeMp4(userAgent: string, platform: string) {
  const webkit = /AppleWebKit/.test(userAgent) && !/Chrome|Chromium|Edg|OPR/.test(userAgent);
  return !(webkit && /Linux/i.test(platform));
}
