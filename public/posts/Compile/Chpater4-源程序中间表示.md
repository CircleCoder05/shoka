---
layout: post
title: 'Compile-Chapter4-源程序中间表示'
date: 2025-10-27
tags: [Compile, 理论]
comments: true
categories: [编译原理]
author: CircleCoder
---

## 波兰表示

### 概念

由波兰逻辑学家 J.Lukasiewicz 提出

- 前缀表示（波兰表示）：<操作符><操作数序列>
- 后缀表示（后缀表示）：<操作数序列><操作符>

![image-20251116190029095](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511161900824.png)

### 算法

- 设一个操作符栈
- 当读到操作数时，立即输出该操作数
- 当扫描到操作符时，与栈顶操作符比较优先级
- 若栈顶操作符优先级高于栈外，则输出该栈顶操作符，反之，则栈外操作符入栈。

### if 语句的波兰表示

![image-20251116190322486](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511161903617.png)

其他语言结构也很容易将其翻译成波兰表示

使用波兰表示的问题：优化不方便

## 三元式

### 概念

![image-20251116191232380](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511161912451.png)

### 条件语句的三元式

![image-20251116191633480](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511161916617.png)

### 间接三元式

使用三元式不便于代码优化，因为优化要删除一些三元式，或对某些三元式的位置要进行变更，由于三元式的结果(表示为编号)，可以是某个三元式的操作数，随着三元式位置的变更也将作相应的修改，很费事

为了便于在三元式上作优化处理，可使用间接三元式

三元式的执行次序用另一张表表示,这样在优化时，三元式可以不变，而仅仅改变其执行顺序表

![image-20251116191731305](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511161917396.png)

## 四元式

### 概念

![image-20251116191849447](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511161918586.png)

### 常见控制流

#### 条件语句

![image-20251116193603661](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511161936777.png)

#### 循环语句

![image-20251116193636484](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511161936605.png)

#### 函数

![image-20251116193700630](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511161937817.png)

![image-20251116193719568](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511161937729.png)

### SSA

静态单一赋值形式的 IR 主要特征是每个变量只赋值一次

![image-20251116193447943](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511161934055.png)

## 抽象语法树（AST）

**抽象语法树**：用树型图的方式表示中间代码。**操作数**出现在叶节点上，**操作符**出现在中间结点

**DAG图**： 有向无环图，语法树的一种归约表达方式

![image-20251116193951965](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511161939114.png)

![image-20251116194052223](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511161940365.png)
