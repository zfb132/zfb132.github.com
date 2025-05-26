---
layout: post
title: Windows电脑配置以太网口访问雷达
subtitle: "保证电脑可以与雷达互相访问，且雷达可以通过电脑访问互联网"
category : [Linux,Windows]
tags : [Linux,Windows]
date:       2025-05-26 19:27:03 +08:00
author:     "晨曦"
header-img: "/img/post/win10-bg.jpg"
description:  "仅为当前网络环境未配置完成，临时调试雷达所用"
---
  
## 目录
{: .no_toc}

* 目录
{:toc}

## 1. 总体说明
适用情况： 目的只是调试雷达，且当前没有配置好的交换机或路由器  
主要功能： 把雷达的以太网口`eth1`连接到windows电脑的以太网口（此时两者即可互相ping通，可以ssh），还可以通过windows电脑的无线网络让雷达连接到互联网  

其中雷达的`eth1`口配置如下  
* IP地址示例： `192.168.19.241`
* 子网掩码示例： `255.255.255.0`
* 网关示例： `192.168.19.244`（可以自行修改为其他ip，只要与windows电脑的以太网口IP地址一致即可，例如`192.168.19.254`）

windows电脑的以太网口配置如下  
* IP地址示例： `192.168.19.244`（只要与雷达网关一致即可，例如`192.168.19.254`）
* 子网掩码示例： `255.255.255.0`
* 网关： 留空

windows电脑可以替换为其他Linux电脑，配置方法类似  

## 2. windows电脑配置以太网口
1. 打开`控制面板` -> `网络和Internet` -> `网络和共享中心` -> `更改适配器设置`
2. 然后再手动修改windows的以太网适配器的IP地址是`192.168.19.244`（也可以是`192.168.19.254`），子网掩码是`255.255.255.0`，保存即可（该适配器可能会显示为`未识别的网络`，属性信息里面IPv4和IPv6可能会提示无法获取Internet访问权限，这是正常的）


## 3. 雷达配置ip和网关和路由
```bash
# 查看当前网络信息(发现eth1的ip地址是192.168.19.241)
ip a
# 1: 1o:<L0OPBACK,UP,LOWER UP> mtu 16436 qdisc noqueue state UNKNOWN
#     link/loopback 00:00:00:00:00:00 brd60:00:00:00:00:00
#     inet 127.0.0.1/8 scope host lo
#     inet6 ::1/128 scope host
#         valid lft forever preferred lft forever
# 2: eth0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc pfifo fast state DOWN qlen 1000
#     link/ether 00:0a:aa:aa:aa:aa brd ff:ff:ff:ff:ff:ff
#     inet 192.168.1.0/24 brd 192.168.1.255 scope global eth0
# 3: eth1: <BROADCAST,MULTICAST,UP,LOWER UP> mtu 1500 qdisc pfifo fast state UNKNOWN qlen 1000
#     link/ether 08:1f:ff:ff:ff:ff brd ff:ff:ff:ff:ff:ff
#     inet 192.168.19.241/24 brd 192.168.19.255 scope global eth1
#     inet6 fe80::alf:7lff:fe03:bbc/64 scope link
#         valid lft forever preferred lft forever
# 4: eth2: <BROADCAST,MULTICAST,UP,LOWER UP> mtu 1500 qdisc pfifo fast state UP qlen 1000
#     link/ether 00:0b:bb:bb:bb:bb brd ff:ff:ff:ff:ff:ff
#     inet 172.16.1.0/16 brd 172.16.255.255 scope global eth2
#     inet6 fe80::20b:abff:fed3:2b52/64 scope link
#         valid lft forever preferred lft forever

# 查看默认网关(发现eth1的网关是192.168.19.254)
route -n
# Kernel Ip routing table
# Destination    Gateway          Genmask         Flags   Metric   Ref   User   Iface
# 192.168.19.0   0.0.0.0          255.255.255.0   U       0        0     0      eth1
# 192.168.1.0    0.0.0.0          255.255.255.0   U       0        0     0      eth0
# 172.16.0.0     0.0.0.0          255.255.0.0     U       0        0     0      eth2
# 127.0.0.0      0.0.0.0          255.0.0.0       U       0        0     0      lo
# 0.0.0.0        192.168.19.254   0.0.0.0         UG      0        0     0      eth1
```
如果不想对雷达进行任何修改，则直接把windows电脑的以太网口IP地址修改为`192.168.19.254`，子网掩码是`255.255.255.0`，保存即可。雷达会通过`eth1`口（ip地址是`192.168.19.241`）经由windows电脑的以太网口（ip地址是`192.168.19.254`）互相访问。

如果希望自定义雷达的IP和网关，则可以在雷达上执行以下命令：
```bash
# 切换到root用户（192.168.19.241是自己设置的eth1口IP地址，只要与windows电脑的以太网口IP地址在同一网段即可）
ifconfig eth1 192.168.19.241 netmask 255.255.255.0 up
# 删除默认网关
route del default
# 添加新的默认网关（这里的网关是windows电脑的以太网口IP地址）
route add default gw 192.168.19.244 eth1
```

此时在windows电脑上可以通过ssh连接到雷达：
```bash
ssh username@192.168.19.241
```
但是如果想让雷达访问互联网，则需要在windows电脑上开启网络转发功能，并配置以太网共享无线网络。

## 4. windows开启路由转发功能
1. 修改注册表：以管理员身份打开cmd，输入以下命令
   ```regedit
    reg add HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters /v IPEnableRouter /D 1 /f
   ```
2. 启动`Routing and Remote Access`服务：以管理员身份打开cmd，输入以下命令
   ```pwsh
    # 如果报错，就手动去服务中启动
    sc config RemoteAccess start=auto
    sc start RemoteAccess
    sc query RemoteAccess
   ```

## 5. windows配置以太网共享无线网络
1. 配置共享地址段（防止在共享WLAN给ethernet时，弹出对话框提示以太网的ip地址只能是`192.168.137.1`）
   以管理员身份打开cmd，输入以下命令
   ```reg
    reg add "HKLM\SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters" -v ScopeAddress -d 192.168.19.142 -f
    reg add "HKLM\SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters" -v ScopeAddressBackup -d 192.168.19.142 -f
   ```
   此处只要`ScopeAddress`和`ScopeAddressBackup`的网段是`192.168.19.x`即可
2. 打开`控制面板` -> `网络和Internet` -> `网络和共享中心` -> `更改适配器设置`
3. 右键点击`无线网络连接` -> `属性` -> `共享`选项卡
4. 勾选`允许其他网络用户通过此计算机的Internet连接来连接`，在下拉框中选择`以太网`（即windows与雷达连接网线后出现的网络适配器），点击`确定`

此时雷达就可以通过windows电脑的无线网络访问互联网了，直接在雷达上执行以下命令测试：
```bash
ping baidu.com
```

关于如何使用frp配置远程访问，参考[远程访问安装xfce4的内网服务器](https://blog.whuzfb.cn/blog/2020/07/05/remote_access_lan_gui/)
