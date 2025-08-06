---
layout: post
title: "布局"
date:   2025-03-01
tags: [Web]
comments: true
categories:
- [Web]
author: CircleCoder#
---

### 标准流

最基本的布局方式，标签按照规定好的默认方式排列

- **块级元素：**

  独占一行，自上而下顺序排列

  如：`div`、`hr`、`h1~h6`、`ul`、`ol`、`dl`、`form`、`table`

- **行内元素：**

  从左到右顺序排列，碰到父元素边缘会自动换行

  如：`span`、`a`、`i`、`em`

  

### 浮动布局

顾名思义，浮而后动

为元素添加 `float` 属性，创建浮动框，将其浮起并移动到一边，知道左边缘或右边缘触及父元素或另一个浮动框的边缘

| 属性值  | 效果             |
| ------- | ---------------- |
| `left`  | 元素向左浮动     |
| `right` | 元素向右运动     |
| `none`  | 不浮动（默认值） |

浮动最初是为了实现文字环绕图片的效果



#### 脱标

浮动布局的盒子会脱离标准流，**不再占据原有位置**（相当于浮到了新的一层），这种现象称为脱标

- 后面的块级元素会直接顶上去，占据浮动元素原来的位置（可能发生重叠）

- 行内元素（如文字、`inline` 元素） 会感知浮动元素，并自动环绕排列

示例：

```html
<head>
    <link rel="stylesheet" href="float.css">
</head>

<body>
    <div class="container">
        <div class="item">I</div>
        <div class="item">LOVE</div>
        <div class="item">BUAA</div>
        <div class="item">德才兼备</div>
        <div class="item">知行合一</div>
        <div class="bottom">
            <p>北航新闻网4月23日电（航宣）4月23日，据中国载人航天工程办公室消息，经空间站应用与发展阶段飞行任务总指挥部研究决定，执行神舟二十号载人飞行任务的航天员乘组由陈冬、陈中瑞、王杰3名航天员组成，陈冬担任指令长。乘组包括2名航天驾驶员和1名飞行工程师。航天员陈冬执行过神舟十一号、神舟十四号载人飞行任务，时隔两年再次担任指令长。陈中瑞、王杰均为第三批航天员，即将踏上个人首飞之旅。其中，王杰是北京航空航天大学航空科学与工程学院工程力学专业2011级硕士毕业生、2012级博士毕业生（硕博连读），入选前是航天科技集团有限公司空间技术研究院的工程师。
            </p>
        </div>
    </div>
</body>
```

```css
.container {
    justify-content: space-evenly;
    align-items: center;
    height: 250px;
    width: 900px;
    background: #dbd5d5;
    border: #5c22da;
}

.item {
    float: left;
    width: 100px;
    margin: 10px;
    height: 100px;
    background-color: #ff6b6b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    border-radius: 10px;
    transition: 1s;
}

.bottom {
    margin-top: 20px;
    height: 250px;
    width: 900px;
    background: #89c1ec;
    border: #5c22da;
    border-radius: 30px;
}
```

![image-20250423145205453](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202504231452632.png)



#### 行内块特性

- 浮动元素会首先排在一行，若父级宽度不够则会自动换行
- 如果盒子未设置宽度，那么默认和父级一样宽；但是添加浮动后，其宽度由内容决定



#### 清除浮动

由于浮动元素脱离标准流，父容器可能无法正确计算高度，导致**高度塌陷**。为了消除此影响，需要**清除浮动**

- **额外标签法：**

  在父元素的最后添加额外标签，**为额外标签添加** `clear` **属性**，消除前面的浮动元素的影响。这样父元素的高度便会被撑开

  属性值设为 `left`、`right` 或者`both`

- **父元素 overflow :**

  在父元素中添加 `overflow` 属性

  属性值设为`hidden`、`auto` 或 `scroll`

- **双伪标签法：**

  为父元素增加 `clearfix` 类的样式

  ```
  .clearfix:before,
  .clearfix:after {
  	content: "";
  	display: table;
  }
  
  .clearfix: after {
  	clear: both;
  }
  
  .clearfix {
  	*zoom: 1
  }
  ```



#### 布局原则

- **搭配标准流父盒子**

  先用标准流父盒子排列上下位置，之后内部子元素采用浮动排列左右位置

- 一浮俱浮

  一个子盒子浮动了，那么其余兄弟盒子也应该浮动，防止引发问题



### Flex 布局

#### 组成

