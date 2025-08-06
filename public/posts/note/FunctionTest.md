---
title: 功能测试
date: 2025-03-29 19:26:20
categories:
- [杂谈]
tags: hexo
audio: true
---

### `links` 链接块

本功能参考 NexT，基于 Hexo Tag 功能，用来建立友链或其他网址链接功能。

{% links %}
- site: CircleCoder
  owner: CircleCoder
  url: https://circlecoder05.github.io/
  desc: CircleCoder 的博客主页
  image: https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503292041419.jpg
  color: "#e9546b"

- site: CircleCoder
  owner: CircleCoder
  url: https://circlecoder05.github.io/2025/03/31/2025-3-31-OSLab2/
  
  desc: OS-Lab2-内存管理
  
  image: https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311945208.jpg

{% endlinks %}



###  `Code` 代码块

基本格式 ：`[language] [title] [url] [link text] [mark] [command]`

```java 行高亮 https://shoka.lostyu.me 参考链接 mark:1,6-7
import java.util.Scanner;
...
Scanner in = new Scanner (System.in);
// 输入 Scan 之后，按下键盘 Alt + “/” 键，Eclipse 下自动补全。

System.out.println (in.nextLine ());
System.out.println ("Hello" + "world.");
```

```bash 命令行提示符 command:("[root@localhost] $":1,9-10||"[admin@remotehost] #":4-6)
pwd
/usr/home/chris/bin
ls -la
total 2
drwxr-xr-x   2 chris  chris     11 Jan 10 16:48 .
drwxr--r-x  45 chris  chris     92 Feb 14 11:10 ..
-rwxr-xr-x   1 chris  chris    444 Aug 25  2013 backup
-rwxr-xr-x   1 chris  chris    642 Jan 17 14:42 deploy
git add -A
git commit -m "update"
git push
```



### quiz 练习题 

1. BUAA 是世界一流大学。{.quiz .true}

2. 下列哪些项是 “派生类对象替换基类对象”。{.quiz .multi}
    - `p1=&circle1;` {.correct}
    - `q1=&shape1;`
    - `shape1=circle1;` {.correct}
    - `circle1=shape1;`
    {.options}
    > - :heavy_check_mark: 令基类对象的指针指向派生类对象
    > - :x: 派生类指针指向基类的引用
    > - :heavy_check_mark: 派生类对象给基类对象赋值
    > - :x: 基类对象给派生类对象赋值
    > {.options}
    
3. 下列叙述正确的是 []{.gap} 。 {.quiz}
    - 虚函数只能定义成无参函数
    - 虚函数不能有返回值
    - 能定义虚构造函数
    - A、B、C 都不对 {.correct}
    {.options}

10. 如果定义 `int e=8; double f=6.4, g=8.9;`，则表达式 `f+int (e/3*int (f+g)/2)%4` 的值为 [9.4]{.gap}。 {.quiz .fill}
    > 注意运算顺序和数据类型
    > [8.4]{.mistake}



### effect 文字特效

++ 下划线 ++
++ 波浪线 ++{.wavy}
++ 着重点 ++{.dot}
++ 紫色下划线 ++{.primary}
++ 绿色波浪线 ++{.wavy .success}
++ 黄色着重点 ++{.dot .warning}
~~ 删除线～～
~~ 红色删除线～～{.danger}
== 荧光高亮 ==
[赤橙黄绿青蓝紫]{.rainbow}
[红色]{.red}
[粉色]{.pink}
[橙色]{.orange}
[黄色]{.yellow}
[绿色]{.green}
[靛青]{.aqua}
[蓝色]{.blue}
[紫色]{.purple}
[灰色]{.grey}
快捷键 [Ctrl]{.kbd} + [C]{.kbd .red}
H~2~0
29^th^



### label 标签块

[default]{.label}
[primary]{.label .primary}
[info]{.label .info}
[:heavy_check_mark:success]{.label .success}
[warning]{.label .warning}
[:broken_heart:danger]{.label .danger}



### note 提醒块

:::default
默认
:::

:::primary
基本
:::

:::info
提示
:::

:::success
成功
:::

:::warning
警告
:::

:::danger
危险
:::

:::danger no-icon
危险
:::

### collapase 折叠块

+++ 默认默认 这里是一段文字
++ 下划线 ++

+++


+++primary 紫色
:::info
参考信息
:::

- 第一行
- 第二行
+++


+++info  蓝色
;;;id3 卡片 1
这里是卡片 1 的内容
;;;

;;;id3 卡片 2
这里是卡片 2 的内容
;;;
+++

+++success 绿色
{% links %}
- site: CircleCoder
  owner: CircleCoder
  url: https://circlecoder05.github.io/
  desc: CircleCoder 的博客主页
  image: https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503292041419.jpg
  color: "#e9546b"

{% endlinks %}

+++

+++warning 黄色
!! 警告警告警告警告警告！！{.bulr}
[label]{.label .success}

+++

+++danger 红色
[danger]{.label .danger}

+++



### taskList 待办事项

- [ ] 这是一个叉
- [x] 这是一个红勾

{.danger}

- [ ] 未完成
- [x] 完成

{.primary}

- [ ] 未完成
- [x] 默认颜色



### 多媒体



{% media audio %}

  - https://music.163.com/#/song?id=26608782

{% endmedia %}
