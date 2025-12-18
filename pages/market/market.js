const { checkLogin } = require('../../utils/auth');
const app = getApp()
const apiHost = app.globalData.apiHost
const openid = app.globalData.openid || wx.getStorageSync('openid')
Page({
  data: {
    product_info: [],
    totalPrice: 0,
    useSandbox: true,
    method:null
  },

  onShow() {

    if (!checkLogin()) return;
    const method = wx.getStorageSync('method')
    this.setData({ method })
    this.fetchProducts();
    if (method === 'delivery') {
      this.checkAddress()
    }
    
  },

  onLoad() {
    this.fetchProducts();
  },
  syncQuantitiesFromStorage() {
    const stored = wx.getStorageSync('product_buy_quantity') || {};
    let products = this.data.product_info;
  
    products = products.map(item => {
      if (stored[item.id] !== undefined) {
        item.buy_quantity = stored[item.id];
      }
      return item;
    });
    this.setData({ product_info: products });
  
    this.updateCartBadge();
    this.calculateTotal();
  },
  checkAddress(){
    const phone = wx.getStorageSync('phoneNumber')
    if(!phone||!openid) return
    wx.request({
      url: `${apiHost}/users/address/${openid}/`,
      method:'GET',
      success:(res) => {
        
        if(!res.data || res.data.length === 0){
          wx.navigateTo({
            url: '/pages/address/list/list'
          })
        }
      },
    })
  },
  fetchProducts(callback) {
    wx.request({
      url: `${apiHost}/products/wechat_get_product/`,
      method: 'GET',
      success: (res) => {
        const baseURL = `${apiHost}`;
        
        const list = res.data.map(item => ({
          ...item,
          image: item.image_url,
          buy_quantity: 0,
          stock_status: item.stock == 0 ? '已售罄' : (item.stock < 30 ? '即将售罄' : ''),
        }));
        const cartQuantities = wx.getStorageSync('cart_quantities') || {};
        list.forEach(p => { if (cartQuantities[p.id]) p.buy_quantity = cartQuantities[p.id]; });
        
        this.setData({
          product_info: list,
          totalPrice: 0
        });
        this.syncQuantitiesFromStorage();
        this.updateCartBadge();
      },
      fail: (err) => {
        console.error('请求失败:', err);
      },
      complete: () => {
        if (callback) callback();
      }
    });
  },
  
  // 计算总价
  calculateTotal() {
    let products = this.data.product_info;
    let total = 0;
    for (let i = 0; i < products.length; i++) {
      total += products[i].buy_quantity * products[i].price;
    }
    this.setData({ totalPrice: total });
  },

  // 商品数量变化
  quantityChange(e) {
    const { id, type } = e.currentTarget.dataset;
    let products = this.data.product_info;
    let index = products.findIndex(x => x.id === id);
    const product = products[index];
    if (product.stock === 0) {
      wx.showToast({
        icon: "none",
        title: "该商品已售罄"
      });
      return;
    }
    
    if (index !== -1) {
      if (type === 'plus') {
        if (products[index].buy_quantity >= products[index].stock) {
          wx.showToast({ title: '库存不足', icon: 'none' });
          return;
        }
        products[index].buy_quantity += 1;
      } else if (type === 'minus') {
        if (products[index].buy_quantity > 0) {
          products[index].buy_quantity -= 1;
        }
      }
    }
    products[index] = product;
    this.setData({ product_info: products });
    let storedQuantities = wx.getStorageSync('product_buy_quantity') || {};
    if (typeof storedQuantities !== 'object') {
      storedQuantities = {};
    }

    storedQuantities[id] = product.buy_quantity;

    wx.setStorageSync('product_buy_quantity', storedQuantities);
      this.updateCartBadge();
      this.calculateTotal();
    },

  // 创建订单并模拟支付
  createAndPayOrder() {
    const cartItems = this.data.product_info.filter(item => item.buy_quantity > 0);

    if (cartItems.length === 0) {
      wx.showToast({
        title: '请先选择商品',
        icon: 'none'
      });
      return;
    }

    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    wx.request({
      url: `${apiHost}/orders/wechat_post_order/`,
      method: 'POST',
      data: {
        method: wx.getStorageSync('method'),
        openid: wx.getStorageSync('openid'),
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.buy_quantity
        }))
      },
      success: res => {
        const data =res.data.data 
        const orderInfo = {
          order_id: data.order_id,
          encrypted_id: data.encrypted_id,
          method: this.data.method,
          total_amount: data.total_amount,
          shipping_fee: data.shipping_fee,
          discount_amount: data.discount_amount,
          pay_amount: data.pay_amount
      };
        wx.setStorageSync('orderInfo', orderInfo);
        wx.setStorageSync('pending_order_items', cartItems);
        wx.navigateTo({
          url: `/pages/confirm_order/confirm_order?order_id=${orderInfo.order_id}`
        });
      },
      fail: err => {
        console.error('下单失败:', err);
        wx.showToast({ title: '下单失败，请稍后重试', icon: 'none' });
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.fetchProducts(() => wx.stopPullDownRefresh());
  },
  goDetail(e) {
    const productId = e.currentTarget.dataset.id;
    const product = this.data.product_info.find(item => item.id === productId);
  
    let quantities = wx.getStorageSync('product_buy_quantity') || {};
  if (typeof quantities !== 'object') {
    quantities = {};
  }
  quantities[productId] = product.buy_quantity;

  wx.setStorageSync('product_buy_quantity', quantities);
  wx.setStorageSync('item', product)
    wx.navigateTo({
      url: `/pages/detail/detail?id=${productId}`
    });
  },
  
  updateCartBadge() {
    const count = this.data.product_info.reduce((sum, item) => sum + item.buy_quantity, 0);
  
    if (count > 0) {
      wx.setTabBarBadge({
        index: 2,
        text: String(count)
      });
    } else {
      wx.removeTabBarBadge({
        index: 2
      });
    }
  }
  
});
