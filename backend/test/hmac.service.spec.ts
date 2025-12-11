import { HmacService } from '../src/security/hmac.service';
import { describe, it, expect } from '@jest/globals';
import * as crypto from 'node:crypto';

describe('HmacService', () => {
  const svc = new HmacService();

  it('rejects tampered payload', () => {
    const secret = crypto.randomBytes(16).toString('hex');
    const ts = new Date().toISOString();
    const body = { a: 1 };
    const goodSig = crypto.createHmac('sha256', secret).update(JSON.stringify(body) + ts).digest('hex');
    expect(() => svc.verifySignature(secret, { a: 2 }, ts, goodSig)).toThrow();
  });

  it('accepts valid timestamp', () => {
    const ts = new Date().toISOString();
    expect(svc.verifyTimestamp(ts)).toBeInstanceOf(Date);
  });

  it('rejects old timestamp', () => {
    const old = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(() => svc.verifyTimestamp(old, 2 * 60 * 1000)).toThrow();
  });
});
