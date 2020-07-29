import { goPage, showModal, toast } from '../../tool/tool.js'

import { tim } from '../../utils/date-format.js'
import API from '../../api/index.js'

const date = new Date()
const years = []
const months = []
const days = []

// 从 2020 年开始
for (let i = 2019; i <= date.getFullYear(); i++) {
  years.push(i)
}

for (let i = 1; i <= 12; i++) {
  if (i < 10) {
    i = '0' + i
  }
  months.push(i)
}

for (let i = 1; i <= 31; i++) {
  if (i < 10) {
    i = '0' + i
  }
  days.push(i)
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedNav: 0,         // 导航栏当前选中项
    isAllSelected: false,     // 全选
    printDialog: false,
    years,
    year: date.getFullYear(),
    months,
    month: 2,
    days,
    day: 2,
    value: [0, 2, 2, 2, 2, 2],
    isDaytime: true,
    selected: false,     // 弹出框切换
    saleTitleData: [], // 数据表 title
    saleData: [],      // 数据表 数据
    orderNum: [{supplyFlag:"1",supplierNo:"2019052501",totalOrder:1}], // 订单前三天内订单状态数量
    orderData: [],
    isShowEnterCarDialog: false,
    driverArr: [], // 司机信息
    // 新订单结算信息
    newOrderInfo: [0,0,0],
    // 待装车结算信息
    waitCarInfo: [0,0,0],
    // 已装车结算信息
    comeCarInfo: [0,0],
    // 已完成结算信息
    successCarInfo: [0,0],
    searchValue: ''  // 搜索框的值
  },
  // 搜索框 value 绑定
  inputBindValueClick (e) {
    console.log(e)
    let value = e.detail.value
    this.setData({ searchValue: value })
  },
  // 点击搜索订单
  searchOrder () {
    let selectedNav = this.data.selectedNav
    // this.searchOrderStatusData()
  },
  // 时间级联框，改变时触发
  bindChange(e) {
    console.log(e.detail.value)
    let oldValue = this.data.value
    let value = e.detail.value
    // 月份联动 （最多31天）
    if (oldValue[1] != value[1] && value[1] != value[4]) {
      value[4] = value[1] + 1
      if (value[2] < value[5]) value[5] = value[2]
    } else if (oldValue[4] != value[4] && value[1] != value[4]) {
      value[1] = value[4] - 1
      if (value[2] < value[5]) value[2] = value[5]
    }

    // 日期联动 (最多31天)
    if (oldValue[2] != value[2] && oldValue[1] != value[4] && value[2] < value[5]) {
      value[5] = value[2]
    } else if (oldValue[5] != value[5] && oldValue[1] != value[4] && value[2] < value[5]) {
      value[2] = value[5]
    }

    this.setData({ value })
  },
  // 选择 item Checkbox
  myCheckbox(checkbox, index) {
    console.log(Number(checkbox), index, checkbox)
    let orderData = this.data.orderData
    console.log(orderData, index)
    let isAllSelected = true
    orderData.forEach((item, i) => {
      if (i == index) {
        orderData[index].checkbox = Number(checkbox)
        console.log(orderData[i])
      } 
      if (orderData[i].checkbox == 0) {
        isAllSelected = false
        console.log('asdasdads')
      }
    })
    this.resOrPrint(orderData, this, isAllSelected)
    // this.setData({ isAllSelected })
  },
  // 关闭时间选择框
  close(e) {
    console.log(e)
    this.setData({
      selected: !this.data.selected
    })
  },

  // 跳转订单详情页
  toGoodDetailClick (e) {
    let index = e.target.dataset.index
    let orderData = this.data.orderData
    let data = JSON.stringify(orderData[index])
    goPage('../orderDetail/orderDetail?data=' + data) // 0: 新订单 1: 待装车 2: 已装车 3.....
  },
