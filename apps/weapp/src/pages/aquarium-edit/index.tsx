import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import { Button } from '@nutui/nutui-react-taro';
import { api, Aquarium } from '../../services/api';
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

export default function AquariumEditPage() {
  const params = Taro.getCurrentInstance().router?.params;
  const aquariumId = params?.id;
  const loadAquariums = useAquariumStore((s) => s.loadAquariums);

  const [name, setName] = useState('');
  const [species, setSpecies] = useState('freshwater');
  const [status, setStatus] = useState('RUNNING');
  const [lengthCm, setLengthCm] = useState('');
  const [widthCm, setWidthCm] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!aquariumId) return;
    api.getAquarium(aquariumId).then((aq: Aquarium) => {
      setName(aq.name);
      setSpecies(aq.species ?? 'freshwater');
      setStatus(aq.status ?? 'RUNNING');
      setLengthCm(aq.lengthCm?.toString() ?? '');
      setWidthCm(aq.widthCm?.toString() ?? '');
      setHeightCm(aq.heightCm?.toString() ?? '');
      setLoaded(true);
    }).catch(() => {
      Taro.showToast({ title: '加载失败', icon: 'none' });
    });
  }, [aquariumId]);

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

  const handleSave = async () => {
    if (!name.trim() || !aquariumId) return;
    setSubmitting(true);
    try {
      await api.updateAquarium(aquariumId, {
        name: name.trim(),
        species,
        status,
        lengthCm: lengthCm ? Number(lengthCm) : undefined,
        widthCm: widthCm ? Number(widthCm) : undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
        volumeLiters,
      });
      await Taro.showToast({ title: '保存成功', icon: 'success' });
      await loadAquariums();
      setTimeout(() => Taro.navigateBack(), 500);
    } catch {
      await Taro.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!aquariumId) return;
    try {
      await api.deleteAquarium(aquariumId);
      await Taro.showToast({ title: '已删除', icon: 'success' });
      await loadAquariums();
      setTimeout(() => Taro.navigateBack(), 500);
    } catch {
      await Taro.showToast({ title: '删除失败', icon: 'none' });
    }
  };

  if (!loaded) return <View className="page"><Text className="muted">加载中...</Text></View>;

  return (
    <View className="page page-enter">
      <Text className="section-title">基本信息</Text>
      <View className="card form-card">
        <View className="form-field">
          <Text className="form-label">鱼缸名称 *</Text>
          <Input className="form-input" value={name} onInput={(e) => setName(e.detail.value)} />
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
            <Input className="form-input" type="number" value={lengthCm} onInput={(e) => setLengthCm(e.detail.value)} />
          </View>
          <View className="form-field flex-1">
            <Text className="form-label">宽</Text>
            <Input className="form-input" type="number" value={widthCm} onInput={(e) => setWidthCm(e.detail.value)} />
          </View>
          <View className="form-field flex-1">
            <Text className="form-label">高</Text>
            <Input className="form-input" type="number" value={heightCm} onInput={(e) => setHeightCm(e.detail.value)} />
          </View>
        </View>
        {volumeLiters !== undefined && (
          <Text className="muted">自动计算容积：{volumeLiters} 升</Text>
        )}
      </View>

      <Button block type="primary" className="water-button" loading={submitting} onClick={handleSave}>
        保存修改
      </Button>
      <Button block className="danger-button" onClick={async () => {
        const result = await Taro.showModal({
          title: '确认删除',
          content: '确定要删除这个鱼缸吗？删除后无法恢复。',
        });
        if (result.confirm) {
          void handleDelete();
        }
      }}>
        删除鱼缸
      </Button>
    </View>
  );
}
