// pages/bankCarCommit/bankCarCommit.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    step: 0, // 步骤 0: 基本信息以及银行卡信息填写  1: 上传照片
    region: ['广西壮族自治区', '南宁市', '兴宁区'],
    customItem: '全部',
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  // 是否信息填写完整
  isAdopt(obj) {
    let info
    for (let key in obj) {
      switch (key) {
        case 'legalName':
          break;
      }
      if (key == 'legalName'){
        if (!obj[key] && !(obj[key].length > 1) && !(obj[key].length < 5)) {
          info = '请填写正确的姓名'
        }
      } else if (key == 'legalIdCard') {
        if (obj[key].length != 18) {
          info = '请填写正确的身份号码'
        }
      } else if (key == 'merLegalPhone') {
      }
    }
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
    const { inputValue } = this.data
    switch (this.data.step) { // 前往下一步
      case 0:
        // 基本信息 
        const basicObj = {
          legalName: inputValue.legalName,
          legalIdCard: inputValue.legalIdCard,
          merLegalPhone: inputValue.merLegalPhone,
          merProvince: inputValue.merProvince,
          merCity: inputValue.merCity,
          merDistrict: inputValue.merDistrict,
          merAddress: inputValue.merAddress,
          mail: inputValue.mail
        }
        let isAdopt = isAdopt()
        return this.setData({ step: 1 }) 
      case 1:
        // 银行卡以及开户信息
        const bankObj = {
          cardNo: inputValue.cardNo,
          headBankCode: inputValue.headBankCode,
          bankCode: inputValue.bankCode,
          yeeBankProvince: inputValue.yeeBankProvince,
          yeeBankCity: inputValue.yeeBankCity
        }
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

  // 省市区选择
  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
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