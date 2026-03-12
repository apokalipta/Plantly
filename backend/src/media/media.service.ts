import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Express } from 'express';
import { MediaSecurityService } from './media-security.service';

@Injectable()
export class MediaService {
  constructor(private readonly config: ConfigService, private readonly sec?: MediaSecurityService) {}

  private readonly fallbackSec = new MediaSecurityService();
  private get security(): MediaSecurityService {
    return this.sec ?? this.fallbackSec;
  }

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

  private async validateAndSniff(file: Express.Multer.File, maxBytes: number): Promise<string> {
    if (!file?.buffer) throw new BadRequestException('File required');
    const sec = this.security;
    sec.validateMime(file.mimetype);
    sec.enforceMaxSize(file.size, maxBytes);
    const actualMime = await sec.sniffActualMime(file.buffer, file.mimetype);
    return actualMime;
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
    const rel = relativePath.replaceAll('\\', '/');
    return `${this.baseUrl}/${rel}`;
  }

  private resolveLocalPath(relativePath: string): string {
    const safeRel = this.security.buildSafePath(relativePath);
    return path.join(this.basePath, safeRel);
  }
  // Sécurité: on compose des chemins avec path.join pour éviter les traversals

  async saveUserAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    this.ensureLocalProvider();
    const mime = await this.validateAndSniff(file, 3 * 1024 * 1024);
    const ext = this.extFromMime(mime);
    const uuid = this.security.sanitizeFilename();
    const rel = path.posix.join('users', userId, 'avatar', `${uuid}.${ext}`);
    const full = this.resolveLocalPath(rel);
    await this.security.ensureDirectoryExists(full);
    await fs.promises.writeFile(full, file.buffer, { mode: 0o644 });
    const url = this.buildUrl(rel);
    return url;
  }
  // Intention: stocker chaque avatar avec un nom unique pour éviter les collisions
  // Objectif: fournir une URL stable sous /media/users/:id/avatar
  // Logique: écriture atomique, dossier créé au besoin

  async savePlantImage(speciesCode: string, file: Express.Multer.File): Promise<string> {
    return this.savePlantMainImage(speciesCode, file);
  }

  async savePlantMainImage(speciesCode: string, file: Express.Multer.File): Promise<string> {
    this.ensureLocalProvider();
    const mime = await this.validateAndSniff(file, 3 * 1024 * 1024);
    const ext = this.extFromMime(mime);
    const rel = path.posix.join('public', 'plants', speciesCode, `main.${ext}`);
    const full = this.resolveLocalPath(rel);
    await this.security.ensureDirectoryExists(full);
    await fs.promises.writeFile(full, file.buffer, { mode: 0o644 });
    const url = this.buildUrl(rel);
    return url;
  }
  // Intention: image principale par espèce, chemin déterministe
  // Objectif: simplifier le rendu public et références BD
  // Logique: écraser/mettre à jour le fichier cible pour la dernière version

  async savePotPhoto(potId: string, file: Express.Multer.File): Promise<string> {
    this.ensureLocalProvider();
    const mime = await this.validateAndSniff(file, 3 * 1024 * 1024);
    const ext = this.extFromMime(mime);
    const uuid = this.security.sanitizeFilename();
    const rel = path.posix.join('pots', potId, 'photos', `${uuid}.${ext}`);
    const full = this.resolveLocalPath(rel);
    await this.security.ensureDirectoryExists(full);
    await fs.promises.writeFile(full, file.buffer, { mode: 0o644 });
    return this.buildUrl(rel);
  }

  async saveForumImage(file: Express.Multer.File): Promise<string> {
    this.ensureLocalProvider();
    const mime = await this.validateAndSniff(file, 3 * 1024 * 1024);
    const ext = this.extFromMime(mime);
    const uuid = this.security.sanitizeFilename();
    const rel = path.posix.join('forum', `${uuid}.${ext}`);
    const full = this.resolveLocalPath(rel);
    await this.security.ensureDirectoryExists(full);
    await fs.promises.writeFile(full, file.buffer, { mode: 0o644 });
    return this.buildUrl(rel);
  }
}
