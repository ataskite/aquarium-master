import { Body, Controller, Post } from '@nestjs/common';
import { AiService, ChatMessage } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('chat')
  chat(@Body() body: { messages: ChatMessage[] }) {
    return this.ai.chat(body.messages ?? []);
  }
}
