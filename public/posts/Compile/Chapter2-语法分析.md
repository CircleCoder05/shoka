---
layout: post
title: 'Compile-Chapter2-语法分析'
date: 2025-10-13
tags: [Compile, 理论]
comments: true
categories: [编译原理]
author: CircleCoder
---

## 基本概念

## 左递归问题

![image-20250925223102112](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509252231960.png)

![image-20250925225241320](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509252252459.png)

## 回溯问题

### 消除回溯的途径

- 通过提取公因子改写文法
- 超前扫描（偷看）

### First 集

![image-20251007212729885](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510072127844.png)

![image-20251007212812852](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510072128917.png)

![image-20251007212905101](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510072129256.png)

### Follow 集

![image-20251007212931117](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510072129409.png)

![image-20251013113427998](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510131134165.png)

![image-20251013114252002](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510131142117.png)

### SELECT 集

![image-20251013121855693](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510131218787.png)

![image-20251013121751107](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510131217209.png)

## LL(1) 文法

![image-20251013115745149](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510131157242.png)

![image-20251013143253399](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510131432573.png)

![image-20251013143334682](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510131433839.png)

![image-20251013143509485](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510131435590.png)

![image-20251013143625379](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510131436501.png)

![image-20251013144229417](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510131442605.png)
