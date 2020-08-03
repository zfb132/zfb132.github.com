---
layout: post
title: 基于jupyter lab搭建网页编程环境
subtitle: "在ubuntu系统配置环境，在任意浏览器编写运行代码"
category : [Ubuntu,Linux,Python, Matlab]
tags : [Ubuntu,Linux,Python, Matlab]
date:       2020-08-02 19:35:11 +08:00
author:     "晨曦"
header-img: "/img/post/jupytercon-planet.jpg"
description:  "包括虚拟环境、多用户、jupyter常用扩展、安装其他kernel等内容"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}

## 说明
即使该系统有用户zfb、root、test、ubuntu等，下面介绍的步骤只影响本用户，既不需要root权限，也不会对其他用户造成影响（开机自启的service文件需要root用户编辑和设置开机自启，之后就不需要操作了）
## 1. 创建虚拟环境jupyter
```bash
# 安装venv
sudo apt-get install python3-venv
# 创建虚拟环境，名称为jupyter
python3 -m venv jupyter
```
## 2. 安装nodejs（用于jupyterlab安装扩展）
```bash
# 下载nvm用于管理npm、nodejs环境
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
# 重新启动即可使用nvm命令
# nvm ls-remote          列出nodejs所有可用版本
# nvm install 10.10.0    安装nodejs 10.10.0版本
# 安装nodejs最新版本
nvm install node
```
把nvm环境`bin`文件夹放入`PATH`，即在`~/.bashrc`添加一行内容，必须把自己路径放在前面，避免先搜索到`/usr/local/bin`目录：  
```bash
export PATH=/home/zfb/.nvm/versions/node/v14.5.0/bin:${PATH}
```
## 3. 安装pip包
```bash
# 激活虚拟环境jupyter
source jupyter/bin/activate
# 在虚拟环境jupyter中安装jupyterlab和nodejs
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple jupyterlab npm nodejs
```
## 4. 使用jupyterlab
先把python虚拟环境`jupyter`的`bin`文件夹放入`PATH`，即在`~/.bashrc`添加一行内容，必须把自己路径放在前面，避免先搜索到`/usr/local/bin`目录：  
```bash
export PATH=/home/zfb/jupyter/bin:${PATH}
```
在命令行输入`jupyter lab`即可在本地端口打开（不需要激活虚拟环境），可以通过命令`which jupyter`得到`/home/zfb/jupyter/bin/jupyter`结果  
在jupyterlab运行期间，可以通过命令`jupyter notebook list`查看当前运行的jupyter实例  
列出当前已安装的扩展：`jupyter labextension list`  
卸载某个扩展：`jupyter labextension uninstall my-extension-name`  
查看jupyter的kernel：`jupyter kernelspec list`  
注意：`http://127.0.0.1:8888/lab`是jupyterlab的地址；`http://127.0.0.1:8888/tree`是传统jupyter notebook的地址  

