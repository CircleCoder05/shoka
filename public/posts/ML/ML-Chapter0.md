---
layout: post
title: "ML-Chapter0-概述"
date:   2025-02-28
tags: [ML,理论]
comments: true
categories:
- [机器学习]
author: CircleCoder
---

{% media audio %}

- https://music.163.com/#/song?id=5255640

{% endmedia %}

### 介绍

机器学习专门研究计算机怎样模拟或实现人类的学习行为，以获取新的知识或技能，重新组织已有的知识结构使之不断改善自身的性能。

**定义**：  

- **Arthur Samuel (1956)**：机器学习是“不显式编程地赋予计算机学习能力的研究领域”。  
- **Tom Mitchell (1998)**：通过经验（E）在任务（T）上通过性能指标（P）的提升实现学习。  

**发展历程**：  

- **早期探索（1943-1970s）**：  
  - 人工神经网络（ANN）、感知机（Rosenblatt）、跳棋程序（Samuel）。  
- **统计学习（1970s-2000s）**：  
  - 反向传播算法（Werbos）、支持向量机（SVM）、卷积神经网络（LeNet）。  
- **深度学习（2000s-2022）**：  
  - ImageNet（李飞飞）、AlexNet（Hinton）、ResNet（何恺明）、Transformer（2017）。  
- **大模型阶段（2022-）**：  
  - GPT系列、ChatGPT、多模态模型（如Qwen2.5-VL）、具身智能。  

**理论原始创新** 是机器学习领域的核心驱动力

**应用领域**：

- 人工智能（智能信息处理）
- 模式识别
- 数据挖掘（消费习惯分析）
- 计算机视觉（图像识别）
- 自然语言处理（机器翻译）。  

---

### 基本概念

 ![image-20250421175300768](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202504211753890.png)

---

### 学习方式

 ![image-20250421175217177](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202504211752309.png)

---

### 监督学习

 ![image-20250421174916842](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202504211749925.png)

 ![image-20250421175129213](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202504211751335.png)

---

### 过拟合与泛化

- **过拟合**：模型复杂度过高，训练误差低但测试误差高（高方差）。  
- **欠拟合**：模型复杂度不足，训练与测试误差均高（高偏差）。  
- **解决方案**：  
  - **增加数据量**：缓解过拟合（如M=9多项式拟合中增加样本）。  
  - **正则化**：惩罚模型复杂度（如L2正则化）。  
- **偏差-方差分解**：  
  - 泛化误差 = 偏差² + 方差 + 噪声。  

