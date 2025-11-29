import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GetMeasurementsQueryDto } from './dto/get-measurements.query.dto';
import { MeasurementDto } from './dto/measurement.dto';
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiNotFoundResponse } from '@nestjs/swagger';

@ApiTags('measurements')
@ApiBearerAuth()
@Controller('pots/:potId/measurements')
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'List measurements for a pot' })
  @ApiOkResponse({ type: MeasurementDto, isArray: true, description: 'Measurements returned', schema: { example: [ { timestamp: '2025-01-01T10:00:00Z', soilMoisture: 40.2, lightLevel: 700, temperature: 20.5 }, { timestamp: '2025-01-01T09:00:00Z', soilMoisture: 38.9, lightLevel: 680, temperature: 20.1 } ] } })
  @ApiNotFoundResponse({ description: 'Pot not found or not owned by user' })
  async list(
    @CurrentUser() user: any,
    @Param('potId') potId: string,
    @Query() query: GetMeasurementsQueryDto,
  ): Promise<MeasurementDto[]> {
    return this.measurementsService.getMeasurementsForPot(user?.userId, potId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('latest')
  @ApiOperation({ summary: 'Get latest measurement for a pot' })
  @ApiOkResponse({ type: MeasurementDto, description: 'Latest measurement or null', schema: { example: { timestamp: '2025-01-01T10:00:00Z', soilMoisture: 40.2, lightLevel: 700, temperature: 20.5 } } })
  @ApiNotFoundResponse({ description: 'Pot not found or not owned by user' })
  async latest(
    @CurrentUser() user: any,
    @Param('potId') potId: string,
  ): Promise<MeasurementDto | null> {
    return this.measurementsService.getLatestMeasurementForPot(user?.userId, potId);
  }
}
