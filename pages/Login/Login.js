const app = getApp()
const apiHost = app.globalData.apiHost
Page({
  data: {
    needPrivacyAuth: true,
    showProfileModal: false,
    tempLoginCode: null
  },
  openPrivacy() {
    wx.openPrivacyContract({
      fail: () => {
        wx.showToast({
          title: '暂时无法打开隐私指引',
          icon: 'none'
        })
      }
    })
  },
  onLoad() {
    wx.getPrivacySetting({
      success: res => {
        if (res.needAuthorization) {
          this.setData({ needPrivacyAuth: true })
        } else {
          this.setData({ needPrivacyAuth: false })
          this.silentLogin()
        }
      }
    })
  },
  onAgreePrivacy() {
    this.setData({ needPrivacyAuth: false })
    this.silentLogin()
  },
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
  handleGetPhoneNumber(e) {
    if (e.detail.errMsg === "getPhoneNumber:ok") {
      const phoneCode = e.detail.code;
      this.requestUserPhone(phoneCode)
        .then(res => {

          wx.setStorageSync('phoneNumber', res.phoneNumber)
          this.setData({
            showProfileModal: true
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

  handleGetProfileTap() {
    this.setData({ showProfileModal: false });

    wx.getUserProfile({
      desc: '用于完善会员资料和登录',
      success: profileRes => {

        const userInfo = profileRes.userInfo;

        this.requestWechatLogin(userInfo);
      },
      fail: err => {
        console.error("获取头像昵称失败：", err);
        wx.showToast({ title: '授权头像失败', icon: 'error' });
      }
    });
  },

  requestUserPhone(phoneCode) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${apiHost}/users/get_user_phone/`,
        method: 'POST',
        data: {
          code: phoneCode,
          login_code: this.data.tempLoginCode
        },
        success: res => {
          if (res.statusCode === 200) {
            if (res.data && res.data.phoneNumber) {
              if (res.data.openid) {
                wx.setStorageSync('openid', res.data.openid);
              }
              resolve(res.data);

            } else {
              console.error("手机号接口数据格式错误:", res.data);
              reject(new Error("后端数据格式错误"));
            }
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },

  requestWechatLogin(userInfo) {
    const openid = wx.getStorageSync('openid');

    if (!openid) {
      wx.showToast({ title: 'OpenID缺失，请重试', icon: 'error' });
      return;
    }

    wx.request({
      url: `${apiHost}/users/wechat_login/`,
      method: 'POST',
      data: {
        openid: openid,
        nickname: userInfo.nickName,
        avatar_url: userInfo.avatarUrl,
        code: this.data.tempLoginCode
      },
      success: backendRes => {

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