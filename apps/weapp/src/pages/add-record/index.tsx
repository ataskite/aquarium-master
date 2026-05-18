import React, { useEffect, useMemo, useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { View, Text, Input, Textarea } from '@tarojs/components';
import { Button } from '@nutui/nutui-react-taro';
import { api, MaintenanceRecord, WaterQualityRecord } from '../../services/api';
import { useAquariumStore } from '../../store/aquarium';
import { toNumber, formatDateTime, getMaintenanceTab, getMaintenanceLabel, compact, midpoint } from '../../utils/add-record';
import './index.scss';

type RecordTab = 'all' | 'water' | 'feed' | 'water-change';

const recordTabs: Array<{ key: RecordTab; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'water', label: '水质' },
  { key: 'feed', label: '喂食' },
  { key: 'water-change', label: '换水' },
];

const tabStorageKey = 'aquarium.recordTab';

const defaultWaterForm = {
  temperature: '26.3',
  ph: '7.2',
  ammonia: '0',
  nitrite: '0',
  nitrate: '10',
  tds: '180',
  note: '',
};

const defaultFeedForm = {
  food: '',
  amount: '',
  appetite: '正常',
  leftovers: '无明显剩食',
  note: '',
};

const defaultWaterChangeForm = {
  percent: '30',
  volume: '25',
  newWaterTemp: '26',
  conditioner: '已添加',
  filterCleaned: '否',
  note: '',
};

