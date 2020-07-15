// components/CheckBox/checkBox.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    currentIndex: {
      type: Number,
      value: 0
    },
    checkBoxData: Array
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

    roleSelect (e) {
      let checkBoxSelectd = e.target.dataset.selecter
      this.triggerEvent('myevent', { index: checkBoxSelectd})  // 将下标传递给父组件
    }
  }
})
