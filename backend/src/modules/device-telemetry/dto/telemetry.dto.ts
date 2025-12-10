import { IsISO8601, IsNumber, IsOptional, Min, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
// Intention: Valider strictement le format et les bornes des mesures
// Objectif: Empêcher l’ingestion de données invalides ou extrêmes côté API
// Logique: Conversion implicite vers Number puis contrôles de plage adaptés aux capteurs

export class TelemetryDto {
  @IsISO8601()
  timestamp!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(100)
  soilMoisture?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(10000)
  lightLevel?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(-50)
  @Max(80)
  temperature?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  batteryLevel?: number;
}
