import { expect, test } from 'vitest';
import { toolEventProperties } from './analytics';
import { filterPrivateCreatorEvent } from '../studio/posthog-privacy';
import type { CaptureResult } from 'posthog-js';

test('every new tool drops replay, autocapture and exceptions; explicit events contain only enums', () => {
  for (const tool of ['gif-compressor']) {
    const properties = {
      $current_url: `https://ytgify.com/${tool}?secret=filename`,
      tool,
      outcome: 'success',
      filename: 'private.gif',
      caption: 'private',
      $referrer: 'secret',
    };
    for (const event of ['$snapshot', '$autocapture', '$exception', '$pageview'])
      expect(filterPrivateCreatorEvent({ event, properties } as unknown as CaptureResult)).toBeNull();
    expect(
      filterPrivateCreatorEvent({ event: 'gif_tool_activity', properties } as unknown as CaptureResult)?.properties,
    ).toEqual({
      tool,
      outcome: 'success',
      $geoip_disable: true,
    });
  }
  expect(toolEventProperties({ tool: 'private.gif', outcome: 'success' })).toBeNull();
  expect(toolEventProperties({ tool: 'resize-gif', outcome: 'private caption' })).toBeNull();
});
