---
layout: post
title: 在linux系统使用expect命令自动填充ssh或scp等命令的密码
subtitle: "expect命令主要配合send进行使用"
category : [Ubuntu,Linux]
tags : [Ubuntu,Linux]
date:       2021-01-16 14:13:22 +08:00
author:     "晨曦"
header-img: "/img/post/ubuntu-canonical-bg.png"
description:  "expect是Tcl脚本语言的一个扩展，应用在交互式软件中如telnet、ftp、passwd、fsck、rlogin、tip、ssh、scp等。它利用正则表达式进行模式匹配以及通用的编程功能，允许简单的脚本智能地管理以上命令"
---
  
## 目录
{: .no_toc}

* 目录
{:toc}

## expect命令使用范例
shell脚本文件的名称为`download.sh`，内容如下：  
```bash
#!/usr/bin/env bash

# 任何一句命令执行出错，都会终止该脚本
set -e
# 设置为调试模式，在执行过程中会同时输出各变量的值
# set -x

# 连接scp
#######################
# expect {
#   -re ".*es.*o.*" {
#     exp_send "yes\r"
#     exp_continue
#   }
#   -re ".*sword.*" {
#     exp_send "mypwd12345\r"
#   }
# }
# 把远程机器上的文件下载到本地机器
# 参数1: 远程机器上的文件（或文件夹）的绝对路径
# 参数2: 存放位置，即本地机器上的文件夹
# 当scp下载大文件时，需要耗费更多时间，设置timeout
function scp_download(){
src=$1
dst=$2
if [ $# -eq 2 ]
then
    need_ssh=0
else
    need_ssh=$3
fi
name=zfb
host="192.168.1.56"
passwd="1234567890pwd"
if [ $3 -eq 1 ]
then
# ssh登录远程机器，为目标文件添加读写执行权限
/usr/bin/expect<<EOF
    spawn ssh $name@$host
    expect {
        -timeout -1
        "*yes/no" {
            send "yes\r";exp_continue
        }
        "*password:" {
            send "$passwd\r"
            # zfb@my-Server:~$
            expect "~.*$"
            send "sudo chmod 777 $src\r"
            expect "*assword:"
            send "$passwd\r"
            expect "~.*$"
            send "exit\r"
            expect eof
        }
    }
EOF
fi
# 使用scp自动下载文件
/usr/bin/expect<<EOF
    set timeout 600
    spawn scp -r $name@$host:$src $dst
    expect {
        "*yes/no" {
            send "yes\r";exp_continue
        }
        "*password:" {
            send "$passwd\r"
            expect eof
        }
    }
EOF
}


# 脚本运行参数
# 参数1: 远程机器的文件（夹）绝对路径， 例如 /media/data/test/a.txt
# 参数2：保存位置，即本地路径

# 若本地不存在，则创建目录
if [ ! -d $2 ]
then
    echo $2" does not exist, ready to mkdir "$2
    mkdir -p $2
    echo "mkdir successfully!"
fi
data=$2/opendata
if [ ! -d $data ]
then
    echo $data" does not exist, ready to mkdir "$data
    mkdir -p $data
    echo "mkdir successfully!"
fi

scp_download $1/test.txt $2
scp_download $1/test/testaa.py $2
mv $2/testaa.py $2/testbb.py
scp_download $1/test/opendata/testcc.txt $data
# testdd.txt在远程机器上，无读取权限，需要ssh进行chmod添加权限
scp_download $1/test/opendata/testdd.txt $data 1
```
使用方法示例：  
`./download.sh /media/data/test ./`