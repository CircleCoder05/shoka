---
layout: post
title: 'Compile-Chapter5-语法制导翻译'
date: 2025-11-03
tags: [Compile, 理论]
comments: true
categories: [编译原理]
author: CircleCoder
---

## 基本概念

### 翻译文法

![image-20251117133948942](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511171339798.png)

![image-20251117134141457](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511171341559.png)

翻译文法所定义的翻译是由输入序列和动作序列组成的对偶集

### 语法制导的翻译

**符号串翻译文法**：若插入文法中的动作符号对应的语义子程序是**输出动作符号标记@后的字符串**的文法。

**语法制导翻译**：按翻译文法进行的翻译。给定一输入符号串，根据翻译文法获得翻译该符号串的动作序列，并执行该序列所规定的动作的过程。

## 属性翻译文法

### 综合属性

![image-20251117140900920](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511171409999.png)

![image-20251117140939177](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511171409250.png)

综合属性是**自底向上**，**自右向左**地求值

### 继承属性

![image-20251117141720519](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511171417641.png)

![image-20251117141747328](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511171417402.png)

![image-20251117141914086](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511171419208.png)

![image-20251117142052626](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511171420821.png)

### L-ATG

其输入文法要求是LL(1)文法，可用自顶向下分析构造分析器。在分析过程中可进行属性求值

继承属性：

- 产生式**左部**非终结符号的继承属性值，取**前面产生式右部**该符号已有的继承属性值
- 产生式**右部**符号的继承属性值，用**该产生式左部**符号的继承属性或出现在该符号左部的符号的属性值进行计算

综合属性：

- 产生式**右部**非终结符号的综合属性值，取其**下部产生式左部**同名非终结符号的综合属性值
- 产生式**左部**非终结符号的综合属性值，用**该产生式左部符号的继承属性或某个右部符号的属性进行计算**
- **动作符号**的综合属性用**该符号的继承属性或某个右部符号的属性进行计算**

![image-20251117210410487](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511172104579.png)

![image-20251117210429260](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511172104314.png)

### SL-ATG

![image-20251124203645079](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511242036240.png)

因此，一个简单赋值形式的L-ATG**除动作符号外**，其余符号的属性求值规则其右部是属性或是常量

给定一个L-ATG，如何找一个等价的SL-ATG?

![image-20251124205846871](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511242058935.png)

![image-20251124214530018](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511242145072.png)

## 自顶向下翻译

### 无参数

![image-20251124210954009](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511242109080.png)

![image-20251124211007418](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511242110491.png)

### 有参数

对于**每个非终结符号**都编写一个**翻译子程序**（过程）。根据该非终结符号具有的属性数目，设置相应的参数

- 继承属性：声明为赋值形参（继承属性值）

- 综合属性：声明为变量形参（属性变量名，传地址，返回时有值）

![image-20251124211223154](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511242112206.png)

![image-20251124211928276](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511242119331.png)

![image-20251124212541710](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511242125782.png)

对简单赋值形式的属性变量取相同的属性名，其求值规则可以删去。开始符号的继承属性 R1=7

```
主程序：
    NEXTSYM;
    PROCS(7); // 开始符号的继承属性 R1=7
    if CLASS ≠ 右界符 then ERROR;
    ACCEPT

过程 PROCS(R)
	R; // 值形参声明

    case CLASS of // First(S) = {a, b}
        a: P1;
        b: P2;
        其它： ERROR;
    end of case;

P1: //产生式1的代码
    T , Q ; //局部变量声明
    T = TOKEN; //单词值赋给终结符的综合属性
    NEXTSYM;
    PROCA(Q)
    OUT(X ↓T,R）；
    PROCS(Q)
    RETURN;

P2: // 产生式2的代码
    NEXTSYM;
    OUT(Z ↓R );
    RETURN;

PROC A(P)
    P; // 变量形参声明
    case CLASS of
        C : p3
        其它： p4
    end of case;

P3:
    U , Q , Z ; /*局部变量声明*/
    U = TOKEN;
    NEXTSYM;
    Z = U – 3 ;
    OUT(y↓U);
    PROC A(Q);
    P = Q+U;
    PROC S(Z);
    OUT(V↓P );
    if CLASS ≠ b then ERROR;
    NEXTSYM;
    RETURN;

P4:
    P = 8;
    OUT(w);
    RETURN;
```

### 例子

![image-20251124214244339](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511242142404.png)

![image-20251124214328493](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511242143582.png)

![image-20251124214342874](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511242143949.png)

![image-20251124214354566](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202511242143632.png)
