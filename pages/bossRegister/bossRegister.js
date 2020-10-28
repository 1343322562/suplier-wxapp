import { goPage, showModal, toast, getLocation, getIP } from '../../tool/tool.js'
import API from '../../api/index.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    step: 0, // 步骤 0: 基本信息  1:银行卡信息填写  2: 上传照片
    areaCode: '',
    // region: ['广西壮族自治区', '南宁市', '兴宁区'], // 基本信息 
    pickerType: 0, // 0： 基本信息picker   1：银行卡 picker
    /* 开户行省市区 picker */
    area: [[], ['请选择省'], ['请选择市']],
    areaObj: [{}, {}, {}], // 省市区数据对象
    areaIndex: [0, 0, 0],
    /* 基本信息省市区 picker */
    basicArea: [[], ['请选择省'], ['请选择市']], 
    basicAreaObj: [{}, {}, {}], // 省市区数据对象
    basicAreaIndex: [0, 0, 0],

    bankDataObj: {},   // 银行数据对象
    bankKeyArr: [],    // 总的
    bankSelectArr: [], // 过滤后的

    subBankDataObj: {},  // 支行数据对象
    subBankKeyArr: [],   
    subBankSelectArr: [],

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
  pickerClick(e) {
    let { type: pickerType } = e.currentTarget.dataset
    this.data.pickerType = pickerType
  },
  // 基本信息省市区选择
  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({ region: e.detail.value })
  },
  /* type  0: 基本信息省市区  1：开户行省市区 */
  // 省市区 picker 选择
  bindAreaPickerColumnChange(e){
    console.log(e)
    const { pickerType } = this.data
    const { column, value } = e.detail
    const _this = this
    console.log(pickerType)
    switch(Number(pickerType)) {
      case 0:
        this.setData({ [`basicAreaIndex[${column}]`]: value })
        break;
      case 1:
        this.setData({ [`areaIndex[${column}]`]: value })
        break;
    }

    switch(column) {
      case 0:
        if (this.provincePickerTimer) clearTimeout(this.provincePickerTimer)
        this.provincePickerTimer = setTimeout(() => {
          _this.getBankCity(value, pickerType)
        }, 600)
        break;
      case 1:
        if (this.cityPickerTimer) clearTimeout(this.cityPickerTimer)
        this.cityPickerTimer = setTimeout(() => {
          _this.getBankDistrict(value, pickerType)
        }, 600)
        break;
    }
  },
  
  // 获取支行
  getYeeBankSubbranch(bankName) {
    const { platform, token, username, supplierNo } = this.userObj
    const { area, areaIndex, bankDataObj } = this.data
    console.log(bankDataObj[bankName],[bankName])
    const bankCode = bankDataObj[bankName].bankCode
    console.log('bankCode',bankCode)
    let yeeBankProvince = area[0][areaIndex[0]].provinceCode
    let yeeBankCity = area[1][areaIndex[1]].cityCode
    const _this = this
    API.getYeeBankSubbranch({
      data: { platform, token, username, supplierNo, yeeBankProvince, yeeBankCity, data: bankCode},
      success(res) {
        console.log(res)
        let subBankData = res.data
        let subBankDataObj = {}
        let subBankKeyArr = []
        subBankData.forEach(item => {
          subBankDataObj[item.sub] = item
        })
        subBankKeyArr = Object.keys(subBankDataObj)
        _this.data.subBankDataObj = subBankDataObj
        _this.data.subBankKeyArr = subBankKeyArr
        console.log(subBankKeyArr)
      }
    }) 
  },
  // 获取开户行
  getYeepayBank() {
    const { platform, token, username, supplierNo } = this.userObj
    const _this = this
    API.getYeepayBank({
      data: { platform, token, username, supplierNo },
      success(res) {
        console.log(res)
        let bankData = res.data
        let bankDataObj = {}
        let bankKeyArr = []
        bankData.forEach(item => {
          bankDataObj[item.bankName] = item
        })
        bankKeyArr = Object.keys(bankDataObj)
        _this.data.bankDataObj = bankDataObj
        _this.data.bankKeyArr = bankKeyArr
        console.log(bankKeyArr)
      }
    }) 
  },
  // 开户行以及支行 数据处理
  /*
   * type  0：开户行  1：支行
   */
  bankDataHanle(data, type, _this) {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.userObj = wx.getStorageSync('authorizeObj')
    this.getBankProvince() // 获取省份
    this.getYeepayBank() // 获取开户行
    setTimeout(() => {console.log(this.data)}, 1000)
  },
  // 省
  getBankProvince() {
    const { platform, token, username, supplierNo } = this.userObj
    const _this = this
    const { pickerType } = this.data
    API.getBankProvince({
      data: { platform, token, username, supplierNo },
      success(res) {
        console.log(res)
        if (res.code == 0) {
          let data = res.data
          let obj = {}
          data.forEach((item) => {
            item.place = item.province
            obj[item.place] = item
            delete item.province
          })
          switch(Number(pickerType)) {
            case 0:
              _this.data.basicArea[0] = data
              _this.setData({ [`basicArea[0]`]: data, ['basicAreaObj[0]']: obj })
              break;
            case 1:
              _this.data.area[0] = data
              _this.setData({ [`area[0]`]: data, ['areaObj[0]']: obj })
              break;
          }
          _this.getBankCity()
        }
      }
    })
  },
  // 市
  getBankCity(index = 0) {
    const { platform, token, username, supplierNo } = this.userObj
    const { area, basicArea, pickerType } = this.data
    const _this = this
    const province = pickerType == 0 ? basicArea[0][index].place : area[0][index].place
    API.getBankCity({
      data: { platform, token, username, supplierNo, data: province },
      success(res) {
        console.log(res)
        if (res.code == 0) {
          let data = res.data
          let obj = {}
          data.forEach((item) => {
            item.place = item.city
            obj[item.place] = item
            delete item.city
          })
          switch(Number(pickerType)) {
            case 0:
              _this.data.basicArea[1] = data
              _this.setData({ [`basicArea[1]`]: data, ['basicAreaObj[1]']: obj })
              break;
            case 1:
              _this.data.area[1] = data
              _this.setData({ [`area[1]`]: data, ['areaObj[1]']: obj })
              break;
          }
          // _this.data.area[1] = data
          // _this.setData({ [`area[1]`]: data, ['areaObj[1]']: obj })
          _this.getBankDistrict()
        }
      }
    })
  },
  // 区 
  getBankDistrict(index = 0) {
    const { platform, token, username, supplierNo } = this.userObj
    const { area, basicArea, pickerType } = this.data
    const _this = this
    const city = pickerType == 0 ? basicArea[1][index].place : area[1][index].place
    API.getBankDistrict({
      data: { platform, token, username, supplierNo, data: city }, 
      success(res) {
        console.log(res)
        if (res.code == 0) {
          let data = res.data
          let obj = {}
          data.forEach((item) => {
            item.place = item.district
            obj[item.place] = item
            delete item.district
          })
          switch(Number(pickerType)) {
            case 0:
              _this.data.basicArea[2] = data
              _this.setData({ [`basicArea[2]`]: data, ['basicAreaObj[2]']: obj })
              break;
            case 1:
              _this.data.area[2] = data
              _this.setData({ [`area[2]`]: data, ['areaObj[2]']: obj })
              break;
          }
          // _this.setData({ [`area[2]`]: data, ['areaObj[2]']: obj })
        }
      }
    })
  },

  // 表单验证
  isAdopt(obj) {
    let info = ''
    const { inputValue, subBankDataObj, bankDataObj } = this.data
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
          if (obj[key].length != 18 && obj[key].length != 16 && obj[key].length != 17){
            info = '请填写正确的银行卡号'
          }
          break;
        case 'headBankCode':
          if (!obj[key] && inputValue[key] in bankDataObj) {
            info = '请填写(选择)正确的开户行名称'
          }
          break;
        case 'bankCode':
          if (!obj[key] && inputValue[key] in subBankDataObj) {
            info = '请填写(选择)正确的开户行支行名称'
          }
          break;
        case ('yeeBankProvince' || 'yeeBankCity'):
          if (!obj[key] && inputValue[key] in subBankDataObj) {
            info = '请选择开户行所属省市区'
          }
          break;
      }
    }
    return info
  },
  // 选择 开户行 支行
  selectHeadBank(e) {
    const { index, type } = e.currentTarget.dataset
    const { bankSelectArr, bankDataObj, subBankSelectArr, subBankDataObj } = this.data
    switch(Number(type)) {
      case 0: /* 开户行 */
        const bankName = bankDataObj[bankSelectArr[index]].bankName
        this.data.inputValue.headBankCode = bankName
        this.setData({
          [`inputValue.headBankCode`]: bankName,
          bankSelectArr: []
        })
        this.getYeeBankSubbranch(bankName)
        break;
      case 1: /* 支行 */
        const sub = subBankDataObj[subBankSelectArr[index]].sub
        this.setData({
          [`inputValue.bankCode`]: sub,
          subBankSelectArr: []
        })
        break;
    }
  },
  bindInputValue (e) {
    console.log(e)
    const { label } = e.currentTarget.dataset
    const { value } = e.detail
    console.log(this.data.bankCode ,value)
    if (label == 'headBankCode' && value.length >= 2 && value.length <= 5) {
      const bankSelectArr = this.bankArrHandle(value, 0)
      this.setData({ [`inputValue.${label}`]: value, bankSelectArr })
      return;
    } else if (label == 'bankCode' && value.length >= 2 && this.data.inputValue.bankCode.length < value.length){
      const subBankSelectArr = this.bankArrHandle(value, 1)
      this.setData({ [`inputValue.${label}`]: value, subBankSelectArr })
      return;
    }
    this.setData({ [`inputValue.${label}`]: value, bankSelectArr: [] })
    console.log(label, value)
  },
  
  // 过滤银行数组 type 0: 开户行   1：开户行支行
  bankArrHandle(value, type) {
    const { bankKeyArr, subBankKeyArr } = this.data
    switch (type) {
      case 0: 
        let bankSelectArr = []
        bankKeyArr.forEach(item => {
          if(item.includes(value)) bankSelectArr.push(item) 
        })
        return bankSelectArr
      case 1:
        let subBankSelectArr = []
        subBankKeyArr.forEach(item => {
          if(item.includes(value)) subBankSelectArr.push(item) 
        })
        return subBankSelectArr
    }
  },
  // 下一步
  runStep() {
    const { inputValue, basicArea, basicAreaIndex, area, areaIndex } = this.data
    switch (this.data.step) {
      case 0:                   
      /* 基本信息 */
        const basicObj = {
          legalName: inputValue.legalName,
          legalIdCard: inputValue.legalIdCard,
          merLegalPhone: inputValue.merLegalPhone,
          merProvince: basicArea[0][basicAreaIndex[0]].provinceCode,  // 省
          merCity: basicArea[1][basicAreaIndex[1]].cityCode,      // 市
          merDistrict: basicArea[2][basicAreaIndex[2]].districtCode,  // 区
          merAddress: inputValue.merAddress,
          mail: inputValue.mail
        }
        let adoptInfo = this.isAdopt(basicObj)
        console.log(adoptInfo)
        // if (adoptInfo) return toast(adoptInfo)
        this.data.pickerType = 1
        // 用户未选择开户行省市区时，发起省市区请求
        if (!this.data.area[0].length) this.getBankProvince()
        return this.setData({ step: 1 })
      case 1:           
      /* 银行卡以及开户信息 */ 
        const bankObj = {
          cardNo: inputValue.cardNo,
          headBankCode: inputValue.headBankCode,
          bankCode: inputValue.bankCode,
          yeeBankProvince: area[0][areaIndex[0]].provinceCode,
          yeeBankCity: area[0][areaIndex[0]].cityCode
        }
        let adoptInfo2 = this.isAdopt(bankObj)
        console.log(adoptInfo2)
        // if (adoptInfo2) return toast(adoptInfo2)
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

    if (step!=1 && step!=2) return
    this.data.pickerType = step - 1
    this.data.step = step - 1
    this.setData({ step: step - 1 })
  },
  // 拍照\选择照片上传
  upImage() {
    const _this = this
    wx.chooseImage({
      count: 1,
      sourceType: ['camera', 'album'],
      sizeType: ['original', 'compressed'],
      success(res) {
        console.log(res)
        const tempFilePath = res.tempFilePaths[0]
        _this.uploadImg(tempFilePath)
      }
    })
  },

  uploadImg(url) {
    wx.uploadFile({
      url: 'http://192.168.2.96:8087/zksr-match/yeepay/uploadPicture.do',
      filePath: url,
      name: 'file',
      formData: {
        'user': 'test'
      },
      success: (res) => {
        console.log(res)
        console.log(JSON.parse(res.data))
      },
      fail: (err) => {
        console.log(err)
        hideLoading()
        toast('选择图片失败!')
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