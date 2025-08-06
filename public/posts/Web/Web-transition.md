---
layout: post
title: "过渡与动画"
date:   2025-03-01
tags: [Web]
comments: true
categories:
- [Web]
author: CircleCoder
---

### 过渡 transition

作用：为一个元素在不同状态之间的切换添加过渡效果

属性名：`transition` （复合属性）

属性值：过渡的属性 花费时间 (s)

注意：

- 过渡的属性可以是具体的 `CSS` 属性，也可以是 `all` （所有发生变化的属性）
- `transition` 属性设置给元素本身

----

### 平面转换 transform

改变盒子在平面内的形态 （位移、旋转、缩放、倾斜），一般与过渡配合使用

![image-20250505124158174](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505051242277.png)

#### 平移

属性：

```css
transform: translate(x轴移动距离, y轴移动距离)
transform: translateX(x轴移动距离)
transform: translateY(y轴移动距离)
```

取值：

- 像素单位数值
- 百分比（根据盒子自身尺寸计算结果）
- 正负均可

实现定位居中：

```css
.box {
	position: absolute
	left: 50%
	top: 50%
	transform: translate(-50%, -50%)
}
```



#### 旋转

属性：

```css
transform: rotate(旋转角度)
```

取值：

- 单位是 `deg`
- 取值为正，顺时针旋转
- 取值为负，逆时针旋转



#### 转换原点

默认的转换原点是盒子的中心点

属性：

```css
transform-origin: 水平原点位置 垂直原点位置
```

取值：

- 方位名词：`left`、`top`、`right`、`bottom`、`center`
- 像素单位数值
- 百分比



#### 多重转换

**先平移再旋转**

```css
transform: translate() rotate()
```

- 旋转会改变坐标轴向
- 多重转换时，以第一种转换形态的坐标轴为准



#### 缩放

属性：

```css
transform: scale(缩放倍数)
transform: scale(x轴缩放倍数, y轴缩放倍数)
```

取值：

- 通常只为`scale()` 设置一个值，表示 `X` 轴和 `Y` 轴等比例缩放
- 取值大于1表示放大，小于1表示缩小



#### 倾斜

属性：

```
transform: skew(角度deg);
```

取值：

正负皆可
