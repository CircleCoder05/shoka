---
layout: post
title: "代码编辑器"
date:   2025-05-01
tags: [Web]
comments: true
categories:
- [Web]
author: CircleCoder
---

### 前言

在完成仓颉大作业的过程中，笔者希望能够美化代码输入框，实现和洛谷等 `oj` 平台一样的代码编辑器效果。

目前先实现了代码高亮，以 `python` 语言为例，效果还是非常漂亮的

![image-20250503215431767](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505032154900.png)

最近学业繁忙，后续如果有空的话将会研究研究自动缩进和括号匹配等高级功能，至于自动补全，想想就麻烦

代码如下：

### HTML

```html
<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Python 代码编辑器</title>
    <script src="vue.js"></script>
    <link rel="stylesheet" href="code.css">
</head>

<body>
    <div id="app">
        <div>
            <!-- <div class="editor-header">
                <div class="header-item">文件名</div>
                <div class="header-item">大小</div>
                <div class="header-item">修改时间</div>
            </div> -->
            <div class="editor-container">
                <div class="line-numbers">
                    <div v-for="n in lineCount" :key="n">{{ n }}</div>
                </div>
                <div class="code-wrapper">
                    <textarea id="code-input" v-model="code" @input="updateHighlight" spellcheck="false"></textarea>
                    <pre id="code-highlight" v-html="highlightedCode"></pre>
                </div>
            </div>
        </div>

    </div>
    <script src="code.js"></script>

</body>

</html>
```



### CSS

```css
body {
    font-family: 'Consolas', 'Monaco', monospace;
    background-color: #f7f5f5;
    color: #fff;
    padding: 20px;
    margin: 0;
}

.editor-container {
    display: flex;
    background-color: #000;
    border-radius: 4px;
    overflow: visible;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    min-height: 100px;
    width: 40%;
}

.line-numbers {
    background-color: #1a1a1a;
    color: #666;
    padding: 10px 8px;
    text-align: right;
    user-select: none;
    line-height: 1.5;
    min-height: 100%;
}

.code-wrapper {
    flex: 1;
    position: relative;
    overflow: visible;
    min-height: 100%;
}

#code-input,
#code-highlight {
    margin: 0;
    padding: 10px;
    border: 0;
    font: inherit;
    line-height: 1.5;
    white-space: pre;
    tab-size: 4;
    word-break: keep-all;
    min-height: 100%;
    width: calc(100% - 20px);
}

#code-input {
    background: transparent;
    color: transparent;
    caret-color: white;
    resize: none;
    outline: none;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    height: auto;
    overflow: hidden;
}

#code-highlight {
    position: relative;
    pointer-events: none;
    color: white;
    overflow: visible;
    z-index: 1;
}

.string {
    color: #98c379;
}

.keyword {
    color: #d19a66;
}

.comment {
    color: #5c6370;
    font-style: italic;
}

.function {
    color: #61afef;
}

.number {
    color: #d19a66;
}
```



### Vue2

这部分的正则表达式匹配多亏有 `deepseek` 帮忙

```javascript
new Vue({
    el: '#app',
    data: {
        code: 'def hello_world():\n    """这是一个示例函数"""\n    print("Hello, World!")\n    for i in range(5):\n        if i % 2 == 0:\n            print(f"偶数: {i}")\n        else:\n            print("奇数:", i)\n\nhello_world()',
        highlightedCode: ''
    },
    computed: {
        lineCount() {
            const lines = this.code.split('\n');
            return Array.from({ length: Math.max(lines.length, 1) }, (_, i) => i + 1);
        }
    },
    mounted() {
        this.updateHighlight();
    },
    methods: {
        updateHighlight() {
            this.highlightedCode = this.highlightPython(this.code);
            this.$nextTick(() => {
                this.adjustTextareaHeight();
            });
        },
        adjustTextareaHeight() {
            const textarea = document.getElementById('code-input');
            if (textarea) {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            }
        },

        highlightPython(code) {
            // 转义HTML特殊字符
            const escapedCode = this.escapeHtml(code);

            // 主正则表达式（已严格测试括号匹配）
            const pattern = /(\b(def|class)\s+(\w+))|(\b\d+\b)|("(?:\\"|[^"])*"|'(?:\\'|[^'])*'|"""(?:\\"""|[^"])*?"""|'''(?:\\'''|[^'])*?''')|(#.*)|(\b(?:False|None|True|and|as|assert|async|await|break|continue|del|def|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b)/g;

            return escapedCode.split('\n').map(line => {
                if (line.trim() === '') return '';

                return line.replace(pattern, (match, _, defClass, funcName, number, string, comment, keyword) => {
                    if (defClass) { 
                        return `<span class="keyword">${defClass}</span> <span class="function">${funcName}</span>`;
                    }
                    if (number) return `<span class="number">${number}</span>`;
                    if (string) return `<span class="string">${string}</span>`;
                    if (comment) return `<span class="comment">${comment}</span>`;
                    if (keyword) return `<span class="keyword">${keyword}</span>`;
                    return match;
                });
            }).join('\n');
        },

        escapeHtml(unsafe) {
            return unsafe
            // .replace(/&/g, "&amp;")
            // .replace(/</g, "&lt;")
            // .replace(/>/g, "&gt;")
            // .replace(/"/g, "&quot;")
            // .replace(/'/g, "&#039;");
        }
    }
});
```

