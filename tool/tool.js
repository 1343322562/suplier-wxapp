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
  wx.showModal({
    title: obj.title || '提示',
    content: obj.content,
    success(res) {
      if (res.confirm) {
        'success' in obj && obj.success()
      } else if (res.cancel) {
        'cancel' in obj && obj.cancel()
      }
    }
  })
}