- **弹性容器（父元素）**：在父元素中设置属性 `display: flex`
- **弹性盒子（子元素）**：子元素可以自动挤压或拉伸
- **主轴：默认在水平方向**
- **侧轴：默认在垂直方向**

![image-20250422231216340](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202504222313492.png)

**默认情况下**，弹性盒子会自动拉伸和挤压：

- **拉伸**：若弹性盒子不设置高度（侧轴方向），则高度将会拉伸至与父元素一致
- **挤压**：弹性盒子将位于同一横排（主轴方向），若宽度超出父元素宽度，则会主动挤压以适应父元素

父元素中可以通过以下属性自定义 `flex` 布局

| 描述           | 属性                        |
| :------------- | :-------------------------- |
| 创建 flex 容器 | `display: flex`             |
| 主轴对齐方式   | `justify-content`           |
| 侧轴对齐方式   | `align-items`、`align-self` |
| 修改主轴方向   | `flex-direction`            |
| 弹性伸缩比     | `flex`                      |
| 弹性盒子换行   | `flex-wrap`                 |
| 行对齐方式     | `align-content`             |



#### 主轴对齐 justify-content

**生效条件**：子项总宽度 < 容器宽度

| **属性值**      | **效果**                                             |
| :-------------- | :--------------------------------------------------- |
| `flex-start`    | 默认值，弹性盒子从起点开始依次排列                   |
| `flex-end`      | 弹性盒子从终点开始依次排列                           |
| `center`        | 弹性盒子沿主轴居中排列                               |
| `space-between` | 弹性盒子沿主轴均匀排列，空白间距均分在弹性盒子之间   |
| `space-around`  | 弹性盒子沿主轴均匀排列，空白间距均分在弹性盒子两侧   |
| `space-evenly`  | 弹性盒子沿主轴均匀排列，弹性盒子与容器之间的间距相等 |



#### 侧轴对齐

- `align-items` ：设置 **弹性容器** 内 **所有弹性盒子** 的侧轴对齐方式

- `align-self`  ：单独设置 **某个弹性盒子** 的侧轴对齐方式（覆盖 `align-items`）

| **属性值**   | **效果**                                                     |
| :----------- | :----------------------------------------------------------- |
| `stretch`    | 弹性盒子沿侧轴拉伸至铺满容器（默认值，前提是未设置侧轴方向尺寸） |
| `center`     | 弹性盒子沿侧轴居中排列                                       |
| `flex-start` | 弹性盒子从侧轴起点开始排列                                   |
| `flex-end`   | 弹性盒子从侧轴终点开始排列                                   |

示例：

```html
<head>
    <link rel="stylesheet" href="flex.css">
</head>

<body>
    <div class="container">
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
        <div class="item">4</div>
        <div class="item">5</div>
        <div class="item">6</div>
    </div>
</body>
```

```css
.container {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    height: 350px;
    background: #dbd5d5;
    border: #5c22da;
}

.item {
    width: 100px;
    height: 100px;
    background-color: #ff6b6b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    border-radius: 10px;
}

.item:nth-child(3) {
    background-color: #6b5cff;
    align-self: flex-start;
}

.item:nth-child(4) {
    background-color: #6bff6b;
    align-self: flex-end;
}
```

![image-20250423132825961](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202504231328046.png)

#### 主轴方向 flex-direction

- **主轴**：默认水平方向（从左到右）
- **侧轴**：默认垂直方向（从上到下）

| **属性值**       | **效果**                             |
| :--------------- | :----------------------------------- |
| `row`            | 主轴水平，子项从左到右排列（默认值） |
| `column`         | 主轴垂直，子项从上到下排列           |
| `row-reverse`    | 主轴水平，子项从右到左排列           |
| `column-reverse` | 主轴垂直，子项从下到上排列           |



#### 弹性伸缩比 flex

**作用**：控制弹性盒子 **主轴方向** 的尺寸

**属性值**：整数，表示占用父元素剩余尺寸的份数（类似于权重）

在不设置宽度时（主轴水平）且父元素宽度足够大时：

- 若不设 `flex` 属性：弹性盒子的宽度由内容撑开。
- 若设置了 `flex` 属性：弹性盒子会根据属性值拉伸填充父元素，且 `justify-content` 属性无效



#### 弹性盒子换行 flex-wrap

在主轴方向，弹性盒子默认情况下会通过自动挤压，排列在同一行。

| 属性值          | 效果     |
| --------------- | -------- |
| `nowrap` (默认) | 不换行   |
| `wrap`          | 自动换行 |



#### 行对齐 align-content

属性值及效果与 `justify-content` 相同
