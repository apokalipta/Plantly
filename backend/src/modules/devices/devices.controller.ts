import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ListPotsResponseDto } from './dto/list-pots.response.dto';
import { LinkPotDto } from './dto/link-pot.dto';
import { PotDetailsResponseDto } from './dto/pot-details.response.dto';
import { ProvisionDeviceDto } from './dto/provision-device.dto';
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiBadRequestResponse, ApiNotFoundResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('pots')
@ApiBearerAuth()
@Controller('pots')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'List pots for current user' })
  @ApiOkResponse({ type: ListPotsResponseDto, isArray: true, schema: { example: [ { id: '3f95d7f2-1111-4444-aaaa-bbbbbb111111', name: 'My Basil', deviceUid: 'PLANT-ABC-001', lastSeenAt: '2025-01-01T10:00:00Z', globalStatus: 'OK' } ] } })
  async list(@CurrentUser() user: any): Promise<ListPotsResponseDto[]> {
    return this.devicesService.findUserPots(user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get pot details' })
  @ApiOkResponse({ type: PotDetailsResponseDto, schema: { example: { id: '3f95d7f2-1111-4444-aaaa-bbbbbb111111', name: 'My Basil', deviceUid: 'PLANT-ABC-001', lastSeenAt: '2025-01-01T10:00:00Z', globalStatus: 'ACTION_REQUIRED', plant: { id: 'plant-01', speciesId: 12, nickname: 'Basilou', plantedAt: '2024-12-20T09:00:00Z', status: 'ACTIVE' }, latestMeasurement: { timestamp: '2025-01-01T10:00:00Z', soilMoisture: 42.5, lightLevel: 650, temperature: 21.1 } } } })
  @ApiNotFoundResponse({ description: 'Pot not found or not owned by user' })
  async details(@CurrentUser() user: any, @Param('id') potId: string): Promise<PotDetailsResponseDto> {
    return this.devicesService.findUserPotById(user?.userId, potId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('link')
  @ApiOperation({ summary: 'Link a pot to the current user' })
  @ApiBody({ type: LinkPotDto, examples: { example: { value: { deviceUid: 'PLANT-ABC-001', pairingCode: '123456', name: 'My Basil', speciesId: 12, plantNickname: 'Basilou' } } } })
  @ApiOkResponse({ description: 'Pot successfully linked', type: PotDetailsResponseDto, schema: { example: { id: '3f95d7f2-1111-4444-aaaa-bbbbbb111111', name: 'My Basil', deviceUid: 'PLANT-ABC-001', lastSeenAt: '2025-01-01T10:00:00Z', globalStatus: 'ACTION_REQUIRED', plant: { id: 'plant-01', speciesId: 12, nickname: 'Basilou', plantedAt: '2024-12-20T09:00:00Z', status: 'ACTIVE' }, latestMeasurement: { timestamp: '2025-01-01T10:00:00Z', soilMoisture: 42.5, lightLevel: 650, temperature: 21.1 } } } })
  @ApiBadRequestResponse({ description: 'Device already owned or invalid pairingCode' })
  @ApiNotFoundResponse({ description: 'Device UID unknown' })
  async link(@CurrentUser() user: any, @Body() dto: LinkPotDto): Promise<PotDetailsResponseDto> {
    return this.devicesService.linkPotToUser(user?.userId, dto);
  }

}

@ApiTags('devices')
@Controller('devices')
export class DevicesProvisionController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('provision')
  @ApiOperation({ summary: 'Provision a device (admin-only)' })
  @ApiBody({ type: ProvisionDeviceDto, examples: { example: { value: { deviceUid: 'PLANT-ABC-001', name: 'Kitchen Pot' } } } })
  @ApiOkResponse({ schema: { example: { deviceUid: 'PLANT-ABC-001', pairingCode: '123456', name: 'Kitchen Pot' } } })
  async provision(@Body() dto: ProvisionDeviceDto): Promise<{ deviceUid: string; pairingCode: string; name: string }> {
    return this.devicesService.provisionDevice(dto);
  }
}