## 5. 配置jupyterlab
在终端输入以下命令生成加密秘钥：  
```bash
# 激活虚拟环境jupyter
source jupyter/bin/activate
# 密码设置为123456，此命令输出密码的sha1结果，用于下一步配置文件token
python -c "from notebook.auth import passwd;print(passwd('123456'))"
```
在命令行输入`jupyter lab --generate-config`，则会生成文件`/home/zfb/.jupyter/jupyter_notebook_config.py`，打开该文件，修改以下内容：  
```python
c.NotebookApp.allow_remote_access = True
c.NotebookApp.ip = '0.0.0.0'
c.NotebookApp.notebook_dir = '/home/zfb/jp_data/'
c.NotebookApp.open_browser = False
c.NotebookApp.password = 'sha1:10d130e9bad7:b73d9821f96ccc4f42b2071b5dc46f2357373da3'
c.NotebookApp.port = 8888
```
安装扩展时如果找不到node，那么需要确保它在PATH，然后手动启动jupyter lab，**不要使用service启动**即可在浏览器点击install安装
## 6. 开机自启jupyter
切换root用户（zfb用户不能执行sudo命令），创建文件jupyter-zfb.service，内容如下：  
```ini
[Unit]
Description=Auto start jupyter lab Service for web
After=network.target

[Service]
Type=simple
# Type=forking
# PIDFile=/var/pid/master.pid
# 如果是在为其他用户配置jupyterlab，这里填对应的用户名
User=zfb
Restart=on-failure
RestartSec=10s
WorkingDirectory=/home/zfb/jupyter
ExecStart=/home/zfb/jupyter/bin/jupyter lab
# ExecReload=/home/zfb/jupyter/bin/jupyter lab

[Install]
WantedBy=multi-user.target
```
然后依次执行下面命令：  
```bash
# 复制jupyter-zfb.service文件到指定目录
sudo cp ./jupyter-zfb.service /etc/systemd/system/
# 设置jupyter-zfb开机自启
systemctl enable jupyter-zfb.service
# 重载service文件
sudo systemctl daemon-reload
# 查看所有的开机自启项
systemctl list-unit-files --type=service|grep enabled
# 手动开启jupyter-zfb服务
service jupyter-zfb start
# 查看jupyter-zfb服务的运行状态
service jupyter-zfb status
# 停止jupyter-zfb服务
service jupyter-zfb stop
```
查看服务状态的输出如下：  
```txt
root1@my-Server:~$ service jupyter-zfb status
● jupyter-zfb.service - Auto start jupyter lab Service for web
   Loaded: loaded (/etc/systemd/system/jupyter-zfb.service; enabled; vendor preset: enabled)
   Active: active (running) since Sun 2020-07-19 23:59:44 CST; 3s ago
 Main PID: 19426 (jupyter-lab)
    Tasks: 1 (limit: 7372)
   CGroup: /system.slice/jupyter-zfb.service
           └─19426 /home/zfb/jupyter/bin/python3 /home/zfb/jupyter/bin/jupyter-lab

Jul 19 23:59:44 my-Server systemd[1]: Started Auto start jupyter lab Service for web.
Jul 19 23:59:44 my-Server jupyter[19426]: [I 23:59:44.704 LabApp] JupyterLab extension loaded from /home/zfb/
Jul 19 23:59:44 my-Server jupyter[19426]: [I 23:59:44.704 LabApp] JupyterLab application directory is /home/z
Jul 19 23:59:44 my-Server jupyter[19426]: [I 23:59:44.706 LabApp] Serving notebooks from local directory: /ho
Jul 19 23:59:44 my-Server jupyter[19426]: [I 23:59:44.706 LabApp] The Jupyter Notebook is running at:
Jul 19 23:59:44 my-Server jupyter[19426]: [I 23:59:44.706 LabApp] http://my-Server:8888/
Jul 19 23:59:44 my-Server jupyter[19426]: [I 23:59:44.706 LabApp] Use Control-C to stop this server and shut 
root1@my-Server:~$ 
```
**问题**：service运行，则一旦安装扩展之后重新打开，扩展处就显示500 Internal Server Error；但是直接运行在控制台无问题；nohup jupyter lab &也无问题；screen也无问题
## 6. 开机自启和nohup运行
创建文件`startjupyterlab.sh`并分配执行权限：  
```bash
#!/bin/bash
# 后台运行，重定向错误日志，导出pid到文件
# nohup会免疫HUP信号，>>表示追加模式
/usr/bin/nohup /home/zfb/jupyter/bin/jupyter lab >> /home/zfb/jupyter/log/jupyterlab.log 2>&1 & echo $! > /home/zfb/jupyter/run_jupyter.pid
```
ubuntu 18.04不再使用`inited`管理系统，改用`systemd`，原本简单方便的`/etc/rc.local`文件已经没有了。systemd默认读取`/etc/systemd/system/`下的配置文件，该目录下的文件会链接`/lib/systemd/system/`下的文件，一般系统安装完`/lib/systemd/system/`下会有`rc-local.service`文件，即我们需要的配置文件，里面有写到`rc.local`的启动顺序和行为，文件内容如下`cat /lib/systemd/system/rc-local.service`  
```ini
#  SPDX-License-Identifier: LGPL-2.1+
#
#  This file is part of systemd.
#
#  systemd is free software; you can redistribute it and/or modify it
#  under the terms of the GNU Lesser General Public License as published by
#  the Free Software Foundation; either version 2.1 of the License, or
#  (at your option) any later version.

# This unit gets pulled automatically into multi-user.target by
# systemd-rc-local-generator if /etc/rc.local is executable.
[Unit]
Description=/etc/rc.local Compatibility
Documentation=man:systemd-rc-local-generator(8)
ConditionFileIsExecutable=/etc/rc.local
After=network.target

[Service]
Type=forking
ExecStart=/etc/rc.local start
TimeoutSec=0
RemainAfterExit=yes
GuessMainPID=no
```
`systemctl status rc-local`可以查看当前是否有`rc-local`这个服务，如果没有则需要创建`ln -fs /lib/systemd/system/rc-local.service /etc/systemd/system/rc-local.service`。设置开机启动并运行服务可以看到如下输出： 
```bash
zfb@my-Server:~$ service rc-local status
● rc-local.service - /etc/rc.local Compatibility
   Loaded: loaded (/lib/systemd/system/rc-local.service; static; vendor preset: enabled)
  Drop-In: /lib/systemd/system/rc-local.service.d
           └─debian.conf
   Active: inactive (dead)
Condition: start condition failed at Mon 2020-07-20 14:39:15 CST; 2s ago
           └─ ConditionFileIsExecutable=/etc/rc.local was not met
     Docs: man:systemd-rc-local-generator(8)
zfb@ny-Server:~$
```
然后执行以下操作：  
```bash
# 创建文件
sudo vim /etc/rc.local
# 添加内容
#  #!/bin/bash  
#  
#  su - zfb -c "/bin/bash /home/zfb/startjupyterlab.sh"

# 添加执行权限
sudo chmod +x /etc/rc.local
```
运行`service rc-local start`即可启动服务，`service rc-local status`查看运行状态
**日志分割**：然后创建文件`/etc/logrotate.d/jupyter-zfb`：
```ini
su zfb zfb
/home/zfb/jupyter/log/jupyterlab.log{
    weekly
    minsize 10M
    rotate 10
    missingok
    dateext
    notifempty
    sharedscripts
    postrotate
        if [ -f /home/zfb/jupyter/run_jupyter.pid ]; then
            /bin/kill -9 `cat /home/zfb/jupyter/run_jupyter.pid`
        fi
        /usr/bin/nohup /home/zfb/jupyter/bin/jupyter lab >> /home/zfb/jupyter/log/jupyterlab.log 2>&1 & echo $! > /home/zfb/jupyter/run_jupyter.pid
    endscript
}
```
执行命令`logrotate -dvf /etc/logrotate.d/jupyter-zfb`可以查看每次轮询的输出  
* `d`表示只是显示，并不实际执行
* `v`表示显示详细信息
* `f`表示即使不满足条件也强制执行一次


