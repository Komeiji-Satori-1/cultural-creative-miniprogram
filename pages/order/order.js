const { checkLogin } = require('../../utils/auth');
const app = getApp();

Page({
  data: {
    orders: [],
    page: 1,
    loading: false,
    noMore: false
  },

  onShow() {
    if (!checkLogin()) return;

    // 返回页面时强制刷新
    this.resetAndLoad();
  },

  onLoad() {
    this.resetAndLoad();
  },

  // 🔁 重置并重新加载
  resetAndLoad() {
    this.setData({
      orders: [],
      page: 1,
      loading: false,
      noMore: false
    });
    this.loadOrders();
  },

  // 📦 加载订单
  loadOrders() {
    if (this.data.loading || this.data.noMore) return;

    const token = wx.getStorageSync('token');
    const openid = app.globalData.openid || wx.getStorageSync('openid');

    if (!openid) {
      console.warn('openid 不存在，终止请求');
      return;
    }

    this.setData({ loading: true });

    wx.request({
      url: `${app.globalData.apiHost}/orders/user-orders/`,
      method: 'GET',
      header: {
        Authorization: 'Token ' + token
      },
      data: {
        page: this.data.page,
        openid: openid
      },
      success: (res) => {
        const results = res.data?.results || [];

        if (results.length > 0) {
          this.setData({
            orders: this.data.orders.concat(results),
            page: this.data.page + 1
          });
        } else {
          this.setData({ noMore: true });
        }
      },
      fail(err) {
        console.error('加载订单失败', err);
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  loadMoreOrders() {
    this.loadOrders();
  },

  onPullDownRefresh() {
    this.resetAndLoad();
    wx.stopPullDownRefresh();
  },

  goOrderdetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?OrderId=${orderId}`
    });
  }
});