export default function AddRecordPage() {
  const { selectedId, aquariums } = useAquariumStore();
  const aquariumId = selectedId ?? aquariums[0]?.id;
  const tankName = aquariums.find((item) => item.id === aquariumId)?.name ?? '当前鱼缸';

  const [tab, setTab] = useState<RecordTab>('water');
  const [waterRecords, setWaterRecords] = useState<WaterQualityRecord[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [waterForm, setWaterForm] = useState(defaultWaterForm);
  const [feedForm, setFeedForm] = useState(defaultFeedForm);
  const [waterChangeForm, setWaterChangeForm] = useState(defaultWaterChangeForm);

  const loadRecords = async () => {
    if (!aquariumId) return;
    setLoading(true);
    try {
      const tank = await api.getAquarium(aquariumId);
      setWaterRecords(tank.waterRecords ?? []);
      setMaintenanceRecords(tank.maintenanceRecords ?? []);
      if (tank.waterProfile) {
        setWaterForm((current) => ({
          ...current,
          temperature: midpoint(tank.waterProfile?.temperatureMin, tank.waterProfile?.temperatureMax, current.temperature),
          ph: midpoint(tank.waterProfile?.phMin, tank.waterProfile?.phMax, current.ph),
          ammonia: `${tank.waterProfile?.ammoniaMax ?? 0}`,
          nitrite: `${tank.waterProfile?.nitriteMax ?? 0}`,
          nitrate: `${Math.min(tank.waterProfile?.nitrateMax ?? Number(current.nitrate), Number(current.nitrate))}`,
          tds: midpoint(tank.waterProfile?.tdsMin, tank.waterProfile?.tdsMax, current.tds),
        }));
      }
      const feedingTemplate = tank.feedingTemplates?.[0];
      if (feedingTemplate) {
        setFeedForm((current) => ({
          ...current,
          food: feedingTemplate.food,
          amount: feedingTemplate.amount,
          note: feedingTemplate.note ?? current.note,
        }));
      }
    } catch {
      await Taro.showToast({ title: '记录加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecords();
  }, [aquariumId]);

  useDidShow(() => {
    const targetTab = Taro.getStorageSync<RecordTab>(tabStorageKey);
    if (targetTab && recordTabs.some((item) => item.key === targetTab)) {
      setTab(targetTab);
      Taro.removeStorageSync(tabStorageKey);
    }
    void loadRecords();
  });

  const feedRecords = useMemo(
    () => maintenanceRecords.filter((record) => getMaintenanceTab(record.type) === 'feed'),
    [maintenanceRecords],
  );
  const waterChangeRecords = useMemo(
    () => maintenanceRecords.filter((record) => getMaintenanceTab(record.type) === 'water-change'),
    [maintenanceRecords],
  );

  const timeline = useMemo(() => {
    const waterItems = waterRecords.map((record) => ({
      id: record.id ?? `${record.recordedAt}-water`,
      tab: 'water' as RecordTab,
      title: `水质 · ${record.temperature ?? '-'}℃ / pH ${record.ph ?? '-'}`,
      detail: compact([
        record.ammonia !== undefined ? `氨氮 ${record.ammonia} mg/L` : undefined,
        record.nitrite !== undefined ? `亚硝酸盐 ${record.nitrite} mg/L` : undefined,
        record.nitrate !== undefined ? `硝酸盐 ${record.nitrate} mg/L` : undefined,
        record.note,
      ]),
      time: record.recordedAt,
    }));
    const maintenanceItems = maintenanceRecords.map((record) => ({
      id: record.id ?? `${record.happenedAt}-${record.type}`,
      tab: getMaintenanceTab(record.type),
      title: getMaintenanceLabel(record.type),
      detail: record.note ?? '已记录',
      time: record.happenedAt,
    }));
    return [...waterItems, ...maintenanceItems]
      .filter((item) => tab === 'all' || item.tab === tab)
      .sort((a, b) => new Date(b.time ?? 0).getTime() - new Date(a.time ?? 0).getTime());
  }, [maintenanceRecords, tab, waterRecords]);

  const latestWater = waterRecords[0];
  const latestFeed = feedRecords[0];
  const latestWaterChange = waterChangeRecords[0];

  const summary = useMemo(() => {
    if (tab === 'feed') {
      return {
        title: latestFeed ? '今日喂食有记录' : '还没有喂食记录',
        copy: latestFeed ? latestFeed.note ?? '已完成一次投喂' : '记录饲料、用量和吃食状态',
        metric: `${feedRecords.length}`,
        unit: '次',
      };
    }
    if (tab === 'water-change') {
      return {
        title: latestWaterChange ? '最近一次换水' : '还没有换水记录',
        copy: latestWaterChange ? latestWaterChange.note ?? '已完成换水' : '记录换水比例、新水温度和滤棉处理',
        metric: latestWaterChange ? formatDateTime(latestWaterChange.happenedAt).split(' ')[0] : '待记',
        unit: '',
      };
    }
    if (tab === 'all') {
      return {
        title: '养护时间线',
        copy: '水质、喂食、换水集中查看',
        metric: `${timeline.length}`,
        unit: '条',
      };
    }
    return {
      title: latestWater ? '最近水质稳定' : '还没有水质记录',
      copy: latestWater ? compact([`pH ${latestWater.ph ?? '-'}`, `硝酸盐 ${latestWater.nitrate ?? '-'} mg/L`]) : '记录关键指标后生成趋势',
      metric: `${latestWater?.temperature ?? '--'}`,
      unit: '℃',
    };
  }, [feedRecords.length, latestFeed, latestWater, latestWaterChange, tab, timeline.length]);

  const updateWaterField = (key: keyof typeof waterForm, value: string) => {
    setWaterForm((current) => ({ ...current, [key]: value }));
  };

  const updateFeedField = (key: keyof typeof feedForm, value: string) => {
    setFeedForm((current) => ({ ...current, [key]: value }));
  };

  const updateWaterChangeField = (key: keyof typeof waterChangeForm, value: string) => {
    setWaterChangeForm((current) => ({ ...current, [key]: value }));
  };

  const saveWaterRecord = async () => {
    if (!aquariumId) throw new Error('missing aquarium');
    await api.createWaterRecord({
      aquariumId,
      temperature: toNumber(waterForm.temperature),
      ph: toNumber(waterForm.ph),
      ammonia: toNumber(waterForm.ammonia),
      nitrite: toNumber(waterForm.nitrite),
      nitrate: toNumber(waterForm.nitrate),
      tds: toNumber(waterForm.tds),
      note: waterForm.note,
      recordedAt: new Date().toISOString(),
    });
    setWaterForm((current) => ({ ...current, note: '' }));
  };

  const saveFeedRecord = async () => {
    if (!aquariumId) throw new Error('missing aquarium');
    await api.createMaintenanceRecord({
      aquariumId,
      type: 'FEEDING',
      note: compact([
        `饲料 ${feedForm.food}`,
        `用量 ${feedForm.amount}`,
        `吃食 ${feedForm.appetite}`,
        `剩食 ${feedForm.leftovers}`,
        feedForm.note,
      ]),
      happenedAt: new Date().toISOString(),
    });
    setFeedForm(defaultFeedForm);
  };

  const saveWaterChangeRecord = async () => {
    if (!aquariumId) throw new Error('missing aquarium');
    await api.createMaintenanceRecord({
      aquariumId,
      type: 'WATER_CHANGE',
      note: compact([
        `换水 ${waterChangeForm.percent}%`,
        `约 ${waterChangeForm.volume}L`,
        `新水 ${waterChangeForm.newWaterTemp}℃`,
        `水稳 ${waterChangeForm.conditioner}`,
        `清洗滤棉 ${waterChangeForm.filterCleaned}`,
        waterChangeForm.note,
      ]),
      happenedAt: new Date().toISOString(),
    });
    setWaterChangeForm(defaultWaterChangeForm);
  };

  const chooseRecordType = async () => {
    const result = await Taro.showActionSheet({ itemList: ['水质', '喂食', '换水'] });
    const nextTab: RecordTab[] = ['water', 'feed', 'water-change'];
    setTab(nextTab[result.tapIndex] ?? 'water');
  };

  const save = async () => {
    if (tab === 'all') {
      await chooseRecordType();
      return;
    }
    setSaving(true);
    try {
      if (tab === 'water') await saveWaterRecord();
      if (tab === 'feed') await saveFeedRecord();
      if (tab === 'water-change') await saveWaterChangeRecord();
      await loadRecords();
      await Taro.showToast({ title: '已保存', icon: 'success' });
    } catch {
      await Taro.showToast({ title: '保存失败，请检查服务', icon: 'none' });
    } finally {
      setSaving(false);
    }
  };

  const buttonText = tab === 'all'
    ? '选择记录类型'
    : tab === 'water'
      ? '添加水质记录'
      : tab === 'feed'
        ? '添加喂食记录'
        : '添加换水记录';

  return (
    <View className="page page-enter record-page">
      <View className="record-header">
        <Text className="hero-title">养护记录</Text>
        <Text className="hero-subtitle">{tankName} · 数据真实入库</Text>
      </View>

      <View className="tank-context-bar">
        <View>
          <Text className="muted">当前鱼缸</Text>
          <Text className="strong">{tankName}</Text>
        </View>
        <Text className="pill" onClick={() => Taro.switchTab({ url: '/pages/home/index' })}>切换</Text>
      </View>

      <View className="segment record-segment">
        {recordTabs.map((item) => (
          <Text key={item.key} className={tab === item.key ? 'active' : ''} onClick={() => setTab(item.key)}>
            {item.label}
          </Text>
        ))}
      </View>

      <View className="trend-card record-summary">
        <View className="row">
          <View>
            <Text className="strong">{summary.title}</Text>
            <Text className="muted">{summary.copy}</Text>
          </View>
          <Text className="metric-value">{summary.metric}<Text className="metric-unit">{summary.unit}</Text></Text>
        </View>
        <View className="record-kpi-grid">
          <View><Text className="muted">水质</Text><Text className="strong">{waterRecords.length} 条</Text></View>
          <View><Text className="muted">喂食</Text><Text className="strong">{feedRecords.length} 条</Text></View>
          <View><Text className="muted">换水</Text><Text className="strong">{waterChangeRecords.length} 条</Text></View>
        </View>
      </View>

      {tab === 'water' && (
        <>
          <Text className="section-title">水质指标</Text>
          <View className="metric-grid">
            <View className="field">
              <Text className="field-label">温度 ℃</Text>
              <Input className="input" value={waterForm.temperature} type="digit" onInput={(event) => updateWaterField('temperature', event.detail.value)} />
            </View>
            <View className="field">
              <Text className="field-label">pH</Text>
              <Input className="input" value={waterForm.ph} type="digit" onInput={(event) => updateWaterField('ph', event.detail.value)} />
            </View>
            <View className="field">
              <Text className="field-label">氨氮 mg/L</Text>
              <Input className="input" value={waterForm.ammonia} type="digit" onInput={(event) => updateWaterField('ammonia', event.detail.value)} />
            </View>
            <View className="field">
              <Text className="field-label">亚硝酸盐 mg/L</Text>
              <Input className="input" value={waterForm.nitrite} type="digit" onInput={(event) => updateWaterField('nitrite', event.detail.value)} />
            </View>
            <View className="field">
              <Text className="field-label">硝酸盐 mg/L</Text>
              <Input className="input" value={waterForm.nitrate} type="digit" onInput={(event) => updateWaterField('nitrate', event.detail.value)} />
            </View>
            <View className="field">
              <Text className="field-label">TDS</Text>
              <Input className="input" value={waterForm.tds} type="number" onInput={(event) => updateWaterField('tds', event.detail.value)} />
            </View>
          </View>
          <View className="field">
            <Text className="field-label">备注</Text>
            <Textarea className="input record-note" value={waterForm.note} onInput={(event) => updateWaterField('note', event.detail.value)} />
          </View>
        </>
      )}

      {tab === 'feed' && (
        <>
          <Text className="section-title">喂食信息</Text>
          <View className="field">
            <Text className="field-label">饲料类型</Text>
            <Input className="input" value={feedForm.food} onInput={(event) => updateFeedField('food', event.detail.value)} />
          </View>
          <View className="metric-grid">
            <View className="field">
              <Text className="field-label">喂食量</Text>
              <Input className="input" value={feedForm.amount} onInput={(event) => updateFeedField('amount', event.detail.value)} />
            </View>
            <View className="field">
              <Text className="field-label">吃食状态</Text>
              <Input className="input" value={feedForm.appetite} onInput={(event) => updateFeedField('appetite', event.detail.value)} />
            </View>
          </View>
          <View className="field">
            <Text className="field-label">剩食情况</Text>
            <Input className="input" value={feedForm.leftovers} onInput={(event) => updateFeedField('leftovers', event.detail.value)} />
          </View>
          <View className="field">
            <Text className="field-label">备注</Text>
            <Textarea className="input record-note" value={feedForm.note} onInput={(event) => updateFeedField('note', event.detail.value)} />
          </View>
        </>
      )}

      {tab === 'water-change' && (
        <>
          <Text className="section-title">换水信息</Text>
          <View className="metric-grid">
            <View className="field">
              <Text className="field-label">换水比例 %</Text>
              <Input className="input" value={waterChangeForm.percent} type="number" onInput={(event) => updateWaterChangeField('percent', event.detail.value)} />
            </View>
            <View className="field">
              <Text className="field-label">换水量 L</Text>
              <Input className="input" value={waterChangeForm.volume} type="number" onInput={(event) => updateWaterChangeField('volume', event.detail.value)} />
            </View>
            <View className="field">
              <Text className="field-label">新水温度 ℃</Text>
              <Input className="input" value={waterChangeForm.newWaterTemp} type="digit" onInput={(event) => updateWaterChangeField('newWaterTemp', event.detail.value)} />
            </View>
            <View className="field">
              <Text className="field-label">水稳</Text>
              <Input className="input" value={waterChangeForm.conditioner} onInput={(event) => updateWaterChangeField('conditioner', event.detail.value)} />
            </View>
          </View>
          <View className="field">
            <Text className="field-label">是否清洗滤棉</Text>
            <Input className="input" value={waterChangeForm.filterCleaned} onInput={(event) => updateWaterChangeField('filterCleaned', event.detail.value)} />
          </View>
          <View className="field">
            <Text className="field-label">备注</Text>
            <Textarea className="input record-note" value={waterChangeForm.note} onInput={(event) => updateWaterChangeField('note', event.detail.value)} />
          </View>
        </>
      )}

      {tab === 'all' && (
        <View className="record-type-grid">
          <View className="record-type-card" onClick={() => setTab('water')}><Text>水质</Text><Text className="muted">测指标</Text></View>
          <View className="record-type-card feed" onClick={() => setTab('feed')}><Text>喂食</Text><Text className="muted">记投喂</Text></View>
          <View className="record-type-card change" onClick={() => setTab('water-change')}><Text>换水</Text><Text className="muted">记维护</Text></View>
        </View>
      )}

      <Button block type="primary" className="water-button record-save-button" loading={saving} onClick={save}>{buttonText}</Button>

      <Text className="section-title">历史记录</Text>
      <View className="record-timeline">
        {loading && <View className="card"><Text className="muted">加载中...</Text></View>}
        {!loading && timeline.length === 0 && <View className="card"><Text className="muted">暂无记录，先添加一条吧</Text></View>}
        {!loading && timeline.map((item) => (
          <View className={`record-item ${item.tab}`} key={item.id}>
            <View className="record-dot" />
            <View className="record-item-main">
              <View className="row">
                <Text className="strong">{item.title}</Text>
                <Text className="muted">{formatDateTime(item.time)}</Text>
              </View>
              <Text className="record-detail">{item.detail || '已记录'}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
