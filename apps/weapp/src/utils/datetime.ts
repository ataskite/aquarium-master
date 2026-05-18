export const formatDueAt = (value?: string, showTime = false) => {
  if (!value) return '待定';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / oneDay);
  const time = `${`${date.getHours()}`.padStart(2, '0')}:${`${date.getMinutes()}`.padStart(2, '0')}`;
  if (diffDays <= 0) return `今天 ${time}`;
  if (diffDays === 1) return `明天 ${time}`;
  return showTime ? `${diffDays}天后 ${time}` : `${diffDays}天后`;
};
