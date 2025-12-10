// Service utilisateur: lecture et mise à jour du profil (à implémenter).
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
// Intention: Service profil utilisateur (lecture, mise à jour, avatar)
// Objectif: Valider l’unicité du nom et persister l’URL d’avatar
// Logique: Requêtes Prisma avec contrôles basiques
import * as fs from 'fs';
import * as path from 'path';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<{ username?: string; avatarUrl?: string | null }> {
    const user = await (this.prisma.user.findUnique({ where: { id: userId }, select: { username: true, avatarUrl: true } as any }) as any);
    return { username: user?.username ?? undefined, avatarUrl: user?.avatarUrl ?? null };
  }

  async updateProfile(userId: string, payload: { username?: string }): Promise<void> {
    if (payload.username && payload.username.trim()) {
      const uname = payload.username.trim();
      const dup = await this.prisma.user.findFirst({ where: { username: uname } as any });
      if (dup && dup.id !== userId) {
        throw new BadRequestException('Username already taken');
      }
      await this.prisma.user.update({ where: { id: userId }, data: { username: uname } as any });
    }
  }

  async setAvatarUrl(userId: string, url: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { avatarUrl: url } as any });
  }

  async saveAvatar(userId: string, file: any): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
    try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch {}
    const ext = (file?.originalname?.split('.')?.pop() || 'png').toLowerCase();
    const name = `${userId}-${Date.now()}.${ext}`;
    const diskPath = path.join(uploadsDir, name);
    fs.writeFileSync(diskPath, file.buffer);
    const url = `/static/avatars/${name}`;
    const existing = await this.prisma.userSettings.findUnique({ where: { userId } });
    if (existing) {
      await this.prisma.userSettings.update({ where: { userId }, data: { avatarUrl: url } as any });
    } else {
      await this.prisma.userSettings.create({ data: { userId, avatarUrl: url } as any });
    }
    return url;
  }
}
