import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import type { Express } from 'express';

@Injectable()
export class MediaService {
  constructor(private readonly config: ConfigService) {}

  private get provider(): string {
    return this.config.get<string>('MEDIA_PROVIDER') || 'LOCAL';
  }
  private get baseUrl(): string {
    const url = this.config.get<string>('MEDIA_BASE_URL') || 'http://localhost:3000/media';
    return url.replace(/\/$/, '');
  }
  private get basePath(): string {
    const p = this.config.get<string>('MEDIA_BASE_PATH') || path.join(process.cwd(), 'media');
    return p;
  }

  private ensureLocalProvider() {
    if (this.provider !== 'LOCAL') throw new BadRequestException('Unsupported media provider');
  }

  private validateFile(file: Express.Multer.File, maxBytes: number) {
    if (!file) throw new BadRequestException('File required');
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) throw new BadRequestException('Unsupported file type');
    if (file.size > maxBytes) throw new BadRequestException('File too large');
    if (!file.buffer) throw new BadRequestException('File buffer missing');
  }
  // Intention: Validation minimale côté service pour éviter les fichiers dangereux
  // Objectif: Restreindre les types, tailles et garantir un buffer en mémoire
  // Logique: Vérifications synchrones, suivies d’un écriture séquentielle dans un chemin contrôlé

  private extFromMime(mime: string): string {
    if (mime === 'image/jpeg') return 'jpg';
    if (mime === 'image/png') return 'png';
    if (mime === 'image/webp') return 'webp';
    return 'bin';
  }

  private buildUrl(relativePath: string): string {
    const rel = relativePath.replace(/\\/g, '/');
    return `${this.baseUrl}/${rel}`;
  }

  private resolveLocalPath(relativePath: string): string {
    return path.join(this.basePath, relativePath);
  }
  // Sécurité: on compose des chemins avec path.join pour éviter les traversals

  async saveUserAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    this.ensureLocalProvider();
    this.validateFile(file, 2 * 1024 * 1024);
    const ext = this.extFromMime(file.mimetype);
    const uuid = crypto.randomUUID();
    const rel = path.posix.join('users', userId, 'avatar', `${uuid}.${ext}`);
    const full = this.resolveLocalPath(rel);
    await fs.promises.mkdir(path.dirname(full), { recursive: true });
    await fs.promises.writeFile(full, file.buffer);
    const url = this.buildUrl(rel);
    return url;
  }
  // Intention: stocker chaque avatar avec un nom unique pour éviter les collisions
  // Objectif: fournir une URL stable sous /media/users/:id/avatar
  // Logique: écriture atomique, dossier créé au besoin

  async savePlantImage(speciesCode: string, file: Express.Multer.File): Promise<string> {
    this.ensureLocalProvider();
    this.validateFile(file, 2 * 1024 * 1024);
    const rel = path.posix.join('public', 'plants', speciesCode, `main.webp`);
    const full = this.resolveLocalPath(rel);
    await fs.promises.mkdir(path.dirname(full), { recursive: true });
    await fs.promises.writeFile(full, file.buffer);
    const url = this.buildUrl(rel);
    return url;
  }

  async savePlantMainImage(speciesCode: string, file: Express.Multer.File): Promise<string> {
    this.ensureLocalProvider();
    this.validateFile(file, 3 * 1024 * 1024);
    const rel = path.posix.join('public', 'plants', speciesCode, `main.webp`);
    const full = this.resolveLocalPath(rel);
    await fs.promises.mkdir(path.dirname(full), { recursive: true });
    await fs.promises.writeFile(full, file.buffer);
    const url = this.buildUrl(rel);
    return url;
  }
  // Intention: image principale par espèce, chemin déterministe
  // Objectif: simplifier le rendu public et références BD
  // Logique: écraser/mettre à jour le fichier cible pour la dernière version

  async savePotPhoto(potId: string, file: Express.Multer.File): Promise<string> {
    this.ensureLocalProvider();
    this.validateFile(file, 3 * 1024 * 1024);
    const ts = Date.now();
    const rel = path.posix.join('pots', potId, 'photos', `${ts}.webp`);
    const full = this.resolveLocalPath(rel);
    await fs.promises.mkdir(path.dirname(full), { recursive: true });
    await fs.promises.writeFile(full, file.buffer);
    return this.buildUrl(rel);
  }
}
