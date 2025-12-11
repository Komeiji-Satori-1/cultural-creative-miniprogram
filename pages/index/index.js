// index.js
const { checkLogin } = require('../../utils/auth.js');
Page({
  data: {
    banners: [
      { src: 'https://xdwenchuang.cn/static_assets/project001.jpg', title: '种子纸贺卡' },
      { src: 'https://xdwenchuang.cn/static_assets/project002.jpg', title: '种子纸机票' },
      { src: 'https://xdwenchuang.cn/static_assets/project003.jpg', title: '西电笔记本' }
    ]
  },

  onShow() {
    const loggedIn = checkLogin();
    if (!loggedIn) return; // 阻止后续逻辑执行

    // 通过检查后可以安全调用接口
    console.log('用户已登录');
  },
  navigateTo_market() {
    wx.setStorageSync('method', 'not_delivery')
    wx.switchTab({
      url: '/pages/market/market',
    })
  },
  navigateTo_delivery() {
    wx.setStorageSync('method', 'delivery')
    wx.switchTab({
      url: '/pages/market/market',
    })
  },

  navigateTo_PointsMall() {
    wx.navigateTo({
      url: '/pages/PointsMall/PointsMall',
    })
  },
})
