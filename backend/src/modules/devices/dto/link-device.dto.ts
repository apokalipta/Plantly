import { IsString } from 'class-validator';

export class LinkDeviceDto {
  // TODO: extend based on device linking requirements
  @IsString()
  deviceId!: string;
}

