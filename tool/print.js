// 处理打印格式
export const printContentHandle = function (data, type) {
  let content = '' // 打印内容
  let sign = type == 1 ? '重复打印' : ''
  let sheetNo = []
    //处理格式
  content += `<C><B><BOLD>${getApp().globalData.wareInfo.warehouse}出库单</BOLD></B></C><BR><BR>`
  data.forEach((item, index) => {
    console.log(item, getApp())
    sheetNo.push(item.sheetNo)
    content += `<L>单号：${item.sheetNo}<BR></L>`
    content += `<L>打印时间：${sign || item.createDate}</L>`
    content += `<L><BR>编号：${item.branchNo || ''}   店名：<BOLD>${item.branchName}</BOLD><BR></L>`
    content += `<L><N>联系人：${'黄老板'}   联系电话：${item.branchTel} </N><BR></L>` // ${item.supplyFlag}
    content += `<L>地址:${item.address}<BR></L>`
    content += `<C><N>————————————————————————</N><BR></C>`
    content += `<N> 序列     条码              品名</N><BR>`
    content += `<N> 单位     数量     原价     现价     合计     </N><BR>`
    content += `<C><N>-----------------------------------------------</N><BR></C>`
    item.details.forEach((good, i) => {
      content += `<N>【${i+1}】     ${good.itemSubno}       ${good.itemName.slice(0, 13)}</N><BR>`
      content += `<N> ${good.unitNo}        ${good.realQty}      ${good.subAmt.toFixed(2)}   ${good.subAmt.toFixed(2)}   ${(good.subAmt*good.realQty).toFixed(2)}</N><BR><BR>`
    })
    content += `<C><N>————————————————————————</N><BR></C>`
    content += `<N><L>合计应付：${(item.sheetAmt).toFixed(2)}<L>                 <R>${item.supplyFlag}</R></N><BR>`
    content += `<N><L>支付方式：${item.payWay || '货到付款'}<L></N><BR>`
    content += `<B><L>客户备注：${item.mome || '无'}<L></B><BR><BR>`
    content += `<B><L>老板备注：${item.mome || '无'}<L></B><BR><BR>`
    content += `<N><L> 如出库单数量有疑问请拨打：${item.branchTel}联系处理<L></N><BR><BR>`
  })
  sheetNo = sheetNo.join(',')
  content = `<C><QR180>订单号</QR></C><BR><BR>` + content // 二维码数据
  content += `</HB><C><B>完</B></C><BR><BR><BR><BR><BR><BR>`
  return content
}

