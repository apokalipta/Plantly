import { describe, it, expect, jest } from '@jest/globals';
// Intention: Valider la génération d’alertes ciblées (batterie, lumière)
// Objectif: Vérifier qu’un écart aux seuils produit les types d’alertes attendus
// Logique: Simulation de mesures sous les seuils et inspection des appels au service d’alertes
import { DeviceTelemetryService } from '../src/modules/device-telemetry/device-telemetry.service';
import { TelemetryDto } from '../src/modules/device-telemetry/dto/telemetry.dto';

const makePrisma = () => ({
  device: {
    findUnique: (jest.fn() as any).mockResolvedValue({ id: 'd1', deviceUid: 'UID-1', deviceSecret: 'k', ownerId: 'u1', lastSeenAt: new Date() }),
    update: (jest.fn() as any).mockResolvedValue(undefined),
  },
  sensorReading: { create: (jest.fn() as any).mockResolvedValue(undefined) },
  plantInstance: { findFirst: (jest.fn() as any).mockResolvedValue({ id: 'p1', speciesId: 1 }) },
  plantCare: { findUnique: (jest.fn() as any).mockResolvedValue({ minMoisture: 30, maxMoisture: 70, minLight: 200, maxLight: 1000 }) },
} as any);

describe('DeviceTelemetryService alerts', () => {
  it('creates BATTERY_LOW alert when battery under 20%', async () => {
    const prisma = makePrisma();
    const alerts = { createOrUpdate: jest.fn(), resolveAllForDevice: jest.fn() } as any;
    const achievements = { onEvent: jest.fn() } as any;
    const svc = new DeviceTelemetryService(prisma, alerts, achievements);
    const ts = new Date().toISOString();
    const dto: TelemetryDto = { timestamp: ts, soilMoisture: 50, lightLevel: 600, batteryLevel: 15 } as any;
    const sig = 'c1'; // use key 'k' to compute signature below
    const crypto = require('crypto');
    const signature = crypto.createHmac('sha256', 'k').update(JSON.stringify(dto) + ts).digest('hex');
    await svc.handleTelemetry('UID-1', ts, signature, dto);
    expect(alerts.createOrUpdate).toHaveBeenCalledWith('d1', 'p1', 'BATTERY_LOW', 'WARNING', undefined);
  });

  it('creates LIGHT_TOO_LOW alert when below min light', async () => {
    const prisma = makePrisma();
    const alerts = { createOrUpdate: jest.fn(), resolveAllForDevice: jest.fn() } as any;
    const achievements = { onEvent: jest.fn() } as any;
    const svc = new DeviceTelemetryService(prisma, alerts, achievements);
    const ts = new Date().toISOString();
    const dto: TelemetryDto = { timestamp: ts, soilMoisture: 50, lightLevel: 100 } as any;
    const crypto = require('crypto');
    const signature = crypto.createHmac('sha256', 'k').update(JSON.stringify(dto) + ts).digest('hex');
    await svc.handleTelemetry('UID-1', ts, signature, dto);
    const calls = alerts.createOrUpdate.mock.calls.map((c: any) => c[2]);
    expect(calls).toContain('LIGHT_TOO_LOW');
  });
});
