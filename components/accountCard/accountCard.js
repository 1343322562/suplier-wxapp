// components/accountCard/accountCard.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object,
      value: {}
    },
    checkbox: {
      type: Number,
      value: 0
    },
    allCheckbox: {
      type: Boolean,
      value: false
    },
    isShowNewOrderSign: {  // 未查看的新订单是否显示 红色标识
      type: Boolean,
      value: true
    },
    isShowCheckbox: {  // 是否显示 radio
      type: Boolean,
      value: true
    },
    isShowMemoIcon: {
      type: Boolean,
      value: false
    },
    index: Number
  },

  /**
   * 组件的初始数据
   */
  data: {
    baseImgUrl: 'http://mmj.zksr.cn:8888/'  // 门店图片根路径  ( + branchNo )
    // http://39.98.164.194/upload/images/bdBranchInfo/
  },

  attached () {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    allSlected (e) {
      console.log(e)
      console.log(page)
      this.setData({ checkbox: !this.data.checkbox })
    },
    selected (e) {
      let page = getCurrentPages().reverse()[0]
      let checkbox = !this.data.checkbox
      let index = e.target.dataset.index
      page.myCheckbox(checkbox, index)
      // this.setData({ checkbox: checkbox })
    },
    showMemoDialogClick() {
      let page = getCurrentPages().reverse()[0]
      page.setData({ isShowMemoDialog: true })
    }
  }
})
