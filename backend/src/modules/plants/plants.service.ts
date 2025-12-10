// Service des plantes: gestion des instances de plantes (à implémenter).
import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class PlantsService {
  // TODO: inject PrismaService

  // Liste des plantes
  async list(): Promise<void> {
    throw new NotImplementedException();
  }

  // Création d'une plante
  async create(): Promise<void> {
    throw new NotImplementedException();
  }
}

