const { checkLogin } = require('../../utils/auth');
const app = getApp()
const apiHost = app.globalData.apiHost
Page({
  data: {
    userInfo: {},
    coupons: [],
    addresses: [],
    coupons_amount: 0
  },

  onShow() {
    if (!checkLogin()) return;
    this.loadUserInfo();
  },

  loadUserInfo() {
    const token = wx.getStorageSync('token');
    if (!token) {
      console.log("未登录");
      return;
    }

    wx.request({
      url: `${apiHost}/users/user_info/`,
      method: 'GET',
      header: {
        Authorization: 'Token ' + token
      },
      success: (res) => {
        this.setData({
          userInfo: res.data.user_info,
          coupons: res.data.coupons,
          addresses: res.data.addresses,
          coupons_amount: res.data.coupons.length
        });
      }
    })
  },

  navigateToOrders() {
    wx.switchTab({ url: '/pages/order/order' });
  },

  navigateToProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' });
  },

  navigateToAddress() {
    wx.navigateTo({ url: '/pages/address/list/list' });
  },
  navigateToPointsMall() {
    wx.navigateTo({
      url: '/pages/PointsMall/PointsMall',
    })
  },
  navigateToUsercoupon(){
    wx.navigateTo({
      url: '/pages/User_coupon/User_coupon',
    })
  },
  logout() {
    wx.clearStorageSync();
    wx.showToast({ title: '已退出登录' });

    this.setData({ userInfo: {} });
    wx.redirectTo({
      url: '/pages/Login/Login',
    })
  }
});
