// pages/rk/rk.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowDialog: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.downloadFile({
    //   url: 'http://120.27.229.209:8080/zksrb2b-web/code?8634e375223d3c7c272a4b90d0ea92b8%20.html', //仅为示例，并非真实的资源
    //   success (res) {
    //     console.log(res)
    //   }
    // })
  },
  examineClick() {
    
  },
  closeExamineClick() { this.setData({ isShowDialog: false }) },
  btnClick(e) {
    console.log(e)
    const { type } = e.target.dataset
    switch (type) {
      case '0': // cancel
        break;
      case '1': // confirm
      this.setData({ isShowDialog: true })
        break; 
    }
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