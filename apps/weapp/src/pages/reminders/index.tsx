import React, { useEffect, useMemo, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import { Button } from '@nutui/nutui-react-taro';
import { api, Reminder } from '../../services/api';
import { useAquariumStore } from '../../store/aquarium';
import { formatDueAt } from '../../utils/datetime';
import './index.scss';

export default function RemindersPage() {
  const { selectedId, aquariums } = useAquariumStore();
  const aquariumId = selectedId ?? aquariums[0]?.id;
  const tankName = aquariums.find((item) => item.id === aquariumId)?.name ?? '当前鱼缸';
  const [title, setTitle] = useState('换水提醒');
  const [note, setNote] = useState('建议换水 30%');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const rows = await api.listReminders(aquariumId);
      setReminders(rows);
    } catch {
      await Taro.showToast({ title: '提醒加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReminders();
  }, [aquariumId]);

  const pendingReminders = useMemo(() => reminders.filter((item) => item.status !== 'DONE'), [reminders]);
  const doneReminders = useMemo(() => reminders.filter((item) => item.status === 'DONE'), [reminders]);
  const healthPercent = Math.max(60, Math.min(99, 100 - pendingReminders.length * 4));

  const createReminder = async () => {
    const nextTitle = title.trim();
    if (!nextTitle) {
      await Taro.showToast({ title: '请输入提醒名称', icon: 'none' });
      return;
    }
    setSaving(true);
    try {
      await api.createReminder({
        title: nextTitle,
        aquariumId,
        dueAt: new Date(Date.now() + 86400000).toISOString(),
        note: note.trim(),
      });
      setTitle('');
      setNote('');
      await loadReminders();
      await Taro.showToast({ title: '已添加', icon: 'success' });
    } catch {
      await Taro.showToast({ title: '添加失败，请检查服务', icon: 'none' });
    } finally {
      setSaving(false);
    }
  };

  const markDone = async (id: string) => {
    try {
      await api.updateReminder(id, { status: 'DONE' });
      await loadReminders();
      await Taro.showToast({ title: '已完成', icon: 'success' });
    } catch {
      await Taro.showToast({ title: '更新失败', icon: 'none' });
    }
  };

  const removeReminder = async (id: string) => {
    const result = await Taro.showModal({ title: '删除提醒', content: '删除后不会再出现在计划中。' });
    if (!result.confirm) return;
    try {
      await api.deleteReminder(id);
      await loadReminders();
      await Taro.showToast({ title: '已删除', icon: 'success' });
    } catch {
      await Taro.showToast({ title: '删除失败', icon: 'none' });
    }
  };

  const renderReminder = (reminder: Reminder) => (
    <View className={`care-task ${reminder.status === 'DONE' ? 'done' : ''}`} key={reminder.id}>
      <Text className={`task-icon ${reminder.title.includes('换水') ? 'water' : reminder.title.includes('滤') ? 'filter' : ''}`} />
      <View className="care-task-main">
        <View className="row">
          <View>
            <Text className="task-title">{reminder.title}</Text>
            <Text className="muted">{reminder.note || '无备注'}</Text>
          </View>
          <Text className={reminder.status === 'DONE' ? 'pill green' : 'pill'}>{reminder.status === 'DONE' ? '已完成' : formatDueAt(reminder.dueAt, true)}</Text>
        </View>
        <View className="task-actions">
          {reminder.status !== 'DONE' && <Text onClick={() => void markDone(reminder.id)}>完成</Text>}
          <Text onClick={() => void removeReminder(reminder.id)}>删除</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="page page-enter care-page">
      <View className="care-hero">
        <View className="care-ring">
          <Text>{healthPercent}</Text>
          <Text>%</Text>
        </View>
        <View>
          <Text className="score-title">智能养护</Text>
          <Text className="muted">{pendingReminders.length ? `还有 ${pendingReminders.length} 个待办提醒` : '今日计划已清空'}</Text>
        </View>
      </View>

      <View className="tank-context-bar">
        <View>
          <Text className="muted">当前鱼缸</Text>
          <Text className="strong">{tankName}</Text>
        </View>
        <Text className="pill" onClick={() => Taro.switchTab({ url: '/pages/home/index' })}>切换</Text>
      </View>

      <Text className="section-title">待办计划</Text>
      {loading && <View className="card"><Text className="muted">加载中...</Text></View>}
      {!loading && pendingReminders.length === 0 && <View className="card"><Text className="muted">暂无待办提醒</Text></View>}
      {!loading && pendingReminders.map(renderReminder)}

      {doneReminders.length > 0 && (
        <>
          <Text className="section-title">已完成</Text>
          {doneReminders.map(renderReminder)}
        </>
      )}

      <Text className="section-title">新增提醒</Text>
      <View className="field">
        <Text className="field-label">提醒名称</Text>
        <Input className="input" value={title} onInput={(event) => setTitle(event.detail.value)} />
      </View>
      <View className="field">
        <Text className="field-label">备注</Text>
        <Input className="input" value={note} onInput={(event) => setNote(event.detail.value)} />
      </View>
      <Button block type="primary" className="water-button" loading={saving} onClick={createReminder}>明天提醒我</Button>
    </View>
  );
}
