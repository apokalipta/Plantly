import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class UserSettingsService {
  // TODO: inject PrismaService

  async getSettings(): Promise<void> {
    throw new NotImplementedException();
  }

  async updateSettings(): Promise<void> {
    throw new NotImplementedException();
  }
}

