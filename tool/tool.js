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
  wx.showToast({
    title: title,
    icon: 'none',
    duration: 1500
  });
}

export const showModal = (obj) => {
  obj.title = '提示'
  console.log(1)
  wx.showModal({
    title: obj.title || '提示',
    content: obj.content,
    cancelText: '取消',
    confirmText: '确定',
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
  wx.getSetting({
    success(res) {
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
        wx.getLocation({
          type: 'gcj02',
          altitude: 'true',
          isHighAccuracy: true,
          highAccuracyExpireTime: 4000,
          success(res) {
            console.log(res)
            params.complete(res)
          }
        })
      }
    }
  })
  return obj
}
