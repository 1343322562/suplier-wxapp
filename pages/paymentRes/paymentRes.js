import API from '../../api/index.js'
import { goPage, showModal, toast, backPage } from '../../tool/tool.js'
var QR = require("../../utils/qrcode.js"); // url 转 二维码 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resData: '暂无数据',
    maskHidden: true,
    imagePath: '',
    placeholder: '' //默认二维码生成文本
  },
  //适配不同屏幕大小的canvas
  setCanvasSize: function () {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      var scale = 750 / 686; //不同屏幕下canvas的适配比例；设计稿是750宽
      var width = res.windowWidth / scale;
      var height = width; //canvas画布为正方形
      size.w = width;
      size.h = height;
    } catch (e) {
      // Do something when catch error
      console.log("获取设备信息失败" + e);
    }
    return size;
  },
  createQrCode: function (url, canvasId, cavW, cavH) {
    //调用插件中的draw方法，绘制二维码图片
    QR.api.draw(url, canvasId, cavW, cavH, this, this.canvasToTempImage);
    // setTimeout(() => { this.canvasToTempImage();},100);

  },
  //获取临时缓存照片路径，存入data中
  canvasToTempImage: function () {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        console.log(tempFilePath);
        if (!tempFilePath) showModal({ content: '二维码生成失败' })
        that.setData({
          imagePath: tempFilePath,
        });
      },
      fail: function (res) {
        showModal({ content: '二维码生成失败' })
        console.log(res);
      }
    }, that);
  },
  //点击图片进行预览，长按保存分享图片
  previewImg: function (e) {
    var img = this.data.imagePath;
    wx.previewImage({
      current: img, // 当前显示图片的http链接
      urls: [img] // 需要预览的图片http链接列表
    })
  },
  formSubmit: function (qrUrl) {
    console.log(1)
    var that = this;
    var url = qrUrl
    if (url === "") {
      wx.showToast({
        icon: 'none',
        title: '请输入网址',
        duration: 2000
      });
      return;
    }
    that.setData({
      maskHidden: false,
    });
    wx.showToast({
      title: '生成二维码中...',
      icon: 'loading',
      duration: 2000
    });
    var st = setTimeout(function () {
      wx.hideToast()
      var size = that.setCanvasSize();
      //绘制二维码
      that.createQrCode(url, "mycanvas", size.w, size.h);
      that.setData({
        maskHidden: true
      });
      clearTimeout(st);
    }, 2000)

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let resData = JSON.parse(options.data)
    let qrUrl = resData.qrUrl
    
    var size = this.setCanvasSize(); //动态设置画布大小
    var initUrl = this.data.placeholder;
    // this.createQrCode(initUrl, "mycanvas", size.w, size.h); // 初始二维码

    this.formSubmit(qrUrl) // 生成二维码
    this.setData({ resData })
  },

  closeOrder() {
    const resData = this.data.resData   
    const sheetNo = resData.sheetNo             // 单号
    const onlinePayway = resData.onlinePayway || 'lcsb'   // 支付方式
    const outTradeNo = resData.outTradeNo       // 支付请求订单号
    let json = { sheetNo, onlinePayway, outTradeNo }
    json = JSON.stringify(json)
    const _this = this
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    const { routeSendMan } = wx.getStorageSync('routeSendMan')
    API.closeQrPay({
      data: { platform, token, username, supplierNo, sheetNo, routeSendMan, json },
      success(res) {
        console.log(res)
        toast('订单已关闭')
        setTimeout(() => { 
          wx.redirectTo({ url: '../driverTransStatu/driverTransStatu'})
        }, 400)
      },
      error(res) {
        console.log(res)
      }
    })
  },
  // 查询订单
  searchOrderClick () {
    const _this = this
    const resData = this.data.resData
    const onlinePayway = resData.onlinePayway                 // 支付方式
    const outTradeNo = resData.outTradeNo || resData.sheetNo  // 支付请求订单号
    const routeSendMan = wx.getStorageSync('routeSendMan')
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    let json = { onlinePayway, outTradeNo }
    json = JSON.stringify(json)
    console.log(platform, token, username, supplierNo, routeSendMan, json)
    API.queryQrPay({
      data: { platform, token, username: routeSendMan, supplierNo, routeSendMan, json},
      success(res) {
        console.log(res)
        wx.showModal({
          showCancel: false,
          title: '提示',
          content: res.data.massge,
          confirmText: '确认',
          success(e){
            setTimeout(() => { backPage() }, 400)
          },
          fail(res) {
            console.log(res)
          }
        })
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
    // this.closeOrder()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // this.closeOrder()
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