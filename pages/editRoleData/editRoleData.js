// pages/editRoleData/editRoleData.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fromData: { }, // 初始数据
    markers: {
      iconPath: "../../images/x.png",
      id: 0,
      latitude: 22.8568050000,
      longitude: 108.2611680000,
      width: 25,
      height: 25
    },
    circle: {
      latitude:'',
      longitude	: '',
      color: '#f5f5f5',
      fillColor:'#f5f5f500' ,
      strokeWidth: 2,
      radius: 500
    }
  },

  // 计算区域经纬度
  areaCricle(areaArr) {
    let areaArrLong = [Number(areaArr[0][0]), Number(areaArr[1][0]), Number(areaArr[2][0]), Number(areaArr[3][0])]
    let areaArrLati = [Number(areaArr[0][1]), Number(areaArr[1][1]), Number(areaArr[2][1]), Number(areaArr[3][1])]
    areaArrLong = areaArrLong.sort((a, b) => b - a)
    areaArrLati = areaArrLati.sort((a, b) => b - a)

    this.setData({
      ['circle.latitude']: (areaArrLati[0] + areaArrLati[3]) / 2,
      ['circle.longitude']: (areaArrLong[0] + areaArrLong[3]) / 2, 
      ['circle.color']: '#FF796D',
      ['circle.fillColor']: '#f5f5f590',
      ['circle.strokeWidth']: 2,
      ['circle.radius']: 500
    })
    console.log((areaArrLati[0] + areaArrLati[3]) / 2, (areaArrLong[0] + areaArrLong[3]) / 2)
  },
  // 退出登录
  backLoginClick () {
    wx.showModal({
      title: '提示',
      content: '确定退出?',
      success(res) {
        if (res.confirm) {
          wx.clearStorageSync()
          wx.redirectTo({
            url: '../login/login',
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let shopData = JSON.parse(options.shopData)
    console.log(shopData)
    if ('area' in shopData) {
      let areaArr = JSON.parse(shopData.area)
      this.areaCricle(areaArr) // 计算区域经纬度
    }
    this.setData({ 
      fromData: shopData, 
      ['markers.longitude']: Number(JSON.parse(shopData.position)[0]),
      ['markers.latitude']: Number(JSON.parse(shopData.position)[1])
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