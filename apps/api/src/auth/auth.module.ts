import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { WechatOpenIdClient } from './wechat-openid.client';

@Module({
  controllers: [AuthController],
  providers: [AuthService, WechatOpenIdClient],
})
export class AuthModule {}
