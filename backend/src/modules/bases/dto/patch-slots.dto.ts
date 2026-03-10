import { Type } from 'class-transformer';
import { IsArray, ValidateNested, IsInt, Min, Max, IsBoolean, IsIn } from 'class-validator';

export class SlotConfigDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  slotIndex!: number;

  @IsIn(['SMALL', 'MEDIUM', 'LARGE'])
  potFormat!: 'SMALL' | 'MEDIUM' | 'LARGE';

  @IsBoolean()
  isActive!: boolean;
}

export class PatchSlotsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotConfigDto)
  slots!: SlotConfigDto[];
}