## 7. 添加其他python环境的kernel
在不激活任何环境的终端，创建新的虚拟环境py36（最后把它添加到jupyter的kernel）   
```bash
# 创建新的虚拟环境py36
python3 -m venv py36
# 激活新虚拟环境py36
source py36/bin/activate
# 为新环境安装需要的库
# pip install -i https://pypi.tuna.tsinghua.edu.cn/simple
# 为虚拟环境安装kernel
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple ipykernel
# 将此虚拟环境配置到jupyter的kernel中，此命令返回
# Installed kernelspec kernel_py36 in /home/zfb/.local/share/jupyter/kernels/kernel_py36
# 若不指定--user，则会提示权限不足，因为默认安装到/usr/local/share/jupyter
python -m ipykernel install --name kernel_py36 --user
# 启动jupyterlab，此时可以看到已经有两个kernel可供切换（jupyter、kernel_py36）
jupyter lab
```
删除某个kernel：`jupyter kernelspec remove kernel_py36`
## 8. 添加matlab的kernel
激活虚拟环境`jupyter`（jupyterlab被安装在此虚拟环境），然后安装matlab_kernal，再切换到matlab的安装目录`extern/engines/python/`，运行`setup.py`文件，具体步骤的命令如下：  
```bash
# 激活虚拟环境jupyter
source jupyter/bin/activate
# 在虚拟环境jupyter安装matlab_kernel
pip install matlab_kernel
# 若不指定--user，则会提示权限不足
python -m matlab_kernel install --user
# 切换到matlab安装目录的extern/engines/python/，然后运行命令
python setup.py install
# --build-base="/home/zfb/build" install --prefix="/home/zfb/jupyter/lib/python3.6/site-packages"
# 此时运行jupyter kernelspec list即可看到如下输出
# Available kernels:
#   matlab     /home/zfb/jupyter/share/jupyter/kernels/matlab
#   python3    /home/zfb/jupyter/share/jupyter/kernels/python3
```
保证最后`/home/zfb/jupyter/lib/python3.6/site-packages/`文件夹下有`matlab`文件夹和`matlab_kernel`文件夹：
```txt
matlab
├── engine
│   ├── _arch.txt
│   ├── basefuture.py
│   ├── engineerror.py
│   ├── enginehelper.py
│   ├── enginesession.py
│   ├── fevalfuture.py
│   ├── futureresult.py
│   ├── __init__.py
│   ├── matlabengine.py
│   ├── matlabfuture.py
│   └── __pycache__
│       ├── basefuture.cpython-36.pyc
│       ├── engineerror.cpython-36.pyc
│       ├── enginehelper.cpython-36.pyc
│       ├── enginesession.cpython-36.pyc
│       ├── fevalfuture.cpython-36.pyc
│       ├── futureresult.cpython-36.pyc
│       ├── __init__.cpython-36.pyc
│       ├── matlabengine.cpython-36.pyc
│       └── matlabfuture.cpython-36.pyc
├── __init__.py
├── _internal
│   ├── __init__.py
│   ├── mlarray_sequence.py
│   ├── mlarray_utils.py
│   └── __pycache__
│       ├── __init__.cpython-36.pyc
│       ├── mlarray_sequence.cpython-36.pyc
│       └── mlarray_utils.cpython-36.pyc
├── mlarray.py
├── mlexceptions.py
└── __pycache__
    ├── __init__.cpython-36.pyc
    ├── mlarray.cpython-36.pyc
    └── mlexceptions.cpython-36.pyc
5 directories, 31 files


matlab_kernel
├── check.py
├── __init__.py
├── kernel.json
├── kernel.py
├── __main__.py
├── matlab
│   ├── engine
│   │   ├── _arch.txt
│   │   ├── basefuture.py
│   │   ├── engineerror.py
│   │   ├── enginehelper.py
│   │   ├── enginesession.py
│   │   ├── fevalfuture.py
│   │   ├── futureresult.py
│   │   ├── __init__.py
│   │   ├── matlabengine.py
│   │   ├── matlabfuture.py
│   │   └── __pycache__
│   │       ├── basefuture.cpython-36.pyc
│   │       ├── engineerror.cpython-36.pyc
│   │       ├── enginehelper.cpython-36.pyc
│   │       ├── enginesession.cpython-36.pyc
│   │       ├── fevalfuture.cpython-36.pyc
│   │       ├── futureresult.cpython-36.pyc
│   │       ├── __init__.cpython-36.pyc
│   │       ├── matlabengine.cpython-36.pyc
│   │       └── matlabfuture.cpython-36.pyc
│   ├── __init__.py
│   ├── _internal
│   │   ├── __init__.py
│   │   ├── mlarray_sequence.py
│   │   ├── mlarray_utils.py
│   │   └── __pycache__
│   │       ├── __init__.cpython-36.pyc
│   │       ├── mlarray_sequence.cpython-36.pyc
│   │       └── mlarray_utils.cpython-36.pyc
│   ├── mlarray.py
│   ├── mlexceptions.py
│   └── __pycache__
│       ├── __init__.cpython-36.pyc
│       ├── mlarray.cpython-36.pyc
│       └── mlexceptions.cpython-36.pyc
├── matlabengineforpython-R2020a-py3.6.egg-info
└── __pycache__
    ├── check.cpython-36.pyc
    ├── __init__.cpython-36.pyc
    ├── kernel.cpython-36.pyc
    └── __main__.cpython-36.pyc

7 directories, 41 files
```
可以参考[链接1](https://am111.readthedocs.io/en/latest/jmatlab_install.html)和[链接2](https://www.mathworks.com/help/matlab/matlab_external/install-the-matlab-engine-for-python.html)
## 9. 使用frp内网穿透
腾讯云主机的`frps.ini`添加一行：
```ini
# 不需要和frpc.ini一致
vhost_http_port = 8888
```
运行jupyterlab的服务器的`frpc.ini`添加一个部分：  
```ini
[web]
type = http
local_port = 8888
custom_domains = lab.example.cn
```
如果要使用frp内网穿透的同时又给它设置域名，则域名解析记录添加一条名称为lab的A记录到腾讯云主机的IP（frps），在腾讯云主机再添加一个nginx项：  
```ini
    server{
        listen 80;
        # 如果需要ssl，参考https://blog.whuzfb.cn/blog/2020/07/07/web_https/
        # listen 443 ssl;
        # include ssl/whuzfb.cn.ssl.conf;
        # 此时支持http与https
        server_name lab.example.cn;
        access_log /home/ubuntu/frp_linux_amd64/log/access_jupyter.log;
        error_log /home/ubuntu/frp_linux_amd64/log/error_jupyter.log;
        location /{
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_redirect off;
            proxy_buffering off;
            proxy_pass http://127.0.0.1:8888;
        }

        location ~* /(api/kernels/[^/]+/(channels|iopub|shell|stdin)|terminals/websocket)/? {
            proxy_pass http://127.0.0.1:8888;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
        # -------  旧方法：还是有部分报错/api/kernels err_too_many_redirects  ---------
        # # 必须有，否则请求/api/kernels/ 的状态码都是400
        # location /api/kernels/ {
        #     proxy_pass            http://127.0.0.1:8888;
        #     proxy_set_header      Host $host;
        #     # websocket support
        #     proxy_http_version    1.1;
        #     proxy_set_header      Upgrade "websocket";
        #     proxy_set_header      Connection "Upgrade";
        #     proxy_read_timeout    86400;
        # }
        # # 必须有，否则请求/terminals/ 的状态码都是400
        # location /terminals/ {
        #     proxy_pass            http://127.0.0.1:8888;
        #     proxy_set_header      Host $host;
        #     # websocket support
        #     proxy_http_version    1.1;
        #     proxy_set_header      Upgrade "websocket";
        #     proxy_set_header      Connection "Upgrade";
        #     proxy_read_timeout    86400;
        # }
    }
```
## 10. VSCode连接jupyter
由于jupyterlab可以运行在本地指定端口，所以可以通过IP和端口在客户自己浏览器进行远程开发（保证远程服务器的`jupyter lab`开机自启服务），这在局域网内很方便，但是对于没有公网IP的话，就无法使用此功能  
好在VSCode可以直接打开远程jupyter，具体操作如下  
* 在客户本地机器安装`Remote Development`三件套插件，然后选择`Remote-SSH: Connect to host`，可以在本地提前创建配置文件（`C:\Users\zfb\.ssh\config`或者`C:\ProgramData\ssh\ssh_config`），内容类似：  
```conf
# 第一个远程机器
Host mylab
    HostName 54.33.135.211
    Port 22
    User ubuntu
```
* 根据提示输入远程服务器的密码即可连接成功，然后在远程服务器安装`Python`、`Pylance`、`IntelliCode`这三个插件，打开远程服务器的文件夹，创建一个扩展名为`ipynb`的文件，然后VSCode会自动提示选择Python版本（既可以选择系统的，也可以根据路径选择某个虚拟环境里面的），接着VSCode会自动连接Kernel，用户可以在右上角查看当前Kernel的状态或者切换Kernel
## 11. ssh连接jupyter在本地打开
在浏览器使用远程ip:port的方法，则服务器必须有公网，而且还费流量，另一种方法，ssh连接，然后端口映射  
服务器1：处于内网，已安装frpc，用户名为zfb，已安装配置好jupyterlab，运行在8888端口  
云主机2：处于公网，ip为56.78.12.34，已安装frps，用户名为ubuntu，仅用于服务器的内网穿透，端口7001为服务器1提供ssh转发  
执行以下命令，把用户3的电脑的本地端口8080绑定到服务器1的端口8888：   
`ssh -p 7001 -NL localhost:8080:localhost:8888 zfb@56.78.12.34`  
此时在用户3的本机打开网址`http://127.0.0.1:8080`即可访问服务器1的jupyterlab

## 12. matplotlib安装
首先在虚拟环境jupyter安装matplotlib库和ipympl库，后者用于显示可交互图形  
```bash
# 激活虚拟环境jupyter
source jupyter/bin/activate
# 在虚拟环境jupyter安装matlab_kernel
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple matplotlib ipympl
```
重新打开浏览器会提示rebuild，点击确定。等待build成功然后点击reload即可正常使用此插件，如下代码  
```python
%matplotlib widget
import pandas as pd
import numpy as np
import matplotlib
from matplotlib import pyplot as plt

ts = pd.Series(np.random.randn(1000), index=pd.date_range('1/1/2000', periods=1000))
ts = ts.cumsum()

df = pd.DataFrame(np.random.randn(1000, 4), index=ts.index,
                  columns=['A', 'B', 'C', 'D'])
df = df.cumsum()
df.plot()
plt.legend(loc='best')
plt.title('我是中文')
```
如果中文乱码，则[纠正中文乱码](https://blog.whuzfb.cn/blog/2020/07/02/matplotlib_tricks)

## 13. 使用plotly显示python程序绘制的图片
使用方法见[官网](https://plotly.com/python/getting-started)，python的使用不需要key和用户名，直接用就行


## 14. 使用plotly显示matlab的图片
详细使用方法见[官网教程](https://plotly.com/matlab/getting-started/)。注册plotly的[chart-studio](https://chart-studio.plotly.com/Auth/login/)账号，然后在个人账户的`setting`点击`api keys`，选择`Regenerate key`，记住这个key和自己的用户名。然后下载[压缩包](https://github.com/plotly/MATLAB-Online/archive/master.zip)并解压，打开matlab，输入  
```txt
>> cd ~/plotly-graphing-library-for-matlab-master/
>> plotlysetup('DemoAccount', 'lr1c44zw81')  % 回车，剩下的内容都是自动执行
Adding Plotly to MATLAB toolbox directory ...  Done
Welcome to Plotly! If you are new to Plotly please enter: >> plotlyhelp to get started!
```
此时会创建文件`~/.plotly/.credentials`，里面已经保存用户名和key（注意该用户需要有`toolbox`的写入权限）  
然后在jupyterlab写：  
```matlab
[X,Y,Z] = peaks;
contour(X,Y,Z,20);
% 个人用户还是用离线模式吧，否则只能创建100个图，还必须是公开分享
getplotlyoffline('https://cdn.plot.ly/plotly-latest.min.js')
fig2plotly(gcf, 'offline', true)
```
该命令会在当前目录生成一个html文件，双击打开即可