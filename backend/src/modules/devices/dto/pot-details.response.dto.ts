/**
 * Detailed response DTO for a single pot.
 */
export class PotDetailsResponseDto {
  id!: string;
  name!: string;
  deviceUid!: string;
  lastSeenAt?: Date | null;
  globalStatus!: 'OK' | 'ACTION_REQUIRED' | 'BAD' | 'OFFLINE';
  plant?: {
    id: string;
    speciesId: number; // From separate wiki schema
    nickname?: string;
    plantedAt: Date;
    status: string; // e.g., PlantStatus
  };
  latestMeasurement?: {
    timestamp: Date;
    soilMoisture?: number;
    lightLevel?: number;
    temperature?: number;
  };
}

