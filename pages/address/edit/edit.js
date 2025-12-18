const app = getApp()
const apiHost = app.globalData.apiHost
const openid = app.globalData.openid || wx.getStorageSync('openid')

Page({
  data: {
    address_id: null,
    receiver_name: "",
    phone: "",
    detail: "",
    isEdit: false,
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ isEdit: true, address_id: options.id })
      this.loadAddress(options.id)
    }
  },

  // 读取地址详情（编辑模式）
  loadAddress(id) {
    wx.request({
      url: `${apiHost}/users/address/detail/${id}/`,
      method: "GET",
      success: (res) => {
        this.setData({
          receiver_name: res.data.receiver_name,
          phone: wx.getStorageSync('phoneNumber'),
          detail: res.data.detail,
        })
      }
    })
  },

  // 输入框绑定
  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [field]: e.detail.value })
  },
  onNameInput(e) {
    this.setData({
      receiver_name: e.detail.value
    })
  },
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  onDetailInput(e) {
    this.setData({
      detail: e.detail.value
    })
  },

  // 校验方法
  validate() {
    const { receiver_name, phone, detail } = this.data

    // 校验姓名
    if (!/^[\u4e00-\u9fa5]{2,8}$/.test(receiver_name)) {
      wx.showToast({ title: "姓名需为中文", icon: "none" })
      return false
    }

    // 校验手机号
    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: "手机号格式错误", icon: "none" })
      return false
    }

    // 校验详细地址
    if (detail.length < 5) {
      wx.showToast({ title: "请填写详细地址", icon: "none" })
      return false
    }

    return true
  },

  // 保存地址
  saveAddress() {
    if (!this.validate()) return

    const { receiver_name, phone, detail, address_id } = this.data

    const data = {
      receiver_name,
      phone,
      detail
    }

    if (this.data.isEdit) {
      // 修改地址
      wx.request({
        url: `${apiHost}/users/address/detail/${address_id}/`,
        method: "PUT",
        data,
        success: () => {
          wx.showToast({ title: "修改成功" })
          setTimeout(() => wx.navigateBack(), 500)
        }
      })
    } else {
      // 新增地址
      wx.request({
        url: `${apiHost}/users/address/${openid}/`,
        method: "POST",
        data,
        success: () => {
          wx.showToast({ title: "添加成功" })
          setTimeout(() => wx.navigateBack(), 500)
        }
      })
    }
  }
})
