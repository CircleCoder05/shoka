---
layout: post
title: 'Compile-Chapter1-词法分析'
date: 2025-09-22
tags: [Compile, 理论]
comments: true
categories: [编译原理]
author: CircleCoder
---

## 基本概念

![image-20250925151326600](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509251513816.png)

![image-20250925151501150](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509251515294.png)

## 有穷自动机

![image-20250925151852730](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509251518852.png)

![image-20250925153224210](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509251532315.png)

### DFA

所谓确定的状态机，其确定性表现在状态转换函数是单值函数！

![image-20250925155322657](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509251553808.png)

### NFA

![image-20250925161651072](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509251616139.png)

![image-20250925160941594](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509251609748.png)

![image-20250925162847245](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509251628330.png)

![image-20250925162904942](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509251629115.png)

## 正则表达式（RE）

![image-20250925163458025](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509251634117.png)

![image-20250925163512202](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509251635360.png)

![image-20250925163631551](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509251636695.png)

## NFA确定化

子集构造法，能够将 NFA 转化成 DFA

![](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509252135814.png)

![image-20250925213623339](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509252136482.png)

![image-20250925213738475](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509252137580.png)

![image-20250925213825140](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509252138271.png)

![image-20250925213842100](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509252138245.png)

![image-20250925214428900](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509252144982.png)

![image-20250925214609906](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509252146070.png)

## DFA极简化（极小化）

对于任一个DFA，存在一个唯一的状态最少的等价的DFA。
一个有穷自动机是化简的 ⇔ 它没有多余状态并且它的状态中没有互相等价的。
一个有穷自动机可以通过**消除多余状态**和**合并等价状态**而转换成一个最小的与之等价的有穷自动机。

(1) 有穷自动机的多余状态：从该自动机的开始状态出发，任何输入串也不能到达那个状态。

(2) 等价状态 ↔ 状态 s 和 t 的等价条件是：

- 一致性条件：状态 s 和 t 必须同时为可接受状态或不接受状态。
- 蔓延性条件：对于所有输入符号，状态 s 和 t 必须转换到等价的状态里。

形式化定义：对于所有输入符号 c，$I_c(s) = I_c(t)$（即状态 s、t 对于 c 具有相同的后继），则称 s, t 是等价的。

> **重要推论**：任何有后继的状态和任何无后继的状态一定不等价。

有穷自动机的状态 s 和 t 不等价，称这两个状态是**可区别的**。

![image-20250925220036292](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509252200437.png)

![image-20250925220053918](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509252200116.png)

![image-20250925220209207](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509252202333.png)

![image-20250925220248559](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509252202684.png)
