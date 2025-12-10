import { describe, it, expect } from '@jest/globals';
// Intention: Tester la logique de statut et la validation du DTO côté télémétrie
// Objectif: Garantir des réponses cohérentes selon les seuils et refuser les données invalides
// Logique: Cas limites (OFFLINE, OK, ACTION_REQUIRED, BAD) et contrôles de types/étendue
import { DeviceTelemetryService } from '../src/modules/device-telemetry/device-telemetry.service';
import { TelemetryDto } from '../src/modules/device-telemetry/dto/telemetry.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('DeviceTelemetryService computeStatus', () => {
  const makeService = () => new DeviceTelemetryService({} as any, {} as any, {} as any);

  it('returns OFFLINE when lastSeenAt is missing', () => {
    const svc = makeService() as any;
    const status = svc['computeStatus']({ lastSeenAt: null }, null, null);
    expect(status).toBe('OFFLINE');
  });

  it('returns OFFLINE when lastSeenAt is older than 30 minutes', () => {
    const svc = makeService() as any;
    const old = new Date(Date.now() - 31 * 60 * 1000);
    const status = svc['computeStatus']({ lastSeenAt: old }, null, null);
    expect(status).toBe('OFFLINE');
  });

  it('returns OK when values are within care ranges', () => {
    const svc = makeService() as any;
    const now = new Date();
    const status = svc['computeStatus'](
      { lastSeenAt: now },
      { timestamp: now, soilMoisture: 50, lightLevel: 600 },
      { minMoisture: 30, maxMoisture: 70, minLight: 200, maxLight: 1000 }
    );
    expect(status).toBe('OK');
  });

  it('returns ACTION_REQUIRED when slightly outside range', () => {
    const svc = makeService() as any;
    const now = new Date();
    // Slightly below min with tolerance
    const status = svc['computeStatus'](
      { lastSeenAt: now },
      { timestamp: now, soilMoisture: 27, lightLevel: 210 },
      { minMoisture: 30, maxMoisture: 70, minLight: 200, maxLight: 1000 }
    );
    expect(status).toBe('ACTION_REQUIRED');
  });

  it('returns BAD when values are far outside range', () => {
    const svc = makeService() as any;
    const now = new Date();
    const status = svc['computeStatus'](
      { lastSeenAt: now },
      { timestamp: now, soilMoisture: 5, lightLevel: 5000 },
      { minMoisture: 30, maxMoisture: 70, minLight: 200, maxLight: 1000 }
    );
    expect(status).toBe('BAD');
  });
});

describe('TelemetryDto validation', () => {
  const validateDto = async (payload: any) => {
    const inst = plainToInstance(TelemetryDto, payload);
    const errors = await validate(inst);
    return errors;
  };

  it('accepts valid payload', async () => {
    const errors = await validateDto({ timestamp: new Date().toISOString(), soilMoisture: 42.5, lightLevel: 650, temperature: 21.1, batteryLevel: 88 });
    expect(errors.length).toBe(0);
  });

  it('rejects out-of-range values', async () => {
    const errors = await validateDto({ timestamp: new Date().toISOString(), soilMoisture: 150, lightLevel: -10, temperature: -100, batteryLevel: 120 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects non-numeric values', async () => {
    const errors = await validateDto({ timestamp: new Date().toISOString(), soilMoisture: 'abc', lightLevel: 'xyz' });
    expect(errors.length).toBeGreaterThan(0);
  });
});
