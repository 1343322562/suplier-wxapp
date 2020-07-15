import { showModal, toast, backPage } from '../../tool/tool.js'
import API from '../../api/index.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 0, // 页面种类 0： 编辑商品   1： 商品详情
    data: {},  
    supplierNo: '',
    json: {}  // 被修改的商品数据
  }, 

  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let data = JSON.parse(options.data)
    let type = 'type' in options ? JSON.parse(options.type) : 1
    console.log(data, type)
    this.setData({ data, type })
  },
// 点击编辑商品
  editConfirmClick () {
    const _this = this
    wx.showModal({
      title: '提示',
      content: '确认编辑此内容？',
      success(res) {
        if (res.confirm) {
          _this.updateItemNote()
        }
      }
    })
  },
// 绑定编辑商品的 input
  bindInputData (e) {
    console.log(e)
    let inputName =  e.target.dataset.inputname
    let value = e.detail.value
    this.setData({ [`json.${inputName}`]: value })
    console.log(this.data.json)
  },
// 编辑商品请求
  updateItemNote () {
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj') 
    const itemNo = this.data.data.itemNo
    let json = this.data.json
    console.log(Object.keys(json).length == 0, json, Object.keys(json).length)
    if (Object.keys(json).length == 0) return showModal({ content: '商品未编辑' })
    json = JSON.stringify(json)
    
    API.updateItemNote({
      data: { platform, token, username, supplierNo, itemNo, appNote: json },
      success (res) {
        console.log(res)
        if (res.code == 0) toast('编辑成功')
        backPage()
      }
    })
  },

// 上下架
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