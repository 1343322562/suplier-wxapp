import { goPage, showModal, toast } from '../../tool/tool.js'
import API from '../../api/index.js'
import { FetchDateLastMonth } from '../../utils/date-format.js' 
import util  from '../../utils/util.js' 
const app = getApp()
Page({
  data: {
    state: 0, // 当前的状态(0正常 | 1审核)
    selected: 0, // 当前选择的角色
    text: '',    // 账号
    password: '', // 密码
    isShowPassword: false // 是否显示密码
  },

  // 选择角色 
  roleSelect (e) {
    let selected = e.target.dataset.selecter
    this.setData({
      selected
    })
  },
  // 密码是否显示切换
  switchPassword () {
    const isShowPassword = !this.data.isShowPassword
    this.setData({ isShowPassword })
  },
  getOpenId () {
    wx.login({
      success(res) {
        if (res.code) {
          console.log(res.code)
          
          // 发起网络请求
          API.getOpenId({
            data: {
              code: res.code,
              appId: "wx56422cd818402e49",
              secret: "bb4ef1ebfc4dfc2fa27fe74ec12fd67b"
            },
            success(res) {
              const openId = res.data
              console.log('openId' ,res)
              wx.setStorageSync('openId', openId)
            },
            complete (res){
              console.log(res, res.code)
            }
          })
        } else {
          showModal({
            title: '提示',
            content: '获取信息失败'
        })
        }
      }
    })
  },

  // 判断身份登录
  submit () {
    const _this = this
    let openId = wx.getStorageSync('openId')
    wx.showLoading({ mask: true, title: '登录中...' })
    let platform = this.data.selected
    let username = this.data.text
    if (platform == '0' || platform == '1') {    // 老板 库管员
      let password = this.data.password
      if (username == '' || password == '') {
        wx.hideLoading()
        console.log(1)
        return toast('账号不能为空')
      }
      console.log(username, password, platform)

      API.toLogin({
        data: { username, password, platform, openId },
        success(res) {
          if (res.code == 0) {
            console.log(res.data)
            let data = res.data
            data.roleNo = _this.data.selected
            console.log(data)
            wx.setStorage({ key: 'userObj', data: { username, password }})
            goPage('../index/index?data=' + JSON.stringify(data))
          }
        },
        error(err){
          console.log(err)
          if (err) {
            wx.hideLoading()
            console.log(1)
            wx.showModal({content: '连接超时，请检查网络设置'})
          }
        }
      })

    } else {   // 司机(司机编号就是用户名)
      let routeSendMan = this.data.text
      wx.showLoading({ mask: true, title: '登录中...' })
      wx.setStorage({key: 'routeSendMan', data: routeSendMan})
      API.toLogin({
        data: { openId, platform, username},
        success(res) {
          console.log(openId, platform, username)
          if (res.code == 0) {
            console.log(res)
            let data = res.data
            let { username, token, supplierNo, platform } = data
            
            wx.setStorageSync('authorizeObj', { routeSendMan: username, token, supplierNo, platform })
            goPage('../driverTransStatu/driverTransStatu')
            console.log(1)
          }
        },
        error(err) {
          console.log(err)
          if (err) {
            wx.hideLoading()
            console.log(1)
            showModal({ content: '登陆失败，请检查网络设置' })
          }
        }
      })
    }
    // goPage('../index/index?role=' + roleNo)
  },
  // input 数据绑定
  binding (e) {
    console.log(e)
    let name = e.target.dataset.name
    let val = e.detail.value
    if (val.includes(' ')) val = val.trim()
    if (name == 'text') {
      this.data.text = val
    } else if (name == 'password') {
      this.data.password = val
    }
    console.log(this.data.text)
  },
  // state: 1 过审
  getCurrentState() {
    const _this = this
    wx.request({
      url: 'https://mmj.zksr.cn/zksrb2b-web/supasd.json',
      method: 'POST',
      header: { 'content-type': 'application/json' },
      dataType: 'json',
      data: {},
      success(res) {
        console.log(res)
        const { state } = res.data.data
        if (state == 1) _this.setData({ state: 1 })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOpenId() // openid 获取并储存 
    const { platform } = wx.getStorageSync('authorizeObj')
    if (platform >= 0) this.setData({ selected: platform }) // 以前客户保存的角色
    let userObj = wx.getStorageSync('userObj')
    userObj && this.setData({ text: userObj.username, password: userObj.password })
    console.log(userObj,this.data.text, this.data.password)
    this.getCurrentState() // 获取当前的登录状态（正常 | 审核）
    setTimeout(() => this.toLogin(), 500)
  },
  // 自动登录
  toLogin (_this = this) {
    const { platform, token } = wx.getStorageSync('authorizeObj')
    if (!token) return
    wx.showLoading({ mask: true, title: '自动登录中...' })
    const openId = wx.getStorageSync('openId')

    if (platform == 2) {
      const { routeSendMan } = wx.getStorageSync('authorizeObj')
      console.log(wx.getStorageSync('authorizeObj'))
      API.toLogin({
        data: { platform, username: routeSendMan, token, openId },
        success(res) {
          if (res.code == 0) {
            console.log(res.data)
            let { username, token, supplierNo, platform } = res.data
            wx.setStorageSync('authorizeObj', { routeSendMan: username, token, supplierNo, platform })
            wx.setStorage({ key: 'userObj', data: { username: routeSendMan } })
            goPage('../driverTransStatu/driverTransStatu')
          }
        },
        error(err) {
          console.log(err)
          if (err) {
            wx.hideLoading()
            console.log(1)
            wx.showModal({ content: '连接超时，请检查网络设置' })
          }
        }
      })
    } else {
      const { token, supplierNo } = wx.getStorageSync('authorizeObj')
      const { username, password } = wx.getStorageSync('userObj')
      API.toLogin({
        data: { platform, username, password, openId },
        success(res) {
          console.log( platform, username)
          if (res.code == 0) {
            console.log(res)
            let data = res.data
            data.roleNo = _this.data.selected
            let { username, token, supplierNo, platform } = data
            wx.setStorageSync('authorizeObj', { username, token, supplierNo, platform })
            goPage('../index/index?data=' + JSON.stringify(res.data))
            console.log(1)
          }
        },
        error(err) {
          console.log(err)
          if (err) {
            wx.hideLoading()
            console.log(1)
            showModal({ content: '登陆失败，请检查网络设置' })
          }
        },
        complete() {
          console.log(platform, username, token)
        }
      })
      
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
    this.setData({ text: '', password: '' })
    setTimeout(function () {
      console.log(1)
      wx.hideLoading()
    }, 1500)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.setData({ text: '', password: '' })
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
    console.log(this.data.username)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})