import API from '../../api/index.js'
import { goPage, showModal, toast } from '../../tool/tool.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resData: '暂无数据',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let resData = JSON.parse(options.data)
    this.setData({ resData })
  },

  closeOrder() {
    const resData = this.data.resData   
    const sheetNo = resData.sheetNo             // 单号
    const onlinePayway = resData.onlinePayway   // 支付方式
    const outTradeNo = resData.outTradeNo       // 支付请求订单号
    let json = { sheetNo, onlinePayway, outTradeNo }
    json = JSON.stringify(json)
    const _this = this
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    const { routeSendMan } = wx.getStorageSync('routeSendMan')
    API.closeQrPay({
      data: { platform, token, username, supplierNo, sheetNo, routeSendMan, json },
      success(res) {
        console.log(res)
        toast('订单已关闭')
        goPage('../driverTransStatu/driverTransStatu') 
      },
      error(res) {
        console.log(res)
      }
    })
  },
  // 查询订单
  searchOrderClick () {
    const _this = this
    const resData = this.data.resData
    const onlinePayway = resData.onlinePayway   // 支付方式
    const outTradeNo = resData.outTradeNo       // 支付请求订单号
    const routeSendMan = wx.getStorageSync('routeSendMan')
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    let json = { onlinePayway, outTradeNo }
    json = JSON.stringify(json)
    console.log(platform, token, username, supplierNo, routeSendMan, json)
    API.queryQrPay({
      data: { platform, token, username: routeSendMan, supplierNo, routeSendMan, json},
      success(res) {
        console.log(res)
        wx.showModal({
          showCancel: false,
          title: '提示',
          content: res.data.massge,
          confirmText: '确认',
          success(e){
            wx.redirectTo({
              url: '../driverTransStatu/driverTransStatu',
            })
          },
          fail(res) {
            console.log(res)
          }
        })
      }
    })
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
    this.closeOrder()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.closeOrder()
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