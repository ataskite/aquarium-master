import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import { Button } from '@nutui/nutui-react-taro';
import { api, FishSpecies } from '../../services/api';
import './index.scss';

export default function FishAddPage() {
  const params = Taro.getCurrentInstance().router?.params;
  const aquariumId = params?.aquariumId ?? '';

  const [search, setSearch] = useState('');
  const [species, setSpecies] = useState<FishSpecies[]>([]);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [color, setColor] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!search.trim()) {
      api.listFishSpecies().then(setSpecies).catch(() => {});
      return;
    }
    const timer = setTimeout(() => {
      api.searchFishSpecies(search).then(setSpecies).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async () => {
    if (!aquariumId) return;
    if (!isCustom && !selectedSpeciesId) {
      await Taro.showToast({ title: '请选择物种', icon: 'none' });
      return;
    }
    if (isCustom && !customName.trim()) {
      await Taro.showToast({ title: '请输入自定义名称', icon: 'none' });
      return;
    }
    setSubmitting(true);
    try {
      await api.createFishStock({
        aquariumId,
        speciesId: isCustom ? undefined : selectedSpeciesId,
        displayName: isCustom ? customName.trim() : undefined,
        quantity: Number(quantity),
        color: color || undefined,
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
      <Text className="section-title">选择物种</Text>
      <View className="card form-card">
        <View className="form-field">
          <Input
            className="form-input"
            placeholder="搜索鱼种..."
            value={search}
            onInput={(e) => setSearch(e.detail.value)}
          />
        </View>
        <View className="species-list">
          {species.slice(0, 10).map((s) => (
            <View
              key={s.id}
              className={`species-item ${selectedSpeciesId === s.id && !isCustom ? 'selected' : ''}`}
              onClick={() => { setSelectedSpeciesId(s.id); setIsCustom(false); }}
            >
              <Text className="species-name">{s.commonName}</Text>
              <Text className="species-sci">{s.scientificName}</Text>
            </View>
          ))}
        </View>
        <View className="custom-toggle" onClick={() => setIsCustom(!isCustom)}>
          <Text className={isCustom ? 'pill green' : 'pill'}>{isCustom ? '自定义输入中' : '自定义物种'}</Text>
        </View>
        {isCustom && (
          <View className="form-field">
            <Text className="form-label">自定义名称</Text>
            <Input className="form-input" placeholder="输入鱼只名称" value={customName} onInput={(e) => setCustomName(e.detail.value)} />
          </View>
        )}
      </View>

      <Text className="section-title">数量和信息</Text>
      <View className="card form-card">
        <View className="form-field">
          <Text className="form-label">数量 *</Text>
          <Input className="form-input" type="number" value={quantity} onInput={(e) => setQuantity(e.detail.value)} />
        </View>
        <View className="form-field">
          <Text className="form-label">颜色标记</Text>
          <Input className="form-input" placeholder="例如：红色" value={color} onInput={(e) => setColor(e.detail.value)} />
        </View>
        <View className="form-field">
          <Text className="form-label">备注</Text>
          <Input className="form-input" placeholder="可选备注" value={note} onInput={(e) => setNote(e.detail.value)} />
        </View>
      </View>

      <Button block type="primary" className="water-button" loading={submitting} onClick={handleSubmit}>
        添加鱼只
      </Button>
    </View>
  );
}
