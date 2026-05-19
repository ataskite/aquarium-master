import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import { Button } from '@nutui/nutui-react-taro';
import { api } from '../../services/api';
import { useAquariumStore } from '../../store/aquarium';
import './index.scss';

const SPECIES_OPTIONS = [
  { label: '淡水社区缸', value: 'freshwater' },
  { label: '水草缸', value: 'planted' },
  { label: '海水缸', value: 'marine' },
];

const STATUS_OPTIONS = [
  { label: '运行中', value: 'RUNNING' },
  { label: '维护中', value: 'MAINTENANCE' },
  { label: '暂停', value: 'PAUSED' },
];

export default function AquariumCreatePage() {
  const loadAquariums = useAquariumStore((s) => s.loadAquariums);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('freshwater');
  const [status, setStatus] = useState('RUNNING');
  const [lengthCm, setLengthCm] = useState('');
  const [widthCm, setWidthCm] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const volumeLiters = lengthCm && widthCm && heightCm
    ? Math.round((Number(lengthCm) * Number(widthCm) * Number(heightCm)) / 1000)
    : undefined;

  const pickSpecies = async () => {
    const result = await Taro.showActionSheet({ itemList: SPECIES_OPTIONS.map((o) => o.label) });
    setSpecies(SPECIES_OPTIONS[result.tapIndex].value);
  };

  const pickStatus = async () => {
    const result = await Taro.showActionSheet({ itemList: STATUS_OPTIONS.map((o) => o.label) });
    setStatus(STATUS_OPTIONS[result.tapIndex].value);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      await Taro.showToast({ title: '请输入鱼缸名称', icon: 'none' });
      return;
    }
    setSubmitting(true);
    try {
      await api.createAquarium({
        name: name.trim(),
        species,
        status,
        lengthCm: lengthCm ? Number(lengthCm) : undefined,
        widthCm: widthCm ? Number(widthCm) : undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
        volumeLiters,
      });
      await Taro.showToast({ title: '创建成功', icon: 'success' });
      await loadAquariums();
      setTimeout(() => Taro.navigateBack(), 500);
    } catch {
      await Taro.showToast({ title: '创建失败', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="page page-enter">
      <Text className="section-title">基本信息</Text>
      <View className="card form-card">
        <View className="form-field">
          <Text className="form-label">鱼缸名称 *</Text>
          <Input className="form-input" placeholder="例如：南美灯鱼缸" value={name} onInput={(e) => setName(e.detail.value)} />
        </View>
        <View className="form-field">
          <Text className="form-label">缸类型</Text>
          <View className="form-picker" onClick={pickSpecies}>
            {SPECIES_OPTIONS.find((o) => o.value === species)?.label}
          </View>
        </View>
        <View className="form-field">
          <Text className="form-label">状态</Text>
          <View className="form-picker" onClick={pickStatus}>
            {STATUS_OPTIONS.find((o) => o.value === status)?.label}
          </View>
        </View>
      </View>

      <Text className="section-title">尺寸 (厘米)</Text>
      <View className="card form-card">
        <View className="form-row">
          <View className="form-field flex-1">
            <Text className="form-label">长</Text>
            <Input className="form-input" type="number" placeholder="60" value={lengthCm} onInput={(e) => setLengthCm(e.detail.value)} />
          </View>
          <View className="form-field flex-1">
            <Text className="form-label">宽</Text>
            <Input className="form-input" type="number" placeholder="40" value={widthCm} onInput={(e) => setWidthCm(e.detail.value)} />
          </View>
          <View className="form-field flex-1">
            <Text className="form-label">高</Text>
            <Input className="form-input" type="number" placeholder="35" value={heightCm} onInput={(e) => setHeightCm(e.detail.value)} />
          </View>
        </View>
        {volumeLiters !== undefined && (
          <Text className="muted">自动计算容积：{volumeLiters} 升</Text>
        )}
      </View>

      <Button block type="primary" className="water-button" loading={submitting} onClick={handleSubmit}>
        创建鱼缸
      </Button>
    </View>
  );
}
