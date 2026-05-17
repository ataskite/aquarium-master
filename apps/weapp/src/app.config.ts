export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/tank-detail/index',
    'pages/add-record/index',
    'pages/ai-assistant/index',
    'pages/reminders/index',
    'pages/profile/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0b87f5',
    navigationBarTitleText: '水族大师',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#607188',
    selectedColor: '#0b72f0',
    backgroundColor: '#f8fbff',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/home/index', text: '首页' },
      { pagePath: 'pages/add-record/index', text: '记录' },
      { pagePath: 'pages/ai-assistant/index', text: 'AI' },
      { pagePath: 'pages/reminders/index', text: '提醒' },
      { pagePath: 'pages/profile/index', text: '我的' },
    ],
  },
});
