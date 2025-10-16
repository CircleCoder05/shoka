---
layout: post
title: 'Compile-Lab2-语法分析'
date: 2025-10-09
tags: [Compile, 实验]
comments: true
categories: [编译原理]
author: CircleCoder
---

## 前言

![image-20251016212303888](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510162123108.png)

语法分析的工作量过于庞大，本人的架构参考了学长的代码（链接附在文末），并进行了一定的优化

本次作业由两部分构成：

- 自顶向下构建语法树。由于语法结点较多，此过程非常漫长，但是比较无脑
- 错误处理（涉及i，j，k三种错误）。比较简单，但是错误的出现会影响语法分析的过程，所以要回头改一下语法分析的一些细节，容易出bug

简化版项目结构：

```
|-- Compiler.java	// 程序入口
|
|-- frontend
|   |-- lexer		// 词法分析器
|   `-- parser		// 语法分析器
|       |-- SyntaxNode.java	// 祖宗结点
|       |-- decl		//声明定义类
|       |-- expression	//表达式类
|       |-- func		//函数类
|       |-- statement	//语句类
|
|-- middle
|   `-- error	//错误处理
|       |-- Error.java			//错误类
|       |-- ErrorReporter.java	//全局错误管理器
|       `-- ErrorType.java		//错误枚举
```



## 词法分析

词法分析将输入转化成了 `tokens`，然后送入语法分析程序进行解析

对于 `tokens` 流，语法分析时并不是一直向前读取。当一个语法结点（非终结符）有多个产生式时，我们采用提前观察的方法消除回溯，观察完毕后要回退到原位置进行解析，故储存 `tokens` 的容器应当支持前进和回退。可以使用 `ListIterator` 迭代器，但为了支持更多功能，这里我们自己写一个迭代器类

```java
package frontend.lexer;

import java.util.ArrayList;
import java.util.ListIterator;

public class TokenListIterator {
    private ListIterator<Token> iterator;
    private Token last;

    public TokenListIterator(ArrayList<Token> tokenList) {
        this.iterator = tokenList.listIterator();
    }

    public ListIterator<Token> getIterator() {
        return iterator;
    }

    public Token readNextToken() {
        return last = this.iterator.next();
    }

    public boolean hasNext() {
        return this.iterator.hasNext();
    }

    public void unReadToken(int k) {
        int cnt = k;
        while (cnt > 0) {
            cnt--;
            if (this.iterator.hasPrevious()) {
                last = this.iterator.previous();
            } else {
                break;
            }
        }
    }

    @Override
    public String toString() {
        return last.toString();
    }
}

```



## 语法分析

先不考虑错误处理，假定输入是符合文法约束的，自顶向下建立语法树。我们采用结点和解析分离的模式，对于每个语法结点，建立 `Node` 类和 `Parser` 类



### 基本模式

以文法规则`ConstDef → Ident [ '[' ConstExp ']' ] '=' ConstInitVal `为例，介绍大部分文法规则的解析模式

`Node` 类定义结点的子成分，只提供构造方法，并实现输出方法（最后按实验要求递归输出所有语法结点）

```java
package frontend.parser.decl.constant;

import frontend.lexer.Token;
import frontend.parser.SyntaxNode;
import frontend.parser.decl.constant.constinitval.ConstInitVal;
import frontend.parser.expression.ConstExp;

public class ConstDef implements SyntaxNode {
    public final String name = "<ConstDef>";
    private Token ident;
    private Token leftBrack;
    private ConstExp constExp;
    private Token rightBrack;
    private Token eql;
    private ConstInitVal constInitVal;

    public ConstDef(Token ident,  Token eql, ConstInitVal constInitVal) {
        this.ident = ident;
        this.eql = eql;
        this.constInitVal = constInitVal;
    }

    public ConstDef(Token ident, Token leftBrack, ConstExp constExp, Token rightBrack, Token eql, ConstInitVal constInitVal) {
        this.ident = ident;
        this.leftBrack = leftBrack;
        this.constExp = constExp;
        this.rightBrack = rightBrack;
        this.eql = eql;
        this.constInitVal = constInitVal;
    }


    @Override
    public String syntaxOutput() {
        StringBuilder sb = new StringBuilder();
        sb.append(this.ident.syntaxOutput());
        if (this.leftBrack != null && this.rightBrack != null && this.constExp != null) {
            sb.append(this.leftBrack.syntaxOutput());
            sb.append(this.constExp.syntaxOutput());
            sb.append(this.rightBrack.syntaxOutput());
        }
        sb.append(this.eql.syntaxOutput());
        sb.append(this.constInitVal.syntaxOutput());
        sb.append(this.name + "\n");
        return sb.toString();
    }
}
```



`Parser` 类解析出各个成分，并传入 `Node` 的构造器中，得到 `Node` 对象

```java

public class ConstDefParser {

