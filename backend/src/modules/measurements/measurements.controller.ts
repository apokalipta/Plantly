import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GetMeasurementsQueryDto } from './dto/get-measurements.query.dto';
import { MeasurementDto } from './dto/measurement.dto';

@Controller('pots/:potId/measurements')
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(
    @CurrentUser() user: any,
    @Param('potId') potId: string,
    @Query() query: GetMeasurementsQueryDto,
  ): Promise<MeasurementDto[]> {
    return this.measurementsService.getMeasurementsForPot(user?.userId, potId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('latest')
  async latest(
    @CurrentUser() user: any,
    @Param('potId') potId: string,
  ): Promise<MeasurementDto | null> {
    return this.measurementsService.getLatestMeasurementForPot(user?.userId, potId);
  }
}
