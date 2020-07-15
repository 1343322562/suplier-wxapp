// components/orderStatuBottom/orderStatuBottom.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Array,
      value: [0,0,0]
    },
    isAllSelected: {
      type: Boolean,
      value: false,
    },
    priceItemStyle: String,
    priceContentStyle: String,
    // 控制显示区域
    isShowAllSelect: {
      type: Boolean,
      value: true,
    },
    isShowAccount: {
      type: Boolean,
      value: true,
    },
    isShowNum: {
      type: Boolean,
      value: true,
    },
    isShowPrice: {
      type: Boolean,
      value: true,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // allSlected (e) {
    //   let page = getCurrentPages().reverse()[0]
    //   page.allSelected(e)
    // }
  }
})
