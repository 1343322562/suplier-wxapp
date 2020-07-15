import { showModal, toast } from '../../tool/tool.js'
import API from '../../api/index.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: {},
    supplierNo: '',
  },

  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let data = JSON.parse(options.data)
    console.log(data)
    this.setData({ data })
  },

  upOrDownClick (e) {
    const _this = this
    wx.showModal({
      title: '提示!',
      content: '请确认此操作',
      confirmText: '确认',
      success: function(res) {
        let status = e.target.dataset.status == 0 ? 1 : 0
        let data = _this.data.data
        console.log(data)
        let itemNo = data.itemNo
        const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
        _this.setData({ supplierNo })
        console.log(platform, token, username, supplierNo, status)
        API.updateItemStatus({
          data: { platform, token, username, supplierNo, status, itemNo },
          success(res) {
            console.log(res)
            if (res.code == 0) {  
              toast('操作成功')
            } else {
              toast('操作失败')
            }
          }
        })
      },
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