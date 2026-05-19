import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import { Button } from '@nutui/nutui-react-taro';
import { api } from '../../services/api';
import './index.scss';

const DEVICE_TYPES = [
  { label: '过滤器', value: 'FILTER' },
  { label: '灯具', value: 'LIGHT' },
  { label: '加热棒', value: 'HEATER' },
  { label: '气泵', value: 'AIR_PUMP' },
  { label: 'CO2', value: 'CO2' },
  { label: '造浪泵', value: 'WAVE_MAKER' },
  { label: '其他', value: 'OTHER' },
];

const STATUS_OPTIONS = [
  { label: '运行中', value: 'RUNNING' },
  { label: '定时', value: 'SCHEDULED' },
  { label: '停用', value: 'STOPPED' },
];

export default function DeviceAddPage() {
  const params = Taro.getCurrentInstance().router?.params;
  const aquariumId = params?.aquariumId ?? '';

  const [type, setType] = useState('FILTER');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('RUNNING');
  const [powerWatts, setPowerWatts] = useState('');
  const [flowRateLph, setFlowRateLph] = useState('');
  const [schedule, setSchedule] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const showFlowRate = ['FILTER', 'WAVE_MAKER'].includes(type);

  const handleSelectType = async () => {
    const items = DEVICE_TYPES.map((t) => t.label);
    try {
      const { tapIndex } = await Taro.showActionSheet({ itemList: items });
      setType(DEVICE_TYPES[tapIndex].value);
    } catch {}
  };

  const handleSelectStatus = async () => {
    const items = STATUS_OPTIONS.map((s) => s.label);
    try {
      const { tapIndex } = await Taro.showActionSheet({ itemList: items });
      setStatus(STATUS_OPTIONS[tapIndex].value);
    } catch {}
  };

  const handleSubmit = async () => {
    if (!aquariumId) return;
    if (!name.trim()) {
      await Taro.showToast({ title: '请输入设备名称', icon: 'none' });
      return;
    }
    setSubmitting(true);
    try {
      await api.createDevice({
        aquariumId,
        type,
        name: name.trim(),
        status,
        powerWatts: powerWatts ? Number(powerWatts) : undefined,
        flowRateLph: flowRateLph ? Number(flowRateLph) : undefined,
        schedule: schedule || undefined,
        note: note || undefined,
      });
      await Taro.showToast({ title: '添加成功', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 500);
    } catch {
      await Taro.showToast({ title: '添加失败', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="page page-enter">
      <Text className="section-title">设备类型和名称</Text>
      <View className="card form-card">
        <View className="form-field">
          <Text className="form-label">设备类型</Text>
          <View className="form-picker" onClick={handleSelectType}>
            {DEVICE_TYPES.find((o) => o.value === type)?.label}
          </View>
        </View>
        <View className="form-field">
          <Text className="form-label">设备名称 *</Text>
          <Input className="form-input" placeholder="例如：过滤桶" value={name} onInput={(e) => setName(e.detail.value)} />
        </View>
        <View className="form-field">
          <Text className="form-label">状态</Text>
          <View className="form-picker" onClick={handleSelectStatus}>
            {STATUS_OPTIONS.find((o) => o.value === status)?.label}
          </View>
        </View>
      </View>

      <Text className="section-title">设备参数</Text>
      <View className="card form-card">
        <View className="form-field">
          <Text className="form-label">功率 (瓦)</Text>
          <Input className="form-input" type="digit" placeholder="15" value={powerWatts} onInput={(e) => setPowerWatts(e.detail.value)} />
        </View>
        {showFlowRate && (
          <View className="form-field">
            <Text className="form-label">流量 (升/时)</Text>
            <Input className="form-input" type="number" placeholder="500" value={flowRateLph} onInput={(e) => setFlowRateLph(e.detail.value)} />
          </View>
        )}
        <View className="form-field">
          <Text className="form-label">定时计划</Text>
          <Input className="form-input" placeholder="例如：10:00-17:00" value={schedule} onInput={(e) => setSchedule(e.detail.value)} />
        </View>
        <View className="form-field">
          <Text className="form-label">备注</Text>
          <Input className="form-input" placeholder="可选备注" value={note} onInput={(e) => setNote(e.detail.value)} />
        </View>
      </View>

      <Button block type="primary" className="water-button" loading={submitting} onClick={handleSubmit}>
        添加设备
      </Button>
    </View>
  );
}
