import { goPage } from '../../tool/tool.js'
import API from '../../api/index.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedNav: 0,
    receivedData: [],
  },

  // 点击图标拨打电话
  callPhoneClick () {
    wx.makePhoneCall({
      phoneNumber: this.data.receivedData[1].content
    })
  },

  // 修改员工状态 
  roleSelect(e) {
    console.log(e)
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    let items = e.target.dataset.items[0]
    let statu = e.target.dataset.items[1]
    console.log(items, statu)
    if (statu == items.enabled) return
    API.saveSupplierEmployment({
      data: { 
        platform, token, username, supplierNo,
        duty: items.duty,
        mobile: items.mobile,
        name: items.name,
        enabled: statu
      },
      success(res){
        console.log(res)
        this.setData({ receivedData: res.data })
      }
    })

  },

  // 新增员工按钮
  addStaff () {
    goPage('../addStaff/addStaff')
  },

  // 导航栏选择事件，传递给子组件
  selectNav(e) {
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    console.log(e)
    let index = e.detail.index
    this.setData({
      selectedNav: index
    })
    this.getSupplierEmployment(platform, token, username, supplierNo, index+1)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    // API.getSupplierEmployment({
    //   data: { platform, token, username, supplierNo, duty: '1'},
    //   success(res){
    //     _this.setData({ receivedData: res.data })
    //   }
    // })
    this.getSupplierEmployment(platform, token, username, supplierNo)
  },
// 查询员工信息
  getSupplierEmployment(platform, token, username, supplierNo, index = false) {
    console.log(index)
    const _this = this
    API.getSupplierEmployment({
      data: { platform, token, username, supplierNo, duty: index || this.data.selectedNav+1 },
      success(res) {
        _this.setData({ receivedData: res.data })
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
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    this.getSupplierEmployment(platform, token, username, supplierNo)
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