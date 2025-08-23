---
title: 'ML-Chapter3-贝叶斯决策'
date: 2025-04-14
tags: [ML, 理论]
comments: true
categories: [机器学习]
author: CircleCoder
---

## 基本概念

**贝叶斯公式：**

![image-20250823103708541](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508231037052.png)

- **样本** $\mathbf{x} \in \mathbb{R}^d$
- **类别/状态** $\omega_i$
- **先验概率** $P(\omega_i)$：历史数据中类别$\omega_i$的初始概率
- **样本分布密度** $p(\mathbf{x})$：所有样本在特征空间中的分布情况
- **类条件概率密度** $P(\mathbf{x} \mid \omega_i)$： 在类别 $\omega_i$ 下，样本 $\mathbf{x}$ 出现的概率
- **后验概率** $P(\omega_i \mid \mathbf{x})$：观察到样本$\mathbf{x}$后修正的类别概率
- **错误概率** $ P(e \mid \mathbf{x}) = \begin{cases}
  P(\omega_2 \mid \mathbf{x}) & \text{若判为}\omega_1 \\
  P(\omega_1 \mid \mathbf{x}) & \text{若判为}\omega_2
  \end{cases} $
- **平均错误率** $$ P(e) = \int P(e \mid \mathbf{x}) p(\mathbf{x}) d\mathbf{x} $$
- **正确率** $P(c) = 1 - P(e)$

## 最小错误率贝叶斯决策

本质上是根据贝叶斯公式计算后验概率，基于 **最大后验概率** 进行判决，不考虑决策风险

- $x \in w_k \text{ iff } k = \arg \max_i \{P(w_i | X)\}$

- $P(w_i | X) = \frac{P(X | w_i) P(w_i)}{\sum_{j = 1}^{c} P(X | w_j) P(w_j)}$

### 等价表达形式

- 后验概率形式

  $if \ P(\omega_i|\mathbf{x}) = \max_{j=1,...,c} P(\omega_j|\mathbf{x})$, $then \ \mathbf{x} \in \omega_i$

- 似然与先验乘积形式

  $if \ P(\mathbf{x}|\omega_i)P(\omega_i) = \max_{j=1,...,c} P(\mathbf{x}|\omega_j)P(\omega_j)$, $then \ \mathbf{x} \in \omega_i$

- 似然比形式（二分类情况）

  $if \ l(x) = \frac{P(\mathbf{x}|\omega_1)}{P(\mathbf{x}|\omega_2)} > \frac{P(\omega_2)}{P(\omega_1)}$, $then \ \mathbf{x} \in \omega_1$

  $if \ l(x) = \frac{P(\mathbf{x}|\omega_1)}{P(\mathbf{x}|\omega_2)} < \frac{P(\omega_2)}{P(\omega_1)}$, $then \ \mathbf{x} \in \omega_2$

- 对数似然比形式（二分类情况）

  $if \ h(x) = \ln[l(x)] = \ln P(\mathbf{x}|\omega_1) - \ln P(\mathbf{x}|\omega_2) > \ln \left( \frac{P(\omega_2)}{P(\omega_1)} \right)$, $then \ \mathbf{x} \in \omega_1$

  $if \ h(x) = \ln[l(x)] = \ln P(\mathbf{x}|\omega_1) - \ln P(\mathbf{x}|\omega_2) < \ln \left( \frac{P(\omega_2)}{P(\omega_1)} \right)$, $then \ \mathbf{x} \in \omega_2$

其中：$l(x)$ 为似然比，$h(x)$ 为对数似然比，$\frac{P(\omega_2)}{P(\omega_1)}$ 为似然比阈值

## 最小风险贝叶斯决策

