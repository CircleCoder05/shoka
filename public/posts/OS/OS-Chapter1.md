---
layout: post
title: "OS-Chapter1-系统引导"
date:   2025-03-11
tags: [OS,理论]
comments: true
categories:
- [操作系统]
author: CircleCoder
---

{% media audio %}

- https://music.163.com/#/song?id=4872836

{% endmedia %}



### Bootloader

启动前硬件状态必须假设在一个最安全、通用，也是功能最弱的状态。因此需要逐步设置硬件，以提

升硬件环境能力。OS启动是一个逐步释放系统灵活性的过程

引导加载程序是系统加电后运行的第一段软件代码，称为 **Bootloader**，是在 **操作系统内核运行之前** 运行的一段小程序。

Bootloader 是 Booter 和 Loader 的合写：

- 前者要 **初始化系统硬件** 使之运行起来，至少是部分运行起来；

-  后者 **将操作系统映像加载到内存** 中，并**跳转**到操作系统的代码运行。

大多数 Bootloader 都分为 **stage1** 和 **stage2** 两大部分。

- 依赖于CPU体系结构的代码（如设备初始化代码等）通常都放在 **stage1** 且可以用 **汇编语言** 来实现；
- **stage2** 则通常用 **C语言** 来实现，这样可以实现复杂的功能，而且有更好的可读性和可移植性。

MIPS 的 BootLoader 为 `U-boot`，而 X86 的 BootLoader 为 `GRUB`



```markdown
启动（Booting）
├── 硬件初始化（BIOS/UEFI POST）  
├── 引导（Bootstrapping）  
│   ├── BootLoader Stage 1（如MBR中的GRUB Stage 1）  
│   └── BootLoader Stage 2（如GRUB加载内核）  
├── 内核初始化（Kernel）  
└── 用户空间启动（init进程）  
```

### 计算机的启动过程（MIPS）

#### MIPS地址空间

在32位下，程序地址空间 (4G) 划分为四大区域，不同区域有不同的属性

 ![image-20250406230426261](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202504062311162.png)

- **kuseg0** ：用户态可用的地址。在有 MMU 的机器里，这些地址将一概**被MMU作转换**，除非MMU的设置被建立好，否则这 2G 的地址是不可用的
- **kseg0** ：最高位清零即可映射到物理地址。几乎全部 **对这段地址的存取都会通过cache**，因此 cache 设置好之前,不能随便使用这段地址。
  - 通常一个没有 MMU 的系统会使用这段地址作为其绝大多数程序和数据的存放位置
  - 对于有MMU的系统，**操作系统核心会存放在这个区域**
- **kseg1** ：高三位清零可映射到相应的物理地址上。**kseg1 是非cache存取的**.。**kseg1是唯一在系统重启时能正常工作的地址空间**。

- **kseg2** ：**只能在核心态下使用** 并且 **要经过MMU的转换**。在MMU设置好之前,不要存取该区域



#### MIPS ROM/Flash启动地址

MIPS上电启动时，由于OS尚未接管系统，**不能采用TLB、Cache机制**。从MIPS的初始内存划分可知，kseg1是唯一的在系统重启时能正常工作的内存映射地址空间。

MIPS的启动入口地址是 `0xBFC0 0000`，通过将最高3位清零（`&0x1FFF FFFF`）的方法，将ROM所在的地址区映射到物理内存的低端512M (0x0000 0000 - 0x1FFF FFFF) 空间，也是“非翻译无需转换的”（Unmapped）地址区域。对应的物理地址是 `0x1FC00000`



#### MIPS启动 stage1（汇编语言)

![image-20250406233255676](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202504062332791.png)



#### MIPS启动 stage2（C语言）

 ![image-20250406235106471](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202504062351650.png)



#### Linux 引导内核启动

`kernel_entry`（`arch/mips/kernel/head.S`）

- **初始化内核堆栈**
  为第一个进程（`init_task`）准备栈空间。

- **清零BSS段**
  清除未初始化的全局变量。

- **跳转到 `start_kernel`**
  进入体系结构无关的通用初始化流程。

`start_kernel` 关键步骤

- **体系结构相关初始化**

  - `setup_arch`：配置内存布局、页表（MIPS的TLB）。

  - `trap_init`：设置异常处理向量（如TLB Miss、中断）。

- **核心子系统初始化**

​	内存管理（`mem_init`）、调度器（`sched_init`）、中断（`init_IRQ`）。

- **启动用户空间**

​	创建第一个用户进程 `init`（`kernel_init`），挂载根文件系统。



### 计算机的启动过程（X86）

#### 概念

- BIOS 程序（Basic Input/Output System）

  BIOS 是固化在主板上的**基本输入输出系统**，是计算机启动第一个运行的软件，存放在ROM中。它会进行硬件初始化和自检，然后查找引导程序并执行。

- 主引导记录 MBR (Master Boot Record)

  MBR是硬盘的主引导记录，位于硬盘的 第0磁头 第0磁道 第一个扇区（共512字节）。它包含了预启动信息和分区表信息。BIOS 会找到**活动分区** 并读取其分区引导记录，完成硬盘的引导。

  | 结构           | 功能                                                    |
  | -------------- | ------------------------------------------------------- |
  | 前 446 字节    | BootLoader 代码及数据                                   |
  | 447 - 510 字节 | 分区表（共4个主分区项，每项16字节，且只有一项是激活的） |
  | 后两个字节     | 魔数 `0x55AA`                                           |



#### 启动流程

- CPU加电后将跳转到 BIOS 的固定物理地址 ` 0xFFFF0`
- BIOS 运行 POST（上电自检）
- 查找可启动设备
- BIOS 将 MBR 加载到内存 `0x7C00`
- BIOS 将控制权交给操作系统引导程序（BootLoader）（GRUB 的 stage1）



#### 运行主引导程序

- 检查位于地址 `0x7dfe` 的（魔数内容）是否等于0xaa55。若不等于则转去尝试其他介质；如果没有其他启动介质，则显示 “No ROM BASIC” ，然后死机；

- 跳转到 `0x7c00` 处执行MBR中的程序；
- MBR 将自己复制到 `0x0600` 处，然后继续执行；(备份分区表)
- 在主分区表中搜索标志为活动的分区。如果发现没有活动分区或者不止一个活动分区，则停止；
- 将活动分区的第一个扇区读入内存地址 `0x7c00` 处；(覆盖之前的)
- 检查位于地址 `0x7dfe` 的（魔数内容）是否等于0xaa55，若不等于则显示 “Missing Operating System”，然后停止，或尝试软盘启动；
- 跳转到 `0x7c00` 处继续执行特定系统的启动程序；