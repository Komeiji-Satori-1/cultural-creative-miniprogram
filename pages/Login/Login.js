const app = getApp()
const apiHost = app.globalData.apiHost
Page({
  data: {
      // 用于控制是否显示“获取头像昵称”提示的变量
      showProfileModal: false, 
      tempLoginCode: null // 临时存储 wx.login 获取的 code
  },

  // 页面加载时或进入时，先执行静默登录
  onLoad() {
      this.silentLogin();
  },

  // 1. 静默登录：获取 OpenID 和 loginCode (用于后续发送给后端)
  silentLogin() {
      wx.login({
          success: loginRes => {
              this.setData({
                  tempLoginCode: loginRes.code
              });
              
          },
          fail: err => {
              console.error("wx.login 失败", err);
          }
      });
  },

  // 2. 手机号授权主流程 (绑定到 WXML 的 bindgetphonenumber)
  handleGetPhoneNumber(e) {
      if (e.detail.errMsg === "getPhoneNumber:ok") {
          const phoneCode = e.detail.code;


          // A. 向后端发送手机号 code
          this.requestUserPhone(phoneCode)
              .then(res => {
                  
                  // 假设这里后端同时返回了登录 token 和 openid
                  wx.setStorageSync('phoneNumber', res.phoneNumber)
                  // B. 手机号登录成功后，弹出提示，引导用户获取头像昵称
                  this.setData({
                      showProfileModal: true // 显示提示弹窗
                  });
              })
              .catch(err => {
                  console.error("手机号请求失败：", err);
                  wx.showToast({ title: '手机号登录失败', icon: 'error' });
              });

      } else {
          console.log("用户拒绝获取手机号或事件错误:", e.detail.errMsg);
          wx.showToast({ title: '拒绝授权手机号', icon: 'none' });
      }
  },
  
  // 3. 专门用于获取头像昵称的函数 (绑定到提示弹窗上的“确定”按钮)
  handleGetProfileTap() {
      this.setData({ showProfileModal: false }); // 关闭弹窗

      wx.getUserProfile({
          desc: '用于完善会员资料和登录',
          success: profileRes => {
              
              const userInfo = profileRes.userInfo;
              
              // 将用户信息和之前获取的 loginCode 发送到后端
              this.requestWechatLogin(userInfo);
          },
          fail: err => {
              console.error("获取头像昵称失败：", err);
              wx.showToast({ title: '授权头像失败', icon: 'error' });
          }
      });
  },
  
  // --- 封装的请求函数 ---

  // 请求后端解密手机号
  // 假设后端在处理手机号后，成功响应中至少包含 phoneNumber 和 openid
requestUserPhone(phoneCode) {
  return new Promise((resolve, reject) => {
      wx.request({
          url: `${apiHost}/users/get_user_phone/`,
          method: 'POST',
          data: { 
              code: phoneCode,
              login_code: this.data.tempLoginCode // 传入静默登录 code
          }, 
          success: res => {
              // 1. 检查 HTTP 状态码
              if (res.statusCode === 200) {
                  // 2. 检查关键数据：手机号
                  if (res.data && res.data.phoneNumber) {
                      
                      // *** 存储 OpenID (假设后端会在这里返回 openid) ***
                      if (res.data.openid) {
                           wx.setStorageSync('openid', res.data.openid);
                      }
                      
                      // 成功，将数据传递给 .then
                      resolve(res.data); 
                      
                  } else {
                      // 状态码 200，但缺少关键数据
                      console.error("手机号接口数据格式错误:", res.data);
                      reject(new Error("后端数据格式错误"));
                  }
              } else {
                  // HTTP 状态码非 200
                  reject(res);
              }
          },
          fail: reject // 网络请求失败
      });
  });
},
  
// 请求后端注册/更新用户信息，并获取最终 token
requestWechatLogin(userInfo) {
  const openid = wx.getStorageSync('openid'); // 从缓存中获取 OpenID

  if (!openid) {
      wx.showToast({ title: 'OpenID缺失，请重试', icon: 'error' });
      return;
  }

  wx.request({
      url: `${apiHost}/users/wechat_login/`,
      method: 'POST',
      data: {
          openid: openid, // 关键：使用 OpenID 绑定用户
          nickname: userInfo.nickName,
          avatar_url: userInfo.avatarUrl,
          code:this.data.tempLoginCode
      },
      success: backendRes => {
          
          
          // *** 最终的 Token 获取和存储 ***
          if (backendRes.data && backendRes.data.token) {
               wx.setStorageSync('token', backendRes.data.token);
               wx.setStorageSync('nickname', backendRes.data.user.nickname); 
               wx.showToast({ title: '登录成功', icon: 'success' });
               wx.switchTab({
                url: '/pages/index/index',
              })
          } else {
               wx.showToast({ title: '未能获取登录凭证', icon: 'error' });
          }
      },
      fail: err => {
          console.error("后端登录失败：", err);
          wx.showToast({ title: '同步信息失败', icon: 'error' });
      }
  });
}
});