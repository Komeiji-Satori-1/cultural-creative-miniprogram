const app = getApp()
const apiHost = app.globalData.apiHost
const openid = app.globalData.openid
Page({
  data: {
    activeTab: "unused",
    couponList: [],
    displayCoupons: []
  },

  onLoad() {
    this.fetchCoupons();
  },

  fetchCoupons() {
    wx.request({
      url: `${apiHost}/users/coupons/list/`,
      data: { openid: wx.getStorageSync('openid') },
      success: res => {
        const list = res.data.data;

        this.setData({
          couponList: list
        });

        this.updateDisplay("unused");
      }
    });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    this.updateDisplay(tab);
  },

  updateDisplay(tab) {
    const list = this.data.couponList;
    const filtered = list.filter(item => item.status === tab);

    this.setData({
      displayCoupons: filtered
    });
  }
});
