import ajax from './config'
export default {
  // match/
  getOpenId: (param) => ajax.post(`match/getOpenId.do`, param),       // 获取 openId
  toLogin: (param) => ajax.post(`match/supplyLoginPwd.do`, param),    // 登录supplySalesDate.do
  searchSaleData: (param) => ajax.post(`match/supplySalesDate.do`, param),        // 获取/查询 销售数据
  searchOrderData: (param) => ajax.post(`match/searchOrderSupply.do`, param),     // 查询前三天订单状态数据
  searchOrderStatusData: (param) => ajax.post(`match/supplyOrderBySupplyType.do`, param),      // 按条件查询订单数据(状态\时间/交款状态)
  searchOrderDetailData: (param) => ajax.post(`match/supplyOrderDetailBySheetNo.do`, param),   // 查询订单详情(根据单号)
  saveSupplierEmployment: (param) => ajax.post(`match/saveSupplierEmployment.do`, param),   // 新建或修改员工信息
  getSupplierEmployment: (param) => ajax.post(`match/getSupplierEmployment.do`, param),     // 获取员工信息
  updateSheetStatus: (param) => ajax.post(`match/updateSheetStatus.do`, param),             // 修改订单状态信息

  searchGoodsItemCls: (param) => ajax.post(`match/searchItemCls.do`, param),         // 查询商品类别
  updateItemNote: (param) => ajax.post(`match/updateItemNote.do`, param),            // 修改商品注解
  supplierItemSearch: (param) => ajax.post(`match/supplierItemSearch.do`, param),    // 分类商品
  updateItemStatus: (param) => ajax.post(`match/updateItemStatus.do`, param),        // 上下架
  updateItemPrice: (param) => ajax.post(`match/updateItemPrice.do`, param),          // 修改商品价格
  updateItemStock: (param) => ajax.post(`match/updateItemStock.do`, param),          // 修改商品库存
  updateSheetMemo: (param) => ajax.post(`/match/updateSheetMemo.do`, param),         // 修改老版备注
  updateWareLocatorNo: (param) => ajax.post(`/match/updateWareLocatorNo.do`, param),         // 修改商品库位信息
  


  submitReceiveOrder: (param) => ajax.post(`match/submitReceiveOrder.do`, param),   // 司机收货
  getErpUrl: (param) => ajax.post(`match/getErpUrl.do`, param),   // 获取图片请求根路径


  // match_distriution/
  commitPaymentOrder: (param) => ajax.post(`match_distribution/commitPaymentOrder.do`, param),  // 司机交款
  sheetEntrucking: (param) => ajax.post(`match_distribution/sheetEntrucking.do`, param),        // 装车
  cancelEntrucking: (param) => ajax.post(`match_distribution/cancelEntrucking.do`, param),      // 取消装车

  // match_pay
  getQrCodeUrl: (param) => ajax.post(`match_pay/getQrCodeUrl.do`, param),  // 二维码收款  closeQrPay
  closeQrPay: (param) => ajax.post(`match_pay/closeQrPay.do`, param),      // 关闭收款订单
  queryQrPay: (param) => ajax.post(`match_pay/queryQrPay.do`, param),      // 司机收款支付查询
  getMiniPayParameters: (param) => ajax.post(`match_pay/getMiniPayParameters.do`, param),  // 老板充值

  // match_finance
  searchOrderByCollectionFlag: (param) => ajax.post(`match_finance/searchOrderByCollectionFlag.do`, param),  // 查询收款信息
  collectionOrder: (param) => ajax.post(`match_finance/collectionOrder.do`, param),    // 确认收款
  getCheckData: (param) => ajax.post(`match_finance/getCheckData.do`, param),          // 查询对账汇总
  accountFlow: (param) => ajax.post(`match_finance/accountFlow.do`, param),   // 查询消费列表数据 supplierNo,startDate,endDate
  settleDetail: (param) => ajax.post(`match_finance/settleDetail.do`, param), // 查询消费详情 supplierNo ,operDate
  settleFlow: (param) => ajax.post(`match_finance/settleFlow.do`, param),     // 查询消费商品详情 supplierNo, sheetNo  
  

  // print
  addPrinters: (param) => ajax.post(`print/addPrinters.do`, param),    // 添加打印机
  print: (param) => ajax.post(`print/print.do`, param)     // 打印订单
}
