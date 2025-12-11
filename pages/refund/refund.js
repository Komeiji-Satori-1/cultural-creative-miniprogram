Page({
  data: {
    order_id: "",
    types: ["退款", "换货"],
    type: "退款",
    reason: "",
    service_phone:18513959991,
    service_wechat:'Hatano_Satori'
  },

  onLoad(options) {
    this.setData({ order_id: options.order_id });
  },

  chooseType(e) {
    this.setData({ type: this.data.types[e.detail.value] });
  },

  inputReason(e) {
    this.setData({ reason: e.detail.value });
  },

  submitRefund() {
    wx.request({
      url: "https://你的域名/api/refund/apply/",
      method: "POST",
      data: {
        order_id: this.data.order_id,
        type: this.data.type,
        reason: this.data.reason
      },
      success: () => {
        wx.showToast({ title: "已提交" });
        wx.navigateBack();
      }
    });
  }
});
