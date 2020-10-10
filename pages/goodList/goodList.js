// pages/goodList/goodList.js
import { goPage, toast, showModal } from '../../tool/tool.js'
import API from '../../api/index.js'

let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    basePicUrl: '',
    // http://mmj.zksr.cn:8888/
    // http://39.98.164.194/upload/images/bdSupplierItem/
    // http://erp.yxdinghuo.com/
    // https://ch.zksr.cn/
    pageSize: 10,     // 当前数据量
    selectedNav: 0,          // 导航栏当前选中项
    isAllSelected: 0,        // 是否全选 1: 全选
    isShowEditDialog: false,  // 是否显示 editDialog
    goodsData: [],           // 商品数据
    editStockInputValue: {   // 修改库存 Dialog input val 数据
      addNum: '',
      subNum: '',
      toNum: ''
    },
    isShowBottomNull: false,
    isShowBottomLoading: false, // 是否显示底部加载中区域
    currentSliderCls: '',    // 当前所选中的类别编号
    isShowEditPriceDialog: false,   // 显示修改价格 Dialog
    editStockFocus: {
      addNum: false,
      subNum: false,
      toNum: false
    },
    editPriceInputVal: {
      price: '',     // 进价
      salePrice: ''  // 售价 
    },
    selecSliderObj: {  // 选择侧边栏
      index: 0,  // 1
      ind: 0,    // 2
    },         
    inputActive: '',     //  修改框的选中态
    currentStock: '',    //  当前商品库存
    currentIndex: ''  //  当前选中商品(修改库存/价格)
  },
  // 跳转搜索页
  toSearchPageClick () {
    goPage('../goodSearch/goodSearch')
    return
  },
  // 修改商品价格请求
  updateItemPrice(itemNo, editPriceInputVal) {
    const _this = this
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj') 
    const { price, salePrice } = { price: editPriceInputVal.price, salePrice: editPriceInputVal.salePrice }
    API.updateItemPrice({
      data: { platform, token, username, supplierNo, itemNo, price, salePrice },
      success (res) {
        console.log(res)
        if (res.code == 0) toast('修改价格成功')
        let index = _this.data.selecSliderObj.index
        let ind = _this.data.selecSliderObj.ind
        let slider = _this.data.slider
        // 重新请求商品，刷新页面
        _this.supplierItemSearch({
          status: this.data.selectedNav,
          itemClsNo: slider[index].second[ind].clsNo,
        }, _this)
      }
    })
  },
  // 价格 input 事件
  priceInput(e) {
    let type = e.currentTarget.dataset.type
    let val = e.detail.value
    if (type == 0) {
      this.setData({ ['editPriceInputVal.salePrice']: val })
    } else if (type == 1) {
      this.setData({ ['editPriceInputVal.price']: val })
    }
  },
  // 显示修改商品 Dialog
  showEditPriceDialogClick (e){
    console.log(e)
    let index = e.target.dataset.index
    let goodsData = this.data.goodsData
    let editPriceInputVal = { price: goodsData[index].price, salePrice: goodsData[index].salePrice }
    this.setData({ editPriceInputVal, isShowEditPriceDialog: true, currentIndex: index})
  },
  // 确认修改价格
  editPriceConfirm(e) {
    let type = e.target.dataset.type
    if (type == 0) return this.setData({ isShowEditPriceDialog: false })

    let goodsData = this.data.goodsData
    let editPriceInputVal = this.data.editPriceInputVal
    let index = this.data.currentIndex
    let goodsItem = goodsData[index]
    console.log(goodsItem)
    if (goodsItem.price == editPriceInputVal.price && goodsItem.salePrice == editPriceInputVal.salePrice){
      return showModal({ content: '价格无改动，请重新输入' })
    }
    if (editPriceInputVal.salePrice < editPriceInputVal.price) return toast('售价需大于进价')
    let itemNo = goodsItem.itemNo
    this.updateItemPrice(itemNo, editPriceInputVal)
    this.setData({ isShowEditPriceDialog: false })
  },
   //回到顶部
   goTop: function (e) {  // 一键回到顶部
      wx.pageScrollTo({ scrollTop: 0 })
  },
  // 选择侧边栏
  selectSlider (e) {
    console.log(2)
    this.setData({goodsData: [], pageSize: 10, isShowBottomLoading: false, isShowBottomNull: false})
    const _this = this
    let data = e.target.dataset
    let index = 'one' in data ? data.one : ''
    let ind = 'two' in data ? data.two : ''
    let currentSliderCls
    let status = this.data.selectedNav
    status = status > 0 ? status - 1 : ''
    if (index !== '') this.setData({ ['selecSliderObj.index']: index })
    if (ind !== '') {
      console.log(this.data.slider, index , ind)
      let slider = this.data.slider
      currentSliderCls = slider[index].second.length == 0 ? slider[index].clsNo : slider[index].second[ind].clsNo
      _this.setData({ ['selecSliderObj.ind']: ind, currentSliderCls })
      console.log(currentSliderCls)
    }
    
    wx.showLoading({ title: '请稍后...' })
    this.supplierItemSearch({ status, itemClsNo: currentSliderCls}, _this)
    this.goTop()
  },
  // 跳转详情页
  toDetailClick (e) {
    console.log(e)
    let index = e.currentTarget.dataset.gooditem
    let goodsData = this.data.goodsData
    let data = JSON.stringify(goodsData[index]) 
    goPage('../goodDetail/goodDetail?data=' + data)
  },
  // 跳转编辑商品页
  editGoodClick (e) {
    console.log(e)
    let index = e.currentTarget.dataset.gooditem
    let goodsData = this.data.goodsData
    let data = JSON.stringify(goodsData[index]) 
    goPage('../goodDetail/goodDetail?data=' + data +'&type=' + 0)
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
  // 上下架商品请求
  updateItemStatus (status, itemNo, _this = this) {
    console.log(status, itemNo)
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj') 
    API.updateItemStatus({
      data: { platform, token, username, supplierNo, status, itemNo }, 
      success(res) {
        console.log(res)
        if (res.code == 0) toast('操作成功')
        _this.supplierItemSearch({ status: _this.data.selectedNav - 1, itemClsNo: _this.data.currentSliderCls }, _this)
        _this.setData({ isAllSelected: 0 })
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

  // 导航栏选择事件，传递给子组件
  selectNav(e) {
    console.log(e)
    let index = e.detail.index
    this.setData({ selectedNav: index })
  },
  /**
   * 生命周期函数--监听页面加载
   */

  isShowEditDialogClick (e) {
    console.log(e)
    let index = e.target.dataset.index
    let goodsData = this.data.goodsData
    let currentStock = goodsData[index].stockQty
    let isShowEditDialog = e.detail
    this.setData({ isShowEditDialog, currentStock, currentIndex: index })
  },
// 修改库存 input 点击态
  focusClick (e) {
    let type = e.target.dataset.type
    if (type == 'addNum') {
      this.setData({ ['editStockFocus.addNum']: true, inputActive: 'addNum'})
    } else if (type == 'subNum') {
      this.setData({ ['editStockFocus.subNum']: true, inputActive: 'subNum'})
    } else if (type == 'toNum') {
      this.setData({ ['editStockFocus.toNum']: true, inputActive: 'toNum'})
    }
  },
// 修改库存
  editStockClick (e) {
    console.log(e, this.data.editStockInputValue)
    let type = e.target.dataset.type
    let value = e.detail.value
    let editStockInputValue = this.data.editStockInputValue
  
    if (type == 'addNum') {
      this.setData({ ['editStockInputValue.subNum']: '', ['editStockInputValue.toNum']: ''})
      this.setData({ ['editStockInputValue.addNum']: value, inputActive: 'addNum' })
    } else if (type == 'subNum') {
      this.setData({ ['editStockInputValue.addNum']: '', ['editStockInputValue.toNum']: '' })
      this.setData({ ['editStockInputValue.subNum']: value, inputActive: 'subNum' })
    } else if (type == 'toNum') {
      this.setData({ ['editStockInputValue.subNum']: '', ['editStockInputValue.addNum']: '' })
      this.setData({ ['editStockInputValue.toNum']: value, inputActive: 'toNum' })
    }
    console.log(1, this.data.inputActive)
  },
  // 修改库存请求
  updateItemStock(stockQty, itemNo) {
    const _this = this
    console.log(platform, token, username, supplierNo, itemNo, stockQty)
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    API.updateItemStock({
      data: { platform, token, username, supplierNo, itemNo, stockQty },
      success(res) {
        console.log(res)
        if (res.code == 0) toast('修改库存成功')
        let index = _this.data.selecSliderObj.index
        let ind = _this.data.selecSliderObj.ind
        let slider = _this.data.slider
        _this.supplierItemSearch({  
          status: this.data.selectedNav, 
          itemClsNo: slider[index].second[ind].clsNo,
        }, _this)
      }
    })
  },
// 确认修改库存
  editConfirm (e) {
    console.log(e)
    let type = e.target.dataset.type
    let editStockInputValue = this.data.editStockInputValue

    let addNum = editStockInputValue.addNum
    let subNum = editStockInputValue.subNum
    let toNum = editStockInputValue.toNum
    let currentStock = this.data.currentStock
    let currentIndex = this.data.currentIndex
    let goodsData = this.data.goodsData
    let itemNo = goodsData[currentIndex].itemNo
    console.log(addNum, subNum, toNum)
    if (type == 0) {
      this.setData({ isShowEditDialog: false, editStockInputValue: '', inputActive: '' })
    } else if (type == 1){
      if (addNum) {
        this.updateItemStock(addNum, itemNo)
      } else if (subNum) {
        this.updateItemStock(0 - subNum, itemNo)
      } else if (toNum) {
        let currentStock = this.data.currentStock
        this.updateItemStock(toNum - currentStock, itemNo)
      }
      this.setData({ isShowEditDialog: false, editStockInputValue: '', inputActive: '' })
    }
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

  onLoad: function (options) {
    console.log(app)
    this.setData({ basePicUrl: app.globalData.baseImgUrl }) // 配置图片根路径
    wx.showLoading({ title: '请稍候..' })
    const _this = this
    this.searchGoodsItemCls(_this) // 查询侧边栏
  },
  onShow: function () {
    console.log('onshow')
  },

  // 查询(请求)商品
  supplierItemSearch(obj, _this = this, pageSize) {
    wx.showLoading('加载中...')
    const basePicUrl = this.data.basePicUrl
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    console.log(obj, supplierNo)
    console.log(123,obj.itemClsNo)
    API.supplierItemSearch({
      data: {
        platform, token, username, supplierNo,
        pageSize: pageSize || this.data.pageSize,
        pageIndex: '1',
        status: 'status' in obj && obj.status == -1 ? obj.status : '',
        itemClsNo: 'itemClsNo' in obj ? obj.itemClsNo : '',
        searchItemNos: 'searchItemNos' in obj ? obj.searchItemNos : '',
        condition: 'condition' in obj ? obj.condition : '',
        modifyDate: 'modifyDate' in obj ? obj.modifyDate : ''
      },
      success(res){
        console.log(res, obj.itemClsNo)
        let goodsData = res.data.itemData
        goodsData.forEach((item, i) => {
          goodsData[i].checkbox = 0 
          let profit = ((goodsData[i].salePrice - goodsData[i].price) / goodsData[i].salePrice).toFixed(4)  // 毛利率
          goodsData[i].profit = profit == 1.0000 ? '100%' : (profit.slice(2)/100 + '%')
          goodsData[i].picUrl = basePicUrl + '/upload/images/bdSupplierItem/' + item.itemNo + '/' + item.picUrl // 图片地址
          let month = item.modifyDate.slice(5,7)
          goodsData[i].modifyMonth = month >= 10 ? month : month.slice(1)    // 最后修改的月份                         
        })
        console.log(403, goodsData.length, _this.data.goodsData.length, _this.data.isShowBottomLoading)
        console.log(goodsData.length-10 != _this.data.goodsData.length, _this.data.goodsData.length != 10 , goodsData.length%10 != 0)
        if (goodsData.length-10 != _this.data.goodsData.length && _this.data.goodsData.length != 10) {
          console.log(321)
          _this.setData({ goodsData, isShowBottomLoading: false, isShowBottomNull: true })
        } else {
          _this.setData({ goodsData }) 
        }
      },
      error(res) {
        console.log(res)
      },
      complete() {
        wx.hideLoading()
      }
    })
  },

  // 请求商品类别
  searchGoodsItemCls (_this) {
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    API.searchGoodsItemCls({
      data: { platform, token, username, supplierNo },
      success (res) {
        console.log(res)
        let data = res.data
        let firstCls = data.firstCls
        let secondCls = data.secondCls
        let currentSliderCls

        firstCls.forEach((item,i) => {
          firstCls[i].second = []
          secondCls.forEach((t, index) => {
            if (item.clsNo == t.clsParent) { 
              firstCls[i]['second'].push(t)
            }
          })
        })
        console.log(firstCls)
        if (firstCls[0].second.length == 0) {
          currentSliderCls = firstCls[0].clsNo
        } else {
          currentSliderCls = firstCls[0].second[0].clsNo
        }
        _this.setData({ slider: firstCls, currentSliderCls })
        let itemClsNo = firstCls[0].second.length == 0 ? firstCls[0].clsNo : firstCls[0].second[0].clsNo // 类别判断
        _this.supplierItemSearch({ status: 0, itemClsNo },  _this)
      }
    })
  },

  // 监听页面滚动事件
  // onPageScroll: function (e) {
  //   console.log(e)
  //   const query = wx.createSelectorQuery();
  //   const currentHeight = wx.getSystemInfoSync().windowHeight    // 获取当前设备窗口的高度
  //   const bottomPosition  // 当前节点位于屏幕上边的位置
  //   query.select('.dsa').boundingClientRect()
  //   query.exec(function(res){
  //     console.log(res, currentHeight)
  //     bottomPosition = res[0].top       
  //   })

  //   if (bottomPosition - currentHeight < 500) {

  //   }
  // },

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
    wx.showLoading({ title: '刷新中' })
    let selectedNav = this.data.selectedNav
    let status = -1
    let itemClsNo = this.data.currentSliderCls
    if (selectedNav == 1) {
      status = 1
    } else if (selectedNav == 2) {
      status = 0
    }

    this.supplierItemSearch({ status, itemClsNo })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log(1)
    wx.showLoading({ title: '刷新中' })
    let pageSize = this.data.pageSize
    const _this = this
    let index = _this.data.selecSliderObj.index
    let ind = _this.data.selecSliderObj.ind
    let slider = _this.data.slider
    let itemClsNo = slider[index].second.length == 0 ? slider[index].clsNo : slider[index].second[ind].clsNo
    // 重新请求商品，刷新页面
    _this.supplierItemSearch({
      status: this.data.selectedNav,
      itemClsNo: slider[index].second[ind].clsNo,
    }, _this ,pageSize)
    pageSize = pageSize + 10
    this.setData({ pageSize, isShowBottomLoading: true })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
})