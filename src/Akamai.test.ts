import { describe, expect, it } from 'vitest';

import Akamai from './Akamai.js';

describe('Akamai Class', () => {
  describe('Generating a valid token', () => {
    const akamai = new Akamai({
      algorithm: 'SHA256',
      acl: '/*',
      window: 6000,
      key: 'random-key',
      encoding: false,
    });
    const token = akamai.generateToken();

    it('produces a valid token', () => {
      const tokenAttributes = ['~exp', '~acl', '~hmac'];
      expect(tokenAttributes.every((a) => token.includes(a))).toBeTruthy();
    });
  });
});
