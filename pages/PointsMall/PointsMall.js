const app = getApp()
const apiHost = app.globalData.apiHost; // 替换为你的后端地址
Page({
  data: {
    isModalVisible: false,
    modalTitle: '',
    modalPoints: '',
    couponsID:0,
    couponRules: [ 
      "优惠券即日起生效", 
      "每人每天限领1张", 
      "至少消费20元才可使用"
    ],
    coupons: [],
    userPoints: 0
  },

  onLoad() {
    this.loadCoupons();
  },

  showExchangeModal(e) {
    const id = e.currentTarget.dataset.id;
    const title = e.currentTarget.dataset.title;
    const points = e.currentTarget.dataset.points;
    const coupon = this.data.coupons.find(c=>c.id===id)
    const rules = [];
    if (coupon.min_amount > 0) {
      rules.push(`满 ${coupon.min_amount} 元可使用`);
    } else {
      rules.push("无最低消费金额限制");
    }
  
    rules.push(`可减免 ${coupon.discount_amount} 元`);
  
    rules.push("每人每天限领 1 张");
  
    const start = coupon.start_time ? coupon.start_time.slice(0, 10) : "无";
    const end = coupon.end_time ? coupon.end_time.slice(0, 10) : "无";
    rules.push(`可兑换时间：${start} 至 ${end}`);
    this.setData({
      isModalVisible: true,
      modalTitle: title,
      modalPoints: points,
      couponsID:id,
      couponRules: rules
    });
  },
  handleConfirmExchange() {
    this.exchangeCoupon()
  },
  loadCoupons() {
    const openid = wx.getStorageSync('openid');
    wx.request({
      url: `${apiHost}/products/coupon/list/`,
      data:{openid:openid},
      success: res => {
        const coupons = res.data.data.filter(c => c.is_exchange);
        this.setData({
          coupons,
          userPoints: res.data.user_points || 0
        });
      }
    });
  },

  exchangeCoupon() {
    const Id = this.data.couponsID;
    const openid = wx.getStorageSync('openid')
    wx.request({
      url: `${apiHost}/products/coupon/exchange/`,
      method: 'POST',
      data: { coupon_id: Id ,openid: openid},
      success: res => {
        if (res.data.code === 200) {
          wx.showToast({ title: '兑换成功', icon: 'success' });
          this.loadCoupons(); // 刷新列表和积分
        } else {
          console.log(res.data)
          wx.showToast({ title: res.data.msg || '兑换失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  }
})
