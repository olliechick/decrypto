import { describe, expect, it } from 'vitest';
import { readBuildTime } from './useNewerVersion';

describe('the build time in the page', () => {
  it('is read from its meta tag', () => {
    expect(readBuildTime('<head>\n  <meta name="build-time" content="2026-10-31T01:02:03.000Z" />\n  </head>')).toBe(
      '2026-10-31T01:02:03.000Z'
    );
  });

  it('is null in a page without one', () => {
    expect(readBuildTime('<head></head>')).toBeNull();
  });
});
