import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WechatOpenIdClient } from './wechat-openid.client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wechat: WechatOpenIdClient,
  ) {}

  async loginWithWechatCode(code: string, profile?: { nickname?: string; avatarUrl?: string }) {
    const session = await this.wechat.exchangeCode(code);
    const user = await this.prisma.user.upsert({
      where: { openId: session.openid },
      create: { openId: session.openid, nickname: profile?.nickname, avatarUrl: profile?.avatarUrl },
      update: { nickname: profile?.nickname, avatarUrl: profile?.avatarUrl },
    });

    return {
      token: `demo-token-${user.id}`,
      user,
      session: { openid: session.openid, unionid: session.unionid },
    };
  }
}
