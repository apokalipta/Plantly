import { Type } from 'class-transformer';
import { IsInt, Min, IsOptional, IsString } from 'class-validator';

export class PatchPlantDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  speciesId!: number;

  @IsOptional()
  @IsString()
  nickname?: string;
}
