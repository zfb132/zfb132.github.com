---
layout: post
title: 在Ubuntu系统以及WSL 2安装使用Docker
subtitle: "主要包括Docker的介绍、Dockerfile以及常用命令"
category : [Ubuntu,Linux,Windows,Python]
tags : [Ubuntu,Linux,Windows,Python]
date:       2020-12-16 11:20:55 +08:00
author:     "晨曦"
header-img: "/img/post/docker_logo.svg"
description:  "Kubernetes已经准备抛弃Docker作为运行时了，新的容器运行时组件有Containerd、CRI-O"
---
  
# 目录
{: .no_toc}

* 目录
{:toc}

## 1. Docker介绍
Docker 使用 Google 公司推出的 Go 语言 进行开发实现，基于 Linux 内核的 cgroup，namespace，以及 OverlayFS 类的 Union FS 等技术，对进程进行封装隔离，属于 操作系统层面的虚拟化技术。由于隔离的进程独立于宿主和其它的隔离的进程，因此也称其为容器。  
Docker包含三个概念：镜像（Image）、容器（Container）、仓库（Repository）  
* 镜像是只读的，镜像中包含有需要运行的文件（运行时所需的程序、库、资源、配置等文件；运行时准备的一些配置参数如匿名卷、环境变量、用户等）。镜像用来创建容器container，一个镜像可以运行多个container；镜像可以通过Dockerfile创建，也可以从Docker hub/registry上下载
* 容器是镜像运行时的实体。容器可以被创建、启动、停止、删除、暂停等。容器的实质是进程，但与直接在宿主执行的进程不同，容器进程可以拥有自己的 root 文件系统、自己的网络配置、自己的进程空间，甚至自己的用户 ID 空间；每一个容器运行时，是以镜像为基础层，在其上创建一个当前容器的存储层，我们可以称这个为容器运行时读写而准备的存储层为**容器存储层**；容器存储层的生存周期和容器一样，容器消亡时，容器存储层也随之消亡。因此，任何保存于容器存储层的信息都会随容器删除而丢失；容器不应该向其存储层内写入任何数据，**容器存储层要保持无状态化**。所有的文件写入操作，都应该使用**数据卷**（Volume）、或者**绑定宿主目录**，在这些位置的读写会跳过容器存储层，直接对宿主（或网络存储）发生读写，其性能和稳定性更高
* 镜像构建完成后，可以很容易的在当前宿主机上运行，但是，如果需要在其它服务器上使用这个镜像，就需要一个集中的存储、分发镜像的服务，Docker Registry（注册服务器）就是这样的服务；一个 Docker Registry 中可以包含多个仓库（Repository）；每个仓库可以包含多个标签（Tag）；每个标签对应一个镜像。一个仓库会包含同一个软件不同版本的镜像，而标签就常用于对应该软件的各个版本。我们可以通过`<仓库名>:<标签>`的格式来指定具体是这个软件哪个版本的镜像（仓库名经常以两段式路径形式出现，比如`jwilder/nginx-proxy`，前者往往意味着 Docker Registry 多用户环境下的用户名，后者则往往是对应的软件名）。如果不给出标签，将以`latest`作为默认标签，例如`ubuntu:16.04`、`ubuntu`、`ubuntu:latest`

Docker三个命令：  
* **docker-compose**：Docker镜像在创建之后，往往需要自己手动`pull`来获取镜像，然后执行`run`命令来运行。当服务需要用到多种容器，容器之间又产生了各种依赖和连接的时候，部署一个服务的手动操作是令人感到十分厌烦的。**dcoker-compose**技术，就是通过一个`.yml`配置文件，将所有的容器的部署方法、文件映射、容器连接等等一系列的配置写在一个配置文件里，最后只需要执行`docker-compose up`命令就会像执行脚本一样的去一个个安装容器并自动部署他们，极大的便利了复杂服务的部署
* **docker-machine**：Docker公司官方提出的，用于在各种平台上快速创建具有 docker 服务的虚拟机的技术，甚至可以通过指定 driver 来定制虚拟机的实现原理（一般是 virtualbox）
* **docker-swarm**：swarm 是基于 docker 平台实现的集群技术，他可以通过几条简单的指令快速的创建一个 docker 集群，接着在集群的共享网络上部署应用，最终实现分布式的服务

