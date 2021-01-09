import { goPage, showModal, toast, backPage } from '../../tool/tool.js'
import API from '../../api/index.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowDialog: false,
    allPrint: [],
    inputValue: {
      machineNo: '',    // 设备编号
      machineName: ''   // 设备名称
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.findPrinter()
  },
  // 查询打印设备
  findPrinter() {
    const { supplierNo } = wx.getStorageSync('authorizeObj')
    const _this = this
    API.findPrinter({
      data: { supplierNo },
      success(res) {
        const data = res.data
        wx.setStorage({ key: 'allPrint', data: data })
        _this.setData({ allPrint: data })
      }
    })
  },
  // 删除设备
  delPrintNoClick(e) {
    const { index } = e.currentTarget.dataset
    const { allPrint } = this.data
    const _this = this
    showModal({
      content: `确认删除此设备 ? 设备号 【${allPrint[index].printerSn}】`,
      success() {
        _this.delPrinters(allPrint[index].printerSn, index)
      }
    })
  },
  delPrinters(printerSn, index) {
    const { supplierNo } = wx.getStorageSync('authorizeObj')
    const _this = this
    const { allPrint } = _this.data
    API.delPrinters({
      data: { supplierNo, printerSn },
      success(res) {
        console.log(res)
        if (res.code === "10000") {
          toast(res.message)
          allPrint.splice(index, 1)
          _this.setData({ allPrint })
          wx.setStorage({ key: 'allPrint', data: allPrint })
        } else {
          toast(res.message)
        }
      }
    })
  },
  // 隐藏框
  hideDialog() { this.setData({ isShowDialog: false }) },
  // 显示添加设备框
  showAddPrintDialog() { this.setData({ isShowDialog: true }) },
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
        _this.setData({ ['inputValue.machineName']: value })
        break;
    }
  },
  // 点击保存
  addPrintClick () {
    console.log(this.data)
    const { machineName, machineNo } = this.data.inputValue
    const { allPrint } = this.data
    const _this = this
    if(!machineNo) return toast('请输入打印设备号码')
    wx.showLoading({ title: '保存中...' })
    const { supplierNo } = wx.getStorageSync('authorizeObj')
    API.addPrinters({
      data: { printerSn: machineNo, supplierNo, printerName: machineName },
      success(res) {
        console.log(res)
        if (res.code == 10000) {
          toast(res.message)
          allPrint.push({ printerName: machineName, printerSn: machineNo})
          wx.setStorage({ key: 'allPrint', data: allPrint })
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