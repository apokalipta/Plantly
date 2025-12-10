// Service Prisma: gère la connexion à la base et l'arrêt propre.
import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
// Intention: Adapter Prisma à Nest (cycle de vie et configuration)
// Objectif: Gérer la connexion et la fermeture propre de l’application
// Logique: Lecture de DATABASE_URL et hooks de shutdown pour relâcher les ressources

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Initialisation avec l'URL de la base
    super({
      datasources: {
        db: { url: process.env.DATABASE_URL || '' },
      },
    });
  }
  async onModuleInit() {
    // Établit la connexion lors du démarrage du module
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    // Ferme proprement l'application avant la sortie du processus
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
