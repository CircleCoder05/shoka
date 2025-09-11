---
title: 'JDK 8 安装与配置'
date: 2025-09-11
tags: [Java, 开发环境]
comments: true
categories: [杂谈]
author: CircleCoder
---

> 本教程面对新手小白，介绍了 JDK1.8（也称作 Java 8 、JDK 8）的安装及配置

## 下载JDK

### 方式一：网盘下载

请选择任意一个链接，选择任意一个安装包下载即可：

[点击下载](https://link.zhihu.com/?target=https%3A//pan.baidu.com/s/1FjQlCUulceJWOQP96qQvjQ%3Fpwd%3Dmclj) [备用下载1](https://link.zhihu.com/?target=https%3A//pan.baidu.com/s/1K4gR2k152JWimdxEADvp2g%3Fpwd%3D1024) [备用下载2](https://link.zhihu.com/?target=https%3A//pan.baidu.com/s/1-KFO-_GQOsF2M-PVzKt24w%3Fpwd%3D1024)

![img](https://pica.zhimg.com/v2-26b334cd69de696f7912508aed86c3a6_1440w.jpg)

### 方式二：官网下载（需要注册账号登录）

1. 点击此链接到官网下载页面：[点击进入](https://link.zhihu.com/?target=https%3A//www.oracle.com/java/technologies/downloads/archive/)

![img](https://pic3.zhimg.com/v2-6ceac36c3101850e668fdfaa58151c20_1440w.jpg)

2. 找到以Java SE Development Kit开头的下载列表，找到64位的版本版本下载：

![img](https://pic4.zhimg.com/v2-37c7f582884b80c66e572fa25d0d6c77_1440w.jpg)

3. 按图所示点击下载：

![img](https://pic2.zhimg.com/v2-ef251c9eeb295b5ddcadf6147292721d_1440w.jpg)

4. 需要登录Oracle账号，没有账号的可以注册一个。登陆后即可下载：

![img](https://pica.zhimg.com/v2-5a22dcfd90e534e7d4dd7e1fe6d59d28_1440w.jpg)

## 安装JDK

### Step 1

![image-20250911182637364](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111834635.png)

### Step 2

![img](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111834213.jpeg)

### Step 3

修改安装路径（如果你是新手小白，可以不执行这一步操作，直接跳转到第5步），点击**更改**：

![img](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111834597.jpeg)

### Step 4

选择安装路径

为了避免后续出现问题，创建路径时，请不要JDK安装位置放在有中文字符的路径中。选择当前路径，点击确定：

![img](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111834339.jpeg)

### Step 5

![img](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111835901.jpeg)

![img](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111835084.jpeg)

### Step 6

安装过程中，出现了一个[JRE](https://zhida.zhihu.com/search?content_id=227345877&content_type=Article&match_order=1&q=JRE&zhida_source=entity)安装（前面我们安装的JDK已经包含了JRE，可以选择不安装，如果不需要安装，出现下图窗口后直接点击右上角关闭即可，直接跳到第11步）。点击**更改路径**：

![img](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111837543.jpeg)

### Step 7

新建一个路径，建议不要出现中文字符，然后选中此文件夹，点击确定：

![动图封面](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111837401.jpeg)

### Step 8

![img](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111837196.jpeg)

安装中，安装完成以后此窗口会自动消失：

![img](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111837165.jpeg)

### Step 9

![img](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111837942.jpeg)

## 配置环境变量

### Step 1

找到JDK的安装路径，出现bin、conf等文件夹，点击上方路径，**鼠标右键**点击**复制**：

![img](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111837049.jpeg)

### Step 2

在任务栏搜索框中找到 “编辑系统环境变量”

![image-20250911183954082](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111839469.png)

![image-20250911184031702](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111840859.png)

### Step 3

在下方系统变量中，点击**新建**：

![img](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111858822.jpeg)

### Step 4

配置安装路径，按照图示操作即可：

![img](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111858484.jpeg)

### Step 5

双击Path进入：

![img](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111858955.jpeg)

### Step 6

按照图示操作即可，然后一路点击确定。

![img](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111858515.jpeg)

## 检查JDK是否安装成功

1. 按Win和R键，输入`cmd`，点击确定：

![img](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111858303.jpeg)

2. 输入`javac`和`java`，会出现下图内容：

![img](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111858890.jpeg)

![img](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111858341.jpeg)

3. 输入`java -version`，出现下图信息表示JDK安装成功：

![img](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509111858209.png)

## 参考资料

[JDK 1.8 下载与安装教程（图文讲解） - 犬小哈教程](https://www.quanxiaoha.com/java/jdk8-download-and-install.html)
