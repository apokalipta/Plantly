// DTO de requête wiki: recherche d'espèces.
import { IsOptional, IsString } from 'class-validator';

export class ListPlantsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}

