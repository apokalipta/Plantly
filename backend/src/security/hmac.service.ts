import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'node:crypto';

@Injectable()
export class HmacService {
  verifyTimestamp(tsHeader: string, skewMs = 2 * 60 * 1000): Date {
    if (!tsHeader) throw new BadRequestException('Missing timestamp');
    const d = new Date(tsHeader);
    if (Number.isNaN(d.getTime())) throw new BadRequestException('Invalid timestamp');
    const now = Date.now();
    if (Math.abs(now - d.getTime()) > skewMs) {
      throw new UnauthorizedException('Timestamp out of range');
    }
    return d;
  }

  verifySignature(secret: string, body: unknown, timestamp: string, provided: string): void {
    if (!secret) throw new UnauthorizedException('Missing secret');
    const payload = JSON.stringify(body) + timestamp;
    const expected = crypto.createHmac('sha256', String(secret)).update(payload).digest('hex');
    const sig = (provided || '').toLowerCase();
    if (expected !== sig) {
      throw new UnauthorizedException('Invalid signature');
    }
  }
}
