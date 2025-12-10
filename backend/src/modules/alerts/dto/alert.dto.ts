// DTO alerte: sérialisation API + Swagger.
import { ApiProperty } from '@nestjs/swagger';

export class AlertDto {
  // Identifiant
  @ApiProperty()
  id!: string;
  // Device
  @ApiProperty()
  deviceId!: string;
  // Plante (optionnel)
  @ApiProperty({ required: false, nullable: true })
  plantInstanceId?: string;
  // Type
  @ApiProperty()
  type!: string;
  // Sévérité
  @ApiProperty()
  severity!: string;
  // Création
  @ApiProperty()
  createdAt!: Date;
  // Résolution
  @ApiProperty({ required: false, nullable: true })
  resolvedAt?: Date;
}
