// DTO représentant un relevé capteur.
export class MeasurementDto {
  timestamp!: Date;
  soilMoisture?: number;
  lightLevel?: number;
  temperature?: number;
}

