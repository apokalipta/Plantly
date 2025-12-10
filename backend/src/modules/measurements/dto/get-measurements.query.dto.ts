// DTO de requête: paramètres de filtre pour les mesures.
import { IsOptional, IsISO8601, IsInt, Min } from 'class-validator';
export class GetMeasurementsQueryDto {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

