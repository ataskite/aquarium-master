import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import { Button, Tag } from '@nutui/nutui-react-taro';
import { api } from '../../services/api';

const demoReminders = [
  { id: 'feed', title: '喂食计划', dueAt: '今天 12:00', status: 'PENDING', note: '热带鱼颗粒饲料' },
  { id: 'water', title: '换水提醒', dueAt: '3天后', status: 'PENDING', note: '建议换水 30%' },
  { id: 'filter', title: '滤棉清洗', dueAt: '5天后', status: 'PENDING', note: '只用原缸水轻洗' },
];

type ReminderItem = (typeof demoReminders)[number];

export default function RemindersPage() {
  const [title, setTitle] = useState('换水提醒');
  const [reminders, setReminders] = useState<ReminderItem[]>(demoReminders);

  useEffect(() => {
    void api.listReminders().then((rows) => {
      if (rows.length) setReminders(rows.map((row) => ({ ...row, dueAt: new Date(row.dueAt).toLocaleString(), note: row.note ?? '' })));
    }).catch(() => undefined);
  }, []);

  const createReminder = async () => {
    await api.createReminder({ title, dueAt: new Date(Date.now() + 86400000).toISOString(), note: 'Demo 快速创建' });
    setReminders((items) => [{ id: String(Date.now()), title, dueAt: '明天', status: 'PENDING', note: 'Demo 快速创建' }, ...items]);
    await Taro.showToast({ title: '已添加', icon: 'success' });
  };

  return (
    <View className="page">
      <Text className="section-title">今日计划</Text>
      {reminders.map((reminder) => (
        <View className="card" key={reminder.id}>
          <View className="row">
            <View>
              <Text className="metric-value">{reminder.title}</Text>
              <Text className="muted">{reminder.note}</Text>
            </View>
            <Tag type="primary">{reminder.dueAt}</Tag>
          </View>
        </View>
      ))}

      <Text className="section-title">新增提醒</Text>
      <View className="field">
        <Text className="field-label">提醒名称</Text>
        <Input className="input" value={title} onInput={(event) => setTitle(event.detail.value)} />
      </View>
      <Button block type="primary" onClick={createReminder}>明天提醒我</Button>
    </View>
  );
}