// 装车
  entetCarClick (e) {
    
    let type = e.target.dataset.type  // 1. 装车
    let driverArr = this.data.driverArr
    let orderData = this.data.orderData

    if (type == 0) return this.setData({ isShowEnterCarDialog: false, driverArr  })
    let sheetNo = ''  // 单号
    let routeMan      // 司机电话
    driverArr.forEach((item, i) => {
      if (item.selected == 1) return routeMan = item.mobile
    })

    if (!routeMan) return showModal({ content: '请选择正确的配送司机'})
    orderData.forEach((item, i) => {
      if (item.supplyFlag == 3 && item.checkbox == 1) {
        if (sheetNo == '') {
          sheetNo = item.sheetNo
        } else {
          sheetNo = sheetNo + ',' + item.sheetNo
        }
      }
    })

    this.sheetEntrucking(sheetNo, routeMan)
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
        _this.setData({ isShowEnterCarDialog: false})
        if(res.code == 0) toast('装车成功')
        _this.searchOrderStatusData(platform, token, username, supplierNo)
      }
    })
  },
  come() {
    
    let value = this.data.value
    if (value[0] < value[3] && (value[1] < 11 || value[4] > 0)) return showModal({ content: '日期区间因在1个月之内' })
    this.setData({
      selected: !this.data.selected
    })
  },
  // 撤销装车
  backCar(e) {
    let index = e.target.dataset.index
    let orderData = this.data.orderData
    let sheetNo = orderData[index].sheetNo
    this.cancelEntrucking(sheetNo)
  },
