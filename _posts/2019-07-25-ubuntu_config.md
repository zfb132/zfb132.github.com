---
layout: post
title: 安装Ubuntu系统后的配置工作
subtitle: "卸载不常用程序及安装配置软件"
category : [Ubuntu]
tags : [Ubuntu]
date:       2019-07-25
author:     "晨曦"
header-img: "/img/post/ubuntu-canonical-bg.png"
description:  "平时工作需要，可能会经常重装Ubuntu系统，所以写下这篇博客来帮助自己快速进行配置"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}


## 卸载webapps和LibreOffice
打开终端输入以下代码：  
`sudo apt-get remove libreoffice-common`  
`sudo apt-get remove unity-webapps-common`  
对于Amazon软件，可以在图标上右键选择移除
## 修改软件更新和安装的apt源
首先备份原始文件：  
`sudo cp /etc/apt/sources.list /etc/apt/sources.list.bk`  
然后用gedit打开（也可以安装使用vim编辑器`sudo apt-get install vim`）文件：  
`sudo gedit /etc/apt/sources.list`  
把文件中的内容替换为下面的内容（对于Ubuntu 18.04，中科大的源）：  
```
deb https://mirrors.ustc.edu.cn/ubuntu/ bionic main restricted universe multiverse
deb-src https://mirrors.ustc.edu.cn/ubuntu/ bionic main restricted universe multiverse
deb https://mirrors.ustc.edu.cn/ubuntu/ bionic-updates main restricted universe multiverse
deb-src https://mirrors.ustc.edu.cn/ubuntu/ bionic-updates main restricted universe multiverse
deb https://mirrors.ustc.edu.cn/ubuntu/ bionic-backports main restricted universe multiverse
deb-src https://mirrors.ustc.edu.cn/ubuntu/ bionic-backports main restricted universe multiverse
deb https://mirrors.ustc.edu.cn/ubuntu/ bionic-security main restricted universe multiverse
deb-src https://mirrors.ustc.edu.cn/ubuntu/ bionic-security main restricted universe multiverse
deb https://mirrors.ustc.edu.cn/ubuntu/ bionic-proposed main restricted universe multiverse
deb-src https://mirrors.ustc.edu.cn/ubuntu/ bionic-proposed main restricted universe multiverse
```
最后保存文件并执行：`sudo apt-get update`  
## 修改安装python库的pip源
首先在用户主目录（`~/`）下新建文件夹`mkdir .pip`，然后进入该文件夹`cd ~/.pip`，在此文件夹下新建文件`vi pip.conf`，然后在文件中输入以下内容并保存文件（以中科大的源为例）：  
```
[global]
index-url = https://mirrors.ustc.edu.cn/pypi/web/simple
trusted-host = mirrors.ustc.edu.cn
timeout = 60
```
另外，如果只是希望指定某一次安装python库的源地址，则可以使用以下代码（以清华的源为例）：  
`pip install -i https://pypi.tuna.tsinghua.edu.cn/simple package_name`
## 安装并设置搜狗输入法
打开终端输入以下代码：  
`sudo apt install fcitx`  
打开设置界面更改输入框架为`fcitx`，然后点击上面的`应用到全局`，重启系统，在终端输入：  
`sudo dpkg -i sogoupinyin_2.2.0.0108_amd64.deb`  
如果出错的话就输入   
`sudo apt  --fix-broken install`  
然后点击右上角的状态栏fcitx框架图标，添加搜狗拼音即可   
**如果在中文状态下只能输入英文标点，按快键键 `ctrl+.` ，然后重启**
## 安装vim、git、pip和tweak软件
打开终端输入以下代码：  
`sudo apt-get install vim`  
`sudo apt-get install git`  
`sudo apt install python3-pip`  
`sudo apt-get install gnome-tweak-tool`  
如果需要启用点击图标最小化的功能（即点击dock栏的应用图标可以最小化或者还原程序图形界面）：  
`gsettings set org.gnome.shell.extensions.dash-to-dock click-action 'minimize'`  
如果需要安装gnome桌面的扩展插件：  
`sudo apt install gnome-shell-extensions`  
`sudo apt install chrome-gnome-shell`
## 修改用户主目录下的文件夹名称为英文
大多数时候我安装的Ubuntu系统都是选择`中文简体`作为系统语言首选项的，这对平时使用带来了很大的方便，但是它的一个不足之处就是用户主目录下（即`~`）的文件夹都是中文的，比如`桌面、图片、文档、下载`等文件夹，偶尔要在终端切换到这些目录时就要切换输入法键入中文（虽然可以tab候选补全，但也还是麻烦），所以修改设置来更改这些文件夹的名字，同时不影响文件管理器`nautilus`的左侧固定的快捷访问文件夹。  
首先，手动修改用户主目录下（即`~`）的`桌面、图片、文档、下载`等文件夹的名字为英文，例如`Desktop、Pictures、Documents、Downloads`等名称，然后在终端输入以下代码：  
`sudo gedit ~/.config/user-dirs.dirs`  
在打开的文件中把内容修改成如下所示：  
```
XDG_DESKTOP_DIR="$HOME/Desktop"
XDG_DOWNLOAD_DIR="$HOME/Downloads"
XDG_TEMPLATES_DIR="$HOME/Templates"
XDG_PUBLICSHARE_DIR="$HOME/Public"
XDG_DOCUMENTS_DIR="$HOME/Documents"
XDG_MUSIC_DIR="$HOME/Music"
XDG_PICTURES_DIR="$HOME/Pictures"
XDG_VIDEOS_DIR="$HOME/Videos"
```
最后重启电脑即可完成操作
## 安装oh-my-zsh
想要安装oh-my-zsh必须首先安装zsh，在终端按顺序依次输入以下命令：  
`sudo apt-get install zsh`  
`chsh -s /bin/zsh`  
重启电脑，此时默认shell就是zsh，然后开始下载并安装oh-my-zsh：  
`sh -c "$(wget https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O -)"`
此时已经可以正常使用了，修改`~/.zshrc`文件可以调整配置如更换主题等  
对于我经常使用的**agnoster**主题需要安装专用字体：  
`sudo apt-get install fonts-powerline`  
另外oh-my-zsh的默认前缀并不美观，可以在`~/.zshrc`文件末尾输入以下内容来关闭前缀：  
`prompt_context () { }`  
我比较喜欢的一个插件是**句法高亮**，它可以用红、绿色来区分拼写错误和正确的命令，安装步骤是：  
`git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting`  
然后在`~/.zshrc`文件中合适位置：  
`plugins=( [plugins...] zsh-syntax-highlighting)`  
## 安装chrome
打开终端依次输入以下命令：  
`sudo wget http://www.linuxidc.com/files/repo/google-chrome.list -P /etc/apt/sources.list.d/`  
`wget -q -O - https://dl.google.com/linux/linux_signing_key.pub  | sudo apt-key add -`  
`sudo apt-get update`  
`sudo apt-get install google-chrome-stable`  
这只是谷歌浏览器deb文件的某一个源，如果无法访问，自行搜索其他源的地址
## 安装TimeShift
打开终端依次输入以下命令：  
`sudo apt-add-repository -y ppa:teejee2008/ppa`  
`sudo apt update`  
`sudo apt install timeshift`  

