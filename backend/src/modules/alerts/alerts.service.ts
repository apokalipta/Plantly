import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class AlertsService {
  // TODO: inject PrismaService

  async list(): Promise<void> {
    throw new NotImplementedException();
  }
}

