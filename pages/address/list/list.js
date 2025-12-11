const app = getApp();
const apiHost = app.globalData.apiHost;


Page({
data: { addressList: [] },


onShow() { this.loadAddresses(); },


loadAddresses() {
wx.request({
url: `${apiHost}/users/address/${app.globalData.openid}/`,
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