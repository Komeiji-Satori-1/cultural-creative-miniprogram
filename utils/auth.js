const tabbarPages = [
  'pages/market/market',
  'pages/order/order',
];
function isTabbarPage(route) {
  console.log(tabbarPages.includes(route))
  return tabbarPages.includes(route);
}
function checkLogin() {
  const token = wx.getStorageSync('token');
  const openid = wx.getStorageSync('openid');

  if (!token || !openid) {
    wx.showToast({
      title: '请先登录',
      icon: 'none'
    });

    setTimeout(() => {
      wx.redirectTo({
        url: '/pages/Login/Login',
      })
    }, 1000);

    return false;
  }

  return true;
}

module.exports = {
  checkLogin
};
