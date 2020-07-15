import { goPage, showModal } from '../../tool/tool.js'
import API from '../../api/index.js'
import { FetchDateLastMonth } from '../../utils/date-format.js' 
import util  from '../../utils/util.js' 
Page({
  data: {
    selected: 0, // 当前选择的角色
    text: '',    // 账号
    password: '' // 密码
  },

  // 选择角色 
  roleSelect (e) {
    let selected = e.target.dataset.selecter
    this.setData({
      selected
    })
  },

  getOpenId () {
    wx.login({
      success(res) {
        if (res.code) {
          console.log(res.code)
          let appid = 'wx214f112d62d0a7cc'
          let js_code = res.code
          console.log( js_code, appid)
          // 发起网络请求
          API.getOpenId({
            data: {
              js_code,
              appid,
              secret: '934f7412723d20bfbe31361fc0223c47'
            },
            success(res) {
              const openId = res.data.openid
              console.log(res)
              wx.setStorageSync('openId', openId)
            },
            complete (res){
              console.log(res, js_code, appid)
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
    wx.showLoading({ mask: true, title: '登录中...' })
    let platform = this.data.selected
    let username = this.data.text
    // if (platform == 2) this.getOpenId()
    if (platform == '0' || platform == '1') {    // 老板 库管员
      let password = this.data.password
      if (username == '' || password == '') {
        wx.hideLoading()
        console.log(1)
        return showModal({ content: '账号不能为空' })
      }
      console.log(username, password, platform)

      API.toLogin({
        data: { username, password, platform },
        success(res) {
          if (res.code == 0) {
            console.log(res.data)
            wx.setStorage({ key: 'userObj', data: { username, password }})
            goPage('../index/index?data=' + JSON.stringify(res.data))
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
      let openid = wx.getStorageSync('openid')
      API.toLogin({
        data: { openid, platform, username},
        success(res) {
          console.log(openid, platform, username)
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
    if (name == 'text') {
      this.data.text = val
    } else if (name == 'password') {
      this.data.password = val
    }
    console.log(this.data.text)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { platform } = wx.getStorageSync('authorizeObj')
    if (platform >= 0) this.setData({ selected: platform })
    // this.getOpenId() // 获取openId 并储存
    var day1 = new Date();
    day1.setTime(day1.getTime() - 24 * 60 * 60 * 1000);
    
    
    var s1 = day1.getFullYear() + "-" + (day1.getMonth() + 1) + "-" + day1.getDate();
    console.log(s1)
    let userObj = wx.getStorageSync('userObj')
    userObj && this.setData({ text: userObj.username, password: userObj.password })
    console.log(userObj,this.data.text, this.data.password)
    this.toLogin()
  },
  // 自动登录
  toLogin () {
    const { platform, token } = wx.getStorageSync('authorizeObj')
    if (!token) return
    wx.showLoading({ mask: true, title: '自动登录中...' })

    if (platform == 2) {
      const { routeSendMan } = wx.getStorageSync('authorizeObj')
      const openid = wx.getStorageSync('openid')
      console.log(wx.getStorageSync('authorizeObj'))
      API.toLogin({
        data: { platform, username: routeSendMan, token, openid },
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
        data: { platform, username, password },
        success(res) {
          console.log( platform, username)
          if (res.code == 0) {
            console.log(res)
            let data = res.data
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