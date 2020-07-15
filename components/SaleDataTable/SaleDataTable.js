// components/SaleDataTable/SaleDataTable.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    saleTitleData: {
      type: Array,
      value: []
    },
    saleData: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  attached: function () { 
    console.log(this)
    
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
