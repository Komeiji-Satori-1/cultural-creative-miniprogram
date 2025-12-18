const app = getApp();
const apiHost = app.globalData.apiHost;
const openid = app.globalData.openid || wx.getStorageSync('openid')


Page({
data: { addressList: [] },


onShow() { this.loadAddresses(); },


loadAddresses() {
wx.request({
url: `${apiHost}/users/address/${openid}/`,
success: (res) => { this.setData({ addressList: res.data }); }
});
},


addAddress() {
wx.navigateTo({ url: '/pages/address/edit/edit' });
},


editAddress(e) {
const id = e.currentTarget.dataset.id;
wx.navigateTo({ url: `/pages/address/edit/edit?id=${id}` });
}
});