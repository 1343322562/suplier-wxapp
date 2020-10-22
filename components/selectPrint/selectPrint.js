const { toast } = require("../../tool/tool")

// components/select-print/select-print.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShow: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    list: []
  },
  attached() {
    let list = this.data.list.length ? this.data.list : wx.getStorageSync('allPrint')
    console.log(list)
    let tempArr = []
    list.length && list.forEach((item,index) => {
      let tempObj = {}
      tempObj.printNo = item
      tempObj.select = false
      tempArr.push(tempObj)
    })
    console.log(tempArr)
    this.data.list = tempArr
    console.log(JSON.stringify(this.data.list))
    this.setData({ list: tempArr })
    console.log(JSON.stringify(this.data.list))
    console.log(this, this.data)
  },
  /**
   * 组件的方法列表
   */
  methods: {
    selectPrint(e) {
      let { index, select } = e.currentTarget.dataset
      const { list } = this.data
      list.forEach(item => {
        item.select = false
      })
      list[index].select = true
      this.setData({ list })
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
      if (!printNo) return toast ('请选择打印机')
      
      this.triggerEvent('printEvent', { printNo: printNo}) 
    },
    hide() {
      this.setData({ isShow: false })
    }
  }
})
