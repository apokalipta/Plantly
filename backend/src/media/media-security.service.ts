import { BadRequestException, Injectable } from '@nestjs/common';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as crypto from 'node:crypto';

@Injectable()
export class MediaSecurityService {
  private readonly allowedMimes = new Set<string>(['image/jpeg', 'image/png', 'image/webp']);

  validateMime(mime: string): void {
    if (!mime || !this.allowedMimes.has(mime)) {
      throw new BadRequestException('Unsupported file type');
    }
  }

  async sniffActualMime(buffer: Buffer, fallbackMime?: string): Promise<string> {
    const mod = await import('file-type');
    const res = await mod.fromBuffer(buffer);
    const detected = res?.mime || '';
    if (detected && this.allowedMimes.has(detected)) {
      return detected;
    }
    if (fallbackMime && this.allowedMimes.has(fallbackMime)) {
      return fallbackMime;
    }
    throw new BadRequestException('Unsupported file type');
  }

  enforceMaxSize(size: number, maxBytes: number): void {
    if (size >= maxBytes) {
      throw new BadRequestException('File too large');
    }
  }

  sanitizeFilename(): string {
    return crypto.randomUUID();
  }

  buildSafePath(relativePath: string): string {
    const normalized = path.posix.normalize(relativePath).replaceAll('\\', '/');
    if (normalized.includes('..')) {
      throw new BadRequestException('Invalid path');
    }
    if (normalized.startsWith('/')) {
      throw new BadRequestException('Invalid path');
    }
    return normalized;
  }

  async ensureDirectoryExists(fullPath: string): Promise<void> {
    const dir = path.dirname(fullPath);
    await fs.promises.mkdir(dir, { recursive: true, mode: 0o755 });
  }
}
