---
layout: post
title: Android系列教程之前言
subtitle: "一些基础必备知识"
category : [Android]
tags : [Android]
date:       2017-08-07
author:     "晨曦"
header-img: "/img/post/android-bg.jpg"
description:  "目前安卓的主流开发语言是Java，在正式开始Android系列的教程之前，需要知道一些基本内容"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}


## Android介绍  
Android['ændrɔid]是一个基于Linux内核的开放源代码移动操作系统，由Google成立的Open Handset Alliance（OHA，开放手持设备联盟）持续领导与开发，主要设计用于触屏移动设备如智能手机和平板电脑与其他便携式设备  
Android一词最早出现于法国作家利尔亚当（Auguste Villiers de l'Isle-Adam）在1886年发表的科幻小说《未来夏娃》（L'Ève future）中，他将外表像人的机器人取名为Android  
Android是一个全身绿色的机器人，颜色采用了<span style="color:#84BD00">PMS 376C</span>和RGB中十六进制的<span style="color:#A4C639">#A4C639</span>来绘制，这是Android操作系统的品牌象征  
Android OS（Operating System）使用开放免费代码许可证，一切代码为公开免费的。Google将Android的大部分以[Apache开源条款2.0](http://www.apache.org/licenses/LICENSE-2.0.html "介绍")发布，剩下的Linux内核部分则继承[GPLv2](http://www.gnu.org/licenses/old-licenses/gpl-2.0.html "介绍")许可  
Android操作系统是完全免费开源的，任何厂商都不须经过Google和开放手持设备联盟的授权随意使用Android操作系统   
2005年7月11日，Google收购了Android科技公司，Android科技公司成为Google旗下的一部分  
## 设计架构  
### Linux内核  
Android OS的核心属于Linux内核的一个分支，具有典型的Linux调度和功能。除此之外，Google为了能让Linux在移动设备上良好的运行，对其进行了修改和扩充。Android去除了Linux中的本地X Window System，也不支持标准的GNU库，这使得Linux平台上的应用程序移植到Android平台上变得困难  
### 应用程序  
Android系统是基于Linux内核开发，使用Java作编程语言，使界面到功能，都有层出不穷的变化。Activity类负责创建视窗，一个活动中的Activity就是处于Foreground模式，而在Background执行的程序一般叫做Service。两者之间透过ServiceConnection和AIDL连结，达到多个程序同时执行的效果。如果执行中的Activity全部画面被其他Activity取代时，该Activity便被暂停，放入回退栈中   
View是视图，可以透过View类与“XML layout”将UI放置在视窗上，并可以利用View打造出所谓的Widgets，其实Widget只是View的一种，所以可以使用xml来设计layout。至于ViewGroup是各种layout的基础抽象类别，ViewGroup之内还可以有ViewGroup。View的构造函数不需要在Activity中调用，但是Displayable的是必须的，在Activity中，要通过findViewById()来从XML中获取View，Android的View类的显示很大程度上是从XML中读取的。View与事件息息相关，两者之间透过Listener结合在一起，每一个View都可以注册event listener，例如：当View要处理用户触碰的事件时，就要向Android框架注册View.OnClickListener  
### HAL（硬件抽象层）  
Android的硬件抽像层是能以封闭源码形式提供硬件驱动模块。HAL的目的是为了把Android framework与Linux kernel隔开，让Android不至过度依赖Linux kernel。<img src="http://blog.whuzfb.cn/img/post/android-hal.svg" width="768" alt="安卓">HAL stub是一种代理人的概念，stub是以\*.so档的形式存在。Stub向HAL“提供”操作函数，并由Android runtime向HAL获取stub的操作，再回调这些操作函数。HAL里包含了许多的stub（代理人）。Runtime只要说明“类型”，即module ID，就可以获取操作函数  
### 虚拟机  
虚拟机是操作系统与应用程序的沟通桥梁，4.4版之前使用特殊的Dalvik虚拟机器，5.0版起改用Android Runtime（ART）。下面主要介绍ART：它是一种在Android操作系统上的运行环境，由Google公司研发，并在2013年作为Android 4.4系统中的一项测试功能正式对外发布，在Android 5.0及后续Android版本中作为正式的运行时库取代了以往的Dalvik虚拟机。ART能够把应用程序的字节码转换为机器码，是Android所使用的一种新的虚拟机。<img src="/img/post/art-view.png" width="768" alt="ART与JIT对比图">它与Dalvik的主要不同在于：Dalvik采用的是JIT技术，而ART采用Ahead-of-time（AOT）技术。ART同时也改善了性能、垃圾回收（Garbage Collection）、应用程序除错以及性能分析  
JIT最早在Android 2.2系统中引进到Dalvik虚拟机中，在应用程序启动时，JIT通过进行连续的性能分析来优化程序代码的执行，在程序运行的过程中，Dalvik虚拟机在不断的进行将字节码编译成机器码的工作。与Dalvik虚拟机不同的是，ART引入了AOT这种预编译技术，在应用程序安装的过程中，ART就已经将所有的字节码重新编译成了机器码。应用程序运行过程中无需进行实时的编译工作，只需要进行直接调用  
ART极大的提高了应用程序的运行效率，同时也减少了手机的电量消耗，提高了移动设备的续航能力，在垃圾回收等机制上也有了较大的提升。为了保证向下兼容，ART使用了相同的Dalvik字节码文件（dex），即在应用程序目录下保留了dex文件供旧程序调用然而.odex文件则替换成了可执行与可链接格式（ELF）可执行文件。一旦一个程序被ART的dex2oat命令编译，那么这个程序将会指通过ELF可执行文件来运行。因此，相对于Dalvik虚拟机模式，ART模式下Android应用程序的安装需要消耗更多的时间，同时也会占用更大的储存空间（指内部储存，用于储存编译后的代码），但节省了很多Dalvik虚拟机用于实时编译的时间  
### 安全机制  
Android操作系统使用了沙箱（SandBox）机制，所有的应用程序都会先被简单地解压缩到沙箱中进行检查，并且将应用程序所需的权限提交给系统，并且将其所需权限以列表的形式展现出来，供用户查看。用户可以根据权限来考虑自己是否需要安装，只有在用户同意了应用程序权限之后，才能进行安装。普通用户只能在应用程序安装时确认并肯定允许程序申请相应权限以继续安装或拒绝安装；应用程序开发商也会可能申请程序并不必需的权限，或者申请使用涉及用户隐私的权限并暗中收集、使用、发送用户隐私数据回开发商服务器用于信息收集。从Android 6.0开始，系统启用原生应用程序权限控制，允许程序安装后仍能对特定类别的权限使用进行启闭，如果应用程序的某组权限使用被关闭并准备访问相应权限控制对应的方法时系统会询问用户是否允许  
## 专利纠纷  
Android所使用的开发语言平台Java是Oracle（甲骨文）公司研制的，早在2010年8月，Oracle就开始对Google无授权使用Java语言实现侵犯了公司的专利在美国加州北区地方法院提起控诉，接下来的六年间，两者打了很多场官司，不分胜负。2016年8月22日，Google在最新的Android 7.0 Nougat中，将专利的JDK替换成开源方案的OpenJDK，以彻底解决Java的专利问题  
## 发行版本  
API以及版本号、英文代号、中文代号、以及发布时间如下：  

 API  | 版本号 |代号（英）|代号（中）|日期|  
:--:|:--:|:--:|:--:|:--:|  
01|1.0|无 |无 |2008.09.23|  
02|1.1|Petit Four|花色小蛋糕|2009.02.02|  
03|1.5|Cupcake|纸杯蛋糕|2009.04.30|  
04|1.6|Donut|甜甜圈|2009.09.15|  
05|2.0|Éclair|松饼|2009.10.26|  
06|2.0.1|Éclair|松饼|2009.12.03|  
07|2.1|Éclair|松饼|2010.01.12|  
08|2.2.0-2.2.3|Froyo |冻酸奶|2010.05.20|  
09|2.3.0-2.3.2|Gingerbread|姜饼|2010.12.07|  
10|2.3.3-2.3.7|Gingerbread|姜饼|2011.09.02|  
11|3.0|Honeycomb|蜂巢|2011.02.02|  
12|3.1|Honeycomb|蜂巢|2011.05.10|  
13|3.2|Honeycomb|蜂巢|2011.07.15|  
14|4.0.0-4.0.2|Ice Cream Sandwich|冰淇淋三明治|2011.10.19|  
15|4.0.3-4.0.4|Ice Cream Sandwich|冰淇淋三明治|2012.02.06|  
16|4.1|Jelly Bean|果冻豆|2012.06.28|  
17|4.2|Jelly Bean|果冻豆|2012.10.30|  
18|4.3|Jelly Bean|果冻豆|2013.07.25|  
19|4.4.0|KitKat|奇巧|2013.10.31|  
20|4.4.4|KitKat Watch|奇巧|2014.06.20|  
21|5.0|Lollipop|棒棒糖|2014.10.16|  
22|5.1|Lollipop|棒棒糖|2015.03.10|  
23|6.0|Marshmallow|棉花糖|2015.10.05|  
24|7.0|Nougat|牛轧糖|2016.08.22|  
25|7.1|Nougat|牛轧糖|2016.10.04|  
26|8.0|Oreo|奥利奥|2017.08.21|  
27|8.1|Oreo|奥利奥|2017.12.05|  
28|9|Pie|派|2018.08.06|  
  
## 分支版本  
LineageOS、YunOS、Fire OS、360OS、Flyme OS、Funtouch OS、氢OS、LeWa OS、XobotOS、Resurrection Remix OS、MIUI（米柚）、华为EMUI、Zen UI、Hive UI、LG Optimus UI、HTC Sense、三星TouchWiz、MoKee（魔趣）、Nokia X Software Platform、OPhone、AOKP、Baidu Yi、Barnes & Noble Nook、CyanogenMod、Replicant、OmniROM  

