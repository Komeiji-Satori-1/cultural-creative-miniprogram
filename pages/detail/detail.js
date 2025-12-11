const app = getApp()
const apiHost = app.globalData.apiHost
Page({
  data: {
    product: null,
    productId: null,
    buy_quantity: 0,
  },

  onLoad(options) {
    const productId = Number(options.id);
    this.setData({ productId });
    this.fetchProductDetail(productId);
  },
  onUnload() {
    const productId = this.data.product.id;
    const qty = this.data.buy_quantity;
    this.saveBuyQuantity(productId, qty);
  },
  

  fetchProductDetail(id) {
    wx.request({
      url: `${apiHost}/products/wechat_get_detail/${id}/`,
      method: 'GET',
      success: (res) => {
        const quantities  = wx.getStorageSync('product_buy_quantity') || {};
        let buy_quantity = quantities[id] || 0;   // 默认 1
        this.setData({
          product: res.data,
          buy_quantity,
        });
      }
    });
  },
  

  // 增加数量
  increase() {
    let q = this.data.buy_quantity;
    if (q < this.data.product.stock) {
      this.setData({ buy_quantity: q + 1 });
      let qty = this.data.buy_quantity
      this.saveBuyQuantity(this.data.productId,qty)
    } else {
      wx.showToast({ title: '库存不足', icon: 'none' });
    }
  },

  // 减少数量
  decrease() {
    let q = this.data.buy_quantity;
    if (q > 0) this.setData({ buy_quantity: q - 1 });
    let qty = this.data.buy_quantity
      this.saveBuyQuantity(this.data.productId,qty)
  },
  saveBuyQuantity(productId, quantity) {
    let stored = wx.getStorageSync('product_buy_quantity') || {};
  
    if (typeof stored !== 'object') stored = {};
  
    stored[Number(productId)] = quantity; 
  
    wx.setStorageSync('product_buy_quantity', stored);
  },
  // 立即购买
  buyNow() {
    const product = this.data.product;
    const quantity = this.data.buy_quantity;
    let item = [wx.getStorageSync('item')]
    item[0].buy_quantity=quantity
    console.log("detail页面的product",product)
    console.log("由market页面传入的item",item)
    // 下单逻辑（同之前 payOrder 封装）
    wx.request({
      url: `${apiHost}/orders/wechat_post_order/`,
      method: 'POST',
      data: {
        method: wx.getStorageSync('method'),
        openid: wx.getStorageSync('openid'),
        items: [
          { product_id: product.id, quantity: quantity}
        ]
      },
      success: (res) => {
        const data = res.data.data
        const orderInfo = {
          order_id: data.order_id,
          encrypted_id: data.encrypted_id,
          method: wx.getStorageSync('method'),  // ← 你在缓存里保存过的
          total_amount: data.total_amount,
          shipping_fee: data.shipping_fee,
          discount_amount: data.discount_amount,
          pay_amount: data.pay_amount
        };
        wx.setStorageSync('orderInfo', orderInfo);

        wx.setStorageSync('pending_order_items', item);
        wx.removeStorageSync('product_buy_quantity');
        wx.removeStorageSync('item');
        wx.redirectTo({
          url: `/pages/confirm_order/confirm_order?order_id=${orderInfo.order_id}`
        });
      }
    });
  }
});
