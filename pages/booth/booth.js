import API from '../../api/index.js'
import { backPage, showModal, toast } from '../../tool/tool.js'
const LAST_CONNECTED_DEVICE = 'last_connected_device'
const PrinterJobs = require('../../printer/printerjobs')
const printerUtil = require('../../printer/printerutil')

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i
    }
  }
  return -1
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  const hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join(',')
}

function str2ab(str) {
  // Convert str to ArrayBuff and write to printer
  let buffer = new ArrayBuffer(str.length)
  let dataView = new DataView(buffer)
  for (let i = 0; i < str.length; i++) {
    dataView.setUint8(i, str.charAt(i).charCodeAt(0))
  }
  return buffer;
}

Page({
  data: {
    // 固定的设备
    fixedDevices: {
      deviceId: "DC:0D:30:46:9A:00",
      name: "JLP352-9A00",
      localName: "JLP352-9A00"
    },   
    devices: [],
    connected: false,
    chs: [],
    writeData: [], // 打印的数据
    sheetNo: '', // 单号
    printNum: 0, // 改变状态记录,防止重复改变
  },
  onUnload() {
    this.closeBluetoothAdapter()
  },
  openBluetoothAdapter() {
    if (!wx.openBluetoothAdapter) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
      return
    }
    wx.showLoading({
      title: '搜索蓝牙中...',
    })
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        this.startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        console.log('openBluetoothAdapter fail', res)
        wx.hideLoading()
        if (res.errCode === 10001) {
          wx.showModal({
            title: '错误',
            content: '未找到蓝牙设备, 请打开蓝牙后重试。',
            showCancel: false
          })

          wx.onBluetoothAdapterStateChange((res) => {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              // 取消监听，否则stopBluetoothDevicesDiscovery后仍会继续触发onBluetoothAdapterStateChange，
              // 导致再次调用startBluetoothDevicesDiscovery
              wx.onBluetoothAdapterStateChange(() => {
              });
              this.startBluetoothDevicesDiscovery()
            }
          })
        }
      }
    })
    wx.onBLEConnectionStateChange((res) => {
      // 该方法回调中可以用于处理连接意外断开等异常情况
      console.log('onBLEConnectionStateChange', `device ${res.deviceId} state has changed, connected: ${res.connected}`)
      if (res.deviceId != 'DC:0D:30:46:9A:00') return showModal({ content: '设备有误' })
      this.setData({
        connected: res.connected
      })
      if (!res.connected) {
        wx.showModal({
          title: '错误',
          content: '蓝牙连接已断开',
          showCancel: false
        })
      }
    });
  },
  getBluetoothAdapterState() {
    wx.getBluetoothAdapterState({
      success: (res) => {
        console.log('getBluetoothAdapterState', res)
        if (res.discovering) {
          this.onBluetoothDeviceFound()
        } else if (res.available) {
          this.startBluetoothDevicesDiscovery()
        }
      }
    })
  },
  startBluetoothDevicesDiscovery() {
    console.log(this._discoveryStarted)
    if (this._discoveryStarted) {
      return
    }
    this._discoveryStarted = true
    console.log(this.data.devices)
    let num = this.data.devices.length
    wx.startBluetoothDevicesDiscovery({
      success: (res) => {
        wx.showLoading({ title: '连接中...' })
        // console.log(res)
        // if (num == 0) {
        //   showModal({
        //     content: '当前无可用设备',
        //   })
        // } else if (num == 1) {
        //   showModal({
        //     content: '搜索成功，请连接打印设备',
        //   })
        // }
        
        console.log('startBluetoothDevicesDiscovery success', res)
        this.onBluetoothDeviceFound()
      },
      fail: (res) => {
        console.log('startBluetoothDevicesDiscovery fail', res)
      }
    })
  },
  stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery({
      complete: () => {
        console.log('stopBluetoothDevicesDiscovery')
        this._discoveryStarted = false
      }
    })
  },
  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return
        }
        const foundDevices = this.data.devices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        if (idx === -1) {
          data[`devices[${foundDevices.length}]`] = device
          // this.data.devices[foundDevices.length] = data[`devices[${foundDevices.length}]`]
        } else {
          data[`devices[${idx}]`] = device
          // this.data.devices[idx] = data[`devices[${idx}]`]
        }
        console.log(data)
        this.setData(data)
      })
    })
  },
  createBLEConnection(e) {
    this.openBluetoothAdapter()   // 打开并搜索蓝牙
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    const name = ds.name
    console.log(deviceId, name)
    console.log(this.data.devices)
    setTimeout(() => {
      this._createBLEConnection(deviceId, name) // 连接蓝牙设备  
    }, 1000)
    console.log('连接蓝牙设备')
  },
  _createBLEConnection(deviceId, name) {
    console.log('进入连接', deviceId, name)
    wx.showLoading()
    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        console.log('createBLEConnection success');
        wx.hideLoading()
        if (res) toast('连接设备成功')
        this.setData({
          connected: true,
          name,
          deviceId,
        })
        this.getBLEDeviceServices(deviceId)
        wx.setStorage({
          key: LAST_CONNECTED_DEVICE,
          data: name + ':' + deviceId
        })
      },
      complete() {
      },
      fail: (res) => {
        console.log('createBLEConnection fail', res)
        wx.hideLoading()
        if (res) toast('连接设备失败')
      }
    })
    this.stopBluetoothDevicesDiscovery()
  },
  closeBLEConnection() {
    wx.closeBLEConnection({
      deviceId: this.data.deviceId
    })
    this.setData({
      connected: false,
      chs: [],
      canWrite: false,
    })
  },
  // 获取蓝牙设备所有服务
  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        console.log('getBLEDeviceServices', res)
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            this.getBLEDeviceCharacteristics(deviceId, res.services[i + 1].uuid)
            return
          }
        }
      }
    })
  },
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
        // 这里会存在特征值是支持write，写入成功但是没有任何反应的情况
        // 只能一个个去试
        for (let i = 0; i < res.characteristics.length; i++) {
          const item = res.characteristics[i]
          if (item.properties.write) {
            this.setData({
              canWrite: true
            })
            this._deviceId = deviceId
            this._serviceId = serviceId
            this._characteristicId = item.uuid
            break;
          }
        }
      },
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })
  },
  writeBLECharacteristicValue() {
    let data = this.data.writeData
    console.log(data)
    let printerJobs = new PrinterJobs();
    
    data.forEach((item, i) => {
      printerJobs
        .print(item.createDate.slice(0,19))
        .print(printerUtil.fillLine())
        .setAlign('ct')  // 格式在中间
        .setSize(2, 2)
        .print('#' + item.branchName)
        .print(item.branchTel)
        .setSize(1, 1)
        .print(item.supplyFlag)
        .print('订单号: ' + item.sheetNo)
        .setAlign('lt') // 格式在左
        .print(printerUtil.fillAround('详情'))

        item.details.forEach(t => {
          printerJobs
            .print(printerUtil.inline(t.itemName + t.itemSize, '*' + t.realQty)) // 商品item 名称 + 规格
        })

      printerJobs
        .print(printerUtil.fillLine()) // 分割线
          .setAlign('rt') // 格式在右
          .print('总价：' + '￥' + item.sheetAmt)
          .print('总数量：' + '￥' + item.sheetQty)
          .setAlign('lt')
          .print(printerUtil.fillLine())
          .print('备注')
          .print(item.memo)
          .print(printerUtil.fillLine())
          .println();
    })

      let buffer = printerJobs.buffer();
      console.log('ArrayBuffer', 'length: ' + buffer.byteLength, ' hex: ' + ab2hex(buffer));
      // 1.并行调用多次会存在写失败的可能性
      // 2.建议每次写入不超过20字节
      // 分包处理，延时调用
      const maxChunk = 20;
      const delay = 20;
      for (let i = 0, j = 0, length = buffer.byteLength; i < length; i += maxChunk, j++) {
        let subPackage = buffer.slice(i, i + maxChunk <= length ? (i + maxChunk) : length);
        setTimeout(this._writeBLECharacteristicValue, j * delay, subPackage);
      }
  },
  _writeBLECharacteristicValue(buffer) {
    const _this = this
    wx.writeBLECharacteristicValue({
      deviceId: this._deviceId,
      serviceId: this._serviceId,
      characteristicId: this._characteristicId,
      value: buffer,
      success(res) {
        console.log('writeBLECharacteristicValue success', res)
          let sheetNo = _this.data.sheetNo
          console.log(sheetNo)
          if (sheetNo != '') {
            let printNum = _this.data.printNum
            _this.data.printNum = printNum + 1
            console.log(printNum)
            
            if (printNum >= 1) return
            setTimeout(() => {
              _this.updateSheetStatus(sheetNo, _this)
            }, 800)
          }  
      },
      fail(res) {
        console.log('writeBLECharacteristicValue fail', res)
        if (res) return toast('打印失败')
      }
    })
  },
  updateSheetStatus(sheetNo = _this.data.sheetNo, _this) {
    console.log(100)
    const { platform, token, username, supplierNo } = wx.getStorageSync('authorizeObj')
    console.log(sheetNo, platform, token, username, supplierNo)
    console.log('this.sheetNo:', _this.data.sheetNo)
    API.updateSheetStatus({
      data: {  
        platform,
        token,
        username,
        supplierNo, 
        sheetNo, 
        printFlag: 1
      },
      success(res) {
        console.log(res, _this)
        if (res.code == 0) toast('更改状态成功')
        _this.setData({ sheetNo: '' })
      },
      complete(res) {
        console.log(res, sheetNo, '装车请求')
        console.log(platform, token, username, supplierNo)
      }
    })
  },
  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter()
    this._discoveryStarted = false
  },
  onLoad(options) {
    const writeData = JSON.parse(options.data)
    console.log(writeData)
    let sheetNo = ''
    writeData.forEach(t => {
      if (sheetNo == '') {
        sheetNo = sheetNo + t.sheetNo
      } else {
        sheetNo = sheetNo + ',' + t.sheetNo
      }
    })
    const lastDevice = wx.getStorageSync(LAST_CONNECTED_DEVICE);
    this.setData({
      lastDevice: lastDevice,
      writeData,
      sheetNo
    })
    this.data.sheetNo = sheetNo
    // this.openBluetoothAdapter()   // 一进入页面就搜索蓝牙
  },
  createBLEConnectionWithDeviceId(e) {
    // 小程序在之前已有搜索过某个蓝牙设备，并成功建立连接，可直接传入之前搜索获取的 deviceId 直接尝试连接该设备
    const device = this.data.lastDevice
    if (!device) {
      return
    }
    const index = device.indexOf(':');
    const name = device.substring(0, index);
    const deviceId = device.substring(index + 1, device.length);
    console.log('createBLEConnectionWithDeviceId', name + ':' + deviceId)
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        this._createBLEConnection(deviceId, name)
      },
      fail: (res) => {
        console.log('openBluetoothAdapter fail', res)
        if (res.errCode === 10001) {
          wx.showModal({
            title: '错误',
            content: '未找到蓝牙设备, 请打开蓝牙后重试。',
            showCancel: false
          })
          wx.onBluetoothAdapterStateChange((res) => {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              // 取消监听
              wx.onBluetoothAdapterStateChange(() => {
              });
              this._createBLEConnection(deviceId, name)
            }
          })
        }
      }
    })
  }
})