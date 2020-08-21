import { toast } from "../tool/tool"

export default {
  baseURL: 'http://192.168.2.96:8087/zksr-match/',
  // https://ch.zksr.cn/
  // http://192.168.2.96:8087/zksr-match/  文艺
  // http://192.168.2.195:8087/zksr-match/
  // http://47.92.249.124:8081/zksr-match/
  // http://qzc.yxdinghuo.com/    中科
  // http://39.98.164.194:8087/
  post (url, param) {
    this.ajax('post', url, param)
  },
  get (url, param) {
    this.ajax('get', url, param)
  },
  ajax(type, url, param) {
    wx.showLoading({
      title: '请稍后...',
    })
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
        // if (response.statusCode == 404) return wx.showModal({ content: '请求丢失' })
        // const data = (typeof response === 'object' ? response.data : response)
        if(url == 'match/supplierItemSearch.do'){
          setTimeout(() => { wx.hideLoading()},800)
          if (response.data.code == 0) {
            param.success(response.data)
          }
        } else if (url == 'match/supplyOrderBySupplyType.do' && response.data.code == 1) {
          toast('暂无订单数据')
        } else if ((url != 'match_pay/getQrCodeUrl.do' && url != 'match_pay/closeQrPay.do') && (!response.data || (response.data.code != 0 && response.data.code != 10000)) ) {
          if (response.data.code == 1) return toast(response.data.msg)
          wx.setStorageSync('isWxLogin', true)
          setTimeout(() => { wx.hideLoading()},800)
          const page = getCurrentPages()[0].route.indexOf('login') // 获取当前页面栈。数组中第一个为首页，最后一个为当前页面。
          wx.showModal({
            title: '温馨提示',
            content: response.data.msg || response.data.message,
            success: () => {
              if (response.data.msg == '您尚未登录或登录失效，请登录后查看！') {
                wx.clearStorageSync()
                wx.reLaunch({
                  url: '../../pages/login/login',
                })
              }
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
      fail: param.error || function () { wx.hideLoading(); wx.showModal({ content: '请求超时，请检查网络重试' }) },
      complete: function (res) {
        wx.hideLoading()
        'complete' in param && param.complete(res)
      }
    }
    wx.request(request)
  }
}
