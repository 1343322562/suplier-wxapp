import { toast, showModal } from '../../tool/tool.js'
import API from '../../api/index.js'
import { tim } from '../../utils/date-format.js'
const date = new Date()
const years = []
const months = []
const days = []

// 从 2019 年开始
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
    years,
    year: date.getFullYear(),
    months,
    month: 2,
    days,
    day: 2,
    value: [0, 0, 0, 0, 0, 0],
    selected: true,   // 弹出框切换
    saleTitleData: ['日期', '总金额', '现金支付', '线上支付', '对账状态'], // 数据表 title
    saleData: []       // 数据表 数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取单据查询数据
    this.getCheckData()
    // 获取时间选择器的默认选择时间，默认近一个月
    this.pickerDefalutDate()
  },
  // 获取时间选择器的默认选择时间，默认近一个月
  pickerDefalutDate() {
    let start = tim(30)
    const y = Number(start.slice(0, 4)),
          m = Number(start.slice(5, 7)),
          d = Number(start.slice(8))
    console.log(y,m,d)
  },
  // 时间级联框，改变时触发
  bindChange (e) {
    let oldValue = this.data.value
    console.log(e.detail.value)
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

    let years = this.data.years
    let months = this.data.months
    let days = this.data.days

    let startDate = years[value[0]] + '-' + months[value[1]] + '-' + days[value[2]]
    let endDate = years[value[3]] + '-' + months[value[4]] + '-' + days[value[5]]
    if (startDate > tim(0) || endDate > tim(0)) return showModal({ content: '搜索时间不应大于当前时间' })
    this.setData({ value })
  },
  // 查询对账数据请求
  getCheckData(startDate = tim(30), endDate = tim(0)) {
    console.log(startDate, endDate)
    wx.showLoading({ title: '请稍候..' })
    const _this = this
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    API.getCheckData({
      data: { platform, token, username, supplierNo, startDate, endDate},
      success (res) {
        console.log(res)
        _this.setData({ saleData: res.data })
        toast('查询成功')
      },
      complete (res) {
        wx.hideLoading()
      }
    })
  },

  // 关闭时间选择框
  close () {
    this.setData({
      selected: !this.data.selected
    })
  },

  come () {
    this.setData({
      selected: !this.data.selected
    })
    toast('修改成功')
  },

  // 显示时间级联框
  showSelectedTime () {
    this.setData({
      selected: true
    })
  },

  
  // 点击搜索
  seachSubmit () {
    let value = this.data.value
    let years = this.data.years

    if (years[value[0]] > years[value[3]]) return showModal({ content: '请选择正确的时间区间' })

    let months = this.data.months
    let days = this.data.days

    let startDate = years[value[0]] + '-' + months[value[1]] + '-' + days[value[2]]
    let endDate = years[value[3]] + '-' + months[value[4]] + '-' + days[value[5]]
    console.log(startDate, endDate)
    console.log(years, value)
    this.getCheckData(startDate, endDate)
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