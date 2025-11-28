/**
 * DTO representing a sensor measurement.
 */
export class MeasurementDto {
  timestamp!: Date;
  soilMoisture?: number;
  lightLevel?: number;
  temperature?: number;
}

