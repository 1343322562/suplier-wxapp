// components/selectNavbar/selectNavbar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    selectItemArray: {
      type: Array,
      value: []
    },
    selectedNavIndex: {
      type: Number,
      value: 0
    },
    itemStyle: String
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
    selectNavs (e) {
      let selectedNav = e.target.dataset.index
      this.triggerEvent('myevent', { index: selectedNav})  // 将下标传递给父组件
    }
  }
})
