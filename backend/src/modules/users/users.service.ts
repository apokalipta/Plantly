// Service utilisateur: lecture et mise à jour du profil (à implémenter).
import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class UsersService {
  // TODO: inject PrismaService

  // Lecture
  async getProfile(): Promise<void> {
    throw new NotImplementedException();
  }

  // Mise à jour
  async updateProfile(): Promise<void> {
    throw new NotImplementedException();
  }
}

