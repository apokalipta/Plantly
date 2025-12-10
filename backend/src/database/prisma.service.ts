// Service Prisma: gère la connexion à la base et l'arrêt propre.
import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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
