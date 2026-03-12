import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

export type ForumUser = {
  id: string;
  username: string | null;
  avatarUrl: string | null;
};

export type ForumComment = {
  id: string;
  content: string;
  createdAt: Date;
  author: ForumUser;
};

export type ForumDiscussion = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  imageUrl: string | null;
  author: ForumUser;
  comments: ForumComment[];
};

export type ForumNotification = {
  id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
};

@Injectable()
export class ForumService {
  constructor(private readonly prisma: PrismaService) {}

  async listDiscussions(): Promise<ForumDiscussion[]> {
    const discussions = await this.prisma.$queryRaw<
      Array<{
        id: string;
        title: string;
        content: string;
        authorId: string;
        imageUrl: string | null;
        createdAt: Date;
        authorUsername: string | null;
        authorAvatarUrl: string | null;
      }>
    >`
      SELECT
        d.id,
        d.title,
        d.content,
        d."authorId" AS "authorId",
        d."imageUrl" AS "imageUrl",
        d."createdAt" AS "createdAt",
        u.username AS "authorUsername",
        u."avatarUrl" AS "authorAvatarUrl"
      FROM "Discussion" d
      JOIN "User" u ON u.id = d."authorId"
      ORDER BY d."createdAt" DESC
      LIMIT 100
    `;

    const ids = discussions.map((d) => d.id);
    const commentsByDiscussionId = new Map<string, ForumComment[]>();
    ids.forEach((id) => commentsByDiscussionId.set(id, []));

    if (ids.length > 0) {
      const comments = await this.prisma.$queryRaw<
        Array<{
          id: string;
          content: string;
          discussionId: string;
          authorId: string;
          createdAt: Date;
          authorUsername: string | null;
          authorAvatarUrl: string | null;
        }>
      >`
        SELECT
          c.id,
          c.content,
          c."discussionId" AS "discussionId",
          c."authorId" AS "authorId",
          c."createdAt" AS "createdAt",
          u.username AS "authorUsername",
          u."avatarUrl" AS "authorAvatarUrl"
        FROM "Comment" c
        JOIN "User" u ON u.id = c."authorId"
        WHERE c."discussionId" IN (${Prisma.join(ids)})
        ORDER BY c."createdAt" ASC
      `;

      for (const c of comments) {
        const list = commentsByDiscussionId.get(c.discussionId);
        if (!list) continue;
        list.push({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt,
          author: {
            id: c.authorId,
            username: c.authorUsername,
            avatarUrl: c.authorAvatarUrl,
          },
        });
      }
    }

    return discussions.map((d) => ({
      id: d.id,
      title: d.title,
      content: d.content,
      createdAt: d.createdAt,
      imageUrl: d.imageUrl,
      author: {
        id: d.authorId,
        username: d.authorUsername,
        avatarUrl: d.authorAvatarUrl,
      },
      comments: commentsByDiscussionId.get(d.id) || [],
    }));
  }

  async createDiscussion(input: { title: string; content: string; authorId: string; imageUrl?: string | null }): Promise<ForumDiscussion> {
    const id = randomUUID();
    const createdAt = new Date();
    const imageUrl = input.imageUrl ?? null;

    await this.prisma.$executeRaw`
      INSERT INTO "Discussion" (id, title, content, "authorId", "imageUrl", "createdAt")
      VALUES (${id}, ${input.title}, ${input.content}, ${input.authorId}, ${imageUrl}, ${createdAt})
    `;

    const row = await this.prisma.$queryRaw<
      Array<{
        id: string;
        title: string;
        content: string;
        authorId: string;
        imageUrl: string | null;
        createdAt: Date;
        authorUsername: string | null;
        authorAvatarUrl: string | null;
      }>
    >`
      SELECT
        d.id,
        d.title,
        d.content,
        d."authorId" AS "authorId",
        d."imageUrl" AS "imageUrl",
        d."createdAt" AS "createdAt",
        u.username AS "authorUsername",
        u."avatarUrl" AS "authorAvatarUrl"
      FROM "Discussion" d
      JOIN "User" u ON u.id = d."authorId"
      WHERE d.id = ${id}
      LIMIT 1
    `;

    const d = row[0];
    if (!d) throw new NotFoundException();

    return {
      id: d.id,
      title: d.title,
      content: d.content,
      createdAt: d.createdAt,
      imageUrl: d.imageUrl,
      author: {
        id: d.authorId,
        username: d.authorUsername,
        avatarUrl: d.authorAvatarUrl,
      },
      comments: [],
    };
  }

  async addCommentAndNotify(input: { discussionId: string; content: string; authorId: string }): Promise<ForumComment> {
    return this.prisma.$transaction(async (tx) => {
      const discussionRows = await tx.$queryRaw<
        Array<{ id: string; authorId: string; title: string }>
      >`
        SELECT id, "authorId" AS "authorId", title
        FROM "Discussion"
        WHERE id = ${input.discussionId}
        LIMIT 1
      `;
      const discussion = discussionRows[0];
      if (!discussion) throw new NotFoundException('Discussion not found');

      const commentId = randomUUID();
      const createdAt = new Date();
      await tx.$executeRaw`
        INSERT INTO "Comment" (id, content, "authorId", "discussionId", "createdAt")
        VALUES (${commentId}, ${input.content}, ${input.authorId}, ${input.discussionId}, ${createdAt})
      `;

      if (discussion.authorId !== input.authorId) {
        const notifId = randomUUID();
        const message = `Nouvelle réponse à votre discussion: ${discussion.title}`;
        await tx.$executeRaw`
          INSERT INTO "Notification" (id, "userId", message, type, read, "createdAt")
          VALUES (${notifId}, ${discussion.authorId}, ${message}, ${'REPLY'}, ${false}, ${new Date()})
        `;
      }

      const rows = await tx.$queryRaw<
        Array<{
          id: string;
          content: string;
          authorId: string;
          createdAt: Date;
          authorUsername: string | null;
          authorAvatarUrl: string | null;
        }>
      >`
        SELECT
          c.id,
          c.content,
          c."authorId" AS "authorId",
          c."createdAt" AS "createdAt",
          u.username AS "authorUsername",
          u."avatarUrl" AS "authorAvatarUrl"
        FROM "Comment" c
        JOIN "User" u ON u.id = c."authorId"
        WHERE c.id = ${commentId}
        LIMIT 1
      `;
      const c = rows[0];
      if (!c) throw new NotFoundException();

      return {
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        author: {
          id: c.authorId,
          username: c.authorUsername,
          avatarUrl: c.authorAvatarUrl,
        },
      };
    });
  }

  async listNotifications(userId: string): Promise<ForumNotification[]> {
    const rows = await this.prisma.$queryRaw<
      Array<{ id: string; message: string; type: string; read: boolean; createdAt: Date }>
    >`
      SELECT id, message, type, read, "createdAt" AS "createdAt"
      FROM "Notification"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      LIMIT 50
    `;
    return rows;
  }
}

