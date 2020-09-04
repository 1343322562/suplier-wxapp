// pages/driverMap/driverMap.js
import API from '../../api/index.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentPosition: { longitude: '', latitude: '' }, // 当前位置
    markers:[{    // 标记位置(也就是当前位置)
      iconPath: "../../images/driver.png",
      id: 0,
      latitude: '',
      longitude: '',
      width: 33,
      height: 32,
      callout: {content: '当前位置', fontSize: 13, color: '#333333', bgColor: '#ffffff', padding: 5, display: 'ALWAYS', borderWidth: 3, borderColor: '#8873FA',anchorY: 4}
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    const currentPosition = JSON.parse(options.currentLocation)
    const markers = this.data.markers
    markers[0].latitude = currentPosition.latitude
    markers[0].longitude = currentPosition.longitude
    let mapItem = {    // 提货位置
      iconPath: "../../images/Default_Avatar@2x.png",
      id: 0,
      latitude: parseFloat(options.x),
      longitude: parseFloat(options.y),
      width: 33,
      height: 32,
      callout: {content: '提货点', fontSize: 13, color: '#333333', bgColor: '#ffffff', padding: 5, display: 'ALWAYS', borderWidth: 3, borderColor: '#FF5E4E',anchorY: 4}
    }
    markers.push(mapItem)
    this.setData({ currentPosition, markers })
    
    console.log(currentPosition, mapItem, markers)
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