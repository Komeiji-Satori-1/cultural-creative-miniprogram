Page({
  data: {
    banners: [
      { src: 'https://xdwenchuang.cn/static_assets/project001.jpg', title: '种子纸贺卡' },
      { src: 'https://xdwenchuang.cn/static_assets/project002.jpg', title: '种子纸机票' },
      { src: 'https://xdwenchuang.cn/static_assets/project003.jpg', title: '西电笔记本' }
    ]
  },

  onShow() {
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
