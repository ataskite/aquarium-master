import React, { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import { Button, Tag } from '@nutui/nutui-react-taro';
import { api } from '../../services/api';
import './index.scss';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiAssistantPage() {
  const [input, setInput] = useState('我的鱼最近浮在水面，呼吸很急促，怎么办？');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '可以描述鱼的状态、水温、pH、氨氮和最近是否换水，我会给你排查方向。' },
  ]);

  const send = async () => {
    const question = input.trim();
    if (!question) return;
    setMessages((items) => [...items, { role: 'user', content: question }]);
    setInput('');
    const response = await api.chat(question);
    setMessages((items) => [...items, { role: 'assistant', content: response.answer }]);
  };

  return (
    <View className="page chat-page">
      <View className="row">
        <Text className="section-title">智能问答</Text>
        <Tag type="primary">Provider 可插拔</Tag>
      </View>
      <View className="chat-list">
        {messages.map((message, index) => (
          <View key={`${message.role}-${index}`} className={`bubble ${message.role}`}>
            <Text>{message.content}</Text>
          </View>
        ))}
      </View>
      <View className="chat-input">
        <Input value={input} placeholder="问问 AI 助手..." onInput={(event) => setInput(event.detail.value)} />
        <Button type="primary" onClick={send}>发送</Button>
      </View>
    </View>
  );
}
