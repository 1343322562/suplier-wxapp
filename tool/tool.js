export const goPage = (url) => {
  wx.navigateTo({
    url: url
  })
}

export const backPage = (delta = 1) => {
  wx.navigateBack({
    delta: delta
  })
}

export const toast = (title = '完成') => {
  setTimeout(() => {
    wx.showToast({
      title: title,
      icon: 'none',
      duration: 1600
    });
  },300)
}

export const showModal = (obj) => {
  obj.title = '提示'
  let showCancel = true
  if (typeof obj.showCancel == 'string' || typeof obj.showCancel == 'boolean') showCancel = obj.showCancel
  console.log(1)
  wx.showModal({
    title: obj.title || '提示',
    content: obj.content,
    showCancel,
    cancelText: obj.cancelText || '取消',
    confirmText: obj.confirmText || '确定',
    success(res) {
      if (res.confirm) {
        'success' in obj && obj.success()
      } else if (res.cancel) {
        'cancel' in obj && obj.cancel()
      }
    }
  })
}

export const getLocation = (params) => {
  let obj = {}
  const _this = params.this
  wx.getSetting({
    success(res) {
      console.log(res)
      if (!res.authSetting['scope.userLocation']) {
        wx.authorize({
          scope: 'scope.userLocation',
          success (res) {
            params.complete(res)
            console.log( '获取授权信息啦',res)
          },
          fail(res) {
            params.complete(res)
            console.log('调取失败' ,res)
            wx.showModal({
              showCancel: false,
              title: '提示',
              content: '检测到您的定位信息关闭，请开启定位',
              cancelText: '关闭',
              confirmText: '前往开启',
              success(res) {
                console.log(res)
                if (res.confirm) {
                  wx.openSetting({
                    success(res) {
                      console.log('openSetting', res)
                    }
                  })
                }
              }
            })
          }
        })
      } else {
        wx.showLoading()
        wx.getLocation({
          type: 'gcj02',
          altitude: 'true',
          isHighAccuracy: true,
          // highAccuracyExpireTime: 3000,
          success(res) {
            console.log(res)
            params.complete(res)
          },
          fail(res) {
            console.log(res)
            wx.showModal({
              showCancel: false,
              title: '您手机定位功能没有开启',
              content: '请在系统设置中打开定位服务',
              confirmText: '已开启',
              success() {
                _this.onLoad()
              }
            })
          }
        })
      }
    }
  })
  return obj
}

// 获取用户的 IP 地址
export const getIP = (param) => {
  wx.request({
    url: 'https://open.onebox.so.com/dataApi?type=ip&src=onebox&tpl=0&num=1&query=ip&url=ip',
    data: {
    },
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: function (res) {
      param.complete(res.data.ip)
    }
  });
} 

// 生成随机数
export const mathRandom = (num = 1) => {
  let str = ''
  for (let i = 1; i <= num; i++) {
    str += Math.floor(Math.random() * 10)
  }
  console.log(str)
  return Number(str)
} 
