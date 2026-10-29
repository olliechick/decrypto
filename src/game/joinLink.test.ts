import { describe, expect, it } from 'vitest';
import { joinUrl, readJoinCode, withoutJoinCode } from './joinLink';
import { makeGameCode } from './random';

describe('join links', () => {
  it('carry the game code there and back', () => {
    for (let i = 0; i < 100; i++) {
      const code = makeGameCode();
      const url = new URL(joinUrl('https://decrypto.olliechick.co.nz', code));
      expect(readJoinCode(url.search)).toBe(code);
    }
  });

  it('tidy up a code typed into the address by hand', () => {
    expect(readJoinCode('?join=k7q2')).toBe('K7Q2');
  });

  it.each(['', '?', '?other=K7Q2', '?join=', '?join=K7Q', '?join=K0Q2'])('ignore %j', (search) => {
    expect(readJoinCode(search)).toBeNull();
  });

  it('can be removed from the address, keeping anything else', () => {
    expect(withoutJoinCode('https://example.com/?join=K7Q2')).toBe('https://example.com/');
    expect(withoutJoinCode('https://example.com/?a=1&join=K7Q2#x')).toBe('https://example.com/?a=1#x');
  });
});
