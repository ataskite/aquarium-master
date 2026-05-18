import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import { Button } from '@nutui/nutui-react-taro';
import { api, ChatMessage } from '../../services/api';
import './index.scss';

const starterPrompts = [
  '我的鱼最近浮在水面，呼吸很急促，怎么办？',
  '硝酸盐一直偏高，应该怎么调整换水频率？',
  '新鱼入缸之前要做哪些检查？',
];

export default function AiAssistantPage() {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '可以描述鱼的状态、水温、pH、氨氮和最近是否换水，我会按真实情况给你排查方向。' },
  ]);

  const sendQuestion = async (question: string) => {
    const content = question.trim();
    if (!content || sending) return;
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setInput('');
    setSending(true);
    try {
      const response = await api.chat(nextMessages);
      setMessages((items) => [...items, { role: 'assistant', content: response.answer }]);
    } catch {
      await Taro.showToast({ title: 'AI 服务暂不可用', icon: 'none' });
      setMessages((items) => [...items, { role: 'assistant', content: '这次请求没有成功。你可以稍后重试，或者先检查 API 服务和 AI Provider 配置。' }]);
    } finally {
      setSending(false);
    }
  };

  const clearMessages = async () => {
    const result = await Taro.showModal({ title: '清空对话', content: '当前页面的对话记录会被清空。' });
    if (!result.confirm) return;
    setMessages([{ role: 'assistant', content: '对话已清空。把鱼缸现象发给我，我们重新排查。' }]);
  };

  return (
    <View className="page page-enter chat-page">
      <View className="chat-header">
        <View>
          <Text className="chat-title">AI 助手</Text>
          <Text className="muted">智能问答，养鱼好帮手</Text>
        </View>
        <Text className="chat-action" onClick={clearMessages}>清空</Text>
      </View>

      <View className="assistant-card prompt-card">
        <Text className="assistant-card-title">快捷问题</Text>
        {starterPrompts.map((prompt) => (
          <View className="prompt-row" key={prompt} onClick={() => void sendQuestion(prompt)}>
            <Text>{prompt}</Text>
          </View>
        ))}
      </View>

      <View className="chat-list">
        {messages.map((message, index) => (
          <View key={`${message.role}-${index}`} className={`bubble ${message.role}`}>
            <Text>{message.content}</Text>
          </View>
        ))}
        {sending && (
          <View className="bubble assistant">
            <Text>正在分析...</Text>
          </View>
        )}
      </View>

      <View className="chat-input">
        <Input className="chat-field" value={input} placeholder="问问 AI 助手..." onInput={(event) => setInput(event.detail.value)} confirmType="send" onConfirm={() => void sendQuestion(input)} />
        <Button className="send-button" type="primary" loading={sending} onClick={() => void sendQuestion(input)}>发送</Button>
      </View>
    </View>
  );
}
