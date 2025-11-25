---
layout: post
title: 'Compile-Chapter3-符号表和运行栈'
date: 2025-10-20
tags: [Compile, 理论]
comments: true
categories: [编译原理]
author: CircleCoder
---

![](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511111021655.png)

## 符号表

![image-20251111102730743](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511111027850.png)

- 在编译过程中，编译程序用来记录源程序中各种名字的特性信息，所以也称为名字特性表。

- 源程序中变量要先声明，再引用

  建表：编译程序在处理这些声明语句时，将声明中的名字及其信息**登录到符号表中**，同时**给变量分配存储单元**，并**将储单元地址登录在符号表中**

- 查表：当编译程序编译到引用所声明的变量时，要进行**语法语义正确性检查**和**生成相应的目标程序**，这就需要查符号表以取得相关信息

## 组织方式

大部分共同信息组成统一格式的符号表，特殊信息另设附表,两者用指针连接。既节省空间，也便于填表和查表

查询优化：无序符号表、有序符号表、散列符号表

### 非分程序结构

每个可独立进行编译的程序单元是一个不包含有子模块的单一模块，如`FORTRAN`语言。

![image-20251111104201676](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511111042800.png)

1. 作用域
   - 全局：子程序名、函数名和公共区名
   - 局部：程序单元中定义的变量

2. 符号表的组织
   - 全局符号表
   - 局部符号表

3. 基本处理办法：
   - 子程序、函数名和公公区名填入全局符号表

   - 在子程序（函数）声明部分读到标识符，**造局部符号表**

     查本程序单元局部符号表，重复声明则报错，否则造表

   - 在语句部分读到标识符，查表

     查本程序单元局部符号表，有即已声明，无则查全局变量表

   - 程序单元结束：释放该程序单元的局部符号表
   - 程序编译完成：释放全部符号表

### 分程序结构

模块内可嵌入子模块

作用域：标识符局部于所定义的模块（最小模块）

- 模块中所定义的标识符作用域是定义该标识符的子程序
- 过程或函数说明中定义的标识符（包括形参）其作用域为本过程体
- 循环语句中定义的标识符,其作用域为该循环语句

### 栈式符号表

![image-20251124215531549](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511242155276.png)

## 静态存储分配

在**编译阶段**由编译程序实现对存储空间的管理和为源程序中的变量分配存储的方法

条件：编译时能够确定源程序中变量在运行时的数据空间大小，且**运行时不改变**

### 分配策略

由于每个变量所需空间的大小在编译时已知，因此可以用简单的方法给变量分配目标地址

- 开辟一数据区（首地址在加载时定）
- 按编译顺序给每个模块分配存储空间
- 在模块内部按顺序给模块的变量分配存储，一般用相对地址，所占数据区的大小由变量类型决定
- 目标地址填入变量的符号表中

## 动态存储分配

在**目标程序运行阶段**由目标程序实现对存储空间的组织与管理，和为源程序中的变量分配存储的方法

特点：

- 在目标程序运行时进行变量的存储分配
- 编译时要生成进行动态分配的目标指令

### 分配策略

**栈式动态存储分配**

整个数据区为一个堆栈：

- 当进入一个过程时，在栈顶为其分配一个数据区
- 退出时，撤消过程数据区

![image-20251124220258482](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511242202570.png)

### 活动记录（AR）

活动记录是**函数（或过程）调用时，在栈上为该函数分配的一块连续内存区域**，用于存储函数执行所需的**所有运行时信息**

![image-20251125131503360](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511251316040.png)

#### 局部数据区

存放模块中定义的各个局部变量

#### 参数区

存放隐式参数和显式参数

![image-20251125131623323](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511251316404.png)

#### display区

存放各外层模块AR的基地址

![image-20251125132127111](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511251321178.png)

#### 例子

![image-20251125132334021](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511251323085.png)

![image-20251125132354017](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511251323090.png)

![image-20251125133958090](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511251339214.png)

#### 建造 display 区的规则

从 i 层模块进入(调用) j 层模块：

![image-20251125134618108](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511251346186.png)

![image-20251125134702125](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511251347199.png)

#### 运行时地址计算

![image-20251125135518255](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511251355347.png)

## C语言的存储管理

![image-20251125135908579](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511251359662.png)

- EIP 指令指针寄存器：存放下一条要执行的指令的内存地址

- ESP 栈指针寄存器：始终指向当前栈顶的内存地址
- EBP 基址指针寄存器：指向当前函数栈帧的基地址

下图示例中，上方为高地址运行栈，下方为低地址代码段和全局变量区

![image-20251125142455332](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511251424407.png)

![image-20251125142805167](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511251428226.png)

## 垃圾回收

![image-20251125143106588](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511251431650.png)

堆引入了新的问题——垃圾（不再使用的内存对象）回收

### 引用计数（Ref Count）

- 为每个对象维护一个引用计数器，记录有多少个指针指向它，是一种增量方法

  当计数器变为 **0** 时，说明没有任何引用指向该对象，可以立即将其回收

- 缺点：**无法处理循环引用**

### 标记和清除（Mark & Sweep）

![image-20251125144014888](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511251440946.png)

- 核心思想：区分可达对象和不可达对象
- 标记阶段：从一组根对象（Root Set，如全局变量、栈上的局部变量等）出发，沿着引用链进行遍历，所有能被访问到的对象都被标记为“可达”（图中的 `Mark`）
- 清除阶段：遍历整个堆内存，将所有未被标记的对象（即不可达对象）进行回收。
- 优点：完美解决了循环引用的问题。
- 缺点：需要暂停程序；产生内存碎片

### 拷贝回收（Stop & Copy）

![image-20251125144729057](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511251447133.png)

![image-20251125144248195](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511251442269.png)

- 基本思想：解决空洞问题，用拷贝的办法来清除碎片，同时对应的更新指针
- 将可用的堆内存一分为二，在任何时刻，只有其中一半用于分配对象（From），另一半则保持空闲（To）
- 程序运行时，所有**新对象都只在From空间中进行分配**。此时，To空间是完全空闲的
- 当From空间被占满，需要垃圾回收时，系统会暂停程序，将可达对象拷贝到To空间
- 清空From空间，交换两者的角色
- 缺点：内存利用率低

### 混合策略（Hybrid）

又到了我们最喜欢的折中策略了~
![image-20251125145155746](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511251451819.png)

- 分代垃圾回收：利用**弱代假说**——绝大多数对象的生命周期都非常短暂

- 综合利用前面的各种策略，利用局部性原理
