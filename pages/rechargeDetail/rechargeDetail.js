import API from '../../api/index.js'
import { goPage, showModal, toast, backPage } from '../../tool/tool.js'
import { tim } from '../../utils/date-format.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    settleData: [],                 // 消费详情
    isShowGoodsDetailDialog: false, 
    goodsList: [],     // 商品列表
    currentSettleObj: {},
    operDate: '' // 消费日期
  },
  showGoodDetail(e) {
    let sheetNo = e.currentTarget.dataset.sheetno
    this.setData({ isShowGoodsDetailDialog: true })
    this.getSettleFlow(sheetNo)
  },
  // 获取消费详情
  getSettleDetail(operDate) {
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    const _this = this
    API.settleDetail({
      data: { platform, token, username, supplierNo, operDate: operDate || tim(0) },
      success(res) {
        console.log(res)
        let settleData = res.data
        // settleData = settleData.slice(0, 20)
        if (!settleData.length) toast('暂无详情数据')
        _this.setData({ settleData })
      }
    })
  },
  hideGoodsDialog() {
    this.setData({ isShowGoodsDetailDialog: false, goodsList: [] })
  },

  // 查询商品详情
  getSettleFlow(sheetNo) {
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    const _this = this
    API.settleFlow({
      data: { platform, token, username, supplierNo, sheetNo: sheetNo },
      success(res) {
        console.log(res)
        _this.setData({ goodsList: res.data })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    const operDate = options.operDate || tim(0)
    this.setData({ operDate })
    this.getSettleDetail(operDate) // 获取消费详情
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