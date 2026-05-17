import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiProvider {
  chat(messages: ChatMessage[]): Promise<{ answer: string; provider: string }>;
}

class EchoProvider implements AiProvider {
  async chat(messages: ChatMessage[]) {
    const question = [...messages].reverse().find((message) => message.role === 'user')?.content ?? '';
    return {
      provider: 'echo',
      answer: `已收到问题：「${question}」。Demo 环境会先给出通用建议：检查水温、pH、氨氮、亚硝酸盐，并观察鱼只呼吸和进食状态。`,
    };
  }
}

class HttpProvider implements AiProvider {
  constructor(
    private readonly endpoint: string,
    private readonly apiKey?: string,
  ) {}

  async chat(messages: ChatMessage[]) {
    const { data } = await axios.post(
      this.endpoint,
      { messages },
      { headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : undefined, timeout: 15000 },
    );
    return { provider: 'http', answer: data.answer ?? data.content ?? JSON.stringify(data) };
  }
}

@Injectable()
export class AiService {
  private readonly provider: AiProvider;

  constructor(config: ConfigService) {
    const httpEndpoint = config.get<string>('AI_HTTP_ENDPOINT');
    this.provider =
      config.get<string>('AI_PROVIDER') === 'http' && httpEndpoint
        ? new HttpProvider(httpEndpoint, config.get<string>('AI_HTTP_API_KEY'))
        : new EchoProvider();
  }

  chat(messages: ChatMessage[]) {
    return this.provider.chat(messages);
  }
}
