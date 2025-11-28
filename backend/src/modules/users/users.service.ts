import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class UsersService {
  // TODO: inject PrismaService

  async getProfile(): Promise<void> {
    throw new NotImplementedException();
  }

  async updateProfile(): Promise<void> {
    throw new NotImplementedException();
  }
}