    private Token ident;
    private Token leftBrack;
    private ConstExp constExp;
    private Token rightBrack;
    private Token assign;
    private ConstInitVal constInitVal;
    private TokenListIterator iterator;

    public ConstDefParser(TokenListIterator iterator) {
        this.iterator = iterator;
    }

    public ConstDef parseConstDef() {
        Token token = this.iterator.readNextToken();
        this.ident = token;
        token = this.iterator.readNextToken();
        if (token.getType().equals(TokenType.LBRACK)) {
            this.leftBrack = token;
            ConstExpParser constExpParser = new ConstExpParser(this.iterator);
            this.constExp = constExpParser.parseConstExp();
            token = this.iterator.readNextToken();
            this.rightBrack = token;

        }else{
            this.iterator.unReadToken(1);
        }

        token = this.iterator.readNextToken();
        this.assign = token;
        ConstInitValParser constInitValParser = new ConstInitValParser(this.iterator);
        this.constInitVal = constInitValParser.parseConstInitVal();

        return new ConstDef(this.ident, this.leftBrack,
                this.constExp, this.rightBrack, this.assign, this.constInitVal);
    }

}

```



### 多个产生式

对于有多个产生式的语法规则，我们采用多态设计，实现各个产生式的独立解析

以文法规则 `Decl → ConstDecl | VarDecl`为例，定义子成分接口 `DeclElement`

```java
public interface DeclElement extends SyntaxNode {
}
```

```java
public class Decl implements SyntaxNode {

    private final DeclElement declElement;
    private final String name = "<Decl>";
    public Decl(DeclElement declElement) {
        this.declElement = declElement;
    }

    @Override
    public String syntaxOutput() {
        return this.declElement.syntaxOutput();
    }
}
```

```java
public class ConstDecl implements DeclElement{
	//....
}

public class VarDecl implements DeclElement{
	//....
}
```

（当然也可以把 `ConstDecl` 和 `VarDecl` 都作为 `Decl` 的成员变量，但并不优雅）

在 `Decl` 的解析时，我们需要通过前瞻 `token` 流，提前判断子成分的类型，从而递归调用子成分的解析方法

```java
public class DeclParser {
    private TokenListIterator iterator;

    public DeclParser(TokenListIterator iterator) {
        this.iterator = iterator;
    }

    public Decl parseDecl() {
        Token first = this.iterator.readNextToken();
        DeclElement declElement = null;
        
        // ConstDecl
        if (first.getType().equals(TokenType.CONSTTK)) {
            this.iterator.unReadToken(1);
            ConstDeclParser constDeclParser = new ConstDeclParser(this.iterator);
            declElement = constDeclParser.parseConstDecl();
        }
        
        // VarDecl
        else if (first.getType().equals(TokenType.INTTK)||first.getType().equals(TokenType.STATICTK)) {
            this.iterator.unReadToken(1);
            VarDeclParser varDeclParser = new VarDeclParser(this.iterator);
            declElement = varDeclParser.parseVarDecl();
        } else {
            System.out.println("READ UNEXPECTED TOKEN ");
        }
        Decl decl = new Decl(declElement);
        return decl;
    }
}
```

对于 `Stmt → LVal '=' Exp ';' | [Exp] ';'`、`UnaryExp → PrimaryExp | Ident '(' [FuncRParams] ')' | UnaryOp UnaryExp` 等文法规则，需要前瞻更多的 `token`，但方法都是一样的



当然，并不是所有多个产生式都需要这样处理，有的可以改写文法来简化处理过程，例如文法：

```
VarDef → Ident [ '[' ConstExp ']' ] | Ident [ '[' ConstExp ']' ] '=' InitVal
```

可以改写为

```
VarDef → Ident [ '[' ConstExp ']' ] [ '=' InitVal]
```

（其实就是上文所述的 “不太优雅的做法”）



### 左递归问题

对于 `AddExp → MulExp | AddExp ('+' | '−') MulExp` 等左递归文法，我们需要改写文法来消除左递归，然后再进行解析

```
AddExp → MulExp {('+' | '−') MulExp}
```

注意，实验要求按照原文法顺序输出，所以这些结点的输出逻辑与一般的不同

```java
public String syntaxOutput() {
        StringBuilder output = new StringBuilder();
        output.append(this.firstExp.syntaxOutput()).
                append(this.name).
                append('\n');
        if (this.operators != null && this.latterExps != null
                && this.operators.size() == this.latterExps.size()) {
            for (int i = 0; i < Math.min(this.operators.size(), this.latterExps.size()); i++) {   		output.append(this.operators.get(i).syntaxOutput()).append(this.latterExps.get(i).syntaxOutput()).append(this.name).append("\n");
            }
        }
        return output.toString();
    }
```



### 泛型

注意到以下几条文法规则具有同样的结构

```
乘除模表达式 MulExp → UnaryExp | MulExp ('*' | '/' | '%') UnaryExp 

加减表达式 AddExp → MulExp | AddExp ('+' | '−') MulExp 

