import React, { useEffect, useState } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { Button, Progress, Tag } from '@nutui/nutui-react-taro';
import { api, Aquarium, WaterQualityRecord } from '../../services/api';

export default function TankDetailPage() {
  const router = useRouter();
  const [tank, setTank] = useState<(Aquarium & { waterRecords?: WaterQualityRecord[] }) | null>(null);

  useEffect(() => {
    const id = router.params.id;
    if (!id || id.startsWith('demo')) {
      setTank({ id: 'demo-living-room', name: '我的客厅鱼缸', volumeLiters: 84, species: '孔雀鱼、红绿灯、清道夫', healthScore: 92 });
      return;
    }
    void api.getAquarium(id).then(setTank);
  }, [router.params.id]);

  const latest = tank?.waterRecords?.[0];

  return (
    <View className="page">
      <View className="hero">
        <Text className="hero-title">{tank?.name ?? '鱼缸档案'}</Text>
        <Text className="hero-subtitle">{tank?.volumeLiters ?? 84}L · {tank?.species ?? '热带鱼混养'}</Text>
      </View>

      <Text className="section-title">健康评分</Text>
      <View className="card">
        <View className="row">
          <Text className="metric-value">{tank?.healthScore ?? 92}分</Text>
          <Tag type="success">状态优秀</Tag>
        </View>
        <Progress percent={tank?.healthScore ?? 92} strokeWidth="10" />
      </View>

      <Text className="section-title">鱼只档案</Text>
      <View className="metric-grid">
        <View className="metric"><Text className="muted">红绿灯鱼</Text><Text className="metric-value">12只</Text></View>
        <View className="metric"><Text className="muted">孔雀鱼</Text><Text className="metric-value">5只</Text></View>
        <View className="metric"><Text className="muted">斑马鱼</Text><Text className="metric-value">6只</Text></View>
        <View className="metric"><Text className="muted">清道夫</Text><Text className="metric-value">1只</Text></View>
      </View>

      <Text className="section-title">最新水质</Text>
      <View className="card">
        <View className="row"><Text>温度</Text><Text>{latest?.temperature ?? 26.3}℃</Text></View>
        <View className="row"><Text>pH</Text><Text>{latest?.ph ?? 7.2}</Text></View>
        <View className="row"><Text>氨氮</Text><Text>{latest?.ammonia ?? 0.02} mg/L</Text></View>
        <View className="row"><Text>硝酸盐</Text><Text>{latest?.nitrate ?? 12} mg/L</Text></View>
      </View>

      <Button block type="primary" onClick={() => Taro.switchTab({ url: '/pages/add-record/index' })}>添加养护记录</Button>
    </View>
  );
}
