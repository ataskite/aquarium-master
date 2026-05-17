import React, { useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { Button, Tag } from '@nutui/nutui-react-taro';
import { useAquariumStore } from '../../store/aquarium';
import './index.scss';

export default function HomePage() {
  const { aquariums, loadAquariums, select } = useAquariumStore();
  const tank = aquariums[0];

  useEffect(() => {
    void loadAquariums();
  }, [loadAquariums]);

  const openTank = () => {
    select(tank.id);
    void Taro.navigateTo({ url: `/pages/tank-detail/index?id=${tank.id}` });
  };

  return (
    <View className="page">
      <View className="hero home-hero">
        <Text className="hero-title">水族大师</Text>
        <Text className="hero-subtitle">科学养鱼 · 快乐养鱼</Text>
        <View className="hero-status">
          <Text>今日水质稳定</Text>
          <Tag type="success">适合投喂</Tag>
        </View>
      </View>

      <Text className="section-title">我的鱼缸</Text>
      <View className="card tank-card" onClick={openTank}>
        <View className="tank-visual">
          <Text className="fish">🐠</Text>
          <Text className="fish fish-alt">🐟</Text>
          <Text className="plant">♒</Text>
        </View>
        <View className="row">
          <View>
            <Text className="tank-name">{tank.name}</Text>
            <Text className="muted">{tank.volumeLiters}L · {tank.species}</Text>
          </View>
          <Tag type="primary">{tank.healthScore}分</Tag>
        </View>
      </View>

      <Text className="section-title">水质概览</Text>
      <View className="metric-grid">
        <View className="metric"><Text className="muted">温度</Text><Text className="metric-value">26.3℃</Text><Tag type="success">正常</Tag></View>
        <View className="metric"><Text className="muted">pH</Text><Text className="metric-value">7.2</Text><Tag type="success">正常</Tag></View>
        <View className="metric"><Text className="muted">氨氮 NH₃</Text><Text className="metric-value">0.02</Text><Tag type="success">正常</Tag></View>
        <View className="metric"><Text className="muted">硝酸盐 NO₃</Text><Text className="metric-value">12</Text><Tag type="success">正常</Tag></View>
      </View>

      <Text className="section-title">快捷操作</Text>
      <View className="quick-grid">
        <Button type="primary" onClick={() => Taro.switchTab({ url: '/pages/add-record/index' })}>添加记录</Button>
        <Button onClick={() => Taro.switchTab({ url: '/pages/ai-assistant/index' })}>问 AI</Button>
      </View>
    </View>
  );
}
