// pages/editRoleData/editRoleData.js
var amapFile = require('../../libs/amap-wx.js');  // 导入 高德 
import { toast } from '../../tool/tool.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: '',  // 高德地图链接
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
    },
    polygons: [{  /* 多边形 */
      // 描边数组（经纬度）
      points: [],
      strokeColor: '#FF4F3F',
      fillColor:'#FF4F3F30' , 
    }]
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
  // 用户授权 地理位置
  userLocation() {
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success () {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              // wx.userLocation()
            }
          })
        }
      }
    })
  },

  // 绘制静态图(区域)
  renderMapArea () {
    var that = this;
    var myAmapFun = new amapFile.AMapWX({key:"47e4309225f9a313e735cb704be23f65"});
    wx.getSystemInfo({
      success: function(data){
        console.log('s', data)
        var height = data.windowHeight-500;
        var width = data.windowWidth-300;
        var size = width + "*" + height;
        myAmapFun.getStaticmap({
          zoom: 8,
          size: size,
          scale: 2,
          markers: "mid,0xFF0000,A:116.37359,39.92437;116.47359,39.92437",
          success: function(data){
            that.setData({
              src: data.url
            })
          },
          fail: function(info){
            wx.showModal({title:info.errMsg})
          }
        })

      },
      fail(res) {
        console.log(res)
      }
    })
  },
  // 闭合多边形
  areaPolygonPoints (areaArr) {
    let tempArr = []
    areaArr.forEach((item, index) => {
      let tempObj = {}
      tempObj['longitude'] = item[0]
      tempObj['latitude'] = item[1]
      tempArr.push(tempObj)
    })
    console.log(tempArr)
    return tempArr
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.userLocation()
    // // 获取地图
    // this.renderMapArea() // 绘制静态图(区域)

    let shopData = JSON.parse(options.shopData)
    let points // 多边形的经纬度数组
    if ('area' in shopData) {
      let areaArr = JSON.parse(shopData.area)
      points = this.areaPolygonPoints(areaArr)
      // this.areaCricle(areaArr) // 计算区域经纬度
    }
    this.setData({ 
      ['polygons[0].points']: points,
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