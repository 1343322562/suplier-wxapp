import { showModal, toast, backPage } from '../../tool/tool.js'
import API from '../../api/index.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    type: 0, // 页面种类 0： 编辑商品   1： 商品详情
    data: {},
    json: {},  // 被修改的商品数据
    // 修改商品信息 Dialog
    editDialogValueObj: {
      name: '',
      inputName: '',
      inputValue: ''
    },
    isShowEditDialog: false
  }, 
  
  // 编辑商品
  editConfirm (e) {
    let type = e.target.dataset.type
    if (type == 0) return this.setData({ isShowEditDialog: false })
    this.updateItemNote()
  },
// 绑定 Dialog 信息
  commitEditData (e) {
    let inputValue = e.detail.value
    this.setData({ ['editDialogValueObj.inputValue']: inputValue })
    const editDialogValueObj = this.data.editDialogValueObj
    const inputName = editDialogValueObj.inputName
    const appNote = { [inputName]: inputValue}
    console.log(appNote)
  },
// 显示 修改信息 Dialog
  showEditDialogClick (e) {
    console.log(e)
    const name = e.currentTarget.dataset.name
    const inputName = e.currentTarget.dataset.inputname
    const inputValue = this.data.data[inputName]
    const editDialogValueObj = { name, inputName, inputValue }
    console.log(editDialogValueObj)
    this.setData({ editDialogValueObj, isShowEditDialog: true })
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
          this.setData({ isShowEditDialog: false })
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
    const _this = this
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj') 
    const editDialogValueObj = this.data.editDialogValueObj
    const inputName = editDialogValueObj.inputName
    const inputValue = editDialogValueObj.inputValue
    if (inputValue == '') return toast('修改值不能为空')
    if (inputValue == this.data.data[inputName]) return toast('请输入修改值')

    const appNote = inputValue
    const itemNo = this.data.data.itemNo
    console.log(platform, token, username, supplierNo, itemNo, inputValue)
    API.updateItemNote({
      data: { platform, token, username, supplierNo, itemNo, appNote },
      success (res) {
        console.log(res)
        // 返回上一页面 不会触发 onshow, 获取页面对象, 更新商品数据
        let pages = getCurrentPages()
        const goodPageIndex = pages.length - 2
        pages[goodPageIndex].onPullDownRefresh()
        if (res.code == 0) toast('编辑成功');
        _this.setData({ isShowEditDialog: false })
        setTimeout(() => { backPage() }, 800)
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