import React, { useEffect, useMemo, useState } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { Button, Progress } from '@nutui/nutui-react-taro';
import { api, Aquarium, AquariumStock, FishSpecies, WaterQualityRecord } from '../../services/api';
import { useAquariumStore } from '../../store/aquarium';
import { formatDueAt } from '../../utils/datetime';
import { formatDateTime } from '../../utils/add-record';
import { statusText, deviceTypeText, deviceStatusText, isWaterNormal, formatProfile, stockName, stockHint, deviceMeta } from '../../utils/tank-detail';
import './index.scss';

const colorClasses = ['', 'orange', 'green', 'dark'];

const speciesFieldRows = (species?: FishSpecies) => {
  if (!species) return [];
  return [
    ['分类', species.category],
    ['产地', species.origin],
    ['难度', species.careLevel],
    ['性格', species.temperament],
    ['食性', species.diet],
    ['水层', species.waterLayer],
    ['建议群体', species.minGroupSize ? `${species.minGroupSize} 只起` : undefined],
    ['最低缸体', species.minTankLiters ? `${species.minTankLiters}L` : undefined],
    ['成体大小', species.adultSizeCm ? `${species.adultSizeCm}cm` : undefined],
    ['温度', species.temperatureMin !== undefined && species.temperatureMax !== undefined ? `${species.temperatureMin}-${species.temperatureMax}℃` : undefined],
    ['pH', species.phMin !== undefined && species.phMax !== undefined ? `${species.phMin}-${species.phMax}` : undefined],
    ['硬度', species.hardness],
  ].filter((row): row is [string, string] => Boolean(row[1]));
};

const waterValue = (value?: number, unit = '') => value === undefined ? '--' : `${value}${unit}`;

const latestWaterRows = (latest?: WaterQualityRecord) => [
  ['温度', waterValue(latest?.temperature, '℃')],
  ['pH', waterValue(latest?.ph)],
  ['氨氮', waterValue(latest?.ammonia, ' mg/L')],
  ['亚硝酸盐', waterValue(latest?.nitrite, ' mg/L')],
  ['硝酸盐', waterValue(latest?.nitrate, ' mg/L')],
  ['TDS', waterValue(latest?.tds)],
];

