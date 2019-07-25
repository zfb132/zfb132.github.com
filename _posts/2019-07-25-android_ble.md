---
layout: post
title: 蓝牙Beacon广播数据包格式以及解析
subtitle: "分析帧格式并设计代码解析数据"
category : [Android]
tags : [Android]
date:       2019-07-25
author:     "晨曦"
header-img: "/img/post/bluetooth4.0-bg.jpg"
description:  "在设计基于蓝牙定位的App过程中需要解析蓝牙广播数据，然后才能继续后面的定位操作，这里主要介绍了广播帧格式以及如何用Java代码解析得到具体参数"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}


## 1. 获取原始蓝牙广播包
首先需要开启**开发者选项**：不同Android手机打开此功能的方法基本一致，首先打开设置，然后找到系统版本号（例如MIUI系统的全部参数选项的MIUI版本），快速连续点击５次以上即可自动打开开发者选项；然后选择"**打开蓝牙数据包日志**"功能，接着打开蓝牙功能即可开始记录数据包，日志文件存放位置在不同的手机上略有不同；最后把日志复制到电脑上等待处理
## 2. 安装WireShark软件
对于ubuntu系统来说，只需要输入以下命令即可成功安装：
`sudo apt-get install wireshark`  
对于windows或其他系统来说，打开[官网](https://www.wireshark.org/#download)按照提示下载安装即可
## 3. 分析Beacon广播包数据
把日志文件导入WireShark软件，会自动识别为蓝牙广播包。首先需要了解蓝牙数据包的主要格式：一个广播包是由若干个广播单元AD Structure构成的。每个广播单元的组成是：**第一个字节是长度值** length，表示接下来的 length个字节是数据部分；数据部分的第一个字节表示**数据的类型AD Type**，AD type非常关键，决定了AD Data的数据代表的是什么以及怎么解析，这是官网上面不同的值代表的数据类型 [https://www.bluetooth.com/specifications/assigned-numbers/generic-access-profile](https://www.bluetooth.com/specifications/assigned-numbers/generic-access-profile)  ；剩下的length-1个字节是**真正的数据AD data**。这里需要特别注意的是，由于发送数据是从低位到高位依次发送，所以**接收到的数据要反过来按字节拼接**。例如接收到的MAC为 8b 03 00 b0 01 c2，那么实际的MAC为 c2:01:b0:00:03:8b
通过分析可以发现，蓝牙设备会连续收到两个来自（同一个）Beacon的广播数据包，每个原始数据包都是59bytes，前一个主要包含MAC和设备名称等信息，后一个主要包含UUID，txPower等信息。不妨认为前一个数据包为packetA，后一个为packetB。以下是一组实际数据
### 3.1 第一个数据包格式
<img src="/img/post/beacon-advertising-packet12.png" width="768" alt="WireShark捕获的第一个数据帧">

可以看到，软件会自动把每个部分的数据进行解释，如果你的英语水平可以的话，以下内容就不需要看了。数据包内容：  
```
    04 3e 38 0d 01 1b 00 01 8b 03 00 b0 01 c2 01 00 ff 7f af 00 00 00 00 00 00 00 00 00 1e
    02 0a 00 08 16 f0 ff 64 27 11 4c b9 11 09 4d 69 6e 69 42 65 61 63 6f 6e 5f 30 30 39 30 37
```
下面是每个字节对应的含义：  
```text
第一个字节是HCI Packet Type，04表示这是HCI Event；剩下的58bytes则是HCI Event的具体内容
第二个字节是EventCode，3e是此事件的代码；第三个字节是Parameter Length，0x38(十进制56)表示后面数据长度56bytes
第四个字节是SubEvent，0d表示这是LE Extended Advertising Report；第五个字节是Num Reports，数值为01
1b 00这两个字节代表Event Type，由于发送数据都是按字节发送以及从低位向高位发送，因此真实值是 001b
01 表示这是随机设备地址
8b 03 00 b0 01 c2 是此设备的MAC，根据从低向高的发送规则，所以真实MAC是　c2:01:b0:00:03:8b
01 代表首要广播信道的带宽
00 代表次要广播信道的带宽，此处表示不使用次要信道
ff 表示广播SID
7f 代表Tx Power的大小，此处是127dbm
af 代表RSSI的大小，此处是-81dbm
00 00 代表周期广播间隔
00 代表直接地址类型，次数是公共设备地址
00 00 00 00 00 00 代表直接BD_ADDR
1e 代表接下的的数据的字节数（长度），以下数据就是最重要的广播数据了
－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－
02 0a 00　代表的是Tx Power Level的信息，02 表示数据字节数，0a 表示数据类型，00 表示功率水平(单位是dBm)
08 16 f0 ff 代表的是Service Data信息，08 表示数据字节数，16 表示数据类型，ff f0 表示16bit UUID ，
64 27 11 4c b9 表示Service Data的具体信息
11 表示后面的数据的字节数
09 表示数据类型
4d 69 6e 69 42 65 61 63 6f 6e 5f 30 30 39 30 37 表示设备的名称，每一个字节对应一个ASCII
```
如果你想查看WireShark软件的解析名称，可在附录里浏览
### 3.2 第二个数据包格式
<img src="/img/post/beacon-advertising-packet2.png" width="768" alt="WireShark捕获的第二个数据帧">

此数据包才是最重要的，59bytes的数据包内容如下：  
```
    04 3e 38 0d 01 13 00 01 8b 03 00 b0 01 c2 01 00 ff 7f af 00 00 00 00 00 00 00 00 00 1e
    02 01 06 1a ff 4c 00 02 15 fd a5 06 93 a4 e2 4f b1 af cf c6 eb 07 64 78 25 27 11 4c b9 c5
```
下面是每个字节对应的含义：  
```text
第一行数据同上，不再分析，重点分析第二行（也就是广播数据部分）
－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－
02 表示接下来的数据有两个字节
01 表示数据类型，此处的类型是Flags
06 表示Flags的具体模式
1a 表示接下来的数据有26个字节
ff 表示数据类型，此处是厂家特定字(Manufacturer specific)
4c 00 表示公司的ID，此处的004c代表苹果公司
02 代表beacon标识位
15 表示接下来有22个字节的数据
fd a5 06 93 a4 e2 4f b1 af cf c6 eb 07 64 78 25　表示beacon UUID
27 11　是major的值，2711转化为10进制是10001
4c b9　是minor的值，4cb9转化为10进制是19641
c5 是txPower的补码，计算可知原码是-59
```
如果你想查看WireShark软件的解析名称，可在附录里浏览
### 3.3 Android程序开发中的蓝牙广播包
上面所讲解的都是Android 系统中的蓝牙广播包的格式，是最底层的数据包格式，如果我们是在开发OS 的话才可能会接触解析这些数据。对于只是进行普通应用程序开发的我们来说，只需要处理已经被Android 系统一次解析之后的数据包，这个数据包才是我们开发应用程序时遇到的数据记录。　　
对于Android 开发中，系统会把packetB中的第二行数据(30bytes，长度不定)和packetA(30bytes)中的第二行数据连接在一起，最后总的数据长度为62bytes，不够的话用0填充，如下所示：  
**02 01 06 1a ff 4c 00 02 15 fd a5 06 93 a4 e2 4f b1 af cf c6 eb 07 64 78 25 27 11 4c b9 c5** 02 0a 00 08 16 f0 ff 64 27 11 4c b9 11 09 4d 69 6e 69 42 65 61 63 6f 6e 5f 30 30 39 30 37 00 00  
## 4. 使用Java解析各数据
以下是主要解析代码，兼容Android P最新版本和Android 较低版本：  

```java
//Android Lollipop 版本以上的扫描回调函数
private ScanCallback mScanCallback = new ScanCallback() {
    @Override
    public void onScanResult(int callbackType, ScanResult result) {
        super.onScanResult(callbackType, result);
        final BluetoothDevice device = result.getDevice();
        final int rssi = result.getRssi();
        final byte[] scanRecord = result.getScanRecord().getBytes();
        // 判断Activity是否已经退出
        if (mainActivity == null) {
            return;
        }
        mainActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                String name = device.getName();
                if (name == null) {
                    //Log.d(TAG, "onLeScan: 此条数据被过滤---"+mac);
                    return;
                }
                Log.d(TAG, "onScanResult: 开始处理广播数据");
                handleScanResult(device, rssi, scanRecord);
            }
        });
    }

    @Override
    public void onBatchScanResults(List<ScanResult> results) {
        super.onBatchScanResults(results);
    }

    @Override
    public void onScanFailed(int errorCode) {
        super.onScanFailed(errorCode);
        Log.e(TAG, "启动扫描失败");
    }
};

// Android KITKAT 版本以下的扫描回调函数
private BluetoothAdapter.LeScanCallback mLeScanCallback = new BluetoothAdapter.LeScanCallback() {
    @Override
    public void onLeScan(final BluetoothDevice device, final int rssi, final byte[] scanRecord) {
        // 判断Activity是否已经退出
        if (mainActivity == null) {
            return;
        }
        mainActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                String name = device.getName();
                String mac = device.getAddress();
                // 官方提供的过滤UUID方法存在问题，此处自己先根据MAC过滤
                if (name == null || mac == null || !Arrays.asList(beaconMAC).contains(mac)) {
                    //Log.d(TAG, "onLeScan: 此条数据被过滤---"+mac);
                    return;
                }
                Log.d(TAG, "onLeScan: 开始处理广播数据");
                handleScanResult(device, rssi, scanRecord);
            }
        });
    }
};

// 处理广播数据
private void handleScanResult(BluetoothDevice device, int rssi, byte[] scanRecord) {
    int startIndex = 2;
    boolean patternFound = false;
    Log.d(TAG, "handleScanResult: "+bytesToHex(scanRecord));
    // 寻找是否存在beacon以及有效数据的起始索引
    while (startIndex <= 5) {
        if (((int) scanRecord[startIndex + 2] & 0xff) == 0x02
                && ((int) scanRecord[startIndex + 3] & 0xff) == 0x15) {
            patternFound = true;
            break;
        }
        startIndex++;
    }
    // 如果找到
    if (patternFound) {
        String ibeaconName = device.getName();
        String mac = device.getAddress();
        Log.d(TAG, "onLeScan: 搜索到一个Beacon设备" + mac);
        Log.d(TAG, "onLeScan: 它的名字是" + ibeaconName);
        String data = parseBLEData(scanRecord, startIndex);
        Log.d(TAG, "onLeScan: RSSI=" + rssi);
        String result = "Beacon设备名称：" + ibeaconName + "  MAC：" + mac + "\n";
        double distance = rssi2distance(rssi);
        String dis = String.format("%.2f", distance);
        result = result + data + "    RSSI：" + rssi + " ( " + dis + " )";
        Log.d(TAG, result);
    } else {
        String name = device.getName();
        if (name == null) {
            //Log.d(TAG, "onLeScan: 搜索到一个普通蓝牙设备，它的MAC是"+device.getAddress());
        } else {
            //Log.d(TAG, "onLeScan: 搜索到一个普通蓝牙设备，它的名字是"+name);
        }
    }
}

// 根据RSSI计算距离
public double rssi2distance(int rssi) {
    int iRssi = Math.abs(rssi);
    // 发射端和接收端相隔1米时的信号强度
    int A = 59;
    // 环境噪声衰减因子
    double n = 2.0;
    double power = (iRssi - A) / (10 * n);
    return Math.pow(10, power);
}

// 字节数据转为Hex: 1 byte = 8bit = 两个16进制数字
public String bytesToHex(byte[] src) {
    StringBuilder stringBuilder = new StringBuilder("");
    for (int i = 0; i < src.length; i++) {
        int v = src[i] & 0xFF;
        String hv = Integer.toHexString(v);
        if (hv.length() < 2) {
            stringBuilder.append(0);
        }
        stringBuilder.append(hv);
    }
    return stringBuilder.toString();
}

// 格式化UUID
public String parseUUID(String data) {
    String uuid = "";
    if (data.length() == 32) {
        uuid = data.substring(0, 8) + "-"
                + data.substring(8, 12) + "-"
                + data.substring(12, 16) + "-"
                + data.substring(16, 20) + "-"
                + data.substring(20);
    } else {
        showTips(getString(R.string.toast_uuid_not_found));
    }
    return uuid;
}

// 解析BLE数据
public String parseBLEData(byte[] scanRecord, int startIndex) {
    // uuid的长度是16bytes
    byte[] uuidBytes = new byte[16];
    System.arraycopy(scanRecord, startIndex + 4, uuidBytes, 0, 16);
    String hexString = bytesToHex(uuidBytes);
    // beacon的UUID值
    String uuid = parseUUID(hexString);
    // beacon的Major值
    int major = (scanRecord[startIndex + 20] & 0xff) * 0x100
            + (scanRecord[startIndex + 21] & 0xff);
    // ibeacon的Minor值
    int minor = (scanRecord[startIndex + 22] & 0xff) * 0x100
            + (scanRecord[startIndex + 23] & 0xff);

    int txPower = (scanRecord[startIndex + 24]);
    Log.d(TAG, "onLeScan: 它的UUID是" + uuid + "，txPower是" + txPower);
    Log.d(TAG, "onLeScan: major=" + major + "，minor=" + minor);
    return "UUID：" + uuid + "\nmajor：" + major + "    minor：" + minor + "\ntxPower：" + txPower;
}
```
以上就是主要代码
## 5. 附录
### 5.1 第一个数据包的内容以及解析
数据包内容：  

    04 3e 38 0d 01 1b 00 01 8b 03 00 b0 01 c2 01 00 ff 7f af 00 00 00 00 00 00 00 00 00 1e
    02 0a 00 08 16 f0 ff 64 27 11 4c b9 11 09 4d 69 6e 69 42 65 61 63 6f 6e 5f 30 30 39 30 37  
下面是每个字节对应的含义（WireShark软件的解析）：  
```text
Bluetooth HCI H4
    [Direction: Rcvd (0x01)]
    HCI Packet Type: HCI Event (0x04)
Bluetooth HCI Event - LE Meta
    Event Code: LE Meta (0x3e)
    Parameter Total Length: 56
    Sub Event: LE Extended Advertising Report (0x0d)
    Num Reports: 1
    Event Type: 0x001b, Connectable, Scannable, Scan Response, Legacy, Data Status: Complete
        .... .... .... ...1 = Connectable: True
        .... .... .... ..1. = Scannable: True
        .... .... .... .0.. = Directed: False
        .... .... .... 1... = Scan Response: True
        .... .... ...1 .... = Legacy: True
        .... .... .00. .... = Data Status: Complete (0x0)
        0000 0000 0... .... = Reserved: 0x000
    Peer Address Type: Random Device Address (0x01)
    BD_ADDR: c2:01:b0:00:03:8b (c2:01:b0:00:03:8b)
    Primary PHY: LE 1M (0x01)
    Secondary PHY: No packets on the secondary advertising channel (0x00)
    Advertising SID: 0xff (not available)
    TX Power: 127dBm (not available)
    RSSI: -81dBm
    Periodic Advertising Interval: 0x0000 (no periodic advertising)
    Direct Address Type: Public Device Address (0x00)
    Direct BD_ADDR: 00:00:00_00:00:00 (00:00:00:00:00:00)
    Data Length: 30
    Advertising Data
        Tx Power Level
            Length: 2
            Type: Tx Power Level (0x0a)
            Power Level (dBm): 0
        Service Data - 16 bit UUID
            Length: 8
            Type: Service Data - 16 bit UUID (0x16)
            UUID 16: Unknown (0xfff0)
            Service Data: 6427114cb9
        Device Name: MiniBeacon_00907
            Length: 17
            Type: Device Name (0x09)
            Device Name: MiniBeacon_00907
```
### 5.2 第二个数据包的内容以及解析
数据包内容：  

    04 3e 38 0d 01 13 00 01 8b 03 00 b0 01 c2 01 00 ff 7f af 00 00 00 00 00 00 00 00 00 1e
    02 01 06 1a ff 4c 00 02 15 fd a5 06 93 a4 e2 4f b1 af cf c6 eb 07 64 78 25 27 11 4c b9 c5  
下面是每个字节对应的含义（WireShark软件的解析）：  
```text
Bluetooth HCI H4
    [Direction: Rcvd (0x01)]
    HCI Packet Type: HCI Event (0x04)
Bluetooth HCI Event - LE Meta
    Event Code: LE Meta (0x3e)
    Parameter Total Length: 56
    Sub Event: LE Extended Advertising Report (0x0d)
    Num Reports: 1
    Event Type: 0x0013, Connectable, Scannable, Legacy, Data Status: Complete
        .... .... .... ...1 = Connectable: True
        .... .... .... ..1. = Scannable: True
        .... .... .... .0.. = Directed: False
        .... .... .... 0... = Scan Response: False
        .... .... ...1 .... = Legacy: True
        .... .... .00. .... = Data Status: Complete (0x0)
        0000 0000 0... .... = Reserved: 0x000
    Peer Address Type: Random Device Address (0x01)
    BD_ADDR: c2:01:b0:00:03:8b (c2:01:b0:00:03:8b)
    Primary PHY: LE 1M (0x01)
    Secondary PHY: No packets on the secondary advertising channel (0x00)
    Advertising SID: 0xff (not available)
    TX Power: 127dBm (not available)
    RSSI: -81dBm
    Periodic Advertising Interval: 0x0000 (no periodic advertising)
    Direct Address Type: Public Device Address (0x00)
    Direct BD_ADDR: 00:00:00_00:00:00 (00:00:00:00:00:00)
    Data Length: 30
    Advertising Data
        Flags
            Length: 2
            Type: Flags (0x01)
            000. .... = Reserved: 0x0
            ...0 .... = Simultaneous LE and BR/EDR to Same Device Capable (Host): false (0x0)
            .... 0... = Simultaneous LE and BR/EDR to Same Device Capable (Controller): false (0x0)
            .... .1.. = BR/EDR Not Supported: true (0x1)
            .... ..1. = LE General Discoverable Mode: true (0x1)
            .... ...0 = LE Limited Discoverable Mode: false (0x0)
        Manufacturer Specific
            Length: 26
            Type: Manufacturer Specific (0xff)
            Company ID: Apple, Inc. (0x004c)
            Data: 0215fda50693a4e24fb1afcfc6eb0764782527114cb9c5
                [Expert Info (Note/Undecoded): Undecoded]
                    [Undecoded]
                    [Severity level: Note]
                    [Group: Undecoded]
```
