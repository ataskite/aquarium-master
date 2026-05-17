import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input, Textarea } from '@tarojs/components';
import { Button, Tabs } from '@nutui/nutui-react-taro';
import { api } from '../../services/api';
import { useAquariumStore } from '../../store/aquarium';

export default function AddRecordPage() {
  const { selectedId } = useAquariumStore();
  const [tab, setTab] = useState('water');
  const [form, setForm] = useState({ temperature: '26.3', ph: '7.2', ammonia: '0.02', nitrate: '12', note: '' });

  const save = async () => {
    if (tab === 'water') {
      await api.createWaterRecord({
        aquariumId: selectedId ?? 'demo-living-room',
        temperature: Number(form.temperature),
        ph: Number(form.ph),
        ammonia: Number(form.ammonia),
        nitrate: Number(form.nitrate),
        note: form.note,
      });
    }
    await Taro.showToast({ title: '已保存', icon: 'success' });
  };

  return (
    <View className="page">
      <Text className="section-title">记录今天的状态</Text>
      <Tabs value={tab} onChange={(paneKey) => setTab(String(paneKey))}>
        <Tabs.TabPane title="水质" value="water" />
        <Tabs.TabPane title="喂食" value="feed" />
        <Tabs.TabPane title="换水" value="water-change" />
      </Tabs>

      <View className="field">
        <Text className="field-label">温度 ℃</Text>
        <Input className="input" value={form.temperature} type="digit" onInput={(event) => setForm({ ...form, temperature: event.detail.value })} />
      </View>
      <View className="field">
        <Text className="field-label">pH</Text>
        <Input className="input" value={form.ph} type="digit" onInput={(event) => setForm({ ...form, ph: event.detail.value })} />
      </View>
      <View className="field">
        <Text className="field-label">氨氮 mg/L</Text>
        <Input className="input" value={form.ammonia} type="digit" onInput={(event) => setForm({ ...form, ammonia: event.detail.value })} />
      </View>
      <View className="field">
        <Text className="field-label">硝酸盐 mg/L</Text>
        <Input className="input" value={form.nitrate} type="digit" onInput={(event) => setForm({ ...form, nitrate: event.detail.value })} />
      </View>
      <View className="field">
        <Text className="field-label">备注</Text>
        <Textarea className="input" value={form.note} onInput={(event) => setForm({ ...form, note: event.detail.value })} />
      </View>
      <Button block type="primary" onClick={save}>保存记录</Button>
    </View>
  );
}