export default function TankDetailPage() {
  const router = useRouter();
  const { selectedId, select } = useAquariumStore();
  const [tank, setTank] = useState<Aquarium | null>(null);
  const [loading, setLoading] = useState(false);
  const highlightFish = router.params.section === 'fish';

  useEffect(() => {
    const id = router.params.id ?? selectedId ?? 'demo-aquarium-community';
    setLoading(true);
    void api.getAquarium(id)
      .then((nextTank) => {
        setTank(nextTank);
        if (nextTank?.id) select(nextTank.id);
      })
      .catch(() => Taro.showToast({ title: '鱼缸档案加载失败', icon: 'none' }))
      .finally(() => setLoading(false));
  }, [router.params.id, select, selectedId]);

  const latest = tank?.waterRecords?.[0];
  const profile = tank?.waterProfile;
  const waterNormal = isWaterNormal(latest, profile);
  const stocks = tank?.fishStocks ?? [];
  const devices = tank?.devices ?? [];
  const feedingTemplates = tank?.feedingTemplates ?? [];
  const maintenanceRecords = tank?.maintenanceRecords?.slice(0, 4) ?? [];
  const pendingReminders = useMemo(
    () => tank?.reminders?.filter((reminder) => reminder.status !== 'DONE').slice(0, 4) ?? [],
    [tank?.reminders],
  );
  const status = tank?.status ? statusText[tank.status] ?? tank.status : '运行中';
  const dimensions = `${tank?.lengthCm ?? '-'}×${tank?.widthCm ?? '-'}×${tank?.heightCm ?? '-'}cm`;

  const openRecord = () => {
    if (tank?.id) select(tank.id);
    void Taro.switchTab({ url: '/pages/add-record/index' });
  };

  if (loading && !tank) {
    return (
      <View className="page page-enter tank-detail-page">
        <View className="hero tank-archive-hero">
          <Text className="hero-title">鱼缸档案</Text>
          <Text className="hero-subtitle">正在读取数据库档案</Text>
        </View>
        <View className="card"><Text className="muted">加载中...</Text></View>
      </View>
    );
  }

  return (
    <View className="page page-enter tank-detail-page">
      <View className="hero tank-archive-hero">
        <Text className="hero-title">{tank?.name ?? '鱼缸档案'}</Text>
        <Text className="hero-subtitle">{tank?.volumeLiters ?? '-'}L · {status} · 健康 {tank?.healthScore ?? '--'}分</Text>
        <Text className="hero-edit-link" onClick={() => tank?.id && Taro.navigateTo({ url: `/pages/aquarium-edit/index?id=${tank.id}` })}>编辑</Text>
        <View className="archive-info">
          <Text>{tank?.species ?? '鱼只待补充'}</Text>
          <Text>{dimensions}</Text>
          <Text>{formatProfile(profile)}</Text>
        </View>
      </View>

      <View className="health-panel">
        <View className={`health-ring ${waterNormal ? '' : 'attention'}`}>
          <Text>{tank?.healthScore ?? '--'}</Text>
          <Text>分</Text>
        </View>
        <View className="health-copy">
          <Text className="score-title">{waterNormal ? '水质位于目标区间' : '有指标需要关注'}</Text>
          <Text className="muted">结合目标水质、设备档案、喂食方案和提醒记录查看。</Text>
          <Progress percent={tank?.healthScore ?? 0} strokeWidth="8" />
        </View>
      </View>

      <Text className="section-title">基础档案</Text>
      <View className="card">
        <View className="profile-grid">
          <View><Text className="muted">容量</Text><Text className="strong">{tank?.volumeLiters ?? '--'}L</Text></View>
          <View><Text className="muted">尺寸</Text><Text className="strong">{dimensions}</Text></View>
          <View><Text className="muted">状态</Text><Text className="strong">{status}</Text></View>
          <View><Text className="muted">库存</Text><Text className="strong">{stocks.reduce((sum, stock) => sum + stock.quantity, 0)} 只</Text></View>
        </View>
      </View>

      <Text className={`section-title ${highlightFish ? 'section-highlight' : ''}`}>鱼只档案</Text>
      <View className="fish-profile-list">
        {stocks.length === 0 && <View className="card"><Text className="muted">暂无鱼只库存</Text></View>}
        {stocks.map((stock: AquariumStock, index) => {
          const species = stock.species;
          const rows = speciesFieldRows(species);
          return (
            <View className={`fish-profile-card ${highlightFish ? 'highlight' : ''}`} key={stock.id}>
              <View className="fish-profile-head">
                <Text className={`fish-thumb ${colorClasses[index % colorClasses.length]}`}>{stockName(stock).slice(0, 1)}</Text>
                <View className="fish-profile-title">
                  <View className="row">
                    <Text className="strong">{stockName(stock)}</Text>
                    <Text className="pill">{stock.quantity}只</Text>
                  </View>
                  <Text className="muted">{species?.scientificName ?? (stockHint(stock) || '学名待补充')}</Text>
                </View>
              </View>
              <View className="fish-meta-grid">
                {rows.map(([label, value]) => (
                  <View key={label}><Text className="muted">{label}</Text><Text>{value}</Text></View>
                ))}
              </View>
              {(stock.note || species?.notes || species?.sourceUrls) && (
                <View className="fish-note-block">
                  {stock.note && <Text>{stock.note}</Text>}
                  {species?.notes && <Text>{species.notes}</Text>}
                  {species?.sourceUrls && <Text className="muted">{species.sourceUrls}</Text>}
                </View>
              )}
            </View>
          );
        })}
      </View>

      <Text className="section-title">设备信息</Text>
      <View className="card">
        <View className="data-list">
          {devices.length === 0 && <View className="data-row"><Text>设备</Text><Text className="muted">暂无设备档案</Text><Text className="pill">待补充</Text></View>}
          {devices.map((device) => (
            <View className="data-row" key={device.id}>
              <Text>{device.name || (deviceTypeText[device.type] ?? device.type)}</Text>
              <Text className="muted">{deviceMeta(device)}</Text>
              <Text className={device.status === 'RUNNING' ? 'pill green' : 'pill'}>{deviceStatusText[device.status] ?? device.status}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text className="section-title">目标水质</Text>
      <View className="card">
        <View className="profile-grid">
          <View><Text className="muted">温度</Text><Text className="strong">{profile?.temperatureMin ?? '--'}-{profile?.temperatureMax ?? '--'}℃</Text></View>
          <View><Text className="muted">pH</Text><Text className="strong">{profile?.phMin ?? '--'}-{profile?.phMax ?? '--'}</Text></View>
          <View><Text className="muted">氨氮</Text><Text className="strong">≤ {profile?.ammoniaMax ?? 0}</Text></View>
          <View><Text className="muted">亚硝酸盐</Text><Text className="strong">≤ {profile?.nitriteMax ?? 0}</Text></View>
          <View><Text className="muted">硝酸盐</Text><Text className="strong">≤ {profile?.nitrateMax ?? '--'}</Text></View>
          <View><Text className="muted">TDS</Text><Text className="strong">{profile?.tdsMin ?? '--'}-{profile?.tdsMax ?? '--'}</Text></View>
        </View>
        {profile?.note && <Text className="profile-note">{profile.note}</Text>}
      </View>

      <Text className="section-title">最新水质</Text>
      <View className="card">
        <View className="data-list">
          {latestWaterRows(latest).map(([label, value]) => (
            <View className="data-row" key={label}>
              <Text>{label}</Text>
              <Text className="strong">{value}</Text>
              <Text className={waterNormal ? 'pill green' : 'pill orange'}>{waterNormal ? '正常' : '关注'}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text className="section-title">喂食方案</Text>
      <View className="card">
        <View className="data-list">
          {feedingTemplates.length === 0 && <View className="data-row"><Text>喂食</Text><Text className="muted">暂无喂食方案</Text><Text className="pill">待补充</Text></View>}
          {feedingTemplates.map((template) => (
            <View className="feeding-row" key={template.id}>
              <View>
                <Text className="strong">{template.food}</Text>
                <Text className="muted">{template.species?.commonName ?? '全缸'} · {template.frequency}</Text>
              </View>
              <Text className="pill green">{template.amount}</Text>
              {template.note && <Text className="feeding-note">{template.note}</Text>}
            </View>
          ))}
        </View>
      </View>

      <Text className="section-title">维护与提醒</Text>
      <View className="card">
        <View className="data-list">
          {maintenanceRecords.length === 0 && pendingReminders.length === 0 && <Text className="muted">暂无维护记录或待办提醒</Text>}
          {pendingReminders.map((reminder) => (
            <View className="data-row" key={reminder.id}>
              <Text>{reminder.title}</Text>
              <Text className="muted">{reminder.note || formatDueAt(reminder.dueAt)}</Text>
              <Text className="pill">{formatDueAt(reminder.dueAt, true)}</Text>
            </View>
          ))}
          {maintenanceRecords.map((record) => (
            <View className="data-row" key={record.id}>
              <Text>{record.type}</Text>
              <Text className="muted">{record.note || '已记录'}</Text>
              <Text className="pill green">{formatDateTime(record.happenedAt)}</Text>
            </View>
          ))}
        </View>
      </View>

      <Button block type="primary" className="water-button" onClick={openRecord}>添加养护记录</Button>
    </View>
  );
}
