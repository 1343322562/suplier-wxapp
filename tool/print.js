import { tim, timHMS } from '../utils/date-format.js'

let contentHandle = {
  unit(e, strLength = 9) {
    // if (e.length >= strLength) return 
    e = e.toString()
    let len = strLength - e.length // 空格长度
    if (e.length >= strLength) len = 1
    for(let i = 0; i <= len-1; i++) {
      e += ' ' 
    }
    console.log(e, e.length)
    return e
  },
}


// 处理打印格式
export const printContentHandle = function (data, type) {
  let content = '' // 打印内容
  let sign = type == 1 ? '重复打印' : ''
  let sheetNo = []
  let cDate = tim(0) + ' ' + timHMS() 
  console.log(cDate)
    //处理格式
    console.log(sign)
  // content += `<C><B><BOLD>${sign=='重复打印' ? '(复打) 配送单' : '配送单'}</BOLD></B></C><BR><BR>` // 不改
  content += `<C><B><BOLD>(复打) 配送单</BOLD></B></C><BR><BR>` // 不改
  data.forEach((item, index) => {
    console.log(item, getApp())
    sheetNo.push(item.sheetNo)
    // content += `<L>前置仓名称：${getApp().globalData.wareInfo.warehouse || getApp().globalData.wareInfo.supplierName}<BR></L>`
    content += `<L>单    号：${item.sheetNo}<BR></L>`
    content += `<L>订单日期：${item.createDate.slice(0, 19)}<BR></L>`
    content += `<L>复打日期：${cDate}<BR></L>`
    // content += `<L>编    号：${item.branchNo || ''}</L>`
    content += `<L>店    名：<BOLD>${item.branchName}</BOLD><BR></L>`
    content += `<L><N>联 系 人：${item.branchMan}</N><BR></L>`
    content += `<L><N>联系电话：${item.branchTel} </N><BR></L>`
    content += `<L>客户地址：${item.address}<BR></L>`
    content += `<C><N>————————————————————————</N><BR></C>`
    content += `<N> 序列      条码                品名</N><BR>`
    content += `<N> 数量      原价      现价      合计      备注</N><BR>`
    content += `<C><N>-----------------------------------------------</N><BR></C>`
    item.details.forEach((good, i) => {
      content += `<N>【${i+1}】    ${contentHandle.unit(good.itemSubno, 19)}${good.itemName.slice(0, 9)}</N><BR>`
      content += `<N> <BOLD>${contentHandle.unit(good.realQty+good.unitNo, 7)}</BOLD>${contentHandle.unit(good.orgiPrice.toFixed(2), 10)}<BOLD>${contentHandle.unit(good.subAmt.toFixed(2)+'/'+good.unitNo, 11)}</BOLD>${contentHandle.unit((good.subAmt*good.realQty).toFixed(2), 10)}${item.warehouse || '空'}</N><BR><BR>`
    })
    content += `<C><N>————————————————————————</N><BR></C>`
    // content += `<N><L>整单合计：${(item.sheetAmt).toFixed(2)}<L>                 <R>${item.supplyFlag}</R></N><BR>`
    content += `<N><L>整单合计：${(item.sheetAmt).toFixed(2)}<L></N><BR>`
    content += `<N><L>支付方式：${item.payWay || '货到付款'}<L></N><BR><BR>`
    content += `<B><L>应收金额: ${(item.sheetAmt).toFixed(2)}<L></B><BR>`
    content += `<B><L>拒收金额:<HB>￥</HB><N>_____________</N><L></B><N> 无修改不用填</N><BR>`
    content += `<B><L>实收金额:<HB>￥</HB><N>_____________</N><L></B><N> 无修改不用填</N><BR><BR>`
    content += `<B><L>配送员：<N>________________</N><L></B><BR><BR>`
    content += `<L><HB>是否有冻品</HB>：    <B>□</B> <HB>是</HB>      <B>□</B> <HB>否</HB><L><BR><BR>`
    // content += `<B><L>出货单备注：<L></B><BR>`
    content += `<BR><B><L>客户备注:${item.mome || '无'}</L></B>`
    content += `<BR><B><L>老板备注:${item.bossMemo || '无'}</L></B><BR><BR>`
    // content += `<N><L>温馨提示: 签收前,请确认整件数量即可,明细数量需在到货24小时内自行清点,少货差异请联系客服为您处理<L></N>`
    // content += `<N><L>如有冻品,请开箱确认完好后再签字!!<L></N>`
    content += `<BR><BR><N><C>================================================<C></N><BR><BR>`


    // 回执单
    content += `<BR><BR><B><C>签收回执单<C></B><BR><BR>`
    content += `<L>单    号：${item.sheetNo}<BR></L>`
    content += `<L>订单日期：${item.createDate}<BR></L>`
    content += `<L>复打日期：${cDate}<BR><BR></L>`
  
    content += `<L>店    名：<BOLD>${item.branchName}</BOLD><BR></L>`
    content += `<L><N>联 系 人：${item.branchMan}</N><BR></L>` // ${item.supplyFlag}
    content += `<L><N>联系电话：${item.branchTel} </N><BR></L>` // ${item.supplyFlag}
    content += `<L>客户地址：${item.address}<BR><BR></L>`
  
    content += `<N><L>整单合计：${(item.sheetAmt).toFixed(2)}<L></N><BR>`
    content += `<N><L>支付方式：${item.payWay || '货到付款'}<L></N><BR><BR>`
    
    content += `<B><L>应收金额:${(item.sheetAmt).toFixed(2)}<L></B><BR>`
    content += `<B><L>拒收金额:<HB>￥</HB><N>_____________</N><L></B><N> 无修改不用填</N><BR>`
    content += `<B><L>实收金额:<HB>￥</HB><N>_____________</N><L></B><N> 无修改不用填</N><BR><BR>`
    
    content += `<B><L>客户签收:<N>__________________</N><L></B><BR><BR>`
    // content += `<N><L>温馨提示: 签收前,请确认整件数量即可,明细数量需在到货24小时内自行清点,少货差异请联系客服为您处理<L></N>`
    
    content += `<L><HB>是否有冻品</HB>：    <B>□</B> <HB>是</HB>      <B>□</B> <HB>否</HB><L><BR><BR>`
    content += `<B><L>冻品客户确认:<N>__________________</N><L></B><BR><BR>`
    content += `<HB><L>如有冻品,请开箱确认完好后再签字!!<L></HB><BR><BR>`
    
    content += `<B><L>签收备注:<L></B><BR>.<BR>.<BR>.<BR>.<BR>.<BR>.<BR>.<BR>`
    content += `<BR><BR><N><C>================================================<C></N><BR><BR>`
  })
  sheetNo = sheetNo.join(',')
  console.log(sheetNo)
  content = `<C><QR140>${sheetNo}</QR></C><BR><BR>` + content // 二维码数据
  // content += `</HB><C><B>完</B></C><BR><BR><BR><BR><BR><BR>`
  return content
}

