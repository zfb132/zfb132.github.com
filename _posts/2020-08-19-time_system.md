---
layout: post
title: 常用的几种时间系统以及GPS时间转UTC时间
subtitle: "包括GMT、UT、TAI、UTC等时间系统"
category : [Ubuntu,Linux,Windows,Python]
tags : [Ubuntu,Linux,Windows,Python]
date:       2020-08-19 15:35:57 +08:00
author:     "晨曦"
header-img: "/img/post/ubuntu-canonical-bg.png"
description:  "使用Python编写时区转换和GPST与UTC转换的代码"
---
  
## 目录
{: .no_toc}

* 目录
{:toc}

## 时间标准
* **格林尼治标准时间GMT**（Greenwich Mean Time）：它是指位于英国伦敦郊区的皇家**格林尼治天文台当地的平太阳时**，因为本初子午线被定义为通过那里的经线。自1924年2月5日开始，格林尼治天文台负责每隔一小时向全世界发放调时信息。格林尼治标准时间的正午是指当平太阳横穿格林尼治子午线时（也就是在格林尼治上空最高点时）的时间。由于地球每天的自转是有些不规则的，而且正在缓慢减速，因此格林尼治平时基于天文观测本身的缺陷，已经被原子钟报时的协调世界时（UTC）所取代
* **世界时UT**（Universal Time）：它是一种以格林威治子夜起算的平太阳时。世界时是以地球自转为基准得到的时间尺度，其精度受到地球自转不均匀变化和极移的影响，为了解决这种影响，1955年国际天文联合会定义了UT0、UT1和UT2三个系统：UTO表示未经改正的世界时，UT1表示经过极移改正的世界时，UT2表示进一步经过地球自转速度的季节性改正后的世界时
* **国际原子时TAI**（International Atomic Time）：英语简称为IAT，法语简称为TAI，最终使用法语简称TAI。它是根据秒的定义（1秒为铯-133原子基态两个超精细能级间跃迁辐射振荡9192631770周所持续的时间）的一种国际参照时标，是均匀的时间尺度，与地球的空间位置不关联，起点为1958年1月1日0时0分0秒。随着时间的迁延，TAI和UT1两种时间尺度的时间差越来越大。为此，在UT1和TAI之间进行协调，这就产生了协调世界时UTC
* **协调世界时UTC**（Coordinated Universal Time）：它是最主要的世界时间标准，基于国际原子时，并通过不规则的加入闰秒来抵消地球自转变慢的影响。它又称为世界统一时间、世界标准时间、国际协调时间。由于英文（CUT）和法文（TUC）的缩写不同，作为妥协，简称UTC。协调世界时（UTC）是世界上调节时钟和时间的主要时间标准，是最接近格林威治标准时间（GMT）的几个替代时间系统之一。对于大多数用途来说，**UTC时间被认为能与GMT时间互换**。人们对该时间系统进行过数次调整，直到1972年引入了闰秒机制，调整工作得以简化。**闰秒在必要的时候会被插入到UTC中，以保证协调世界时（UTC）与世界时（UT1）相差不超过0.9秒**
* **Unix或POSIX时间戳**：它是UNIX或类UNIX系统使用的时间表示方式。一般定义为从协调世界时(UTC时间)1970年1月1日0时0分0秒起至现在的总秒数（10位是精确到秒，13位是精确到毫秒）。考虑到闰秒的话，更精确的定义为从协调世界时(UTC时间)1970年1月1日0时0分0秒起至现在经过闰秒调整之后的总秒数
* **GPS时间**：它是GPS原子时，它的时间基准是1980年1月6日0时0分0秒与世界协调时刻UTC相一致，以后按原子时TAI秒长累积计时。GPS时间跟UTC时间之差为秒的整倍数（因为UTC比TAI慢，而GPS是按照TAI来计时的，所以UTC也比TAI慢）。如1989年为5秒，1996年为11秒，2002年为13秒，到现在2020年08月为止为18秒。

