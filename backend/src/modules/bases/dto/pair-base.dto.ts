import { IsString, IsOptional } from 'class-validator';

export class PairBaseDto {
  @IsString()
  pairingCode!: string;

  @IsOptional()
  @IsString()
  name?: string;
}
