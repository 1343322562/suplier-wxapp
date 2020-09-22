import { goPage, showModal, toast, getLocation } from '../../tool/tool.js'
import API from '../../api/index.js'
import { tim } from '../../utils/date-format.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedNav: 0,          // 导航栏当前选中项
    selectedNav2: 0,         // 订单分类 0：全部 1.在线支付 2.现金支付
    isShowCollectDialog: false,  // 收款 Dialog
    isShowPaymentDialog: false,  // 交款 Dialog   
    paymentValueObj: {           // 交款 input value
      date: '06-29',
      driver: '张三丰',
      shouldBePrice: '20000',
      actPrice: '',
      lackPrive: '1000',
      textArea: ''
    },    
    data: [],
    complateData: [],
    orderData: [],
    allSheetAmt: [0, [], 0], // 送货中底部结算区域
    currentIndex: '', // 当前收款的 item 项下标
    billData: [0,0,0], // 送货中的结算底边栏信息
    // 经纬度
    location: { latitude: '', longitude: '' }
  },
  // 拉起扫码并装车
  pullCodeClick() {
    const _this = this
    const { platform, token, routeSendMan, supplierNo } = wx.getStorageSync('authorizeObj')
    wx.scanCode({
      success(res) {
        wx.showLoading({ title: '请稍候...' })
        const sheetNo = res.result
        API.sheetEntrucking({
          data: { 
            platform, 
            token, 
            username: routeSendMan, 
            routeMan: routeSendMan, 
            supplierNo,
            sheetNo
          },
          success(res) {
            console.log(res)
            if (res.code != 0) return
            toast(res.msg)
            _this.searchOrderStatusData()
          }
        })
      }
    })
  },
  // 跳转司机地图页面
  toDeiverMapClick(e) {
    console.log(e)
    const x = e.currentTarget.dataset.itemdata.xlocationLat
    const y = e.currentTarget.dataset.itemdata.ylocationLng
    // const sheetNo = e.currentTarget.dataset.sheetNo
    const currentLocation = JSON.stringify(this.data.location)
    goPage('../driverMap/driverMap?currentLocation='+currentLocation+'&x='+x+'&y='+y)
  },
  // 绑定交款 input
  paymentValue (e) {
    console.log(e)
    let allSheetAmt = this.data.allSheetAmt[0]  // 应缴总金额
    let type = e.target.dataset.type
    let value = e.detail.value                  // 实缴金额
    if (type == 'actPrice') {    // 实缴
      if (value > allSheetAmt) {
        value = allSheetAmt
        this.setData({ ['paymentValueObj.actPrice']: value })
        return showModal({ content: '实缴金额应大于总金额' })
      }
      this.setData({ ['paymentValueObj.actPrice']: value, ['paymentValueObj.date']: tim(0) })
    }
    // 差异原因
    if (type == 'textArea') this.setData({ ['paymentValueObj.textArea']: value, ['paymentValueObj.date']: tim(0) })
    
  },
  // 提交 交款信息
  submitPaymentClick (e) {
    const _this = this
    let type = e.target.dataset.type  // 0: 取消  1：提交
    if (type == 1) {
      const { platform, token, routeSendMan, supplierNo } = wx.getStorageSync('authorizeObj')
      const paymentObj = this.data.paymentValueObj
      const allSheetAmt = this.data.allSheetAmt
      if (allSheetAmt[0] == 0) return showModal({content: '应缴总金额不能为零,请检查后再提交'})
      if (paymentObj.actPrice == 0) return showModal({ content: '实缴总金额不能为零,请检查后再提交' })
      // console.log(paymentObj)
      // console.log({platform, token, username, supplierNo, routeSendMan,
      //   memo: paymentObj.textArea,
      //   shouldAmt: allSheetAmt[0],
      //   cyAmt: paymentObj.actPrice - allSheetAmt[0],
      //   json: allSheetAmt[1]})
      allSheetAmt[1] = JSON.stringify(allSheetAmt[1])
      console.log(allSheetAmt[1], typeof(allSheetAmt[1]))
      API.commitPaymentOrder({
        data:{  
          platform, token, supplierNo, routeSendMan, username: routeSendMan,
          memo: paymentObj.textArea,
          shouldAmt: allSheetAmt[0],
          cyAmt: allSheetAmt[0] - paymentObj.actPrice,
          receiptDate: tim(0),
          json: allSheetAmt[1]
        },
        success (res) {
          console.log(res)
          showModal({content: '交款成功'})
          _this.searchOrderStatusData()
        }
      })
    }
    this.setData({ isShowPaymentDialog: false })
  },
  // 显示交款 Dialog
  showPaymentDialogClick () {
    const allSheetAmt = this.data.allSheetAmt
    if (allSheetAmt[0] == 0) return showModal({ content: '总金额必须大于 0' })
    
    this.setData({ isShowPaymentDialog: true, ['paymentValueObj.date']: tim(0) })
  },
  // 关闭支付 Dialog
  closeDialogClick () {
    this.setData({ isShowCollectDialog: false })
  },
  // 跳转支付页面(或现金收款)
  toPayClick (e) {
    console.log(e)
    const currentIndex = Number(this.data.currentIndex)
    const _this = this
    let orderData = this.data.orderData             
    let payAmt = orderData[currentIndex].sheetAmt   // 支付金额
    let sheetNo = orderData[currentIndex].sheetNo   // 单号
    let payType = e.target.dataset.paytype
    if (payType == 2) {                         // 现金收款 2
      console.log('asdas',564)
      showModal({
        title: '提示',
        content: '本次收款 ￥' + payAmt,
        success () {
          const { platform, token, routeSendMan, supplierNo } = wx.getStorageSync('authorizeObj')
          API.submitReceiveOrder({
            data: { platform, token, username: routeSendMan,routeSendMan, supplierNo, payAmt, payWay: 'XJ', sheetNo },
            success(res) {
              if (res.code == 0) toast('现金收款成功')
              _this.searchOrderStatusData()
            }
          })
        },
        cancel() {
          toast('已取消收款')
        }
      })
      this.setData({ isShowCollectDialog: false })
    } else if (payType == 1 || payType == 0) { 
      // goPage('../scanCodePay/scanCodePay?type=' + payType)
      this.scanCodePay(payType)
    }
  },
  // 扫码支付
  scanCodePay(payType) {
    const _this = this
    const currentIndex = Number(this.data.currentIndex)
    const orderData = this.data.orderData
    console.log(orderData[currentIndex], orderData, currentIndex)
    const { platform, token, routeSendMan, supplierNo } = wx.getStorageSync('authorizeObj')
    const mdbh = orderData[currentIndex].branchNo   // 门店编号
    const mdmc = orderData[currentIndex].branchName // 门店名称
    const payAmt = orderData[currentIndex].sheetAmt // 付款金额
    const fhdh = orderData[currentIndex].sheetNo    // 发货单号
    // const onlinePayways = 'lcsb'                     // 支付方式(扫呗)
    const onlinePayways = payType == 0 ? 'YSEWX' : 'YSEZFB' // 支付方式
    let authCode
    wx.scanCode({
      success(res) {
        console.log('扫码信息', res)
        authCode = res.rawData
        let json = { onlinePayway: onlinePayways, fhdh, mdbh, mdmc, payAmt, username: routeSendMan, authCode }
        console.log(json)
        json = JSON.stringify(json)
        console.log({ platform, token, username: routeSendMan, supplierNo, fhdh, routeSendMan, json })
        API.getQrCodeUrl({
          data: {  
            platform, token, username: routeSendMan, supplierNo, fhdh, routeSendMan, json
          },
          success (res) {
            console.log('166' ,res)
            let data = res.data
            if (data == null) return showModal({ content: res.message })
            
            if (res.code == -2) {
              wx.showModal({
                title: '提示',
                content: res.message,
                cancelText: '关闭支付',
                confirmText: '继续操作',
                success(e) {
                  if (e.confirm) {
                  } else if (e.cancel) {
                    console.log(res)
                    _this.closeOrder(data)
                  }
                },
                fail(res) {
                  console.log(res)
                  
                }
              })
              return
            } 
          }
        })
    
        // console.log(onlinePayways)
        // data['onlinePayway'] = onlinePayways
        // data['sheetNo'] = fhdh
        // data['payAmt'] = payAmt
        // console.log('data',data)
        // data = JSON.stringify(data)
        // goPage('../paymentRes/paymentRes?data=' + data)
      },
      error(err){
        console.log(err)
        let data = res.data
        data.onlinePayway = onlinePayways   // 支付方式
        data.sheetNo = fhdh       // 单号
        data.payAmt = payAmt      // 金额
        data = JSON.stringify(data)
        goPage('../paymentRes/paymentRes?data=' + data)
      },
      complete(res) {

      }
    })
  },

  closeOrder(data) {
    const _this = this
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    const routeSendMan = wx.getStorageSync('routeSendMan')
    let json = { sheetNo: data.sheetNo, onlinePayway: data.onlinePayway, outTradeNo: data.outTradeNo }     
    console.log(json)
    json = JSON.stringify(json)

    API.closeQrPay({
      data: { platform, token, username: routeSendMan, supplierNo, sheetNo: data.sheetNo, routeSendMan, json },
      success(res) {
        console.log(res)
        _this.setData({ isShowCollectDialog: false})
        toast(res.message)
      },
      error(res) {
        console.log(res)
      }
    })
  },


  // 计算配送完成结算金额
  resPrice(orderDatas) {
    let orderData = orderDatas || this.data.orderData
    let allSheetAmt = this.data.allSheetAmt
    allSheetAmt[1] == []
    let billData = this.data.billData
    allSheetAmt[0] = 0
    allSheetAmt[2] = 0
    billData[0] = 0
    billData[1] = 0
    billData[2] = 0
    let selectedNav = this.data.selectedNav
    let selectedNav2 = this.data.selectedNav2
    orderData.forEach(item => {
      if (
        selectedNav == 1 
        && ((item.payWay == 'XJ' && selectedNav2 == 2) || (item.payWay == 'ONLINE' && selectedNav2 == 1) || selectedNav2 == 0) 
        && item.tmsPayFlag == 0
      ) {
        allSheetAmt[0] = allSheetAmt[0] + item.sheetAmt                         // 交款单据的总金额
        allSheetAmt[1].push({ sheetAmt: item.sheetAmt, sheetNo: item.sheetNo})  // 司机交款的单据明细
        allSheetAmt[2] = allSheetAmt[2] + item.sheetQty                         // 总数量
      }
      if (item.supplyFlag == 31) {
        billData[0] = billData[0] + 1
        billData[1] = billData[1] + item.sheetQty
        billData[2] = billData[2] + item.sheetAmt
      }
    })
    billData[2] = billData[2].toFixed(2)
    allSheetAmt[0] = allSheetAmt[0].toFixed(2)
    this.setData({ allSheetAmt, billData })
    console.log(allSheetAmt)
  },

  // 导航栏选择事件，传递给子组件
  selectNav (e) {
    // let orderData = []
    // this.setData({ orderData })
    console.log(e)
    let index = e.detail.index
    this.setData({ selectedNav: index })
    console.log(2)
    this.searchOrderStatusData()
    // if (index == '0') this.resPrice(orderData) // 计算结算区域
  },

  selectNav2 (e) {
    // let orderData = []
    // this.setData({ orderData })
    console.log(e)
    let index = e.detail.index
    this.setData({ selectedNav2: index })
    console.log(1)

    this.resPrice(this.data.orderData)
    // this.resPrice(orderData) // 计算结算区域
  },

  // 点击确认送货完成，弹出收款 Dialog
  transportEndClick (e) {
    console.log(e)
    const currentIndex = e.target.dataset.index 
    const acctFlag = e.target.dataset.acctflag
    if (acctFlag == '2') return showModal({ tuitle: '提示', content: '已交款，无需再次交款'}) 
    this.setData({ isShowCollectDialog: true ,currentIndex })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _this = this
    getLocation({
      complete(res) {
        console.log(334,res)
        const { latitude, longitude } = res
        _this.data.location = { latitude, longitude }
        _this.searchOrderStatusData()
        _this.resPrice(_this.data.orderData)
      }
    })
  },
  
  // 查询订单
  searchOrderStatusData(startDate = tim(7), endDate = tim(0)) {
    const _this = this
    const { platform, token, routeSendMan, supplierNo } = wx.getStorageSync('authorizeObj')
    const { latitude, longitude } = this.data.location
    const selectedNav = this.data.selectedNav
    let selectedNav2 = this.data.selectedNav2
    const supplyFlag = selectedNav == 0 ? '31' : '5'         // 状态 31 配送中     5 已完成
    if (selectedNav == 1 && selectedNav2 != 0) { 
      selectedNav2 = selectedNav2 == 1 ? 'ONLINE'  : 'XJ'
    } else { selectedNav2 = null }
    console.log({
      platform, token, routeSendMan, supplierNo, startDate, endDate,
      routeSendMan,
      supplyFlag,
      payWay: selectedNav2 || null
    })
    API.searchOrderStatusData({
      data: {
        platform, token, routeSendMan, username: routeSendMan,supplierNo, startDate, endDate,
        x: latitude,
        y: longitude,
        supplyFlag,
        payWay: selectedNav2 || null  // 支付方式 XJ 现金  ONLINE在线支付
      },
      success (res) {
        console.log(res, 654)
        let orderData = res.data.reverse()
        orderData.forEach((item, i) => {
          orderData[i].createDate = orderData[i].createDate.slice(0, 19)
          orderData[i].distance = item.distance < 0 ? (item.distance*1000)+'m' : item.distance+'km' 
        })
        _this.setData({ orderData })
        console.log(1)
        _this.resPrice(orderData)
      },
      complete(res) {
        const orderData = _this.data.orderData
        if ((res.data.code == 1 || res.data.msg == "暂无订单数据") && orderData.length != 0) _this.setData({ orderData: [] })  
        setTimeout(() => { wx.hideLoading() }, 400)
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
    wx.showLoading()
    this.searchOrderStatusData()
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