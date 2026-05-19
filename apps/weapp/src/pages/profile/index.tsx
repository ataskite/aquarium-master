import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { Button } from '@nutui/nutui-react-taro';
import { api } from '../../services/api';
import { useAquariumStore } from '../../store/aquarium';
import { useAuthStore } from '../../store/auth';
import './index.scss';

interface ProfileStats {
  aquariums: number;
  reminders: number;
  records: number;
  knowledge: number;
}

export default function ProfilePage() {
  const { selectedId, aquariums, loadAquariums } = useAquariumStore();
  const { user, isLoggedIn, login, logout } = useAuthStore();
  const aquariumId = selectedId ?? aquariums[0]?.id;
  const [stats, setStats] = useState<ProfileStats>({ aquariums: 0, reminders: 0, records: 0, knowledge: 0 });
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      await loadAquariums();
      const currentAquariumId = useAquariumStore.getState().selectedId ?? useAquariumStore.getState().aquariums[0]?.id;
      const [reminders, waterRecords, maintenanceRecords, knowledge] = await Promise.all([
        api.listReminders(currentAquariumId),
        currentAquariumId ? api.listWaterRecords(currentAquariumId) : Promise.resolve([]),
        currentAquariumId ? api.listMaintenanceRecords(currentAquariumId) : Promise.resolve([]),
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
  }, [isLoggedIn, aquariumId]);

  const handleLogin = async () => {
    try {
      const { code } = await Taro.login();
      await login(code);
      await Taro.showToast({ title: '已登录', icon: 'success' });
    } catch {
      await Taro.showToast({ title: '登录失败', icon: 'none' });
    }
  };

  const handleLogout = () => {
    logout();
    useAquariumStore.setState({ aquariums: [], selectedId: undefined });
    setStats({ aquariums: 0, reminders: 0, records: 0, knowledge: 0 });
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
            <Text className="metric-value">{isLoggedIn ? (user?.nickname ?? '微信用户') : '未登录'}</Text>
            {isLoggedIn && user?.openId && <Text className="muted">{user.openId}</Text>}
          </View>
          <Text className={isLoggedIn ? 'pill green' : 'pill'}>{isLoggedIn ? '已登录' : '未登录'}</Text>
        </View>
      </View>
      {!isLoggedIn && <Button block type="primary" className="water-button" onClick={handleLogin}>微信登录</Button>}
      {isLoggedIn && <Button block className="profile-secondary-button" onClick={handleLogout}>退出登录</Button>}

      {isLoggedIn && (
        <>
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
        </>
      )}
    </View>
  );
}
