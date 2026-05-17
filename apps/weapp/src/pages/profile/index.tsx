import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { Button, Tag } from '@nutui/nutui-react-taro';
import { api } from '../../services/api';

export default function ProfilePage() {
  const [openid, setOpenid] = useState('未登录');

  const login = async () => {
    const { code } = await Taro.login();
    const response = await api.login(code) as { session?: { openid?: string } };
    setOpenid(response.session?.openid ?? 'demo-openid');
  };

  return (
    <View className="page">
      <View className="hero">
        <Text className="hero-title">我的水族档案</Text>
        <Text className="hero-subtitle">记录鱼缸、提醒和 AI 咨询历史</Text>
      </View>

      <Text className="section-title">账号</Text>
      <View className="card">
        <View className="row">
          <View>
            <Text className="metric-value">微信用户</Text>
            <Text className="muted">{openid}</Text>
          </View>
          <Tag type="success">Demo</Tag>
        </View>
      </View>
      <Button block type="primary" onClick={login}>微信登录占位</Button>

      <Text className="section-title">服务状态</Text>
      <View className="metric-grid">
        <View className="metric"><Text className="muted">鱼缸</Text><Text className="metric-value">1</Text></View>
        <View className="metric"><Text className="muted">提醒</Text><Text className="metric-value">3</Text></View>
        <View className="metric"><Text className="muted">知识库</Text><Text className="metric-value">只读</Text></View>
        <View className="metric"><Text className="muted">对象存储</Text><Text className="metric-value">MinIO</Text></View>
      </View>
    </View>
  );
}
