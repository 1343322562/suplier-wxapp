// pages/bankCarCommit/bankCarCommit.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  // 拍照\选择照片上传
  upImage() {
    const _this = this
    wx.chooseImage({
      count: 1,
      success(res) {
        console.log(res)
        const tempFilePath = res.tempFilePaths[0]
        // _this.uploadImg(tempFilePath)
      }
    })
  },
  // 提交注册信息
  submit () {

  },

  uploadImg(url) {
    // wx.uploadFile({
    //   url: '',
    //   filePath: url,
    //   name: 'file',
    //   success: (res) => {
    //     console.log(res)
    //     hideLoading()
    //     if (data.status === 200) {
    //       // toast('图片上传成功!')
    //     } else {
    //       toast('图片上传失败!')
    //     }
    //   },
    //   fail: () => {
    //     hideLoading()
    //     toast('选择图片失败!')
    //   }
    // })
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