import { UsersController } from '../src/modules/users/users.controller';
import { describe, it, expect, jest } from '@jest/globals';

const makeFile = (mime: string, size: number) => ({
  fieldname: 'file', originalname: 'a', encoding: '7bit', mimetype: mime, size, buffer: Buffer.alloc(size || 1),
} as any);

describe('UsersController avatar', () => {
  it('updates avatar and returns url', async () => {
    const usersService: any = { setAvatarUrl: (jest.fn() as any).mockResolvedValue(undefined) };
    const achievements: any = { onEvent: (jest.fn() as any).mockResolvedValue(undefined) };
    const media: any = { saveUserAvatar: (jest.fn() as any).mockResolvedValue('http://localhost:3000/media/users/u1/avatar/abc.webp') };
    const prisma: any = {};
    const ctrl = new UsersController(usersService, achievements, media, prisma);
    const res = await ctrl.uploadAvatarSimple({ userId: 'u1' } as any, makeFile('image/webp', 1000));
    expect(res.avatarUrl).toBe('http://localhost:3000/media/users/u1/avatar/abc.webp');
    expect(usersService.setAvatarUrl).toHaveBeenCalledWith('u1', 'http://localhost:3000/media/users/u1/avatar/abc.webp');
  });
});

