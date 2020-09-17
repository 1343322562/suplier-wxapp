import API from '../../api/index.js'
import { goPage, showModal, toast, backPage } from '../../tool/tool.js'
import { tim } from '../../utils/date-format.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: []
  },
  // 跳转消费详情页
  toDetail(e) {
    // const { index } = e.currentTarget.dataset
    // let { data } = this.data
    // let itemNo = data[index].no
    // goPage('../rechargeDetail/rechargeDetail&itemNo=' + itemNo)

    
    goPage('../rechargeDetail/rechargeDetail')
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj'),
          _this = this
    API.accountFlow({
      data: { platform, token, username, supplierNo, startDate: tim(30), endDate: tim(0) },
      success(res) {
        console.log(res)
        if (res.code == 0) {
          let data = res.data
          data.detail.forEach(item => {
            item.operDate = item.operDate.slice(0, 19)
          })
          _this.setData({ data })
        }
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