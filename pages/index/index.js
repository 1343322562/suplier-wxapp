import { goPage, showModal } from "../../tool/tool.js"
import API from '../../api/index.js'
import { FetchDateLastMonth, FetchDateLastDay, tim } from '../../utils/date-format.js'
import util from '../../utils/util.js' 

let app = getApp()

Page({
  data: {
    todaySaleData: [0,0,0],  // 当日销售数据 [金额, 订单数, 数量]
    bounding: '',  // 胶囊信息
    saleDataTimeId: '2', // 销售数据timeID (0: 7天, 1: 30天)
    saleTableData: [],
    saleTitleData: ['日期', '营业额(元)', '销售订单数', '销售件数'], // 数据表 title
    roleNo: '0',    // 角色 0：老板
    shopData: {
      linkMan: '张三',
      supplierTel: '137 8854 5629',
      supplierName: '晴天烟酒供应商',
      warehouse: '前置仓',
      card: '中国建设银行',
      cardNo: '****5874',
      position: '["108.2611680000","22.8568050000"]'
    }
  },
  // 缓存 authorizeObj 信息
  authorize (supplierData) {
    const authorizeObj = { 
      platform: supplierData['platform'],
      token: supplierData['token'],
      username: supplierData['username'],
      supplierNo: supplierData['supplierNo']
    }
    wx.setStorageSync('authorizeObj', authorizeObj)
    console.log(1)
  },
  // 获取胶囊信息
  getBoundingInfo () {
    const APP = getApp().globalData
    this.setData({
      bounding: APP.bounding
    })
  },
  // 获取今日销售数据
  getTodaySaleData(saleTableData = this.data.saleTableData) {
    console.log(saleTableData,'当日促销数据')
    let todaySaleData = [0, 0, 0]
    saleTableData.forEach((item, i) => {
      if (item.createDate == tim(0)) { 
        todaySaleData[0] = todaySaleData[0] + item.totalAmt    // 当日销售金额
        todaySaleData[1] = todaySaleData[1] + item.totalOrder  // 当日销售订单数
        todaySaleData[2] = todaySaleData[2] + item.totalQty    // 当日销售数量
      }
    })
    this.setData({ todaySaleData })
  },

  onLoad: function (options) {
    this.getBoundingInfo() //获取胶囊信息（自定义导航栏）  
    if (!options.data) {
      showModal({
        title: '提示',
        content: '获取供应商数据失败，请刷新重试'
      })
      return
    }
    const supplierData = JSON.parse(options.data)
    console.log(supplierData, !wx.getStorageSync('authorizeObj'))
    this.authorize(supplierData) // 缓存 authorizeObj 信息
    this.seachSaleData(0)   // 表格数据获取 并 计算当日销售数据
    this.getErpUrl() // 情求图片根路径
    let roleNo = supplierData.roleNo
  
    this.setData({ roleNo, shopData: supplierData })

  },
  // 请求图片根路径
  getErpUrl() {
    const _this = this
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    API.getErpUrl({
      data: { platform, token, username, supplierNo },
      success(res) {
        console.log('图片路径请求结果:', res)
        app.globalData.baseImgUrl = res.data
      }
    })
  },

  // 跳转个人资料页
  toShopDataClick () {
    let shopData = JSON.stringify(this.data.shopData)
    goPage('../editRoleData/editRoleData?shopData=' + shopData)
  },
  goPageSaleDataSeach () {
    goPage('../saleDataSeach/saleDataSeach')
  },
  
// 销售数据渲染条件
  seachSaleData (e) {
    const _this = this
    const { platform, token, username, supplierNo} = wx.getStorageSync('authorizeObj')
    let timeId = typeof(e) == 'object' ? e.target.dataset.timeid : e
    this.setData({ saleDataTimeId: timeId })
    let currentDay = timeId == 0 ? 7 : 30
    let startDate = tim(currentDay)
    let endDate = util.formatTime(new Date()).slice(0, 10)

    console.log(startDate,endDate,platform,token,username)
    
    API.searchSaleData({
      data: {
        supplierNo,
        startDate,
        endDate,
        platform,
        token,
        username
      },
      success(res) {
        console.log(res,102)
        let saleTableData = res.data
        _this.setData({ saleTableData })
        // 计算当日销售数据
        _this.getTodaySaleData(saleTableData) 
      }
    })
  },
  // 导航跳转
  toPage (e) {
    let toPageName = e.target.dataset.name
    if (toPageName == 'accountStatement') {
      goPage('../accountStatement/accountStatement')
    } else if (toPageName == 'myStaff') {
      goPage('../myStaff/myStaff')
    } else if (toPageName == 'orderStatu0') {
      goPage('../orderStatu/orderStatu?nav=0')
    } else if (toPageName == 'orderStatu1') {
      goPage('../orderStatu/orderStatu?nav=1')
    } else if (toPageName == 'orderStatu2') {
      goPage('../orderStatu/orderStatu?nav=2')
    } else if (toPageName == 'orderStatu3') {
      goPage('../orderStatu/orderStatu?nav=3')
    } else if (toPageName == 'goodList') {
      goPage('../goodList/goodList')
    } else if (toPageName == 'driver') {
      goPage('../driverTransStatu/driverTransStatu')
    }
  },

  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  onReachBottom(){
  }
})
