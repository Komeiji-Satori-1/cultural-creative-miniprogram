// app.js
// app.js
App({
  globalData: {
    apiHost: "https://xdwenchuang.cn/api",   // 你自己的后端域名
    imgHost: "https://xdwenchuang.cn/static", // 比如静态资源地址
    token: wx.getStorageSync("token") || "",
    openid: wx.getStorageSync("openid") || "",
    // 还可以加更多
  }
})

