// Contrôleurs des pots et appareils: endpoints utilisateur et provisionnement.
import { Controller, Get, Post, Body, Param, UseGuards, Delete, HttpCode, Patch } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ListPotsResponseDto } from './dto/list-pots.response.dto';
import { LinkPotDto } from './dto/link-pot.dto';
import { PotDetailsResponseDto } from './dto/pot-details.response.dto';
import { ProvisionDeviceDto } from './dto/provision-device.dto';
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiBadRequestResponse, ApiNotFoundResponse, ApiBody, ApiNoContentResponse } from '@nestjs/swagger';
import { PatchPlantDto } from '../bases/dto/patch-plant.dto';

@ApiTags('pots')
@ApiBearerAuth()
@Controller('pots')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  // Liste des pots de l'utilisateur courant
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'List pots for current user' })
  @ApiOkResponse({ type: ListPotsResponseDto, isArray: true, schema: { example: [ { id: '3f95d7f2-1111-4444-aaaa-bbbbbb111111', name: 'My Basil', deviceUid: 'PLANT-ABC-001', lastSeenAt: '2025-01-01T10:00:00Z', globalStatus: 'OK' } ] } })
  async list(@CurrentUser() user: any): Promise<ListPotsResponseDto[]> {
    return this.devicesService.findUserPots(user?.userId);
  }

  // Détails d'un pot (vérifie la possession)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get pot details' })
  @ApiOkResponse({ type: PotDetailsResponseDto, schema: { example: { id: '3f95d7f2-1111-4444-aaaa-bbbbbb111111', name: 'My Basil', deviceUid: 'PLANT-ABC-001', lastSeenAt: '2025-01-01T10:00:00Z', globalStatus: 'ACTION_REQUIRED', plant: { id: 'plant-01', speciesId: 12, nickname: 'Basilou', plantedAt: '2024-12-20T09:00:00Z', status: 'ACTIVE' }, latestMeasurement: { timestamp: '2025-01-01T10:00:00Z', soilMoisture: 42.5, lightLevel: 650, temperature: 21.1 } } } })
  @ApiNotFoundResponse({ description: 'Pot not found or not owned by user' })
  async details(@CurrentUser() user: any, @Param('id') potId: string): Promise<PotDetailsResponseDto> {
    return this.devicesService.findUserPotById(user?.userId, potId);
  }

  // Lier un pot à l'utilisateur via code d'appairage
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

  // Supprimer un pot (et toutes ses données associées)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a pot (and associated data) owned by the current user' })
  @ApiNoContentResponse({ description: 'Pot deleted' })
  @ApiNotFoundResponse({ description: 'Pot not found or not owned by user' })
  async delete(@CurrentUser() user: any, @Param('id') potId: string): Promise<void> {
    await this.devicesService.deleteUserPotById(user?.userId, potId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/plant')
  @ApiOperation({ summary: 'Assign or change the plant associated to a pot' })
  @ApiBody({ type: PatchPlantDto, examples: { example: { value: { speciesId: 12, nickname: 'Basilou' } } } })
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  async patchPlant(
    @CurrentUser() user: any,
    @Param('id') potId: string,
    @Body() dto: PatchPlantDto,
  ): Promise<{ status: string }> {
    await this.devicesService.assignPlantToPot(String(user?.userId), potId, dto);
    return { status: 'ok' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/plant')
  @HttpCode(200)
  @ApiOperation({ summary: 'Unassign the current plant from a pot (mark as removed)' })
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  async deletePlant(@CurrentUser() user: any, @Param('id') potId: string): Promise<{ status: string }> {
    await this.devicesService.removePlantFromPot(String(user?.userId), potId);
    return { status: 'ok' };
  }

}

@ApiTags('devices')
@Controller('devices')
export class DevicesProvisionController {
  constructor(private readonly devicesService: DevicesService) {}

  // Provisionner un appareil (génère un code d'appairage)
  @Post('provision')
  @ApiOperation({ summary: 'Provision a device (admin-only)' })
  @ApiBody({ type: ProvisionDeviceDto, examples: { example: { value: { deviceUid: 'PLANT-ABC-001', name: 'Kitchen Pot' } } } })
  @ApiOkResponse({ schema: { example: { deviceUid: 'PLANT-ABC-001', pairingCode: '123456', name: 'Kitchen Pot', deviceSecret: 'abcdef123456' } } })
  async provision(@Body() dto: ProvisionDeviceDto): Promise<{ deviceUid: string; pairingCode: string; name: string; deviceSecret: string }> {
    return this.devicesService.provisionDevice(dto);
  }
}
