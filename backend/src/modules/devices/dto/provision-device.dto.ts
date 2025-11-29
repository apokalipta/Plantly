import { IsOptional, IsString } from 'class-validator';

export class ProvisionDeviceDto {
  @IsString()
  deviceUid!: string;

  @IsOptional()
  @IsString()
  name?: string;
}
