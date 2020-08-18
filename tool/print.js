import { tim, timHMS } from '../utils/date-format.js'
// 处理打印格式
export const printContentHandle = function (data, type) {
  let content = '' // 打印内容
  let sign = type == 1 ? '重复打印' : ''
  let sheetNo = []
  let cDate = tim(0) + ' ' + timHMS() 
  console.log(cDate)
    //处理格式
  content += `<C><B><BOLD>${ getApp().globalData.wareInfo.warehouse }配送单</BOLD></B></C><BR><BR>`
  data.forEach((item, index) => {
    console.log(item, getApp())
    sheetNo.push(item.sheetNo)
    content += `<L>单    号：${item.sheetNo}<BR></L>`
    content += `<L>订单日期：${item.createDate}<BR></L>`
    content += `<L>${sign=='重复打印' ? '补打' : '出库'}日期：${cDate}<BR></L>`
    // content += `<L>编    号：${item.branchNo || ''}</L>`
    content += `<L>店    名：<BOLD>${item.branchName}</BOLD><BR></L>`
    content += `<L><N>联 系 人：${'黄老板'}</N><BR></L>`
    content += `<L><N>联系电话：${item.branchTel} </N><BR></L>`
    content += `<L>客户地址：${item.address}<BR></L>`
    content += `<C><N>————————————————————————</N><BR></C>`
    content += `<N> 序列    条码            品名</N><BR>`
    content += `<N> 单位    数量    原价    现价    合计     库位</N><BR>`
    content += `<C><N>-----------------------------------------------</N><BR></C>`
    item.details.forEach((good, i) => {
      content += `<N>【${i+1}】    ${good.itemSubno}      ${good.itemName.slice(0, 13)}</N><BR>`
      content += `<N> ${good.unitNo}       ${good.realQty}      ${good.subAmt.toFixed(2)}    ${good.subAmt.toFixed(2)}    <BOLD>${(good.subAmt*good.realQty).toFixed(2)}</BOLD>     ${item.warehouse || '空'}</N><BR>${item.details.length == 1 ? '' : '<BR>'}`
    })
    content += `<C><N>————————————————————————</N><BR></C>`
    content += `<N><L>整单合计：${(item.sheetAmt).toFixed(2)}<L>                 <R>${item.supplyFlag}</R></N><BR>`
    content += `<N><L>支付方式：${item.payWay || '货到付款'}<L></N><BR><BR>`
    content += `<B><L>应收金额:${(item.sheetAmt).toFixed(2)}<L></B><BR>`
    content += `<B><L>拒收金额:<HB>￥</HB><N>_____________</N><L></B><N> 无修改不用填</N><BR>`
    content += `<B><L>实收金额:<HB>￥</HB><N>_____________</N><L></B><N> 无修改不用填</N><BR><BR>`
    content += `<B><L>配送员：<N>________________</N><L></B><BR><BR>`
    content += `<L><HB>是否有冻品</HB>：    <B>□</B> <HB>是</HB>      <B>□</B> <HB>否</HB><L><BR><BR>`
    content += `<B><L>出货单备注：<L></B><BR>`
    content += `<BR><N><L>    (客户备注):${item.mome || '无'}<L></N>`
    content += `<BR><N><L>    (老板备注):${item.bossMome || '无'}<L></N><BR><BR>`
    content += `<N><L>温馨提示: 签收前,请确认整件数量即可,明细数量需在到货24小时内自行清点,少货差异请联系客服为您处理<L></N>`
    content += `<N><L>如有冻品,请开箱确认完好后再签字!!<L></N>`
    content += `<BR><BR><N><C>================================================<C></N><BR><BR>`


    // 回执单
    content += `<BR><BR><B><C>签收回执单<C></B><BR><BR>`
    content += `<L>单    号：${item.sheetNo}<BR></L>`
    content += `<L>订单日期：${item.createDate}<BR></L>`
    content += `<L>${sign=='重复打印' ? '补打' : '出库'}日期：${cDate}<BR><BR></L>`
  
    content += `<L>店    名：<BOLD>${item.branchName}</BOLD><BR></L>`
    content += `<L><N>联 系 人：${'黄老板'}</N><BR></L>` // ${item.supplyFlag}
    content += `<L><N>联系电话：${item.branchTel} </N><BR></L>` // ${item.supplyFlag}
    content += `<L>客户地址：${item.address}<BR><BR></L>`
  
    content += `<N><L>整单合计：${(item.sheetAmt).toFixed(2)}<L></N><BR>`
    content += `<N><L>支付方式：${item.payWay || '货到付款'}<L></N><BR><BR>`
    
    content += `<B><L>应收金额:${(item.sheetAmt).toFixed(2)}<L></B><BR>`
    content += `<B><L>拒收金额:<HB>￥</HB><N>_____________</N><L></B><N> 无修改不用填</N><BR>`
    content += `<B><L>实收金额:<HB>￥</HB><N>_____________</N><L></B><N> 无修改不用填</N><BR><BR>`
    
    content += `<B><L>客户签收:<N>__________________</N><L></B><BR><BR>`
    content += `<N><L>温馨提示: 签收前,请确认整件数量即可,明细数量需在到货24小时内自行清点,少货差异请联系客服为您处理<L></N>`
    content += `<N><L>如有冻品,请开箱确认完好后再签字!!<L></N><BR><BR>`
    
    content += `<L><HB>是否有冻品</HB>：    <B>□</B> <HB>是</HB>      <B>□</B> <HB>否</HB><L><BR><BR>`
    content += `<B><L>冻品客户确认:<N>__________________</N><L></B><BR><BR>`
    content += `<HB><L>如有冻品,请开箱确认完好后再签字!!<L></HB><BR><BR>`
    
    content += `<B><L>签收备注:<L></B><BR>.<BR>.<BR>.<BR>.<BR>.<BR>.<BR>.<BR>`
    content += `<BR><BR><N><C>================================================<C></N><BR><BR>`
  })
  sheetNo = sheetNo.join(',')
  console.log(sheetNo)
  content = `<C><QR140>${sheetNo}</QR></C><BR><BR>` + content // 二维码数据
  content += `</HB><C><B>完</B></C><BR><BR><BR><BR><BR><BR>`
  return content
}

