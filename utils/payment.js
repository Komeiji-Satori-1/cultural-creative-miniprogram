// utils/payment.js
/**
 * 支付封装
 * @param {Number} orderId - 订单 ID
 * @param {Number} totalAmount - 总金额
 * @param {Boolean} useSandbox - 是否使用模拟支付（开发阶段 true）
 * @param {Function} callback - 支付完成回调
 */
function payOrder({ orderId, openid, couponId, useSandbox = false, callback }) {
  if (useSandbox) {
    // --- 模拟支付流程 ---
    wx.request({
      url: 'https://xdwenchuang.cn/api/orders/simulate_pay/',
      method: 'POST',
      data: { order_id: orderId, couponId: couponId, openid: openid },
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
      url: 'https://xdwenchuang.cn/api/orders/pay/wechat/create/', // 后端生成 prepay_id
      method: 'POST',
      data: { order_id: orderId, openid: openid, coupon_id: couponId },
      success(res) {
        if (res.data.code !== 200) {
          wx.showToast({ title: res.data.message || '支付创建失败', icon: 'none' })
          callback && callback(false, res.data)
          return
        }
        const payData = res.data.data.pay_params; // 后端返回 timeStamp、nonceStr、package、signType、paySign
        const requiredKeys = ['timeStamp', 'nonceStr', 'package', 'paySign']
        for (let key of requiredKeys) {
          if (!payData[key]) {
            wx.showToast({ title: '支付参数错误', icon: 'none' })
            callback && callback(false, payData)
            return
          }
        }
        wx.requestPayment({
          timeStamp: payData.timeStamp,
          nonceStr: payData.nonceStr,
          package: payData.package,
          signType: 'RSA',
          paySign: payData.paySign,
          success() {
            // ⚠️ 这里只表示“用户完成支付动作”
            wx.showToast({ title: '支付完成', icon: 'success' })
            callback && callback(true)
          },
          fail(err) {
            if (err.errMsg && err.errMsg.includes('cancel')) {
              wx.showToast({ title: '已取消支付', icon: 'none' })
            } else {
              wx.showToast({ title: '支付失败', icon: 'none' })
            }
            callback && callback(false, err)
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