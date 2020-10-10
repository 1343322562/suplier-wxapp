import { toast, showModal } from '../../tool/tool.js'
import API from '../../api/index.js'
import { FetchDateLastMonth } from '../../utils/date-format.js'
import util from '../../utils/util.js' 

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
    years,
    year: date.getFullYear(),
    months,
    month: 2,
    days,
    day: 2,
    value: [0, 2, 2, 0, 2, 2],
    isDaytime: true,
    selected: true,   // 弹出框切换
    saleTitleData: ['日期', '营业额(元)', '销售订单数', '销售件数'], // 数据表 title
    saleTableData: []       // 数据表 数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  // 销售数据渲染条件
  seachSaleData() {
    const _this = this
    let { days, months, years, value} = this.data
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    console.log(years)
    let startDate = years[value[0]] + '-' + months[value[1]] + '-' + days[value[2]]
    let endDate = years[value[3]] + '-' + months[value[4]] + '-' + days[value[5]]

    console.log(startDate, endDate)

    API.searchSaleData({
      data: {
        supplierNo,
        startDate,
        endDate,
        platform,
        token,
        username
      },
      success(res) {
        console.log(res)
        _this.setData({ saleTableData: res.data })
      },
      complete(res) {
        console.log(res)
      }
    })
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
    this.setData({ value })
  },
  // 关闭时间选择框
  close () {
    this.setData({
      selected: !this.data.selected
    })
  },

  come () {
    let value = this.data.value
    console.log(value[0] <= value[3])
    if ((value[1] != value[4] && value[2] < value[5]) || (value[0] > value[3])) {
      showModal({
        title: '注意',
        content: '日期查询区间应在 31 天内'
      })
      return
    }
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
    this.seachSaleData()
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