// Service paramètres utilisateur: lecture et mise à jour (à implémenter).
import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class UserSettingsService {
  // TODO: inject PrismaService

  // Lecture
  async getSettings(): Promise<void> {
    throw new NotImplementedException();
  }

  // Mise à jour
  async updateSettings(): Promise<void> {
    throw new NotImplementedException();
  }
}

