---
layout: post
title: "在Linux下通过Docker运行Code Composer Studio"
subtitle: "支持多版本CCStudio及其组件的自动化构建与部署"
category : [Ubuntu,Linux,Docker]
tags : [Ubuntu,Linux,Docker,CCStudio,TI]
date:       2025-07-21 18:00:31 +08:00
author:     "晨曦"
header-img: "/img/post/docker_logo.svg"
description:  "提供一个用于在Linux环境（含CI/CD）中部署和使用Code Composer Studio的完整方案"
---
  
## 目录
{: .no_toc}

* 目录
{:toc}

## 1. CCStudio说明
Docker镜像可在以下位置获取：  
* [Dockerhub: whuzfb/ccstudio](https://hub.docker.com/r/whuzfb/ccstudio)
* [GHCR: zfb132/ccstudio](https://github.com/zfb132/ccstudio/pkgs/container/ccstudio)

### 1.1 软件配置情况
1. 目前理论上支持的[CCStudio](https://www.ti.com/tool/CCSTUDIO)版本：  
  * 10.x（已测试版本`10.0.0.00010`、`10.4.0.00006`）
  * 11.x（已测试版本`11.0.0.00012`、`11.2.0.00007`）
  * 12.x（已测试版本`12.0.0.00009`、`12.8.1.00005`）
  * 20.x（已测试版本`20.2.0.00012`）
2. 支持的Ubuntu版本： ubuntu 20.04及以上版本（已测试版本`20.04`、`22.04`、`24.04`）
3. 支持安装指定版本的[mmWave SDK](https://www.ti.com/tool/MMWAVE-SDK)，已测试版本`03.06.02.00-LTS`
4. 支持安装指定版本的[SYS/BIOS](https://software-dl.ti.com/dsps/dsps_public_sw/sdo_sb/targetcontent/bios/sysbios/)，已测试版本`6.73.01.01`

[zfb132/ccstudio](https://github.com/zfb132/ccstudio)目的是提供一个在Linux系统上安装[Code Composer Studio](https://www.ti.com/tool/CCSTUDIO)的Docker镜像，方便在Linux系统（无桌面环境）上使用CCStudio进行TI芯片的开发，尤其是适用于CI/CD场景。用户也可以参考仓库的[configure.sh](https://github.com/zfb132/ccstudio/blob/main/configure.sh)脚本在自己的Linux系统上安装CCStudio

容器内部最重要的三个目录：  
* `/ccs_projects`：CCStudio项目目录（运行容器必须挂载本地目录到此目录，因为entrypoint.sh脚本会在此目录下查找项目文件）
* `/workspaces`：CCStudio工作空间目录（容器内部CCS的工作空间目录为/workspaces，编译结果也存放在此目录下）
* `/opt/ti`：TI系列产品的安装目录（容器内部CCStudio、mmwave SDK、SYS/BIOS的安装目录）

不同版本的CCStudio在Linux系统的安装说明：  
* [CCS Linux Host Support](https://software-dl.ti.com/ccs/esd/documents/ccs_linux_host_support.html)
* [CCS Linux Host Support v12](https://software-dl.ti.com/ccs/esd/documents/ccsv12_linux_host_support.html)
* [CCS Installation Guide v20](https://software-dl.ti.com/ccs/esd/documents/users_guide/ccs_installation.html)

不同版本的CCStudio命令行程序的使用说明：  
* [CCS Command Line Interface (v12 and below)](https://software-dl.ti.com/ccs/esd/documents/ccs_projects-command-line.html)
* [CCS Command Line Interface (v20 and above)](https://software-dl.ti.com/ccs/esd/documents/users_guide/ccs_project-command-line.html)

## 2. 构建镜像
### 2.1 自动
使用`make`命令自动构建镜像  
```bash
# 查看可用的目标
make list

# 构建指定的镜像
make ubuntu24.04-20.2.0.00012-mmw

# 逐个构建镜像
make all

# 并行构建镜像（但是输出日志会混在一起）
make -j $(nproc) all

# 生成docker-compose.yaml文件用于并行构建镜像
make gen_compose

# 使用docker-compose构建镜像
docker compose -f docker-compose.yaml --parallel 2 build
```

### 2.2 手动
构建镜像的脚本如下：  
```bash
#   --network host
#   --build-arg "HTTP_PROXY=http://127.0.0.1:9900/" \
#   --build-arg "HTTPS_PROXY=http://127.0.0.1:9900/" \
#   --progress=plain --no-cache

# MMWSDK_COMPONENTS或BIOS_VERSION参数若为空，表示不安装对应组件
export UBUNTU_VERSION=24.04
export CCSTUDIO_VERSION=20.2.0.00012
export CCS_COMPONENTS="PF_MMWAVE,PF_C6000SC,PF_TM4C"
export MMWSDK_VERSION="03.06.02.00-LTS"
export MMWSDK_COMPONENTS="ALL"
export BIOS_VERSION="6.73.01.01"
# 使用major.minor版本号作为ccstudio版本标识
export CCS_VERSION_SHORT=$(echo ${CCSTUDIO_VERSION} | cut -d '.' -f 1-2)
export tag="whuzfb/ccstudio:${CCS_VERSION_SHORT}-ubuntu${UBUNTU_VERSION}"
docker build -t ${tag} . \
  --build-arg "OS_VERSION=${UBUNTU_VERSION}" \
  --build-arg "CCS_VERSION=${CCSTUDIO_VERSION}" \
  --build-arg "CCS_COMPONENTS=${CCS_COMPONENTS}" \
  --build-arg "MMWSDK_VERSION=${MMWSDK_VERSION}" \
  --build-arg "MMWSDK_COMPONENTS=${MMWSDK_COMPONENTS}" \
  --build-arg "BIOS_VERSION=${BIOS_VERSION}"
```

## 3. 运行容器
从Docker Hub拉取镜像[whuzfb/ccstudio](https://hub.docker.com/r/whuzfb/ccstudio)：  
```bash
# 拉取最新版本的ccstudio镜像（20.2-ubuntu24.04-mmw）
docker pull whuzfb/ccstudio:latest
```
或者使用本地构建的镜像  

挂载本地的ccs项目目录到容器内的`/ccs_projects`目录下并启动构建：  
```bash
# 假设本地项目目录为 ./mmw_oob
git clone --recursive https://github.com/zfb132/mmw_oob.git ./mmw_oob
# 该目录下包含out_of_box_6843_isk_mss.projectspec文件，且包含Debug编译配置
# 运行以下命令可以在容器内编译该项目
# 如果需要保存结果，那么使用 -v ./results:/workspaces （容器内部CCS的工作目录为/workspaces）
# 默认时区为UTC，可以通过设置 -e TZ=... 来更改时区（例如 -e TZ=Asia/Shanghai）
mkdir ./results
docker run \
  -e TZ=Asia/Shanghai \
  -v ./mmw_oob:/ccs_projects \
  -v ./results:/workspaces \
  -it --rm --name ccstudio whuzfb/ccstudio:latest \
  "out_of_box_6843_isk_mss.projectspec" "Debug"
```

## 4. CCStudio组件
[可安装的产品系列](https://software-dl.ti.com/ccs/esd/documents/ccs_installer-cli.html)列表：  

|  Product family   |                               Description                                    |            OS               |
|      :---:        |                                  :---:                                       |           :---:             |
| PF_MSP430         | MSP430 ultra-low power MCUs                                                  | windows-x64, linux-x64, osx |
| PF_MSP432         | SimpleLink™ MSP432™ low power + performance MCUs                             | windows-x64, linux-x64, osx |
| PF_CC2X           | SimpleLink™ CC13xx and CC26xx Wireless MCUs                                  | windows-x64, linux-x64, osx |
| PF_CC3X           | SimpleLink™ Wi-Fi® CC32xx Wireless MCUs                                      | windows-x64, linux-x64, osx |
| PF_CC2538         | CC2538 IEEE 802.15.4 Wireless MCUs                                           | windows-x64, linux-x64, osx |
| PF_C28            | C2000 real-time MCUs                                                         | windows-x64, linux-x64, osx |
| PF_TM4C           | TM4C12x ARM® Cortex®-M4F core-based MCUs                                     | windows-x64, linux-x64, osx |
| PF_PGA            | PGA Sensor Signal Conditioners                                               | windows-x64, linux-x64, osx |
| PF_HERCULES       | Hercules™ Safety MCUs                                                        | windows-x64, linux-x64, osx |
| PF_SITARA         | Sitara™ AM3x, AM4x, AM5x and AM6x MPUs (will also include AM2x for CCS 10.x) | windows-x64, linux-x64      |
| PF_SITARA_MCU     | Sitara™ AM2x MCUs (only supported in CCS 11.x and greater)                   | windows-x64, linux-x64      |
| PF_OMAPL          | OMAP-L1x DSP + ARM9® Processor                                               | windows-x64, linux-x64      |
| PF_DAVINCI        | DaVinci (DM) Video Processors                                                | windows-x64, linux-x64      |
| PF_OMAP           | OMAP Processors                                                              | windows-x64, linux-x64      |
| PF_TDA_DRA        | TDAx Driver Assistance SoCs & Jacinto DRAx Infotainment SoCs                 | windows-x64, linux-x64      |
| PF_C55            | C55x ultra-low-power DSP                                                     | windows-x64, linux-x64      |
| PF_C6000SC        | C6000 Power-Optimized DSP                                                    | windows-x64, linux-x64      |
| PF_C66AK_KEYSTONE | 66AK2x multicore DSP + ARM® Processors & C66x KeyStone™ multicore DSP        | windows-x64, linux-x64      |
| PF_MMWAVE         | mmWave Sensors                                                               | windows-x64, linux-x64      |
| PF_C64MC          | C64x multicore DSP                                                           | windows-x64, linux-x64      |
| PF_DIGITAL_POWER  | UCD Digital Power Controllers                                                | windows-x64, linux-x64      |


## 5. 其他参考
* [zfb132/ccstudio](https://github.com/zfb132/ccstudio)
* [zfb132/mmw_oob](https://github.com/zfb132/mmw_oob)
* [uoohyo/ccstudio-ide](https://github.com/uoohyo/docker-ccstudio-ide)
* [uoohyo/action-ccstudio-ide](https://github.com/uoohyo/action-ccstudio-ide)
* [ccstudio code composer studio 12.8 and uniflash 8.7 on ubuntu 24.04](https://e2e.ti.com/support/processors-group/processors/f/processors-forum/1412767/ccstudio-code-composer-studio-12-8-and-uniflash-8-7-on-ubuntu-24-04)
* [codecomposer installing ccs 20.2.0 into a docker container](https://e2e.ti.com/support/tools/code-composer-studio-group/ccs/f/code-composer-studio-forum/1532443/codecomposer-installing-ccs-20-2-0-into-a-docker-container)
