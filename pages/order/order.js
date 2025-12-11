const { checkLogin } = require('../../utils/auth');
const app = getApp()
const apiHost = app.globalData.apiHost
Page({
  data: {
    orders: [],
    page: 1,
    loading: false,
    noMore: false
  },
  onShow() {
    if (!checkLogin()) return;

    // 如果用户从后台返回，要重新刷新订单
    this.setData({ orders: [], page: 1, noMore: false });
    this.loadOrders();
  },
  onLoad() {
    this.loadOrders();
  },

  loadOrders() {
    if (this.data.loading || this.data.noMore) return;

    this.setData({ loading: true });
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${apiHost}/orders/user-orders/?page=${this.data.page}`,
      method: 'GET',
      header: {
        Authorization: 'Token ' + token

      },
      data: {
        openid: wx.getStorageSync('openid'),
      },
      success: (res) => {
        const newOrders = res.data.results;
        if (newOrders.length > 0) {
          this.setData({
            orders: this.data.orders.concat(newOrders),
            page: this.data.page + 1
          });

        } else {
          this.setData({ noMore: true });
        }
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ orders: [], page: 1, noMore: false });
    this.loadOrders();
    wx.stopPullDownRefresh();
  },

  // 滚动到底部加载更多
  onReachBottom() {
    this.loadOrders();
  },
  goOrderdetail(e) {
    const OrderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/orderDetail/orderDetail?OrderId=${OrderId}`
    });
  }
});
