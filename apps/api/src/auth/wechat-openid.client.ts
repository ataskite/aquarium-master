import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface WechatSession {
  openid: string;
  session_key?: string;
  unionid?: string;
}

@Injectable()
export class WechatOpenIdClient {
  constructor(private readonly config: ConfigService) {}

  async exchangeCode(code: string): Promise<WechatSession> {
    const appid = this.config.get<string>('WECHAT_APP_ID');
    const secret = this.config.get<string>('WECHAT_APP_SECRET');
    if (!appid || !secret) {
      return { openid: `mock-openid-${code}` };
    }

    const { data } = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: { appid, secret, js_code: code, grant_type: 'authorization_code' },
      timeout: 8000,
    });
    if (data.errcode) {
      throw new Error(`Wechat code exchange failed: ${data.errmsg ?? data.errcode}`);
    }
    return data as WechatSession;
  }
}
