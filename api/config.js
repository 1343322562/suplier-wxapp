
export default {
  baseURL: 'https://ch.zksr.cn/', 
  // https://ch.zksr.cn/
  // http://192.168.2.96:8086/zksr-match/
  post (url, param) {
    this.ajax('post', url, param)
  },
  get (url, param) {
    this.ajax('get', url, param)
  },
  ajax(type, url, param) {
    let requestObj = param.data || {}
    let request = {
      url: this.baseURL + url,
      method: type,
      header: {
        'content-type': url.indexOf('application') === -1 ? 'application/x-www-form-urlencoded' : 'application/json'
      },
      dataType: 'json',
      data: requestObj ,
      success:  (response) => {
        console.log(response, url)
        // const data = (typeof response === 'object' ? response.data : response)
        if ((url != 'match_pay/getQrCodeUrl.do' && url != 'match_pay/closeQrPay.do') && (!response.data || (response.data.code != 0 && response.data.code != 10000)) ) {
          wx.setStorageSync('isWxLogin', true)
          setTimeout(() => { wx.hideLoading()},800)
          const page = getCurrentPages()[0].route.indexOf('login') // 获取当前页面栈。数组中第一个为首页，最后一个为当前页面。
          wx.showModal({
            title: '温馨提示',
            content: response.data.msg || response.data.message,
            success: () => {
              if (!page) wx.navigateTo({ url: '../login/login' }) // 不是 login 页面，则跳转到登录页
              // getApp().backLogin()
              // wx.removeStorageSync('userObj')
              // wx.removeStorageSync('allPromotion')
              // wx.removeStorageSync('configObj')
              // if (page != -1) {
              //   wx.reLaunch({ url: '/pages/login/login' })
              //   //param.error && param.error('login')
              // } else {
              //   wx.reLaunch({ url: '/pages/login/login' })
              // }
            },
            showCancel: false
          })
        } else {
          param.success(response.data)
        }
      },
      fail: param.error,
      complete: param.complete
    }
    wx.request(request)
  }
}
