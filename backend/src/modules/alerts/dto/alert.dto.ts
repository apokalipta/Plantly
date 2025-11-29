import { ApiProperty } from '@nestjs/swagger';

export class AlertDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  deviceId!: string;
  @ApiProperty({ required: false, nullable: true })
  plantInstanceId?: string;
  @ApiProperty()
  type!: string;
  @ApiProperty()
  severity!: string;
  @ApiProperty()
  createdAt!: Date;
  @ApiProperty({ required: false, nullable: true })
  resolvedAt?: Date;
}
