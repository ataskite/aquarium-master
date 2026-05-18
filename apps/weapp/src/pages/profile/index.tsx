import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { Button } from '@nutui/nutui-react-taro';
import { api } from '../../services/api';
import { useAquariumStore } from '../../store/aquarium';
import './index.scss';

interface ProfileStats {
  aquariums: number;
  reminders: number;
  records: number;
  knowledge: number;
}

export default function ProfilePage() {
  const { selectedId, aquariums, loadAquariums } = useAquariumStore();
  const aquariumId = selectedId ?? aquariums[0]?.id;
  const [openid, setOpenid] = useState('未登录');
  const [stats, setStats] = useState<ProfileStats>({ aquariums: aquariums.length, reminders: 0, records: 0, knowledge: 0 });
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      await loadAquariums();
      const [reminders, waterRecords, maintenanceRecords, knowledge] = await Promise.all([
        api.listReminders(aquariumId),
        aquariumId ? api.listWaterRecords(aquariumId) : Promise.resolve([]),
        aquariumId ? api.listMaintenanceRecords(aquariumId) : Promise.resolve([]),
        api.listKnowledge(),
      ]);
      setStats({
        aquariums: useAquariumStore.getState().aquariums.length,
        reminders: reminders.length,
        records: waterRecords.length + maintenanceRecords.length,
        knowledge: knowledge.length,
      });
    } catch {
      await Taro.showToast({ title: '统计加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStats();
  }, [aquariumId]);

  const login = async () => {
    try {
      const { code } = await Taro.login();
      const response = await api.login(code) as { session?: { openid?: string } };
      setOpenid(response.session?.openid ?? 'mock-openid-demo');
      await Taro.showToast({ title: '已登录', icon: 'success' });
    } catch {
      await Taro.showToast({ title: '登录失败', icon: 'none' });
    }
  };

  return (
    <View className="page page-enter profile-page">
      <View className="hero profile-hero">
        <Text className="hero-title">我的水族档案</Text>
        <Text className="hero-subtitle">记录鱼缸、提醒和养护数据</Text>
      </View>

      <Text className="section-title">账号</Text>
      <View className="card">
        <View className="row">
          <View>
            <Text className="metric-value">微信用户</Text>
            <Text className="muted">{openid}</Text>
          </View>
          <Text className={openid === '未登录' ? 'pill' : 'pill green'}>{openid === '未登录' ? '未登录' : '已登录'}</Text>
        </View>
      </View>
      <Button block type="primary" className="water-button" onClick={login}>微信登录</Button>

      <Text className="section-title">服务数据</Text>
      {loading && <View className="card"><Text className="muted">加载中...</Text></View>}
      {!loading && (
        <View className="metric-grid">
          <View className="metric"><Text className="muted">鱼缸</Text><Text className="metric-value">{stats.aquariums}</Text></View>
          <View className="metric"><Text className="muted">提醒</Text><Text className="metric-value">{stats.reminders}</Text></View>
          <View className="metric"><Text className="muted">养护记录</Text><Text className="metric-value">{stats.records}</Text></View>
          <View className="metric"><Text className="muted">知识库</Text><Text className="metric-value">{stats.knowledge}</Text></View>
        </View>
      )}
      <Button block className="profile-secondary-button" onClick={() => void loadStats()}>刷新数据</Button>
    </View>
  );
}
