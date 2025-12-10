import { MediaService } from '../src/media/media.service';
import { ConfigService } from '@nestjs/config';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import type { Express } from 'express';
import 'multer';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function makeFile(mime: string, size: number): Express.Multer.File {
  const buf = Buffer.alloc(size > 0 ? size : 1, 0x01);
  return {
    fieldname: 'file',
    originalname: 'upload.bin',
    encoding: '7bit',
    mimetype: mime,
    size,
    buffer: buf,
    destination: '',
    filename: '',
    path: '',
    stream: undefined as any,
  } as unknown as Express.Multer.File;
}

describe('MediaService', () => {
  let tmpdir: string;
  let service: MediaService;

  beforeAll(() => {
    tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'media-test-'));
    const cfg = new ConfigService({ MEDIA_PROVIDER: 'LOCAL', MEDIA_BASE_URL: 'http://localhost:3000/media', MEDIA_BASE_PATH: tmpdir });
    service = new MediaService(cfg);
  });

  afterAll(() => {
    try { fs.rmSync(tmpdir, { recursive: true, force: true }); } catch {}
  });

  it('rejects invalid mime', async () => {
    await expect(service.saveUserAvatar('u1', makeFile('application/octet-stream', 100))).rejects.toBeTruthy();
  });

  it('rejects oversize', async () => {
    await expect(service.saveUserAvatar('u1', makeFile('image/png', 3 * 1024 * 1024))).rejects.toBeTruthy();
  });

  it('saves avatar and returns URL', async () => {
    const url = await service.saveUserAvatar('u1', makeFile('image/png', 1024));
    expect(url).toMatch(/^http:\/\/localhost:3000\/media\/users\/u1\/avatar\//);
    const rel = url.replace('http://localhost:3000/media/', '');
    const full = path.join(tmpdir, rel);
    expect(fs.existsSync(full)).toBe(true);
  });

  it('saves plant main image and returns deterministic URL', async () => {
    const url = await service.savePlantMainImage('basilic', makeFile('image/webp', 1024));
    expect(url).toBe('http://localhost:3000/media/public/plants/basilic/main.webp');
    const full = path.join(tmpdir, 'public', 'plants', 'basilic', 'main.webp');
    expect(fs.existsSync(full)).toBe(true);
  });
});
