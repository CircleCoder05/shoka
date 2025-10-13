---
layout: post
title: 'Compile-Lab1-词法分析'
date: 2025-09-24
tags: [Compile, 实验]
comments: true
categories:
  - [编译原理]
author: CircleCoder
password: ilovebuaa
---

## 前言

![image-20250925095634964](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202509250956131.png)

词法分析比较简单，照搬OO第一单元的Lexer即可（OO不愧是世界一流课程)

项目结构：

```
├── Compiler.java
├── config.json
└── frontend
         └── Lexer.java		//词法分析器（单例模式）
         └── TokenType.java	//单词枚举类
```

## Lexer.java

### 主要成员

```
private String source;	//源程序字符串
private int curPos;		//当前字符串位置指针
private String token;	//解析单词值
private TokenType tokenType;	//解析单词类型
private int lineNum;	//当前行号
private int number;		//解析数值
private final Map<String, TokenType> reserveWords;	//保留字表
private boolean hasError;	//是否错误
private int errorLine;	//错误行号
private char errorCode;	//错误代码
```

### 主要方法

```
isAtEnd();	//是否解析到末尾
peek();		//当前字符串位置指针
advance();	//读取一个字符并前进
addChar();	//加入Token;
setError();	//置错

//主要接口
next();		//读取下一个单词
getToken();	//获取单词值
getTokenType();	//获取单词类型
```

### 解析过程

```java
public void next() {
        this.token = "";
        this.tokenType = null;
        this.hasError = false;
        this.errorLine = -1;
        this.errorCode = '\0';

        //跳过空白符、注释
        while (true) {
            //空白符
            //......

            // 行内注释
            //......

            // 块注释
            //......
        }

		//是否解析到末尾
        if (isAtEnd()) {
            tokenType = null;
            return;
        }

        char c = advance();
        addChar(c);

        // 标识符、关键字
        if (Character.isLetter(c) || c == '_') {
            //......

            return;
        }

        // 无符号整数
        if (Character.isDigit(c)) {
            //......

            number = Integer.parseInt(token);
            return;
        }

        // 字符串常量
        if (c == '"') {
           	//......

            return;
        }

        // 操作符
        switch (c) {
            case '+':
                tokenType = TokenType.PLUS;
                return;

            //......

            default:
                tokenType = null;
                return;
        }
    }
```

## Compiler.java

程序入口，读取源程序，调用Lexer进行词法分析

```java
import frontend.Lexer;
import frontend.TokenType;

import java.io.*
import java.nio.*

public class Compiler {
    public static void main(String[] args) {
        String inputPath = "testfile.txt";
        String lexerOut = "lexer.txt";
        String errorOut = "error.txt";

        //读取源程序
        //......

        Lexer lexer = Lexer.getInstance();
        lexer.reset(src);

        try (
            BufferedWriter lw = new BufferedWriter(new FileWriter(lexerOut));
            BufferedWriter ew = new BufferedWriter(new FileWriter(errorOut))) {
                while (true) {
                    lexer.next();
                    if (lexer.hasError()) {
                        //输出到error.txt
                        //......
                        continue;
                    }

                    //...
                    //输出到lexer.txt
                }
            } catch (IOException ignored) {
        }
    }
}
```
