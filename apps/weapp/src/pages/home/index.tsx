import React, { useEffect, useMemo } from 'react';
import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { Aquarium } from '../../services/api';
import { useAquariumStore } from '../../store/aquarium';
import { useAuthStore } from '../../store/auth';
import { formatDueAt } from '../../utils/datetime';
import {
  countFish,
  countPendingReminders,
  getAquariumDimensions,
  getLatestWaterSummary,
  getTankFishSummary,
  listFishArchiveItems,
} from '../../utils/dashboard';
import { formatProfile, statusText } from '../../utils/tank-detail';
import './index.scss';

export default function HomePage() {
  const { aquariums, selectedId, loadAquariums, select, loading } = useAquariumStore();
  const { isLoggedIn } = useAuthStore();
  const selectedTank = aquariums.find((item) => item.id === selectedId) ?? aquariums[0];
  const fishArchive = useMemo(() => listFishArchiveItems(aquariums), [aquariums]);
  const totalPending = useMemo(() => countPendingReminders(aquariums), [aquariums]);
  const totalFish = useMemo(() => countFish(aquariums), [aquariums]);

  useEffect(() => {
    void loadAquariums();
  }, [loadAquariums]);

  const openTank = (tank: Aquarium, section?: 'fish') => {
    select(tank.id);
    const sectionQuery = section ? `&section=${section}` : '';
    void Taro.navigateTo({ url: `/pages/tank-detail/index?id=${tank.id}${sectionQuery}` });
  };

  const openRecordTab = (tab: 'water' | 'feed' | 'water-change', tank = selectedTank) => {
    if (tank) select(tank.id);
    Taro.setStorageSync('aquarium.recordTab', tab);
    void Taro.switchTab({ url: '/pages/add-record/index' });
  };

  const selectedLatestWater = selectedTank?.waterRecords?.[0];
  const selectedPendingReminders = selectedTank?.reminders?.filter((item) => item.status !== 'DONE').slice(0, 3) ?? [];

  if (loading) {
    return (
      <View className="page page-enter">
        <View className="hero home-hero">
          <Text className="hero-title">水族大师</Text>
          <Text className="hero-subtitle">正在读取鱼缸档案</Text>
        </View>
        <View className="card"><Text className="muted">加载中...</Text></View>
      </View>
    );
  }

  if (!selectedTank) {
    return (
      <View className="page page-enter">
        <View className="hero home-hero">
          <Text className="hero-title">水族大师</Text>
          <Text className="hero-subtitle">科学养鱼 · 快乐养鱼</Text>
        </View>
        <View className="card">
          <Text>还没有鱼缸数据</Text>
          <Text className="muted">请先运行 ./reset-db.sh 初始化数据库</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="page page-enter home-page">
      <View className="hero home-hero">
        <View className="home-topbar">
          <View>
            <Text className="hero-title">水族工作台</Text>
            <Text className="hero-subtitle">{aquariums.length} 个鱼缸 · {totalFish} 只生物 · {totalPending} 个待办</Text>
          </View>
          <View className="home-toolbar">
            <Text onClick={() => Taro.switchTab({ url: '/pages/ai-assistant/index' })}>问</Text>
            <Text onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}>我</Text>
          </View>
        </View>
        <View className="hero-stat-grid">
          <View>
            <Text>{aquariums.length}</Text>
            <Text>鱼缸</Text>
          </View>
          <View>
            <Text>{fishArchive.length}</Text>
            <Text>鱼种/库存</Text>
          </View>
          <View>
            <Text>{totalPending}</Text>
            <Text>待办</Text>
          </View>
        </View>
      </View>

      <Text className="section-title">我的鱼缸</Text>
      <View className="tank-list">
        {aquariums.map((tank) => {
          const pendingCount = (tank.reminders ?? []).filter((item) => item.status !== 'DONE').length;
          const latestWater = tank.waterRecords?.[0];
          const active = tank.id === selectedTank.id;
          return (
            <View className={`tank-card dashboard-tank-card ${active ? 'active' : ''}`} key={tank.id} onClick={() => openTank(tank)}>
              <View className="tank-card-main">
                <View>
                  <View className="tank-heading">
                    <Text className="tank-name">{tank.name}</Text>
                    {active && <Text className="pill green">当前</Text>}
                  </View>
                  <Text className="tank-meta">{getAquariumDimensions(tank)}</Text>
                  <Text className="tank-fish-summary">{getTankFishSummary(tank)}</Text>
                </View>
                <Text className="tank-score">{tank.healthScore ?? '--'}<Text>分</Text></Text>
              </View>
              <View className="tank-kpi-row">
                <View><Text className="muted">状态</Text><Text>{statusText[tank.status ?? 'RUNNING'] ?? tank.status ?? '运行中'}</Text></View>
                <View><Text className="muted">水质</Text><Text>{getLatestWaterSummary(tank)}</Text></View>
                <View><Text className="muted">待办</Text><Text>{pendingCount} 个</Text></View>
              </View>
              {latestWater?.note && <Text className="tank-note">{latestWater.note}</Text>}
            </View>
          );
        })}
      </View>

      <Text className="section-title">鱼只档案</Text>
      <View className="fish-archive-grid">
        {fishArchive.length === 0 && <View className="card"><Text className="muted">暂无鱼只档案，数据库补充后会在这里出现。</Text></View>}
        {fishArchive.map((fish, index) => (
          <View className="fish-archive-card" key={fish.id} onClick={() => openTank(aquariums.find((tank) => tank.id === fish.aquariumId) ?? selectedTank, 'fish')}>
            <Text className={`fish-avatar tone-${index % 4}`}>{fish.name.slice(0, 1)}</Text>
            <View className="fish-archive-main">
              <View className="row">
                <Text className="strong">{fish.name}</Text>
                <Text className="pill">{fish.quantity}只</Text>
              </View>
              <Text className="muted">{fish.aquariumName}</Text>
              <Text className="fish-archive-hint">{fish.hint || fish.stock.note || '暂无鱼种参数'}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text className="section-title">当前鱼缸</Text>
      <View className="score-card">
        <View className="row">
          <View>
            <Text className="score-title">{selectedTank.name}</Text>
            <Text className="score-copy">{formatProfile(selectedTank.waterProfile)}</Text>
          </View>
          <Text className="score-value">{selectedTank.healthScore ?? '--'}分</Text>
        </View>
      </View>

      <Text className="section-title">水质概览</Text>
      <View className="metric-grid">
        <View className="metric">
          <View className="row"><Text className="metric-icon">℃</Text><Text className="pill green">最新</Text></View>
          <Text className="muted">温度</Text>
          <Text className="metric-value">{selectedLatestWater?.temperature ?? '--'}<Text className="metric-unit">℃</Text></Text>
        </View>
        <View className="metric">
          <View className="row"><Text className="metric-icon">pH</Text><Text className="pill green">最新</Text></View>
          <Text className="muted">酸碱度</Text>
          <Text className="metric-value">{selectedLatestWater?.ph ?? '--'}</Text>
        </View>
        <View className="metric">
          <View className="row"><Text className="metric-icon">NO2</Text><Text className="pill green">目标 0</Text></View>
          <Text className="muted">亚硝酸盐</Text>
          <Text className="metric-value">{selectedLatestWater?.nitrite ?? '--'}<Text className="metric-unit">mg/L</Text></Text>
        </View>
        <View className="metric">
          <View className="row"><Text className="metric-icon">NO3</Text><Text className="pill green">最新</Text></View>
          <Text className="muted">硝酸盐</Text>
          <Text className="metric-value">{selectedLatestWater?.nitrate ?? '--'}<Text className="metric-unit">mg/L</Text></Text>
        </View>
      </View>

      <Text className="section-title">快捷操作</Text>
      <View className="quick-grid">
        <View className="quick-action" onClick={() => openRecordTab('feed')}>
          <Text className="quick-icon">喂</Text>
          <Text className="quick-title">喂食记录</Text>
        </View>
        <View className="quick-action" onClick={() => openRecordTab('water-change')}>
          <Text className="quick-icon droplet">水</Text>
          <Text className="quick-title">换水记录</Text>
        </View>
        <View className="quick-action" onClick={() => openTank(selectedTank, 'fish')}>
          <Text className="quick-icon device">鱼</Text>
          <Text className="quick-title">鱼只档案</Text>
        </View>
        <View className="quick-action" onClick={() => openRecordTab('water')}>
          <Text className="quick-icon note">记</Text>
          <Text className="quick-title">水质记录</Text>
        </View>
      </View>

      <Text className="section-title">当前提醒</Text>
      <View className="card compact-card">
        {selectedPendingReminders.length === 0 && <Text className="muted">当前鱼缸暂无待办提醒，可以去提醒页新增。</Text>}
        {selectedPendingReminders.map((reminder) => (
          <View className="reminder-line" key={reminder.id} onClick={() => Taro.switchTab({ url: '/pages/reminders/index' })}>
            <Text className={`reminder-dot ${reminder.title.includes('换水') ? 'blue' : 'orange'}`} />
            <View className="reminder-main">
              <Text className="strong">{reminder.title}</Text>
              <Text className="muted">{reminder.note || '无备注'}</Text>
            </View>
            <Text className="muted">{formatDueAt(reminder.dueAt)}</Text>
          </View>
        ))}
      </View>

      {isLoggedIn && (
        <View className="fab" onClick={() => Taro.navigateTo({ url: '/pages/aquarium-create/index' })}>
          <Text className="fab-text">+</Text>
        </View>
      )}
    </View>
  );
}
