import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class ListAlertsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  onlyUnresolved?: boolean;
}
