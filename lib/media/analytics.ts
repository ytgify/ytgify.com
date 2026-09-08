import posthog from 'posthog-js';

const tools = ['gif-compressor', 'resize-gif', 'gif-to-mp4', 'screen-to-gif'] as const;
const outcomes = ['view', 'start', 'success', 'error', 'cancel', 'download'] as const;
export function toolEventProperties(properties: Record<string, unknown>) {
  const tool = tools.find((value) => value === properties.tool);
  const outcome = outcomes.find((value) => value === properties.outcome);
  return tool && outcome ? { tool, outcome } : null;
}
export function trackToolEvent(tool: (typeof tools)[number], outcome: (typeof outcomes)[number]) {
  if (typeof window === 'undefined') return;
  const properties = { tool, outcome };
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN)
    posthog.capture('gif_tool_activity', properties);
}
