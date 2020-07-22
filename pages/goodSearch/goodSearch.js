// pages/goodSearch/goodSearch.js
import { goPage, toast, showModal } from '../../tool/tool.js'
import API from '../../api/index.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    basePicUrl: 'http://mmj.zksr.cn:8888/',
    // http://mmj.zksr.cn:8888/
    // http://39.98.164.194/upload/images/bdSupplierItem/
    // http://erp.yxdinghuo.com/
    // https://ch.zksr.cn/
    goodsData: [],
    isAllSelected: 0,        // 是否全选 1: 全选
    searchValue: ''        // 查询 input 的 value 值
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  // 搜索框数据绑定
  inputBindValue (e) {
    console.log(e)
    let value = e.detail.value
    this.setData({ searchValue: value })
  },

  // 全选
  allSelected (e) {
    let isAllSelected = this.data.isAllSelected == 0 ? 1 : 0
    let goodsData = this.data.goodsData
    if (isAllSelected == 0) {               // 取消全选
      goodsData.forEach((item, index) => {
        goodsData[index].checkbox = 0
      })
      this.setData({goodsData , isAllSelected: 0})
    } else if (isAllSelected == 1){         // 全选
      goodsData.forEach((item, index) => {
        goodsData[index].checkbox = 1
      })
      this.setData({goodsData , isAllSelected: 1})
    }
  },

  // 选中 商品
  seleted(e) {
    console.log(e)
    let index = e.target.dataset.index
    let goodsData = this.data.goodsData
    let checkbox = this.data.goodsData[index].checkbox == 1 ? 0 : 1
    goodsData[index].checkbox = checkbox
    let isAllSelected = this.data.isAllSelected
    if (checkbox == 0 && isAllSelected == 1) {
      this.setData({ goodsData, isAllSelected: 0})
    } else {
      this.setData({ goodsData })
    }
  },

  // 搜索商品
  searchOrder() {
    let value = this.data.searchValue
    const _this = this

    // 重新请求商品，刷新页面
    _this.supplierItemSearch({
      condition: value
    }, _this)
  },

  // 查询(请求)商品
  supplierItemSearch(obj, _this = this, pageSize = 10) {
    const basePicUrl = this.data.basePicUrl
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    console.log(obj, supplierNo)

    API.supplierItemSearch({
      data: {
        platform, token, username, supplierNo,
        pageSize,
        pageIndex: '1',
        status: 'status' in obj && obj.status == -1 ? obj.status : '',
        itemClsNo: 'itemClsNo' in obj ? obj.itemClsNo : '',
        searchItemNos: 'searchItemNos' in obj ? obj.searchItemNos : '',
        condition: 'condition' in obj ? obj.condition : '',
        modifyDate: 'modifyDate' in obj ? obj.modifyDate : ''
      },
      success(res){
        console.log(res)
        let goodsData = res.data.itemData
        goodsData.forEach((item, i) => {
          goodsData[i].checkbox = 0 
          let profit = ((goodsData[i].salePrice - goodsData[i].price) / goodsData[i].salePrice).toFixed(4)  // 毛利率
          goodsData[i].profit = profit == 1.0000 ? '100%' : (profit.slice(2)/100 + '%') 
          goodsData[i].picUrl = basePicUrl + item.itemNo + '/' + item.picUrl  // 图片地址
          let month = item.modifyDate.slice(5,7)
          goodsData[i].modifyMonth = month >= 10 ? month : month.slice(1)    // 最后修改的月份                         
        })
        _this.setData({ goodsData })
        setTimeout(() => { wx.hideLoading() }, 500)
      },
      error(res) {
        console.log(res)
        wx.hideLoading()
      }
    })
  },

  // 上架
  upClick () {
    const _this = this
    let goodsData = _this.data.goodsData
    // let bool = false
    // goodsData.forEach(item => {
    //   if (item.checkbox == 1) bool = true  
    // })
    // if (!bool) return showModal({content: '请选择要上架(下架)的商品'}) 
    showModal({
      title: '',
      content: '确认上架?',
      success () { 
        let itemNo = []
        goodsData.forEach((item, i) => {
          if (item.checkbox == 1 && item.status == 0) {
            itemNo.push(item.itemNo)
          }
        })
        if (!itemNo.length) return showModal({ content: '请选择上架商品' })
        itemNo = itemNo.join(',')
        // 发起上下架请求, 并重新请求数据
        _this.updateItemStatus('1', itemNo, _this)
      }
    })
  },
  // 下架
  downClick () {
    const _this = this
    let goodsData = _this.data.goodsData
    showModal({
      title: '',
      content: '确认下架?',
      success() {
        let itemNo = []
        goodsData.forEach((item, i) => {
          if (item.checkbox == 1 && item.status == 1) {
            itemNo.push(item.itemNo)
          }
        })
        if (!itemNo.length) return showModal({ content: '请选择下架商品' })
        itemNo = itemNo.join(',')
        // 发起上下架请求, 并重新请求数据
        _this.updateItemStatus('0', itemNo, _this)
      }
    })
  },

  // 上下架请求
  updateItemStatus (status, itemNo, _this = this) {
    console.log(status, itemNo)
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj') 
    API.updateItemStatus({
      data: { platform, token, username, supplierNo, status, itemNo }, 
      success(res) {
        console.log(res)
        if (res.code == 0) toast('操作成功')
        _this.supplierItemSearch({ condition: _this.data.searchValue }, _this)
        _this.setData({ isAllSelected: 0 })
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