// components/goodCard/goodCard.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsData: {
      type: Object,
      value: {}
    },
    isAllSelected: {
      type: Boolean,
      value: false
    },
    isShowEditDialog: {
      type: Boolean,
      value: false
    },
    index: Number
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  attached: function () {
    // 在组件实例进入页面节点树时执行
    console.log(this.data.isAllSelected)
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 点击进入详情页
    toDetailClick (e) {
      let page = getCurrentPages().reverse()[0]
      page.toDetailClick(e)
    },
    // 修改价格
    editPrice(e) {
      let page = getCurrentPages().reverse()[0]
      page.showEditPriceDialogClick(e)
    },
    // 修改库存
    editStock (e) {
      this.triggerEvent('isShowEditDialogClick', !this.data.isShowEditDialog)
      let page = getCurrentPages().reverse()[0]
      page.isShowEditDialogClick(e)
      // this.setData({
      //   isShowEditDialog: !this.data.isShowEditDialog
      // })
    },
    // 选中商品
    selectedClick (e) {
      let page = getCurrentPages().reverse()[0]
      page.seleted(e)
    },
    // 跳转编辑商品页
    editGoodClick (e) {
      let page = getCurrentPages().reverse()[0]
      page.editGoodClick(e)
    }
  }
})
