import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class PlantsService {
  // TODO: inject PrismaService

  async list(): Promise<void> {
    throw new NotImplementedException();
  }

  async create(): Promise<void> {
    throw new NotImplementedException();
  }
}

