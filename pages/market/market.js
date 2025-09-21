// pages/market/market.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    product_info: [
      { id: 0, price: 10, buy_quantity: 0, name: '种子纸', image: '/images/project_pictures/project001.jpg' },
      { id: 1, price: 10, buy_quantity: 0, name: '贺卡', image: '/images/project_pictures/project002.jpg' },
      { id: 2, price: 20, buy_quantity: 0, name: '笔记本', image: '/images/project_pictures/project003.jpg' }
    ],
    totalPrice:0

  },
  wxnavigateTo(){

  },

  quantityChange(event) {
    const id = event.currentTarget.dataset.id;     
    const type = event.currentTarget.dataset.type; 

    let products = this.data.product_info;


    let index = products.findIndex(item => item.id === id);
    if (index !== -1) {
      if (type === 'plus') {
        products[index].buy_quantity += 1;
      } else if (type === 'minus' && products[index].buy_quantity > 0) {
        products[index].buy_quantity -= 1;
      } else if (type === 'minus' && products[index].buy_quantity === 0) {
        wx.showToast({
          title: '至少买一件',
          icon: 'none'
        })
      }
    }


    this.setData({
      product_info: products
    });

    let total = 0;
    let a = this.data.product_info
    for (let i = 0; i < this.data.product_info.length; i++) {
      total+=this.data.product_info[i].buy_quantity*this.data.product_info[i].price
    }
    
    this.setData({
      totalPrice: total
    });

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})