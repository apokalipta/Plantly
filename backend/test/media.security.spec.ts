import { MediaSecurityService } from '../src/media/media-security.service';
import { describe, it, expect } from '@jest/globals';

describe('MediaSecurityService', () => {
  const svc = new MediaSecurityService();

  it('rejects invalid MIME', () => {
    expect(() => svc.validateMime('application/pdf')).toThrow();
    expect(() => svc.validateMime('image/svg+xml')).toThrow();
  });

  it('rejects files > max size', () => {
    expect(() => svc.enforceMaxSize(4 * 1024 * 1024, 3 * 1024 * 1024)).toThrow();
  });

  it('rejects SVG disguised content', async () => {
    const buffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    await expect(svc.sniffActualMime(buffer)).rejects.toThrow();
  });

  it('rejects path traversal', () => {
    expect(() => svc.buildSafePath('../etc/passwd')).toThrow();
    expect(() => svc.buildSafePath('/absolute/path')).toThrow();
  });

  it('ensures final path is normalized', () => {
    const rel = svc.buildSafePath('users/abc/./avatar/../avatar/file.webp');
    expect(rel).toBe('users/abc/avatar/file.webp');
  });
});
