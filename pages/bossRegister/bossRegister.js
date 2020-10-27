import { goPage, showModal, toast, getLocation, getIP } from '../../tool/tool.js'
import API from '../../api/index.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    step: 0, // 步骤 0: 基本信息以及银行卡信息填写  1: 上传照片
    areaCode: '',
    customItem: '全部',
    /* picker */
    area: [[], ['请选择省'], ['请选择市']],   // 省市区
    areaIndex: [0, 0, 0],
    bank: [],
    bankIndex: [],
    inputValue: {
      /* 基本信息 */
      legalName: '',     // 法人姓名
      legalIdCard: '',   // 法人证件号
      merLegalPhone: '', // 法人手机号
      merProvince: '',   // 省
      merCity: '',       // 市
      merDistrict: '',   // 区
      merAddress: '',    // 商户详细地址
      mail: '',          // 邮箱

      /* 银行卡以及开户信息 */
      cardNo: '',        // 卡号
      headBankCode: '',  // 开户银行编号
      bankCode: '',      // 开户支行编号
      yeeBankProvince: '',  // 开户省
      yeeBankCity: '',      // 开户市 
    }
  },
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value, e)
    this.setData({ areaIndex: e.detail.value })
  },
  bindMultiPickerColumnChange(e){
    console.log(e)
    const { column, value } = e.detail
    const _this = this
    this.setData({ [`areaIndex[${column}]`]: value })
    switch(column) {
      case 0:
        this.setData({ [`areaIndex[0]`]: value })
        if (this.provincePickerTimer) clearTimeout(this.provincePickerTimer)
        this.provincePickerTimer = setTimeout(() => {
          _this.getBankCity(value)
        }, 800)
        break;
      case 1:
        if (this.cityPickerTimer) clearTimeout(this.cityPickerTimer)
        this.cityPickerTimer = setTimeout(() => {
          _this.getBankDistrict(value)
        }, 500)
        break;
      case 2:
        this.setData({ [`areaIndex[2]`]: value })
    }
  },

  getYeepayBank() {
    const { platform, token, username, supplierNo } = this.userObj
    const _this = this
    API.getYeepayBank({
      data: { platform, token, username, supplierNo },
      success(res) {
        console.log(res)
      }
    }) 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.userObj = wx.getStorageSync('authorizeObj')
    this.getBankProvince() // 获取省份
    this.getYeepayBank() // 获取开户行
  },
  // 省
  getBankProvince() {
    const { platform, token, username, supplierNo } = this.userObj
    const _this = this
    API.getBankProvince({
      data: { platform, token, username, supplierNo },
      success(res) {
        console.log(res)
        if (res.code == 0) {
          let data = res.data
          let provinceArr = []
          data.forEach((item) => {
            provinceArr.push(item.province)
          })
          _this.data.area[0] = provinceArr
          _this.setData({ [`area[0]`]: provinceArr })
          _this.getBankCity()
        }
      }
    })
  },
  // 市
  getBankCity(index = 0) {
    const { platform, token, username, supplierNo } = this.userObj
    const { area } = this.data
    const _this = this
    const province = area[0][index]
    API.getBankCity({
      data: { platform, token, username, supplierNo, data: province },
      success(res) {
        console.log(res)
        if (res.code == 0) {
          let data = res.data
          let cityArr = []
          data.forEach((item) => {
            cityArr.push(item.city)
          })
          _this.data.area[1] = cityArr
          _this.setData({ [`area[1]`]: cityArr })
          _this.getBankDistrict()
        }
      }
    })
  },
  // 区 
  getBankDistrict(index = 0) {
    const { platform, token, username, supplierNo } = this.userObj
    const { area } = this.data
    const _this = this
    const city = area[1][index]
    API.getBankDistrict({
      data: { platform, token, username, supplierNo, data: city }, 
      success(res) {
        console.log(res)
        if (res.code == 0) {
          let data = res.data
          let districtArr = []
          data.forEach((item) => {
            districtArr.push(item.district)
          })
          _this.setData({ [`area[2]`]: districtArr })
        }
      }
    })
  },

  // 表单验证
  isAdopt(obj) {
    let info = ''
    for (let key in obj) {
      switch (key) {
        case 'legalName':
          if (!obj[key] && !(obj[key].length > 1) && !(obj[key].length < 5)) {
            info = '请填写正确的姓名'
          }
          break;
        case 'legalIdCard':
          if (obj[key].length != 18) {
            info = '请填写正确的身份号码'
          }
          break;
        case 'merLegalPhone':
          if (obj[key].length != 11) {
            info = '请填写正确的手机号'
          }  
          break;
        case ('merProvince' || 'merCity' || 'merDistrict'):
          if (!obj[key]) {
            info = '请选择正确的省市区'
          }
          break;
        case 'merAddress':
          if (!obj[key]) {
            info = '请填写详细地址'
          }
          break;
        case 'mail':
          if (!obj[key]) {
            info = '请填写邮箱'
          }
          break;
        case 'cardNo':
          if (obj[key].length != 18 && obj[key].length != 16 && obj[key].length != 17) {
            info = '请填写正确的银行卡号'
          }
          break;
        case 'headBankCode':
          if (!obj[key]) {
            info = '请填写开户银行编号'
          }
          break;
        case 'bankCode':
          if (!obj[key]) {
            info = '请填写开户银行支行编号'
          }
          break;
        case 'yeeBankProvince':
          if (!obj[key]) {
            info = '请填写开户银行支行编号'
          }
          break;
      }
    }
    return info
  },
  
  bindInputValue (e) {
    console.log(e)
    const { label } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({ [`inputValue.${label}`]: value })
    console.log(label, value)
  },
  // 下一步
  runStep() {
    const { inputValue, area, areaIndex } = this.data
    switch (this.data.step) {
      case 0:                   
      /* 基本信息 */
        const basicObj = {
          legalName: inputValue.legalName,
          legalIdCard: inputValue.legalIdCard,
          merLegalPhone: inputValue.merLegalPhone,
          merProvince: area[0][areaIndex[0]],  // 省
          merCity: area[1][areaIndex[1]],      // 市
          merDistrict: area[2][areaIndex[2]],  // 区
          merAddress: inputValue.merAddress,
          mail: inputValue.mail
        }
        let adoptInfo = this.isAdopt(basicObj)
        console.log(adoptInfo)
        // if (adoptInfo) return toast(adoptInfo)
        return this.setData({ step: 1 })
      case 1:           
      /* 银行卡以及开户信息 */ 
        const bankObj = {
          cardNo: inputValue.cardNo,
          headBankCode: inputValue.headBankCode,
          bankCode: inputValue.bankCode,
          yeeBankProvince: inputValue.yeeBankProvince,
          yeeBankCity: inputValue.yeeBankCity
        }
        let adoptInfo2 = this.isAdopt(bankObj)
        console.log(adoptInfo2)
        if (adoptInfo2) return toast(adoptInfo2)
        return this.setData({ step: 2 }) 
    }
  },
  submit(e) {
    console.log(this.data, 1, e)
    console.log(2)
  },

  // 返回上一步
  backStep() {
    let { step } = this.data
    this.setData({ step: step - 1 })
  },
  // 拍照\选择照片上传
  upImage() {
    const _this = this
    wx.chooseImage({
      count: 1,
      success(res) {
        console.log(res)
        const tempFilePath = res.tempFilePaths[0]
        // _this.uploadImg(tempFilePath)
      }
    })
  },

  uploadImg(url) {
    // wx.uploadFile({
    //   url: '',
    //   filePath: url,
    //   name: 'file',
    //   success: (res) => {
    //     console.log(res)
    //     hideLoading()
    //     if (data.status === 200) {
    //       // toast('图片上传成功!')
    //     } else {
    //       toast('图片上传失败!')
    //     }
    //   },
    //   fail: () => {
    //     hideLoading()
    //     toast('选择图片失败!')
    //   }
    // })
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