import { goPage, showModal, toast, backPage } from '../../tool/tool.js'
import API from '../../api/index.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputValue: {
      machineNo: '',    // 设备编号
      user: '', // 用户名
      userKey: '' // 开发者密钥
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  // 绑定输入框
  bindInputValue(e) {
    console.log(e)
    const _this = this
    const type = parseInt(e.currentTarget.dataset.type) // 0: 设备编号  1: 用户名  2: 密钥
    const value = e.detail.value
    switch(type) {
      case 0:
        _this.setData({ ['inputValue.machineNo']: value })
        break;
      case 1:
        _this.setData({ ['inputValue.user']: value })
        break;
      case 2:
        _this.setData({ ['inputValue.userKey']: value })
        break;
    }
  },
  // 点击保存
  addPrintClick () {
    console.log(this.data)
    const { user, userKey, machineNo } = this.data.inputValue
    const _this = this
    console.log(!user, !userKey, !machineNo)
    // if(!user) return toast('请输入用户账号')
    // if(!userKey) return toast('请输入开发者密钥')
    if(!machineNo) return toast('请输入打印设备号码')
    wx.showLoading({ title: '保存中...' })
    const { supplierNo } = wx.getStorageSync('authorizeObj')
    API.addPrinters({
      data: { printerSn: machineNo, supplierNo },
      success(res) {
        console.log(res)
        if (res.code == 10000) {
          toast(res.message)
          _this.cachePrintNo(machineNo)
          backPage()
          backPage()
        } else {
          toast('添加失败')
        }
      },
      complete() { wx.hideLoading() }
    })
  },

  // 缓存打印设备号码
  cachePrintNo(printNo) {
    console.log(1000, printNo)
    let allPrint = wx.getStorageSync('allPrint') || []
    allPrint.unshift(printNo)
    console.log(allPrint)
    wx.setStorageSync({
      key: 'allPrint',
      data: allPrint
    })
    wx.setStorageSync('allPrint', allPrint)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})