---
layout: post
title: 在linux系统监控某个程序的执行情况并通知用户
subtitle: "用于进程运行状态监控"
category : [Ubuntu,Linux,Python]
tags : [Ubuntu,Linux,Python]
date:       2021-02-11 13:30:21 +08:00
author:     "晨曦"
header-img: "/img/post/ubuntu-canonical-bg.png"
description:  "如果某个程序停止执行，则自动发送邮件和短信通知用户"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}

## 介绍
如果有一个下载任务需要执行（`python3 download.py`），该任务会下载许多文件，一般将其放在后台执行。但是又需要知道它是否在某个时刻退出，可能是因为：  
* 任务执行完毕，正常结束运行
* 任务异常退出，可能由于下载的网站爬虫策略限制，也可能是其他原因

无论由于哪个原因，一旦程序停止，都需要立刻用户，所以编写以下代码来实现该功能
## 代码
使用python语言编写监控程序`detect.py`文件：  
* 如果需要使用腾讯云发送短信通知，则安装库`qcloudsms_py`
* 如果需要使用twilio发送短信通知，则安装库`twilio`

文件内容如下：  
```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
# author: 'zfb'
# time: 19-06-29 09:52
import datetime
import json
import os
import requests
import socket
import logging
from logging.handlers import RotatingFileHandler
from qcloudsms_py import SmsSingleSender
from qcloudsms_py.httpclient import HTTPError

LOG_FORMAT = "%(asctime)s [%(funcName)s: %(filename)s,%(lineno)d] - %(levelname)s : %(message)s"
DATE_FORMAT = "%m/%d/%Y %H:%M:%S"
LOG_PATH = "./log/"

# 初始化日志文件配置
def initLog(fileName,logger):
    # 创建日志文件夹
    if not os.path.exists(LOG_PATH):
        os.mkdir(LOG_PATH)
    myapp = logging.getLogger(logger)
    myapp.setLevel(logging.DEBUG)
    # 切割日志文件
    handler = RotatingFileHandler(LOG_PATH+fileName, maxBytes=128*1024, backupCount=60)
    handler.setFormatter(logging.Formatter(LOG_FORMAT,DATE_FORMAT))
    myapp.addHandler(handler)
    return myapp


logging = initLog('detect.log', 'detect')

# ------------  使用腾讯云发送短信通知用户  -----------
APP_ID = 1412345678
APP_KEY = "3998d59614123456789b72dd5961405c"
TEMPLATE_ID = 101234
SMS_SIGN = "签名A"
# ------------  使用腾讯云发送短信通知用户  -----------

# ------------  使用twilio发送短信  ------------------
SMS_SID = 'ACb770c5f63aac91c44d97891234567890'
SMS_TOKEN = '42b1294966799e965883181234567890'
SMS_FROM_NUMBER = '+12512123456'
# ------------  使用twilio发送短信  ------------------

# ------------  使用邮箱发信  ------------------------
EMAIL_FROM = 'example@qq.com'
EMAIL_PWD = '123demo'
# ------------  使用邮箱发信  ------------------------

def sendSMS(number, params, app_id=APP_ID, key=APP_KEY, template_id=TEMPLATE_ID, sms_sign=SMS_SIGN):
    ssender = SmsSingleSender(app_id, key)
    try:
        result = ssender.send_with_param(86, number, template_id, 
                params, sign=sms_sign, extend="", ext="")
    except HTTPError as e:
        log = json.dumps(e, ensure_ascii=False)
        logging.error(log)
        print(log)
    except Exception as e:
        log = json.dumps(e, ensure_ascii=False)
        logging.error(log)
        print(log)
    log = json.dumps(result, ensure_ascii=False)
    logging.debug(log)
    print(log)


# 使用twilio的使用账户发送短信
def send_sms(phone, content):
    from twilio.rest import Client
    # 账户信息： twilio.com/console
    account_sid = SMS_SID
    auth_token = SMS_TOKEN
    from_phone_num = SMS_FROM_NUMBER
    client = Client(account_sid, auth_token)
    message = client.messages.create(body=content, from_=from_phone_num, to=phone)
    print(message.sid)


# 使用139邮箱的短信通知功能
def send_email(email, subject, msg):
    from smtplib import SMTPException, SMTP_SSL
    from email.mime.text import MIMEText
    from email.header import Header
    # 发件人
    sender = EMAIL_FROM
    pwd = EMAIL_PWD
    # 三个参数：第一个为文本内容，第二个为plain设置文本格式，第三个为utf-8设置编码
    message = MIMEText(msg,"plain",'utf-8')
    message ['From'] = Header(sender,'utf-8')
    message ['To'] = Header(email,'utf-8')
    message["Subject"] = Header(subject,"utf-8")
    try:
        # 使用非本地服务器，需要建立ssl连接
        smtpObj = SMTP_SSL("smtp.exmail.qq.com", 465)
        smtpObj.login(sender,pwd)
        smtpObj.sendmail(sender,email,message.as_string())
        print("邮件发送成功")
    except SMTPException as e:
        print("Error：无法发送邮件.Case:%s"%e)


# 检测下载进程是否正在运行
def isRunning(search_param):
    output = os.popen('ps -ef | grep {}'.format(search_param))
    length = 0
    for line in output:
        # print(line)
        if "/bin/sh" in line or "grep" in line or "Terminated" in line:
            continue
        length = length + 1
    # print(length)
    return True if length > 0 else False


# 获取系统用户名和ip
def getInfomation():
    user = socket.gethostname()
    # 创建socket访问DNS来获取本机的IP，如果是NAT的话，则是局域网IP
    local_ip = "127.0.0.1"
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('1.1.1.1', 80))
        local_ip = s.getsockname()[0]
    finally:
        s.close()
    # 访问www.ip.cn网站获取公网IP
    net_ip = "127.0.0.1"
    try:
        net_ip = requests.get('https://api.ipify.org').text
    finally:
        pass
    return (user, local_ip, net_ip)


if __name__ == "__main__":
    status = isRunning("download.py")
    flag_file = "/home/ubuntu/flag"
    # now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if status:
        logging.debug("program is running")
    else:
        if os.path.isfile(flag_file):
            logging.error("program stopped, nobody fixed it.")
        else:
            info = getInfomation()
            msg = "您的主机{}，公网IP地址为{}，局域网IP为{}，下载进程已中断".format(info[0], info[2], info[1])
            phone = "13612345678"
            sendSMS(phone, ['spy', msg])
            send_sms(phone, msg)
            send_email("user@qq.com", "spy", msg)
            with open(flag_file, "w+") as file:
                file.write("Please delete me after restarting the download program.")
            logging.error("program stopped")
```
## 运行监控代码文件
在终端输入`crontab -e`打开定时管理任务，然后在文件中最后添加一行，内容如下：  
`*/30 * * * * python3 /home/ubuntu/detect.py`  
此代码表示每隔30min运行一次  
**注意**：每次重新启动下载进程之后，务必删除`flag`文件（为了防止因为没有及时重启下载进程而浪费短信资源，在主目录`~`下输入`rm flag`即可删除此文件）