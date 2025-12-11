// utils/payment.js

/**
 * 支付封装
 * @param {Number} orderId - 订单 ID
 * @param {Number} totalAmount - 总金额
 * @param {Boolean} useSandbox - 是否使用模拟支付（开发阶段 true）
 * @param {Function} callback - 支付完成回调
 */
function payOrder({ orderId, openid, couponId, useSandbox = true, callback }) {

  if (useSandbox) {
    // --- 模拟支付流程 ---
    wx.request({
      url: 'https://xdwenchuang.cn/api/orders/simulate_pay/',
      method: 'POST',
      data: { order_id: orderId,couponId: couponId,openid:openid},
      success(res) {
        if (res.data.success) {
          wx.showToast({ title: '支付成功', icon: 'success', duration: 1500 });
          if (callback) callback(true, res.data);
        } else {
          wx.showToast({ title: '支付失败', icon: 'error' });
          if (callback) callback(false, res.data);
        }
      },
      fail(err) {
        wx.showToast({ title: '支付接口错误', icon: 'error' });
        if (callback) callback(false, err);
      }
    });
  } else {
    // --- 真实微信支付流程 ---
    wx.request({
      url: 'http://192.168.0.108:8000/api/orders/wechat_pay/', // 后端生成 prepay_id
      method: 'POST',
      data: { order_id: orderId, address: address },
      success(res) {
        const payData = res.data; // 后端返回 timeStamp、nonceStr、package、signType、paySign
        wx.requestPayment({
          ...payData,
          success(paymentRes) {
            wx.showToast({ title: '支付成功', icon: 'success' });
            if (callback) callback(true, paymentRes);
          },
          fail(paymentErr) {
            wx.showToast({ title: '支付失败', icon: 'error' });
            if (callback) callback(false, paymentErr);
          }
        })
      },
      fail(err) {
        wx.showToast({ title: '支付接口错误', icon: 'error' });
        if (callback) callback(false, err);
      }
    });
  }
}
module.exports = { payOrder }