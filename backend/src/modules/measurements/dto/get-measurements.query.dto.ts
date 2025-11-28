import { IsOptional, IsISO8601, IsInt, Min } from 'class-validator';

/**
 * Query parameters for fetching measurements.
 */
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

