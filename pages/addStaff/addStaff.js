import API from '../../api/index.js'
import { showModal,backPage } from '../../tool/tool.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selected: 0,   // 当前角色状态 0: 禁用, 1: 启用
    name: '',
    phone: '',
    password: '',
    role: '', 
    licensePlate: '',   // 车牌
    isShowRoleDialog: false // 控制角色选择框显示 
  },

  showSelectRole () {
    this.setData({
      isShowRoleDialog: true
    })
    console.log(1)
  },


// 选择状态
  statuSelect (e) {
    console.log(e)
    let selected = e.target.dataset.selecter
    this.setData({
      selected
    })
  },
// 选择角色
  roleSelect (e) {
    let role = e.target.dataset.role
    if (role == 0) {
      this.setData({
        isShowRoleDialog: false,
        role: '库管员'
      })
    } else if (role == 1) {
      this.setData({
        isShowRoleDialog: false,
        role: '司机'
      })
    }
  },
// 绑定 input data
  getFormData (e) {
    console.log(e)
    const type = e.currentTarget.dataset.type
    const value = e.detail.value
    this.setData({
      [type]: value
    })
  },
// 提交表单数据
  addStaff () {
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    const name = this.data.name
    const mobile = String(this.data.phone)
    const password = String(this.data.password)
    const enabled = String(this.data.selected)
    const duty = String(this.data.role == "库管员" ? 1 : 2)
    const licensePlate = String(this.data.licensePlate)
    API.saveSupplierEmployment({
      data: { 
        platform, token, username, supplierNo,
        name, mobile, password, enabled, duty, licensePlate
      },
      success (res) {
        console.log(res)
        showModal({
          content: '新增员工成功',
          success() {
            backPage()
          }
        })
      }
    })
    console.log(name, mobile, password, enabled, duty, licensePlate)
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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