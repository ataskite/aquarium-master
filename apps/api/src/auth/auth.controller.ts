import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('wechat-login')
  login(@Body() body: { code: string; nickname?: string; avatarUrl?: string }) {
    return this.auth.loginWithWechatCode(body.code, {
      nickname: body.nickname,
      avatarUrl: body.avatarUrl,
    });
  }
}
