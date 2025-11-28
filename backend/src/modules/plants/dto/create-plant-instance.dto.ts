import { IsOptional, IsString } from 'class-validator';

export class CreatePlantInstanceDto {
  // TODO: extend based on requirements
  @IsString()
  speciesId!: string;

  @IsOptional()
  @IsString()
  nickname?: string;
}

