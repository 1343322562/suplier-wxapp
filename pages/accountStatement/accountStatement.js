import { goPage, showModal, toast } from '../../tool/tool.js'
import API from '../../api/index.js'

import { tim } from '../../utils/date-format.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedNav: 0,   // 导航栏当前选中项
    orderData: [],      // 订单信息
    receivedData: [     // 收款信息
      { title: '交款时间', content:'06-05 08:23' },
      { title: '司机', content:'张三丰' },
      { title: '应收金额', content:'￥20000' },
      { title: '单据金额', content:'￥19000' },
      { title: '差异金额', content: '￥-1000' },
      { title: '差异原因', content: '差异的原因~~~' }
    ],
    resBottom: [0, 0]  //结算区域信息
  },
// 点击确认收款
  confirmCollectionClick (e) {
    const _this = this
    showModal({
      title: '提示',
      content: '是否确认收款',
      success () {
        let sheetNo = e.currentTarget.dataset.sheetno
        _this.collectionOrder(sheetNo)
      }
    })
  },
// 确认收款请求
  collectionOrder(sheetNo) {
    const _this = this
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    API.collectionOrder({
      data: { sheetNo, platform, token, username, supplierNo },
      success (res) {
        console.log(res)
        if (res.code == 0) toast('收款成功')
        _this.searchOrderByCollectionFlag(1) // 再次刷新已收款数据
      }
    })
  },
// 导航栏选择事件，传递给子组件
  selectNav (e) {
    console.log(e)
    let index = 'detail' in e ? e.detail.index : e
    this.setData({
      selectedNav: index
    })

    // 查询对应data
    if (index == 1) this.searchOrderByCollectionFlag(0)
    if (index == 2) this.searchOrderByCollectionFlag(1)


    // 计算对应结算信息
    if (index == 0 || index == 3) this.resBottom(this.data.orderData)
    if (index == 1 || index == 2) this.resBottom(this.data.receivedData)
  },
  // 跳转单据查询页
  toAccountSeachClick () {
    goPage('../accountSeach/accountSeach')
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({ title: '请稍候..' })
    this.searchOrderStatusData()
  },
  // 查询订单（未交款，在线支付）
  searchOrderStatusData(startDate = tim(7), endDate = tim(0)) {
    const _this = this
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    API.searchOrderStatusData({
      data: { platform, token, username, supplierNo, startDate, endDate },
      success (res) {
        console.log(res)
        let orderData = res.data
        orderData.forEach((item, i) => {
          orderData[i].createDate = orderData[i].createDate.slice(0, 19)
        })
        _this.setData({ orderData })
        // 计算结算信息
        _this.resBottom(orderData)
        wx.hideLoading()
      }
    })
  },
  // 查询收款信息（待收款、已交款）
  searchOrderByCollectionFlag(tmsCollectionFlag, startDate = tim(7), endDate = tim(0)) {
    const _this = this
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    console.log('platform:', platform, 'token:', token, 'username:', username, 'supplierNo:', supplierNo, 'tmsCollectionFlag:', tmsCollectionFlag, 'startDate:', startDate,'endDate:', endDate)
    API.searchOrderByCollectionFlag({
      data: { platform, token, username, supplierNo, startDate, endDate, tmsCollectionFlag },
      success(res) {
        console.log(res)
        let receivedData = res.data
        _this.setData({ receivedData })
        // 计算结算信息
        _this.resBottom(receivedData)
      }
    })
  },
  // 底边栏结算区域
  resBottom (data) {
    console.log(data, 'resBottom')
    let selectedNav = this.data.selectedNav
    let sheetAmt = 0   // 总单据金额
    let sheetNum = 0   // 总单据数量
    data.forEach((item, i) => {
      // 未交款 和 在线支付
      if (  
        'sheetAmt' in item 
        && ((selectedNav == 0 && item.acctFlag == 0) || (selectedNav == 3 && (item.payWay != null && item.payWay != 'XJ'))) 
      ) {
        sheetNum++
        sheetAmt = sheetAmt + item.sheetAmt
      }

      // 待收款 和 已交款
      if (
        'shouldAmt' in item
        && ((selectedNav == 1 && item.tmsCollectFlag == 0) || (selectedNav == 2 && item.tmsCollectFlag == 1))
      ) {
        sheetNum++
        sheetAmt = sheetAmt + item.sheetAmt
      }
      console.log(sheetAmt)
      this.setData({ resBottom: [sheetNum, sheetAmt.toFixed(2)] })
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