// 撤销装车请求
  cancelEntrucking(sheetNo) {
    const _this = this
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    API.cancelEntrucking({
      data: { platform, token, username, supplierNo, sheetNo },
      success(res){
        console.log(res)
        if (res.code == 0) toast('撤销成功')
        _this.searchOrderStatusData(platform, token, username, supplierNo)
      }
    })
  },

  // 显示时间级联框
  showSelectedTime() {
    this.setData({
      selected: true
    })
  },
  // 显示司机 Dialog 并请求司机信息
  showEnterCarDialog () {
    let orderData = this.data.orderData
    let isShow = false
    orderData.forEach((item, i) => {
      if (item.supplyFlag == 3 && item.checkbox == 1) isShow = true 
    })
    if (!isShow) return showModal({content: '请选择需要装车的订单'})
    this.getSupplierEmployment()
    this.setData({ isShowEnterCarDialog: true })
  },
  // 选择司机
  selectDriver(e) {
    console.log(e)
    let index = e.target.dataset.index
    let driverArr = this.data.driverArr
    console.log(driverArr)
    driverArr.forEach((item,i) => {
      if (i != index) {
        driverArr[i].selected = 0
      }
    })
    if (driverArr[index].selected == 0 || !('selected' in driverArr[index])) {
      driverArr[index].selected = 1
    } else if (driverArr[index].selected == 1) {
      driverArr[index].selected = 0
    }
    this.setData({ driverArr })
  },

  // 点击搜索
  seachSubmit() {
    let orderData = this.data.orderData
    if (orderData.length != 0) this.setData({ orderData: [] })
    
    let { days, months, years, value} = this.data
    if (value[0] < value[3] && (value[1] < 11 || value[4] > 0)) return showModal({ content: '日期区间因在1个月之内' })

    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    let startDate = years[value[0]] + '-' + months[value[1]] + '-' + days[value[2]]
    let endDate = years[value[3]] + '-' + months[value[4]] + '-' + days[value[5]]
    console.log(startDate,endDate)
    if (
      value[0] > value[3] 
      || (value[0] == value[3] && value[1] > value[4])
      || (value[0] == value[3] && value[1] == value[4] && value[2] > value[5])
    ){
      showModal({
        title: '提示',
        content: '结束日期不能小于开始日期'
      })
      return
    }
    wx.showLoading()
    setTimeout(() => this.searchOrderStatusData(platform, token, username, supplierNo ,startDate, endDate, 1))
    setTimeout(() => wx.hideLoading())
  },



  // 导航栏选择事件，传递给子组件
  selectNav(e) {
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    if (this.data.selectedNav == 3) this.searchOrderStatusData(platform, token, username, supplierNo)
    this.allSelected(true)  // 切换导航栏，使订单都为未选择状态
    console.log(e, this)
    let index = e.detail.index
    this.setData({ selectedNav: index, isAllSelected: false })
    this.resOrPrint(this.data.orderData)
  },

  // 是否全选
  allSelected(e , orderDatas) {
    console.log(e)
    console.log('全选')
    console.log('asd', e, typeof(e))
    let isAllSelected = (e || this.data.isAllSelected) ? false : true
    if (typeof (e) == 'object') isAllSelected = !this.data.isAllSelected
    console.log(isAllSelected)
    let orderData = orderDatas || this.data.orderData
    orderData.forEach((item, i) => {
      if (isAllSelected == false) {
        orderData[i].checkbox = 0
      } else if (isAllSelected == true) {
        orderData[i].checkbox = 1
      }
    })
    console.log(orderData)
    this.resOrPrint(orderData, this, isAllSelected)
    // this.setData({ isAllSelected, orderData })
  },

  // 显示拣货单 Dialog
  showPrintDialog () {
    this.setData({ printDialog: true })
  },

  // 新订单结算数据
  newOrderResInfo() {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    options.nav != 3 && wx.showLoading({ title: '请稍候..' })
    console.log(options)
    let selectedNav = options.nav
    this.setData({ selectedNav })
  },
  
  onShow: function (e) {
    console.log(1)
    if (this.data.selectedNav == 3) return
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    this.searchOrderStatusData(platform, token, username, supplierNo)
    
    setTimeout(() => { wx.hideLoading() }, 1500)
  },

  // 请求新订单
  searchSaleData(platform, token, username, supplierNo) {
    API.searchSaleData({
      data: {platform, token, username, supplierNo},
      success: function(res) {
        console.log(res)
      }
    })
  },
  // 点击搜索，搜索订单
  
  // 根据状态请求订单
  searchOrderStatusData(platform, token, username, supplierNo, startDate = tim(7), endDate = tim(0), search) {
    console.log(startDate, endDate)
    const _this = this
    console.log(supplierNo, arguments)
    let searchs = arguments[arguments.length - 1]
    API.searchOrderStatusData({
      data:{ 
        supplierNo,
        startDate,
        endDate,
        // supplyFlag: '5',
        // routeSendMan
        // payWay
        // tmsPayFlag
        platform,
        token,
        username
      },
      success(res) {
        console.log(res, supplierNo ,arguments)
        if (searchs == 1) toast('查询成功') // 配送完成时 按时间 的订单信息查询
        let orderData = res.data
        orderData.forEach((item, i) => {
          orderData[i].createDate = orderData[i].createDate.slice(0, 19)
          if (orderData[i].supplyFlag != 1) {
            orderData.push(item)
            orderData.splice(i, 1)
          }
        })
        
        _this.allSelected(true ,orderData)   // 每个 item 添加 checkbox ，进入页面就全选
        // _this.resOrPrint(orderData, _this)
      }
    })
  },

  // 打印结算区域
  resOrPrint(orderData, _this = this, isAllSelected = false) {
    let [order, allAmt, allSheetQty] = [0,0,0]     // 新订单
    let [worder, wallAmt, wallSheetQty] = [0,0,0]  // 待装车
    let [corder, callAmt] = [0,0,0]                // 配送中
    let [sorder, sallAmt] = [0,0,0]                // 已完成
    const selectedNav = this.data.selectedNav
    orderData.forEach((item, i) => {
      // console.log(item.checkbox, item)
      if (!('checkbox' in item)) orderData[i].checkbox = 0    // 检查有无 checkbox 控件字段
      orderData[i].createDate = orderData[i].createDate.slice(0, 19)
      // 订单结算区域计算
      if (selectedNav == 0 && item.supplyFlag == 1 || item.supplyFlag == 2) { 
        if (item.checkbox == 0) return
        order++; allSheetQty = allSheetQty + Number(item.sheetQty); allAmt = Number(allAmt) + Number(item.sheetAmt)
      }
      if (selectedNav == 1 && item.supplyFlag == 3) {  
        if (item.checkbox == 0) return
        worder++; wallSheetQty = wallSheetQty + Number(item.sheetQty); wallAmt = Number(wallAmt) + Number(item.sheetAmt)
      }
      // 已装车和待装车不用判断是否选中
      // console.log(selectedNav == 2 && item.supplyFlag == 31)
      if (selectedNav == 2 && item.supplyFlag == 31) {
        corder++; callAmt = Number(callAmt) + Number(item.sheetAmt)
      }
      if (selectedNav == 3 && (item.supplyFlag == 4 || item.supplyFlag == 5)) {
        sorder++; sallAmt = Number(sallAmt) + Number(item.sheetAmt)
      }
    })
    _this.setData({
      isAllSelected,
      orderData,
      newOrderInfo: [order, Number(allAmt).toFixed(2), allSheetQty],
      waitCarInfo: [worder, Number(wallAmt).toFixed(2), wallSheetQty],
      comeCarInfo: [corder, Number(callAmt).toFixed(2)],
      successCarInfo: [sorder, Number(sallAmt).toFixed(2)]
    })
  },
  // 出库
  updateSheetStatus(sheetNo, _this = this) {
    wx.showLoading()
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    console.log(platform, token, username, supplierNo, sheetNo)
    API.updateSheetStatus({
      data: { platform, token, username, supplierNo, sheetNo, printFlag: 1 },
      success(res) {
        if (res.code == 0) toast('更新状态成功')
        console.log(res)
        const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
        _this.searchOrderStatusData(platform, token, username, supplierNo)
      },
      complete() {
        setTimeout(() => { wx.hideLoading() }, 500)
      }
    })
  },


  // 打印单据 ,跳转链接蓝牙页面(或出库)
  print (e) {
    console.log(e)
    let type = e.target.dataset.type  // 0: 打印 1：不打印，直接出库
    // let res = e.target.dataset.res
    let orderData = this.data.orderData
    let sheetNo = ''  // 请求单号
    orderData.forEach((item,i) => {
      if ((item.supplyFlag == 1 || item.supplyFlag == 2) && item.checkbox == 1) { // 新订单被选中时
        if (sheetNo == '') {
          sheetNo = item.sheetNo 
        } else {
          sheetNo = sheetNo + ',' + item.sheetNo
        }
      }
    })
    if (sheetNo == '') return showModal({ content: '请选择单据' }) 
    console.log(sheetNo, type)
    if (type == 1) return this.updateSheetStatus(sheetNo) // 直接出库

    this.searchOrderDetailData(sheetNo) // 请求单据详情，并跳转蓝牙打印页
    // if (res == 0) {
    //   this.setData({ printDialog: false })
    // } else if (res == 1) {
    //   console.log('打印')
    //   this.setData({ printDialog: false })
    // }
  },
  // 查询订单详情
  searchOrderDetailData(sheetNo) {
    const _this = this
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj') 
    API.searchOrderDetailData({
      data: { platform, token, username, supplierNo, sheetNo },
      success (res) {
        console.log(res)
        let data = JSON.stringify(res.data)
        
        goPage('../booth/booth?data=' + data)
      } 
    })
  },
  // 请求司机信息
  getSupplierEmployment(){
    const _this = this
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    API.getSupplierEmployment({
      data: { platform, token, username, supplierNo, duty: 2 },
      success (res) {
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */


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
    wx.showLoading({ title: '刷新中....' })
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    this.searchOrderStatusData(platform, token, username, supplierNo)
    setTimeout(() => { wx.hideLoading() }, 1000)
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