export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/tank-detail/index',
    'pages/add-record/index',
    'pages/ai-assistant/index',
    'pages/reminders/index',
    'pages/profile/index',
    'pages/aquarium-create/index',
    'pages/aquarium-edit/index',
    'pages/fish-add/index',
    'pages/device-add/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#eaf8ff',
    navigationBarTitleText: '水族大师',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#58728d',
    selectedColor: '#075cf1',
    backgroundColor: '#f8fcff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home-active.png',
      },
      {
        pagePath: 'pages/add-record/index',
        text: '记录',
        iconPath: 'assets/tabbar/record.png',
        selectedIconPath: 'assets/tabbar/record-active.png',
      },
      {
        pagePath: 'pages/ai-assistant/index',
        text: 'AI',
        iconPath: 'assets/tabbar/bot.png',
        selectedIconPath: 'assets/tabbar/bot-active.png',
      },
      {
        pagePath: 'pages/reminders/index',
        text: '提醒',
        iconPath: 'assets/tabbar/bell.png',
        selectedIconPath: 'assets/tabbar/bell-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tabbar/user.png',
        selectedIconPath: 'assets/tabbar/user-active.png',
      },
    ],
  },
});