## 2. 安装使用WSL 2的Docker
在WSL使用Docker的官网安装[教程](https://docs.docker.com/docker-for-windows/wsl/)，需要自己安装[Windows版Docker](https://hub.docker.com/editions/community/docker-ce-desktop-windows/)
## 3. 配置Docker
打开Docker软件，修改设置：  
* Resources-->WSL Integration，启用自己安装的子系统
* Docker Engine修改镜像配置为  
```json
{
  "registry-mirrors": [
     "https://hub-mirror.c.163.com",
     "https://mirror.baidubce.com"
  ],
  "insecure-registries": [],
  "debug": true,
  "experimental": false
}
```
* 上述配置文件的路径在`C:\Users\zfb\.docker\daemon.json`
* 保存配置并重启Docker，则Windows的Powershell和WSL均可正常使用docker

## 4. docker常用命令
* 所有命令中，容器id与容器名字可以混用
* `docker info`：查看当前系统Docker信息
* `docker version`：查看当前Docker的版本
* `docker inspect c4b66ffc84d3`：输出容器的详细信息
* `docker cp tomcat:/webapps/js/text.js /home/admin`：将容器中的文件复制到宿主机
* `docker run hello-world`：运行最简单的一个docker命令，测试是否安装成功
* `docker pull angelkitty/nginx_web:v1`：下载镜像，`{registry}/{namespace or project}/{image}:{tag}`，`registry`不填的情况下默认为`docker.io`（可通过修改配置文件改为其他），`namespace or project`不填的情况下默认为`library`，`tag`不填的情况下默认为`latest`
* `docker commit c4b66ffc84d3 zfb/testimage:2.0`：可以保留对镜像的修改，在原有镜像的基础上，再叠加上容器的存储层，并构成新的镜像，将其保存下来形成镜像。以后运行这个新镜像的时候，就会拥有原有容器最后的文件变化，但是不利于分发部署，因为其他人不知道生成此镜像的步骤
* `docker images`：查看宿主机上的镜像，镜像保存在`/var/lib/docker`目录下
* `docker rmi c4b66ffc84d3`：删除id为`c4b66ffc84d3`的本地镜像，也可以是镜像的名字
* `docker rmi -f $(docker images -q)`：强制删除所有镜像
* `docker image prune -f -a`：强制删除所有不使用的镜像
* `docker ps -a -q`：显示所有（`-a`）容器（运行中和已退出）的详细信息，`-q`表示只显示容器的id信息
* `docker top c4b66ffc84d3`：查看容器内的进程
* `docker stop $(docker ps -aq)`：停止所有的容器
* `docker stop 8d0eb8b4180b`：停止id为`8d0eb8b4180b`的容器，也可以是容器的名字，如`webserver`
* `docker start Name或者ID`：启动id为`ID`的容器，也可以是容器的名字，如`Name`
* `docker kill Name或者ID`：强制杀死id为`ID`的容器，也可以是容器的名字，如`Name`
* `docker restart name或者ID`：重启id为`ID`的容器，也可以是容器的名字，如`Name`
* `docker rm $(docker ps -a -q)`：删除所有容器
* `docker container prune`：删除所有已停止的容器

### 4.1 exec
使用此命令可以进入正在运行（或已经创建）的容器，例如：  
`docker exec -it webserver bash`  
此命令表示进入名称为webserver的容器里面（也可以通过id进入），并且执行bash命令；此时我们会看到回显：  
```txt
 ~ > docker exec -it webserver bash
root@79b527eb60ee:/#
```
`-i`表示即使没有附加也保持标准输入打开，以交互模式运行容器，通常与`-t`同时使用  
`-t`表示为容器重新分配一个伪输入终端，通常与`-i`同时使用  
在bash修改配置、退出容器时候：如果要正常退出不关闭容器，需要按`Ctrl+P+Q`进行退出容器，如果要回到运行中的容器则`docker attach c4b66ffc84d3`；如果使用exit退出，那么在退出之后会关闭容器，可以使用下面的流程恢复`docker restart && docker attach`

### 4.2 run
run命令会去首先在本地寻找镜像，如果不存在则从网络下载  
使用镜像nginx:latest以交互模式启动（创建）一个容器，在容器内执行/bin/bash命令  
`docker run --name webserver -d -p 4000:80 -it nginx:latest /bin/bash`  
`--name`：为容器指定名称  
`--cpuset="0-2" or --cpuset="0,1,2"`：绑定容器到指定CPU运行  
`--link mypostgres_merry:db`：将此容器与名称为`mypostgres_merry`的容器连接，并为`mypostgres_merry`容器设置别名为`db`  
`-d`：表示后台运行容器，并返回容器ID  
`-e username="ritchie"`：为容器设置环境变量  
`-m`：设置容器使用内存最大值  
`-P`：随机端口映射，容器内部端口随机映射到主机的端口  
`-p 4000:80`：指定端口映射，将容器的80端口映射为宿主机的4000端口  
`-v /home/zfb/myimage:/data`：将主机上的`/home/zfb/myimage`目录中的内容关联到容器的文件系统`/data`下


## 5. Dockerfile
`Dockerfile`是一个用来构建镜像的文本文件（定制镜像），文本内容包含了一条条构建镜像所需的指令（每一条指令的内容，就是描述该层应当如何构建）和说明，每添加一层，镜像就会变大一些，所以尽可能把同类操作合并为一个指令  
忽略大小写，但是建议使用大写，使用`#`作为注释，每一行只支持一条指令，每条指令可以携带多个参数  
指令的换行方式与shell环境一致（用转义符`\`表示换行），如下所示：  
```bash
apt-get update \
    && apt-get install -y \
        build-essential \
        cmake \
        git
```
此指令与`apt-get update && apt-get install -y build-essential cmake git`效果完全一致  
一般来说`Dockerfile`的内容分为四个部分：**基础镜像信息**、**维护者信息**、**镜像操作指令**和**容器启动时执行指令**；支持的指令为`FROM`、`MAINTAINER`、`RUN`、`CMD`、`EXPOSE`、`ENV`、`ARG`、`ADD`、`COPY`、`ENTRYPOINT`、`VOLUME`、`USER`、`WORKDIR`、`ONBUILD`  
```dockerfile
# 第一条指令必须为 FROM 指令，表示下面修改基于的镜像
# FROM ubuntu:20.04
FROM nginx:1.11

# 指定维护者信息
MAINTAINER zfb and example@gmail.com

# 指定RUN命令更新镜像，RUN command，command为shell支持的所有命令
# 尽量把它们写为一条（用&&连接），多条的话会打包多层
# 每一个 RUN 都是启动一个容器、执行命令、然后提交存储层文件变更
# 因此cd命令与其他命令&&连起来放到同一个RUN，否则不会成功
# RUN命令的另一种写法（exec格式，一定要使用双引号"），CMD命令也支持此写法
# RUN ["/bin/bash", "-c", "echo hello"]
# 对于国内使用，先更换源；有的是cn，有的不是
# 然后更新apt、安装需要的软件包、删除缓存文件使镜像更小
# RUN echo "deb http://archive.ubuntu.com/ubuntu/ raring main universe" >> /etc/apt/sources.list
RUN sed -i 's/cn.archive.ubuntu.com/mirrors.ustc.edu.cn/g' /etc/apt/sources.list \
    && sed -i 's/archive.ubuntu.com/mirrors.ustc.edu.cn/g' /etc/apt/sources.list \
    && apt-get update && rm -rf /var/lib/apt/lists/*

# 指定容器对外暴露的端口号为3000-4000和5008
# 讨论以下几种情况
#   1. 既没有在Dockerfile里Expose，也没有run -p
#   2. 只在Dockerfile里Expose了这个端口
#   3. 同时在Dockerfile里Expose，又run -p
#   4. 只有run -p
# 针对情况1
#   启动在这个容器里的服务既不能被host主机和外网访问
#   也不能被链接的容器访问，只能在此容器内部使用
# 针对情况2
#   启动在这个容器里的服务不能被docker外部世界（宿主机和其他主机）访问
#   但是可以通过容器链接，被其他链接的容器访问到
# 针对情况3
#   启动的这个容器既可以被docker外部世界访问，也可以被链接的容器访问
# 针对情况4
#   等价于情况3
EXPOSE 80 443 3000-4000 5008

# 在镜像构建过程中设置环境变量，可以被后面的所有指令使用，会永久的保存到该镜像创建的任何容器中
# 例如：ADD、COPY、ENV、EXPOSE、FROM、LABEL、USER、WORKDIR、VOLUME、STOPSIGNAL、ONBUILD、RUN
# 但不能被CMD指令使用
ENV MYDIR /mydir
ENV VERSION=1.0 DEBUG="on" NAME=zfb

# ARG设置的构建环境的环境变量（参数名称和默认值），在将来容器运行时不会存在（但是docker history可以看到）
# 构建命令 docker build 中用 --build-arg MYDEBUG=off 来覆盖
ARG MYDEBUG=on

# 改变环境状态并影响以后的层，RUN、CMD、ENTRYPOINT这类命令的身份
# 这个用户必须是事先建立好的
RUN groupadd -r gp_redis && useradd -r -g redis gp_redis
USER redis:gp_redis

# 指定工作目录，相当于cd
# 该语句以后各层的当前目录就被改为指定的目录，如该目录不存在，WORKDIR 会自动建立目录
WORKDIR /home/$NAME/test

# 从构建上下文目录中<源路径>的文件/目录复制到新的一层的镜像内的<目标路径>位置
# 构建上下文：docker build -t testx .    其中.表示当前目录，则上下文为当前宿主机的目录
# <源路径>   可以是多个，甚至可以是通配符
# <目标路径> 可以是容器内的绝对路径，也可以是相对于工作目录的路径（若不存在自动创建缺失目录）
COPY check?.log ./

# 格式和 COPY 命令相同，可以完成 COPY 命令的所有功能，还具有其他功能
# 自动解压压缩文件并把它们添加到镜像中；从 url 拷贝文件到镜像中
ADD myname.tar.gz ./

# 在镜像中创建挂载点，这样只要通过该镜像创建的容器都有了挂载点
# 通过 VOLUME 指令创建的挂载点，无法指定宿主机上对应的目录，是自动生成的
# docker run -v可以指定
# 指定两个挂载点 /data1 和 /data2
VOLUME ["/data1", "/data2"]

# ENTRYPOINT指定容器启动程序及参数，格式和RUN格式一样，exec格式和shell格式
# 只有最新的一行ENTRYPOINT生效，前面会被覆盖
# 当指定ENTRYPOINT后，CMD指令的含义改变了
# 不再是直接运行命令，而是将CMD（或者docker run时的命令）的内容作为参数传给ENTRYPOINT指令
# 例如，CMD命令指定ENTRYPOINT命令的参数，
# ENTRYPOINT ["docker-entrypoint.sh"]
# CMD [ "redis-server" ]
# 如上设置会在容器创建后自动运行shell命令  ./docker-entrypoint.sh "redis-server"
# 再例如：docker run mytest curl -s http://ip.cn -i（mytest的Dockerfile未设置ENTRYPOINT）
# 等价于：docker run newtest -i（newtest的Dockerfile设置ENTRYPOINT如下）
ENTRYPOINT ["curl", "-s", "http://ip.cn"]


# CMD 指令的格式和 RUN 相似，表示容器创建后自动执行的命令，只有最新的一行CMD生效，前面会被覆盖
# 但是需要明白前台、后台的概念，区分容器和虚拟机的差异
# 对于容器而言，其启动程序就是容器应用进程，容器就是为了主进程而存在的，主进程退出，容器就退出
# 例如指令 CMD service nginx start 会被理解为 CMD [ "sh", "-c", "service nginx start"]
# 主进程实际上是sh，当service nginx start命令结束后，sh也就结束了，就会令容器退出
# 解决方法： 直接执行nginx可执行文件，并且要求以前台形式运行，如下所示
CMD ["nginx", "-g", "daemon off;"]

# 当所创建的镜像作为其它新创建镜像的基础镜像时，所执行的操作指令
# 也就是本镜像被from时，自动立即执行的指令
ONBUILD ADD . /app/src
ONBUILD RUN /usr/local/bin/python-build --dir /app/src
```
最不容易发生变化的操作放在较低的镜像层中，这样在重新 build 镜像时就会使用前面 build 产生的缓存  
编写完成`Dockerfile`之后，可以通过`docker build`命令来创建镜像，该命令将读取指定路径下（包括子目录）的`Dockerfile`文件，并将该路径下所有内容发送给`Docker`服务端，由服务端来创建镜像。因此一般建议放置`Dockerfile`的目录为空目录。也可以通过`.dockerignore`文件（每一行添加一条匹配模式）来让`Docker`忽略路径下的目录和文件；要指定镜像的标签信息，可以通过`-t`选项，例如：  
`sudo docker build -t myrepo/myapp:2.0 /tmp/test1/`  
**注意**：对于使用`Dockerfile`创建的镜像构建的容器来说，直接启动就会执行`Dockerfile`的`CMD`命令（或`ENTRYPOINT`命令），所以如果是别人制作的镜像，例如[opendronemap/odm/dockerfile](https://hub.docker.com/r/opendronemap/odm/dockerfile)，我们很可能就无法进入容器内的`/bin/bash`来执行其他操作。这时，使用如下命令启动容器就可以覆盖`Dockerfile`的`ENTRYPOINT`命令，来执行自己需要的命令：  
`docker run -it --entrypoint /bin/bash opendronemap/odm`  
## 6. docker-compose
[docker-compose](https://github.com/docker/compose)是定义和运行多个Docker容器的应用，它允许用户通过一个单独的`docker-compose.yml`模板文件来定义一组相关联的应用容器为一个项目。两个重要的概念：  
* 服务 (service)：一个应用的容器，实际上可以包括若干运行相同镜像的容器实例
* 项目 (project)：由一组关联的应用容器组成的一个完整业务单元，在`docker-compose.yml`文件中定义


## 7. Ubuntu（不是WSL）安装使用Docker
1. 卸载旧版本：`sudo apt-get remove docker docker-engine docker.io`
2. 添加apt源并安装：  
```bash
# 添加使用 HTTPS 传输的软件包以及 CA 证书
sudo apt-get install apt-transport-https ca-certificates curl software-properties-common
# 由于国内网络问题，使用国内源；官方地址为 https://download.docker.com/linux/ubuntu/gpg
curl -fsSL https://mirrors.ustc.edu.cn/docker-ce/linux/ubuntu/gpg | sudo apt-key add -
# 向 source.list 中添加 Docker 软件源；官方地址为 https://download.docker.com/linux/ubuntu
sudo add-apt-repository \
    "deb [arch=amd64] https://mirrors.ustc.edu.cn/docker-ce/linux/ubuntu \
    $(lsb_release -cs) \
    stable"
# 更新 apt 软件包缓存
sudo apt-get update
# 安装 docker-ce
sudo apt-get install docker-ce
```
3. 配置文件路径`/etc/docker/daemon.json`，如果不存在则自己创建，添加以下内容：  
```json
{
  "registry-mirrors": [
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
```
然后重新启动服务：  
```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
# 测试docker是否正确安装
docker run hello-world
```
4. 建立 docker 用户组（可选）：默认情况下`docker`命令会使用 Unix socket 与 Docker 引擎通讯。而只有`root`用户和`docker`组的用户才可以访问 Docker 引擎的 Unix socket。因此，更好地做法是将需要使用`docker`的用户加入`docker`用户组  
```bash
# 建立 docker 组
sudo groupadd docker
# 将当前用户加入 docker 组
sudo usermod -aG docker $USER
# 更新用户组
newgrp docker
```
如果还是出现报错，那么登出再登入该用户。还是不可以的话，就重启机器再次尝试  
5. 设置开机自启以及手动启动Docker  
```bash
# 设置Docker开机自启
sudo systemctl enable docker
# 启动Docker
sudo systemctl start docker
```