import { IsISO8601, IsNumber, IsOptional } from 'class-validator';

export class TelemetryDto {
  @IsISO8601()
  timestamp!: string;

  @IsOptional()
  @IsNumber()
  soilMoisture?: number;

  @IsOptional()
  @IsNumber()
  lightLevel?: number;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  batteryLevel?: number;
}

