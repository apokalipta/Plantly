// DTO de réponse détaillée pour un pot.
export class PotDetailsResponseDto {
  id!: string;
  name!: string;
  deviceUid!: string;
  lastSeenAt?: Date | null;
  globalStatus!: 'OK' | 'ACTION_REQUIRED' | 'BAD' | 'OFFLINE';
  plant?: {
    id: string;
    speciesId: number; // Référence au wiki des plantes
    nickname?: string;
    plantedAt: Date;
    status: string; // Statut (ex: PlantStatus)
  };
  latestMeasurement?: {
    timestamp: Date;
    soilMoisture?: number;
    lightLevel?: number;
    temperature?: number;
    airHumidity?: number;
  };
}

