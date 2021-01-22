import { goPage, showModal, toast, backPage } from '../../tool/tool.js'
import { printContentHandle } from '../../tool/print.js'
import API from '../../api/index.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    authorizeObj: {},
    supplyFlag: '',       // 当前订单状态
    sheetNo: '',
    bounding: {},         // 胶囊信息
    detailData: {},       // 详细数据
    isShowEnterCarDialog: true, // 是否显示装车 Dialog
    driverArr: [],        // 司机信息
    isShowSelectDialog: false, // 显示选择打印设备 Dialog 
    printList: [],        // 打印设备列表
    isShowGoodDetailDialog: false,  // 是否显示 商品详情
    currentGoodIndex: ''  // 当前商品 index
  },
  // 隐藏商品 Dialog
  hideDlalogClick () {
    this.setData({ isShowGoodDetailDialog: false })
  },
  // 显示商品详情 Dialog
  showGoodDetailCardClick (e) {
    console.log('showGoodDetailCardClick', e)
    let currentGoodIndex = e.currentTarget.dataset.currentindex
    this.setData({ currentGoodIndex, isShowGoodDetailDialog: true })
  },

  // 复制单号
  copySheetNoClick: function (e) {
    console.log(e)
    wx.setClipboardData({
      data: e.currentTarget.dataset.sheetno,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
          }
        })
      }
    })
  },
  // 打印拣货单
  print (e) {
    this.setData({ isShowSelectDialog: true })
    // this.printOrder(detailData, type)
  },

  // 打印订单
  printOrder(data, type, printNo) {
    console.log(data)
    const _this = this
    const printContent = printContentHandle(data, type)
    console.log('printContent', printContent)
    // 打印请求
    const { platform, token, username, supplierNo, synCode } = wx.getStorageSync('authorizeObj')
    API.print({
      data: { platform, token, username, supplierNo ,printContent, printerSn: printNo, synCode },
      success(res) {
        console.log(res)
        toast(res.message || res.msg)
        if (res.code == '10000') _this.updateSheetStatus(1, _this.data.sheetNo)
      }
    })
  }, 

  // 拨打电话
  callPhoneClick () {
    wx.makePhoneCall({ phoneNumber: 12345674 })
  },
  // 装车

  entetCarClick(e) {
    let type = e.target.dataset.type  // 1. 装车
    if (type == 0) return this.setData({ isShowEnterCarDialog: false })
    let driverArr = this.data.driverArr
    let detailData = this.data.detailData
    let sheetNo = detailData.sheetNo  // 单号
    let routeMan       // 司机电话
    driverArr.forEach((item, i) => {
      if (item.selected == 1) return routeMan = item.mobile
    })
    if (!routeMan) return showModal({ content: '请选择正确的配送司机'})

    this.sheetEntrucking(sheetNo, routeMan)
  },

  // 选择司机使事件
  selectDriver(e) {
    console.log(e)
    let index = e.target.dataset.index
    let driverArr = this.data.driverArr
    driverArr.forEach((item, i) => {
      driverArr[i].selected = 0
    })
    driverArr[index].selected = 1
    this.setData({ driverArr })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.data)
    wx.showLoading({ title: '请稍候..' })
    let data = JSON.parse(decodeURIComponent(options.data))
    console.log(data)
    this.data.sheetNo = data.sheetNo
    console.log(data)
    // 更新订单状态(已查看)
    if (data.supplyFlag == 1) this.updateSheetStatus(0, data.sheetNo)
    // 获取员工（司机）
    if (data.supplyFlag == 3) this.getSupplierEmployment()
    // 获取胶囊信息
    const APP = getApp().globalData
    this.setData({
      bounding: APP.bounding
    })
    // 获取当前订单状态
    let { supplyFlag } = data
    console.log(options)
    this.setData({ supplyFlag, printList: wx.getStorageSync('allPrint'), authorizeObj: wx.getStorageSync('authorizeObj') })
    // 获取订单详情
    this.getOrderDetail(data.sheetNo)
  },

  // 显示选择 打印机 Dialog
  showSelectPrint () {
    const printList = wx.getStorageSync('allPrint')
    this.setData({ printList })
    if (!printList) return toast('请添加打印设备')
    this.setData({ isShowSelectDialog: true })
  },

  // 选择完设备，并打印
  selectPrintEvent(e) {
    console.log('dayin')
    const { printNo } = e.detail
    let detailData = [this.data.detailData]
    this.printOrder(detailData, 1, printNo)
  },

  // 装车请求
  sheetEntrucking(sheetNo, routeMan) {
    const _this = this
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    console.log('装车参数,', sheetNo, routeMan)
    API.sheetEntrucking({
      data: { platform, token, username, supplierNo, sheetNo, routeMan },
      success(res) {
        console.log(res)
        _this.setData({ isShowEnterCarDialog: false })
        if (res.code == 0) toast('装车成功')
        setTimeout(() => { wx.redirectTo({ url: '../orderStatu/orderStatu?nav=' + 2 })}, 500)
        
      }
    })
  },
  // 不打印，直接出库
  warehouseOut () {
    let sheetNo = this.data.detailData['sheetNo']
    this.updateSheetStatus(1, sheetNo)
  },

  // 司机请求
  getSupplierEmployment() {
    const _this = this
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    API.getSupplierEmployment({
      data: { platform, token, username, supplierNo, duty: 2 },
      success(res) {
        console.log(res)
        let data = res.data
        let driverArr = []
        data.forEach(item => {
          if (item.enabled == 1 && item.duty == 2) driverArr.push(item)
        })
        _this.setData({ driverArr })
      }
    })
  },
  // 改变订单状态请求
  updateSheetStatus(printFlag, sheetNo, _this = this) {
    if (printFlag == 1) wx.showLoading({ title: '出库中' })
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    API.updateSheetStatus({
      data: { platform, token, username, supplierNo, sheetNo, printFlag},
      success(res) {
        if (res.code == 0 && printFlag == 1) {
          toast()
          backPage()
        }
        console.log(res)
      },
      complete () {
        setTimeout(() => { wx.hideLoading() }, 500)
      }
    })
  },
  // 获取订单详情
  getOrderDetail (sheetNo) {
    const _this = this
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    API.searchOrderDetailData({
      data: { sheetNo, platform, token, username, supplierNo },
      success(res) {
        console.log(res)
        _this.setData({ detailData: res.data[0] })
      },
      complete(){
        wx.hideLoading()
      }
    })
  },
  makeCar(){
    if (!this.data.driverArr.length) return toast('暂无司机信息')
    this.setData({ isShowEnterCarDialog: true })
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