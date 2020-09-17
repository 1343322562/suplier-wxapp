const { toast } = require("../../tool/tool")

// components/select-print/select-print.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: true
  },
  attached() {
    let list = this.data.list.length ? this.data.list : wx.getStorageSync('allPrint')
    let tempArr = []
    list.forEach((item,index) => {
      let tempObj = {}
      tempObj.printNo = item
      tempObj.select = false
      tempArr.push(tempObj)
    })
    console.log(tempArr)
    this.setData({ list: tempArr })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    selectPrint(e) {
      let { index, select } = e.currentTarget.dataset
      this.setData({ [`list[${index}].select`]: !select })
    },
    confirm() {
      let { list } = this.data
      let printNo
      list.forEach(item => {
        if (item.select) {
          printNo = printNo ? `${item.printNo},${printNo}` : item.printNo
        }
      })
      console.log(printNo)
      if (!printNo) toast ('请选择打印机')
    },
    hide() {
      this.setData({ isShow: false })
    }
  }
})