- 目标：最小化决策风险
- 损失函数：$\lambda(\alpha_i, \omega_j)$，表示将 $\omega_j$ 误判为 $\alpha_i$ 的代价
- 利用后验概率与损失函数，计算条件风险：$R(\alpha_i | x) = \sum_{j = 1}^{c} \lambda(\alpha_i, \omega_j)P(\omega_j | x), i = 1, 2, \ldots, a$
- 决策：$R(\alpha_k | x) = \min_{i = 1, 2, \ldots, a} R(\alpha_i | x)$
- 最小错误率贝叶斯决策就是在 0-1损失函数（即正确分类损失为0，错误分类损失为1）条件下的最小风险贝叶斯决策

## 朴素贝叶斯决策

相比于上面提到的贝叶斯决策，带分类的样本 $\mathbf{x}$ 从一维变成**多维**（可以认为有 {$x_1,x_2,...x_i,...x_d$} 多重属性），现在我们要使用贝叶斯公式对这个多维样本进行分类

- **属性条件独立性假设**：在已知类别 $\omega_i$ 的条件下，假设所有属性 $x_i$ 都是相互独立的。即如下公式：

  $ P(\mathbf{x}\mid\omega)=P(x*{1} x*{2},...,x*{i},...,x*{d}\mid\omega)=\prod*{i=1}^{d}P(x*{i}\mid\omega) $

- 好处：降低样本集大小需求；降低复杂度

- 贝叶斯公式 + 属性独立性条件

  $P(w | \mathbf{x}) = \frac{P(w)P(\mathbf{x} | w)}{P(\mathbf{x})} = \frac{P(w)}{P(\mathbf{x})} \prod_{i = 1}^{d} P(x_i | w)$

- 朴素贝叶斯决策

  $w_k = \arg \max_j P(w_j) \prod_{i = 1}^{d} P(x_i | w_j)$

## 贝叶斯估计

把待估计参数 $θ$ 看作是具有先验分布 $p(θ)$ 的随机变量，其取值与样本集 $\mathbf{x}$ 有关，根据样本集 $mathbf{x}$ 估计（利用样本将先验概率修正为后验概率 ）

**概念**：

- **损失函数** $\lambda(\hat{\theta}, \theta)$：将 $\theta$ 估计为 $\hat{\theta}$ 造成的损失
- **平方误差损失** $\lambda(\hat{\theta}, \theta)=(\theta-\hat{\theta})^{2}$
- **期望风险** $R=\int_{E^{d}}R(\hat{\theta}\mid x)p(x)dx$
- **条件风险** $R(\hat{\theta}\mid x)=\int_{\Theta}\lambda(\hat{\theta},\theta) p(\theta\mid x)d\theta$
- **贝叶斯估计量** $\hat{\theta}=\arg \min \left(\int_{\Theta} \lambda(\hat{\theta}, \theta) p(\theta \mid x) d \theta\right)$
- **关键关系**：最小化期望风险 ⇨ 最小化所有$x$的条件风险
- **特例**：平方误差损失下，贝叶斯估计量=后验均值 $\hat{\theta}=E[\theta\mid x]$

**贝叶斯估计定理**（平方误差损失下）：

- 单样本形式：$\hat{\theta}=E(\theta\mid x)=\int_{\Theta}\theta p(\theta\mid x)d\theta$
- 样本集形式：$\hat{\theta}=E(\theta\mid X)=\int_{\Theta}\theta p(\theta\mid X)d\theta$

**算法步骤（平方误差损失下）**

1. 确定先验分布：$p(\theta)$
2. 计算样本联合分布：$p(X\mid\theta)=\prod_{i=1}^{N}p(x_{i}\mid\theta)$
3. 求后验分布：$p(\theta\mid X)=\frac{p(X\mid\theta)p(\theta)}{\int_{\Theta}p(X\mid\theta)p(\theta)d\theta}$
4. 计算贝叶斯估计量：$\hat{\theta}=\int_{\Theta}\theta p(\theta\mid X)d\theta$

## 例题

![image-20250823171846739](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508231722680.png)

## 参考文献

[北航机器学习期末考试例题汇总 - 凉宫秋月的文艺部](https://suzumiyaakizuki.github.io/2024/12/21/机器学习期末考试例题汇总/#贝叶斯决策)
