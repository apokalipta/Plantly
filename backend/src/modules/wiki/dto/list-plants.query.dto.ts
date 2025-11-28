import { IsOptional, IsString } from 'class-validator';

export class ListPlantsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}

