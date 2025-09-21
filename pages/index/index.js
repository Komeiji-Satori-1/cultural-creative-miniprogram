// index.js
Page({
  navigateTo_market(){
    wx.switchTab({
      url: '/pages/market/market',
    })
  },
  navigateTo_delivery(){
    wx.switchTab({
      url: '/pages/market/market',
    })
  },

  navigateTo_request(){
    wx.navigateTo({
      url: '/pages/request/request',
    })
  },
  navigateTo_latest_items(){
    wx.navigateTo({
      url: '/pages/latest_items/latest_items',
    })
  },
  navigateTo_group(){
    wx.navigateTo({
      url: '/pages/Wechat_Group/Wechat_Group',
    })
  },

  navigateTo_purchase(){
    wx.navigateTo({
      url: '/pages/purchase/purchase',
    })
  }
})