## 闰秒
它是在协调世界时（UTC）中增加或减少一秒，使它与平太阳时贴近所做调整。需要闰秒的部分原因是因为平均太阳日（mean solar day）的长度正以非常缓慢的速度增加中，另一个原因是原子钟赋予秒固定的时间长度。而当两者结合时，就已经比当时的太阳时的秒短少了一点点。时间现在是以稳定的原子钟来测量（TAI或国际原子时），因为地球自转有着许多的变数，所以以前的秒定义（地球绕着轴自转和绕太阳的公转，以平均太阳日的1/86400来定义）被废除。当要增加正闰秒时，这一秒是增加在第二天的00:00:00之前，效果是延缓UTC第二天的开始。当天23:59:59的下一秒被记为23:59:60，然后才是第二天的00:00:00。如果是负闰秒的话，23:59:58的下一秒就是第二天的00:00:00了，但目前还没有负闰秒调整的需求  
[Leap_Second.dat](https://hpiers.obspm.fr/eoppc/bul/bulc/Leap_Second.dat)可以查看每次闰秒的时间和第几次闰秒，主要内容如下：  
```txt
#    MJD        Date        TAI-UTC (s)
#           day month year
#    ---    --------------   ------   
#
    41317.0    1  1 1972       10
    41499.0    1  7 1972       11
    41683.0    1  1 1973       12
    42048.0    1  1 1974       13
    42413.0    1  1 1975       14
    42778.0    1  1 1976       15
    43144.0    1  1 1977       16
    43509.0    1  1 1978       17
    43874.0    1  1 1979       18
    44239.0    1  1 1980       19
    44786.0    1  7 1981       20
    45151.0    1  7 1982       21
    45516.0    1  7 1983       22
    46247.0    1  7 1985       23
    47161.0    1  1 1988       24
    47892.0    1  1 1990       25
    48257.0    1  1 1991       26
    48804.0    1  7 1992       27
    49169.0    1  7 1993       28
    49534.0    1  7 1994       29
    50083.0    1  1 1996       30
    50630.0    1  7 1997       31
    51179.0    1  1 1999       32
    53736.0    1  1 2006       33
    54832.0    1  1 2009       34
    56109.0    1  7 2012       35
    57204.0    1  7 2015       36
    57754.0    1  1 2017       37
```

## TAI、GPST、UTC换算
根据文件[Leap_Second.dat](https://hpiers.obspm.fr/eoppc/bul/bulc/Leap_Second.dat)可以得知，截止2020年08月：  
`TAI = UTC + 37`  
由于GPST从1980年1月6日0时0分0秒开始计时，所以1980年1月1日及以前的闰秒不考虑，则：  
`GPST = UTC + 18`  
另外，[leapsecond](http://www.leapsecond.com/java/gpsclock.htm)可以查看实时的UTC、GPST、TAI时间
## 时区划分
时区是指地球上的某一个区域使用同一个时间定义。GMT时间或者UT时间，都是表示地球自转速率的一种形式。从太阳升起到太阳落下，时刻从0到24变化。这样，不同经度的地方时间自然会不相同。为了解决这个问题，人们把地球按经度划分为不同的区域，每个区域内使用同一个时间定义，相邻的区域时间差为1个小时。时区又分为理论时区和法定时区
* **理论时区**：按经度，每15°为一个时区，将地球划分为24个时区，以本初子午线为中心，向东西两侧各延伸7.5°的区域为0时区
* **法定时区**：法定时区是在理论时区的基础上，根据某些地区的国界线做了调整之后的时区。为实际使用的时区。例如中国横跨东五区到东九区五个时区，但统一使用东八区时间（北京时间）
* **时差**：某个地方的时刻与0时区的时刻差称为时差，时差东正西负。以本初子午线为中心，每向东一跨过一个时区，时刻增加一个小时，每向西跨过一个时区，时刻减少一个小时
* **国际日期变更线**：大体以180度经线为日界线。当自西向东穿过日期变更线时，日期需要减少一天，反之，日期增加一天

## UTC时间转本地时间（东八区）
根据此代码，修改最后一行`fromtimestamp(timestamp, timezone(timedelta(hours=8)))`即可实现UTC转不同时区  
```python
from datetime import datetime, timedelta, timezone

# UTC时间转本地时间（北京）时间
# 1. 把utc的str转为datetime（无时区信息）
# 2. 添加时区信息为utc时区
# 3. datetime转为时间戳
# 4. 从时间戳得到本地时间datetime
# 输入格式为：'2020-08-05 02:03:03.815650'
# 输出格式为：datetime.datetime(2020, 8, 5, 10, 3, 3, 815650)
def utc_to_local(utc_time):
    datetimeformat = "%Y-%m-%d %H:%M:%S.%f"
    # 得到不包含时区的datetime
    dt_no_tz = datetime.strptime(utc_time, datetimeformat)
    # 设置时区为UTC
    # timezone.utc与timezone(timedelta(hours=0))一样
    utc_datetime = dt_no_tz.replace(tzinfo=timezone(timedelta(hours=0)))
    t = utc_datetime.timestamp()
    # 根据时间戳得到UTC时间
    # datetime.utcfromtimestamp(t)
    # 如果要将时间戳转化为东八区datetime
    # fromtimestamp(timestamp, timezone(timedelta(hours=8)))
    # 根据时间戳得到本地时间fromtimestamp(t, tz=None)
    return datetime.fromtimestamp(t)
```
## 本地时间（东八区）转UTC
根据此代码，修改`replace(tzinfo=timezone(timedelta(hours=8)))`即可实现某个时区转UTC时间  
```python
from datetime import datetime, timedelta, timezone

# 本地时间转UTC时间
# 输入格式为：'2020-08-05 10:03:03.815650'
# 输出格式为：datetime.datetime(2020, 8, 5, 2, 3, 3, 815650)
def local_to_utc(local_time):
    datetimeformat = "%Y-%m-%d %H:%M:%S.%f"
    # 得到不包含时区的datetime
    dt_no_tz = datetime.strptime(local_time, datetimeformat)
    # 设置时区为本地时区（北京，东八区）
    # timezone.utc与timezone(timedelta(hours=0))一样
    local_datetime = dt_no_tz.replace(tzinfo=timezone(timedelta(hours=8)))
    t = local_datetime.timestamp()
    # 根据时间戳得到UTC时间
    return datetime.utcfromtimestamp(t)
```
## GPS时间转UTC时间
将GPS时间转换为UTC时间  
```python
from datetime import datetime, timedelta

# 闰秒
LEAP_SECONDS = 18

# 输入：GPS周、GPS周内秒、闰秒（可选，gps时间不同，闰秒值也不同，由Leap_Second.dat文件决定）
# 输出：UTC时间（格林尼治时间）
# 输入示例： gps_week_seconds_to_utc(2119, 214365.000)
# 输出示例： '2020-08-18 11:32:27.000000'
def gps_week_seconds_to_utc(gpsweek, gpsseconds, leapseconds=LEAP_SECONDS):
    datetimeformat = "%Y-%m-%d %H:%M:%S.%f"
    epoch = datetime.strptime("1980-01-06 00:00:00.000", datetimeformat)
    # timedelta函数会处理seconds为负数的情况
    elapsed = timedelta(days=(gpsweek*7), seconds=(gpsseconds-leapseconds))
    return datetime.strftime(epoch+elapsed, datetimeformat)
```
## UTC时间转GPS时间
将UTC时间转换为GPS时间  
```python
from datetime import datetime, timedelta

# 闰秒
LEAP_SECONDS = 18

# 输入：UTC时间（datetime类型）
# 输出：GPS周、周内日、周内秒、毫秒
def utc_to_gps_week_seconds(utc, leapseconds=LEAP_SECONDS):
    datetimeformat = "%Y-%m-%d %H:%M:%S.%f"
    epoch = datetime.strptime("1980-01-06 00:00:00.000", datetimeformat)
    tdiff = utc - epoch + timedelta(seconds=leapseconds)
    gpsweek = tdiff.days // 7
    gpsdays = tdiff.days - 7*gpsweek
    gpsseconds = tdiff.seconds + 86400*(tdiff.days -7*gpsweek)
    return gpsweek, gpsdays, gpsseconds, tdiff.microseconds
```