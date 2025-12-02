---
layout: post
title: 'Compile-Chapter8-全局优化'
date: 2025-11-20
tags: [Compile, 理论]
comments: true
categories: [编译原理]
author: CircleCoder
---

## 数据流方法

用于获取数据在程序执行路径中如何流动的有关信息。

- 某个变量在某个特定的执行点（语句前后）是否还“存活”
- 某个变量的值，是在什么地方定义的
- 某个变量在某一执行点上被定义的值，可能在哪些其他执行点被使用

是局部优化、**全局优化**的基础

### 数据流分析方程

![image-20251201153310141](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512011533210.png)

![image-20251201153407453](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512011534550.png)

![image-20251201205452251](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512012054358.png)

## 活跃变量分析

### 概念

变量x的值在执行点p处或沿着从p出发的某条路经中会被使用，则称x在p点是活跃的

活跃变量信息对于寄存器分配，不论是**全局寄存器**分配还是**临时寄存器**分配都有重要意义

- 如果拥有寄存器的变量x在p点开始的任何路径上不再活跃，可以释放寄存器

- 如果两个变量的活跃范围不重合，则可以共享同一个寄存器

### 数据流方程

![image-20251201154729109](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512011547165.png)

![image-20251201154800655](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512011548735.png)

### 迭代算法

输入：程序流图，且基本块的 `use` 集和 `def` 集已计算完毕

输出：每个基本块入口和出口处的 `int[B]` 和 `out[B]`

方法：

1. 将包括出口在内的所有基本块的 `in` 集合初始化为空集

2. 根据方程

   ```
   out[B] = U int[P] (P为B的直接后继基本块)
   int[B] = use[B] U (out[B]-def[B])
   ```

   为每个基本块以此计算集合 `out[B]` 和 `int[B]`。（无顺序要求）

3. 如果计算得到的 `int[B]` 与之前计算得出的 `int[B]` 不同，则循环执行步骤2，直至所有基本块的 `int[B]` 集合不再产生变化

![image-20251201160612175](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512011606280.png)

### 全局死代码消除

根据每个基本块的 `in[B]` 和 `out[B]` 的活跃变量，可以消除中间不活跃的变量定义语句，即死代码

![image-20251201165302434](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512011653516.png)

## 冲突图

冲突图的节点是待分配全局寄存器的变量，当两个变量中的一个变量在**另一个变量定义（赋值）时**是活跃的，他们之间就有一条边作为连接

![image-20251202082848410](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512020828676.png)

### 算法

两个变量中的一个变量在另一个变量定义（赋值）处是活跃的，它们就是冲突的

- 算法一：在每一个变量的定义点计算活跃变量

- **算法二**：计算基本块入口处的活跃变量（in的集合），这些变量在该基本块中的定义点活跃，因而冲突。之后，在基本块内部，进一步计算每个定义点的活跃变量（基本块范围内计算）

  基本块内是线性的，可降低计算复杂度

![image-20251202083115078](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512020831193.png)

### 定义-使用链

![image-20251202083646484](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512020836601.png)

同一变量的多个定义-使用链，如果它们拥有某个同样的使用点，则合并为同一个 **网(net)**

![image-20251202083813736](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512020838814.png)

把不同变量的网络之间的公共节点进一步合并，即可得到变量的冲突图，判断原则为：**网络之间的交点即为共同的活跃点**

![image-20251202084052807](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512020840939.png)

## 到达定义分析

### 概念

- 如果从定义点d出发，存在一条路径达到p，且在该路径上，不存在对该变量的其他定义语句，则认为“变量x的定义点d到达（可达）静态点p”
- 如果路径上存在对该变量的其他赋值语句，那么路径上的前一个定义点就被路径上的后一个定义点“杀死（kill）”，或者消除了

![image-20251201163638220](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512011636283.png)

![image-20251201163658330](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512011636402.png)

![image-20251201163955097](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512011639166.png)

```
out[B] = gen[B] U ( in[B] - kill[B] )
```

### 迭代算法

输入：程序流图，且基本块的 `kill[]` 和 `gen[]` 已经计算完毕

输出：每个基本块入口和出口处的 `in` 和 `out` 集合

步骤：

1. 将包括出口的所有基本块的 `out` 集合，初始化为空集

2. 根据方程

   ```
   in[B] = U out[P] (P为B的直接前驱基本块)
   out[B] = gen[B] U (in[B]-kill[B])
   ```

   为每个基本块B依次计算集合 `in[B]` 和 `out[B]`

3. 如果某个基本块计算得到的 `out[B]` 与该基本块此前计算得出的 `out[B]` 不同，则循环执行步骤2，直到所有基本块的 `out[B]` 集合不再产生变化为止

### 位向量

- 集合的并和差运算，可以采用 **位向量**（Bit Vector）的方式完成

- 将集合中的每个定一点，根据其下标映射为一个无限位二进制数的某一位，例如，可以将 d1 映射为第一位，d3 映射为第三位，以此类推（ 对应二进制向量为11011110，向量从低位到高位依次对应 d1 到 d8）
- 基于此，集合的并运算等价于位向量的或运算，集合的差运算等价于后者取反后，和前者进行的与运算

## 全局常量传播

## 支配属性

### 支配属性

节点D支配节点N：如果从开始到N的每条路径都通过D

严格支配：D ≠ N

![image-20251202085645112](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512020856233.png)

![image-20251202090211809](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512020902931.png)

```
in[i] = ∩ out[p] (P为i的直接前驱结点)
out[i] = i U int[i]
```

### 支配边界

![image-20251202091426540](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512020914841.png)

## 循环优化

80/20经验规则：“程序运行时间的80%是由仅占源程序20%的部分执行的”。这20%的源程序就是循环部分，特别是多重循环的最内层的循环部分。

### 寻找循环

循环L 是基本块集合，满足：

- 强连通
- 有唯一的入口，且入口支配所有节点

找回边 `n -> d` ，其中 `d` 是入口点

回边 `n -> d` 定义循环包括：

- 基本块 `d`
- 不经过 `d` 能到达 `n` 的所有节点（含 `n`）

### 循环不变式代码外提

不变表达式：不随循环控制变量改变而改变的表达式或子表达式

![image-20251202154009711](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512021540725.png)

### 循环展开

将构成循环体的代码（不包括控制循环的测试和转移部分），重复产生许多次（这可在编译时确定），而不仅仅是一次，以空间换时间

![image-20251202154251803](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512021542893.png)

优点：

- 通过展开，避免比较、跳转引入的多余开销
- 为其他优化创造条件：循环展开放大了基本块

缺点：

- 增加了生成代码的长度：对运行时的内存、缓存要求提高

注意事项：

![image-20251202154517176](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512021545262.png)

### 归纳变量优化

在每一次执行循环迭代的过程中，若某变量的值固定增加（或减少）一个常量值，则称该变量为归纳变量(induction variable)

![image-20251202155356534](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202512021553649.png)

### 其他优化

- 循环拆分：多层嵌套变成单层循环
- 循环融合：两个循环合成一个
- 循环交换：`a[i][j]` 等二重数组循环遍历时，交换 `i j` 遍历顺序
- 循环并行：SIMD单指令多数据流

## 跨函数优化

### in_line 展开

把过程（或函数）调用改为in_line展开可节省许多处理过程（函数）调用所花费的开销

例如过程

```
procedure m(i,j:integer; max:integer);
begin if i > j then max:=i else max:=j end;
```

若有过程调用 m(k,0,max);则内置展开后为：

```
if k>0 then max:=k else max:=0;
```

省去了函数调用时参数压栈，保存返回地址等指令。这也仅仅限于简单的函数
