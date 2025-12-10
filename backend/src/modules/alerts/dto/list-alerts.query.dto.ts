// DTO requête alertes: filtre de base.
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class ListAlertsQueryDto {
  // True: uniquement non résolues
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  onlyUnresolved?: boolean;
}
