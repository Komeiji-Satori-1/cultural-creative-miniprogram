const app = getApp()
const apiHost = app.globalData.apiHost
const openid = app.globalData.openid
const { payOrder } = require('../../utils/payment.js');
Page({
  data: {
    encrypted_id: null,
    order: null,
    loading: true,
  },

  onLoad(options) {
    this.setData({ encrypted_id: options.OrderId });  // 你会传 encrypted_id
  },

  onShow() {
    this.fetchOrderDetail();
  },

  fetchOrderDetail() {
    const that = this;
    wx.request({
      url: `${apiHost}/orders/wechat_get_orderDetail/${that.data.encrypted_id}/`,
      method: "GET",
      header: {
        Authorization: `Token ${getApp().globalData.token}`
      },
      success(res) {
        if (res.statusCode === 200) {
          that.setData({ order: res.data });
        } else {
          wx.showToast({ title: "订单不存在", icon: "none" });
        }
      },
      complete() {
        that.setData({ loading: false });
      },
    });
  },

  payNow() {
    payOrder({
      orderId: this.data.order.id,
      encrypted_id:this.data.encrypted_id,
      openid: openid,
      couponId: this.data.order.coupon_id,
      callback: (success) => {
        if (success) {
          wx.showToast({ title: '支付成功' });
          wx.removeStorageSync('pending_order_items');
          wx.removeStorageSync('product_buy_quantity');
          wx.removeStorageSync('orderInfo');
          wx.redirectTo({
            url: `/pages/orderDetail/orderDetail?OrderId=${this.data.encrypted_id}`
          });
        } else {
          wx.showToast({ title: '支付失败', icon: 'none' });
        }
      }
    });
  },

  cancelOrder() {
    wx.request({
      url: `${apiHost}/orders/wechat_cancel_order/${this.data.encrypted_id}/`,
      method: "POST",
      header: {
        Authorization: `Token ${getApp().globalData.token}`
      },
      success: (res) => {
        wx.showToast({ title: res.data.message });
        this.fetchOrderDetail();
      },
    });
  },
  goAfterSale(){
    wx.navigateTo({
      url: '/pages/refund/refund',
    })
  }
});
