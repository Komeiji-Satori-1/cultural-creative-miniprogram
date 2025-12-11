const app = getApp()
const apiHost = app.globalData.apiHost
const openid = app.globalData.openid
const { payOrder } = require('../../utils/payment.js');

Page({
  data: {
    orderId: null,
    encrypted_id: null,
    method: null,
    items: [],
    addresses: [],
    selectedAddress: null,
    coupons: [],
    selectedCoupon: null,
    selectedCouponId: null,
    totalAmount: 0,
    shippingFee: 0,
    discountAmount: 0,
    payAmount: 0,   // 最终应付金额（由后端决定）
    addressId: null
  },

  onLoad(options) {
    const orderId = options.order_id;
    const orderInfo = wx.getStorageSync('orderInfo');

    if (!orderInfo) {
      wx.showToast({ title: "订单信息不存在", icon: "error" });
      return;
    }

    this.setData({
      orderId: orderId,
      method: orderInfo.method,
      totalAmount: orderInfo.total_amount,
      shippingFee: orderInfo.shipping_fee,
      payAmount: orderInfo.pay_amount,
      encrypted_id: orderInfo.encrypted_id,
      items: wx.getStorageSync('pending_order_items') || [],
    });

    if (orderInfo.method === 'delivery') {
      this.loadAddresses();
    }

    this.fetchCoupons();
  },

  fetchCoupons() {
    wx.request({
      url: `${apiHost}/users/coupon/available/`,
      method: 'GET',
      data: {
        openid: wx.getStorageSync('openid'),
        encrypted_id: this.data.encrypted_id
      },
      success: (res) => {
        if (res.data.code === 200) {
          this.setData({ coupons: res.data.data });
        }
      }
    });
  },

  // Picker 选择优惠券
  selectCoupon(e) {
    const index = e.detail.value;
    const coupon = this.data.coupons[index] || null;

    this.setData({
      selectedCoupon: coupon,
      selectedCouponId: coupon ? coupon.id : null
    });

    // 选完优惠券后调用服务器重新计算 payAmount
    this.recalculatePayAmount();
  },

  // Picker 选地址
  onAddressChange(e) {
    const index = e.detail.value;
    this.setData({
      selectedAddress: this.data.addresses[index],
      addressId: this.data.addresses[index].id
    });

    this.recalculatePayAmount();
  },

  loadAddresses() {
    wx.request({
      url: `${apiHost}/users/address/${openid}`,
      method: 'GET',
      success: res => {
        const list = res.data.map(a => ({
          ...a,
          display: `${a.receiver_name} ${a.phone} ${a.detail}`
        }));
        this.setData({ addresses: list });
      }
    });
  },

  // ⭐ 重新计算应付金额（后端计算）
  recalculatePayAmount() {
    if(this.data.method==='not_delivery'){
      this.setData({addressId:null})
    }
    wx.request({
      url: `${apiHost}/orders/wechat_confirm_order/`,
      method: 'POST',
      data: {
        openid:wx.getStorageSync('openid'),
        order_id: this.data.orderId,
        encrypted_id:this.data.encrypted_id,
        address_id: this.data.addressId,
        coupon_id: this.data.selectedCouponId
      },
      success: res => {
        if (res.data.code === 200) {
          this.setData({
            payAmount: res.data.data.pay_amount,
            discountAmount: res.data.discount_amount
          });
        }
      }
    });
  },

  // ⭐ 最终支付
  confirmPay() {
    if (this.data.method === "delivery" && !this.data.selectedAddress) {
      wx.showToast({ title: "请选择地址", icon: "none" });
      return;
    }

    payOrder({
      orderId: this.data.orderId,
      encrypted_id:this.data.encrypted_id,
      openid: openid,
      couponId: this.data.selectedCouponId,
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
  }
});
