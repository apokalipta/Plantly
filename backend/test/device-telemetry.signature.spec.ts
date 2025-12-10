import { describe, it, expect } from '@jest/globals';
// Intention: Vérifier l’authentification HMAC côté service de télémétrie
// Objectif: S’assurer que seule une signature valide conduit à l’acceptation de la charge
// Logique: Calculer la signature à partir du secret et comparer avec celle fournie
import { DeviceTelemetryService } from '../src/modules/device-telemetry/device-telemetry.service';
import { TelemetryDto } from '../src/modules/device-telemetry/dto/telemetry.dto';
import * as crypto from 'crypto';

const makePrisma = (secretHash: string) => ({
  device: {
    findUnique: jest.fn().mockResolvedValue({ id: 'd1', deviceUid: 'UID-1', deviceSecretHash: secretHash, ownerId: null, lastSeenAt: new Date() }),
    update: jest.fn().mockResolvedValue(undefined),
  },
  sensorReading: { create: jest.fn().mockResolvedValue(undefined) },
  plantInstance: { findFirst: jest.fn().mockResolvedValue(null) },
  plantCare: { findUnique: jest.fn().mockResolvedValue(null) },
} as any);

describe('DeviceTelemetryService HMAC signature', () => {
  it('accepts valid signature computed with deviceSecretHash', async () => {
    const secretHash = 'super-secret-hash';
    const prisma = makePrisma(secretHash);
    const alerts: any = { createOrUpdate: jest.fn(), resolveAllForDevice: jest.fn() };
    const achievements: any = { onEvent: jest.fn() };
    const svc = new DeviceTelemetryService(prisma, alerts, achievements);
    const headerTs = new Date().toISOString();
    const dto: TelemetryDto = { timestamp: headerTs, soilMoisture: 40, lightLevel: 500 } as any;
    const payload = JSON.stringify(dto) + headerTs;
    const signature = crypto.createHmac('sha256', secretHash).update(payload).digest('hex');
    const res = await svc.handleTelemetry('UID-1', headerTs, signature, dto);
    expect(res.status).toBe('ok');
  });

  it('rejects invalid signature', async () => {
    const secretHash = 'hmac-key';
    const prisma = makePrisma(secretHash);
    const alerts: any = { createOrUpdate: jest.fn(), resolveAllForDevice: jest.fn() };
    const achievements: any = { onEvent: jest.fn() };
    const svc = new DeviceTelemetryService(prisma, alerts, achievements);
    const headerTs = new Date().toISOString();
    const dto: TelemetryDto = { timestamp: headerTs, soilMoisture: 40, lightLevel: 500 } as any;
    const badSignature = 'deadbeef';
    await expect(svc.handleTelemetry('UID-1', headerTs, badSignature, dto)).rejects.toThrow('Invalid signature');
  });
});