关系表达式 RelExp → AddExp | RelExp ('<' | '>' | '<=' | '>=') AddExp 

相等性表达式 EqExp → RelExp | EqExp ('==' | '!=') RelExp 

逻辑与表达式 LAndExp → EqExp | LAndExp '&&' EqExp

逻辑或表达式 LOrExp → LAndExp | LOrExp '||' LAndExp
```

可以通过泛型最大化代码复用，减少重复逻辑

定义泛型基类 `MultipleExp`

```java
public class MultipleExp<T extends SyntaxNode> implements SyntaxNode {
    private T firstExp = null;
    private ArrayList<Token> operators = null;
    private ArrayList<T> latterExps = null;
    private String name = null;

    public MultipleExp(T firstExp,
                    ArrayList<Token> operators,
                    ArrayList<T> latterExps,
                    String name) {
        this.firstExp = firstExp;
        this.latterExps = latterExps;
        this.operators = operators;
        this.name = name;
    }

    @Override
    public String syntaxOutput() {
		//...
    }

    public T getFirstExp() {
    	return this.firstExp;
    }

    public ArrayList<T> getLatterExps() {
    	return this.latterExps;
    }

    public ArrayList<Token> getOperators() {
    	return this.operators;
    }
}
```

派生子类

```java
public class AddExp extends MultipleExp<MulExp> {

    //  <AddExp> -> <MulExp> { ('+' | '-') <MulExp> }
    public AddExp(MulExp firstExp, ArrayList<Token> operators, ArrayList<MulExp> latterExps) {
        super(firstExp, operators, latterExps, "<AddExp>");
    }
    
}
```



## 错误处理

识别出错误后，不能影响后续的解析过程



### 词法错误

![image-20251016234938662](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510162349270.png)

直接在 `Lexer` 里处理即可。为了不影响语法的解析，我们将其作为正确的符号加入 `token` 流中

```java
case '&':
    if (!isAtEnd() && peek() == '&') {
        addChar(advance());
    } else {
        setError();
    }
    tokenType = TokenType.AND;
    return;
```



### 语法错误
![image-20251016235213834](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510162352182.png)

三种语法错误均为符号缺失，而当我们发现此类错误时，`token` 流已经走到了下一个单词了，因此 `token` 流的回退显得格外重要

以 `Stmt → LVal '=' Exp ';' // i` 为例：

```java
public class AssignStmtParser {
    private LVal lVal;
    private Token assign;
    private Exp exp;
    private Token semicolon;
    private TokenListIterator iterator;

    public AssignStmtParser(TokenListIterator iterator) {
        this.iterator = iterator;
    }

    public AssignStmt parseAssignStmt() {
        this.lVal = new LValParser(this.iterator).parseLVal();
        this.assign = this.iterator.readNextToken();
        handleHError();

        this.exp = new ExpParser(this.iterator).parseExp();

        this.semicolon = this.iterator.readNextToken();
        handleIError(this.semicolon);

        return new AssignStmt(this.lVal, this.assign, this.exp, this.semicolon);
    }

    private void handleIError(Token token) {
        if (!token.getType().equals(TokenType.SEMICN)) {
            this.iterator.unReadToken(2);
            int lineNum = this.iterator.readNextToken().getLineNum();
            Error error = new Error(lineNum, ErrorType.MISSING_SEMICN);
            ErrorReporter.addError(error);
            System.out.println("In AssignStmtParser, At Line"+ lineNum+ ":   EXPECT SEMICN");
        }
    }

```

这三类语法错误都是同样的处理方式，不再一一列举



错误处理之所以能产生很多 `bug`，是因为它会影响语法解析的流程

以 `FuncDef → FuncType Ident '(' [FuncFParams] ')' Block ` 为例，不考虑语法错误的情况下，在解析 `[FuncFParams]` 时，我们是这样做的：

```java
public FuncDef parseFuncDef() {
    this.funcType = new FuncTypeParser(this.iterator).parseFuncType();
    this.ident = this.iterator.readNextToken();
    this.lparent = this.iterator.readNextToken();

    Token token = this.iterator.readNextToken();
    
    // 如果左小括号的下一个token不是右小括号，说明函数有参数
    if(!token.getType().equals(TokenType.RPARENT)){
        this.iterator.unReadToken(1);
        this.funcFParams = new FuncFParamsParser(this.iterator).parseFuncFParams();
        this.rparent = this.iterator.readNextToken();
    }else{
        this.rparent = token;
    }

	//....
}
```

但是由于存在 `j` 型错误，在右小括号缺失且无参数的情况下，`Block` 会被我们当做 `FuncFParams` 进行解析。从而致错。类似这种情况还有很多处，我们必须一一修改

```java
//...

if(!(token.getType().equals(TokenType.RPARENT)) 
	&&!(token.getType().equals(TokenType.LBRACE))){
	//.....
}

//...
```

