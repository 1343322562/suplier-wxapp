const { toast, getIP, showModal } = require("../../tool/tool")
import API from '../../api/index.js'
import { tim, getRandomNum } from '../../utils/date-format.js'
// pages/rechargePay/rechargePay.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    intoWay: '', // 进入页面方式 1: 由登录界面进入  '': 正常充值页进入
    tagArray: [5000, 8000, 10000, 20000, 50000, 100000],
    type: '', // 选择的金额
    amt: '',
    userIp: ''
  },
  bindInputValue(e) {
    let { value:amt } = e.detail
    console.log(amt, amt.length)
    if (amt.length > 7) amt = this.data.amt

    amt = Number(amt)
    console.log(amt)
    if (typeof amt != 'number' || isNaN(amt)) return toast('请输入正确金额')
    this.setData({ amt, type: '' })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  repeatGetIp() {
    const _this = this
    getIP({
      complete(ip) {
        if (!ip) {
          setTimeout(() => { _this.repeatGetIp() }, 300)
        } else {
          _this.data.userIp = ip
        }
      }
    })
  },
  onLoad: function (options) {
    console.log(options)
    this.data.intoWay = options.type
    console.log(getApp().globalData)
    this.repeatGetIp() // 获取用户 IP 地址
  },
  // 选择金额
  selectAmt(e) {
    console.log(e)
    const { type } = e.target.dataset
    const { tagArray } = this.data
    this.setData({ type, amt: tagArray[type - 1] })
  },

  submit() {
    const _this = this
    const { type, amt, tagArray } = this.data
    let pay_amt
    if (type) { // 选择 tag 金额
      pay_amt = tagArray[type-1]
    } else if (amt) {  // 输入金额
      pay_amt = amt
    }
    console.log(pay_amt, typeof pay_amt)
    if (!pay_amt && typeof pay_amt != 'number') return toast('请输入(选择)需充值的金额')
    if (Number(pay_amt) < 5000) return toast('充值金额需高于5000')
    console.log(pay_amt)
    wx.login({
      success(codeData) {
        console.log(codeData)
        _this.rechargePay(codeData.code, pay_amt) // 支付并充值 
      },
      fail(err) {
        toast('获取微信支付配置失败，请检查网络是否正常')
      }
    })
  },
  rechargePay(code, pay_amt) {
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    const { intoWay } = this.data
    console.log(intoWay)
    let requestObj = {
      code,             // 授权码
      pay_amt: 0.01,          // 充值金额
      body: '老板余额充值', // 描述
      out_trade_no: `CZ${tim(0).replace(/-/g, '')}${getRandomNum(6)}`,    // 订单号      
      userIp: this.data.userIp,
      supplier_no: supplierNo || username,       // 入驻商编号
      username,
      platform, 
      token,
    }
    console.log(`CZ${tim(0).replace(/-/g, '')}${getRandomNum(6)}`)
    API.getMiniPayParameters({
      data: requestObj,
      success(res) {
        console.log(res)
        if (res.code == 0 && res.data) {
          wx.requestPayment({
            'timeStamp': res.data.timeStamp || JSON.parse(res.data).timeStamp,
            'nonceStr': res.data.nonceStr || JSON.parse(res.data).nonceStr,
            'package': res.data.package || JSON.parse(res.data).package,
            'signType': res.data.signType || JSON.parse(res.data).signType,
            'paySign': res.data.sign || JSON.parse(res.data).paySign,
            success: ret => {
              console.log(ret)
              showModal({
                content: `支付成功 \b 充值金额：${pay_amt}`,
                showCancel: false,
                success() {
                  if (intoWay == 1) {
                    wx.redirectTo({ url: '/pages/login/login' })
                    wx.clearStorageSync('authorizeObj')
                    return
                  }
                  wx.redirectTo({ url: '/pages/index/index' }) 
                }
              })
            },
            fail: (ret) => {
              showModal({
                content: '支付已取消',
                showCancel: false
              })
            }
          })
        }
      },
      fail(err){
        console.log(err)
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