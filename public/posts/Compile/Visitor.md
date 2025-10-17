---
layout: post
title: 'Compile-Lab3-语义分析'
date: 2025-10-16
tags: [Compile, 实验]
comments: true
categories: [编译原理]
author: CircleCoder
---

## 前言

![image-20251017105243107](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510171052238.png)

与上一次实验的语法分析相比，语义分析的工作量显著减少，但是思考量增多

本次作业由两部分构成：

- 建立符号表，解析时记录各个符号的信息。此过程较简单，但需要设计合理高效的数据结构来管理符号表
- 错误处理（涉及b、c、d、e、f、g、h、l、m九种错误）。工作量较大，也容易出bug，是本次实验的难点

简化版项目结构：

```powershell
|-- Compiler.java
|
|-- frontend
|   |-- lexer
|   `-- parser
|
|-- middle
|   |-- error
|   `-- visitor
|       |-- FuncSymbol.java
|       |-- Symbol.java
|       |-- SymbolManger.java
|       |-- SymbolTable.java
|       `-- SymbolType.java
```



## 符号表

同样地，我们还是假定不存在错误情况，先建立正确的语义分析流程

### 符号

![image-20251017114844683](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510171148898.png)

首先建立的 符号类 和 符号类型枚举类

```java
public class Symbol {

    private SymbolType type;
    private String name;
    private int lineNum;

    public Symbol(SymbolType type, String name, int lineNum) {
		//....
    }
	
	// get()方法...
	
}

public enum SymbolType {
    ConstInt("ConstInt"),
    ConstIntArray("ConstIntArray"),
    //......
}
```

函数需要额外记录参数等信息，所以我给函数符号写了一个子类

```java
public class FuncSymbol extends Symbol{
    
    private int paramNum;
    private ArrayList<SymbolType> paramTypeList;

    public FuncSymbol(SymbolType type, String name, int lineNum) {
       //......
    }

    public void addParam(SymbolType paramType) {
       //....
    }

    // get()方法...
}
```



### 符号表

每个作用域都要建立一张符号表，记录该作用域的所有符号

为了记录作用域之间的嵌套关系，我们给符号表设置属性 `parent`，为父作用域的符号表

```java
public class SymbolTable {
    private int tableId;
    private ArrayList<Symbol>symbolList;
    private HashMap<String, Symbol> table;
    private SymbolTable parent;

    public SymbolTable(SymbolTable parent,int cnt) {
        table = new HashMap<String, Symbol>();
        symbolList = new ArrayList<Symbol>();
        this.parent = parent;
        this.tableId = cnt;
    }

    public void addSymbol(Symbol symbol) {
        table.put(symbol.getName(), symbol);
        symbolList.add(symbol);
    }

    public boolean hasParent() {
    	return parent != null;
    }

}
```

这里我使用了两个容器 `HashMap` 和 `ArrayList`（不是很优雅），前者是为了快速查询 `symbol`，后者是适应本次实验要求的“顺序输出”，在后续实验中可以删除



### 栈式管理

符号和符号表均已建立完，接下来要做的就是设计合理的数据结构，在解析过程中为每个作用域建立符号表，并且保留符号表之间关系信息。一种思路是解析时传参，将符号表作为参数传入解析类的构造器中，解析时往里面添加符号即可。这需要对 `parser` 做大量修改，而且并不优雅

对于每个作用域，进入时建立符号表，退出时符号表已包含了该作用域的所有信息，之后不再修改。因此嵌套作用域的符号表具有先进后出的特点，基于此，我们采用栈进行符号表的全局管理

```java
public class SymbolManger {		//单词打错了（）
    private final static SymbolManger instance = new SymbolManger();	// 单例模式

    private final HashMap<Integer, SymbolTable> symbolTableMap;
    private final Stack<SymbolTable> symbolTableStack;
    private SymbolTable currentTable;
    private int cnt;

    private SymbolManger() {
        symbolTableMap = new HashMap<Integer, SymbolTable>();
        symbolTableStack = new Stack<SymbolTable>();
        currentTable = null;
    }
       
    public static SymbolManger getInstance() {
    	return instance;
    }

    public void pushScope() {
        cnt++;
        SymbolTable table = new SymbolTable(currentTable, cnt);
        symbolTableStack.push(table);
        symbolTableMap.put(cnt, table);
        currentTable = table;
    }

    public void popScope() {
        symbolTableStack.pop();
        currentTable = symbolTableStack.peek();
    }

    public SymbolTable getCurrentTable() {
    	return currentTable;
    }

    public void printSymbols(){
       	//...
    }
}
```

进入新的作用域时，调用 `pushScope()` 入栈，创建新的符号表，并将该符号表的 `parent` 字段设置为当前符号表 ；离开作用域时，调用 `popsScope()` 出栈。我们需要考虑的情况就是`Block`块作用域和函数作用域

对于 `Block` 块作用域：

```java
public Block parseBlock() {
        this.blockItemList = new ArrayList<>();
        this.lbrace = this.iterator.readNextToken();

        SymbolManger.getInstance().pushScope();

        Token token = this.iterator.readNextToken();
        while (!(token.getType().equals(TokenType.RBRACE))) {
            //......
        }
        this.rbrace = token;

        SymbolManger.getInstance().popScope();

        return new Block(this.lbrace, this.blockItemList, this.rbrace);
    }
```

对于函数作用域（函数定义），需要注意，形参以及函数体都属于函数作用域。所以要在形参解析前 `pushScope()`，在函数定义解析完毕后 `popScope()`。而函数体本身是`Block`块，不算作新的作用域，所以在 `parseBlock()` 时，我们需要修改上面的代码，先判断是否是函数体，然后再选择是否进行新作用域的入出栈

我在 `SymbolManger` 中设置了全局变量 `isSkipNextBlockPush` 作为开关，用来跳过函数体 `Block` 块的入出栈

```java
public FuncDef parseFuncDef() {
        this.funcType = new FuncTypeParser(this.iterator).parseFuncType();
        this.ident = this.iterator.readNextToken();
        this.lparent = this.iterator.readNextToken();

        addFuncSymbol();

        Token token = this.iterator.readNextToken();

        SymbolManger.getInstance().pushScope();
        SymbolManger.getInstance().setSkipNextBlockPush(true);

        if(!(token.getType().equals(TokenType.RPARENT)) &&
        	//.....
        }

        handleJError(this.rparent);

        this.block = new BlockParser(this.iterator).parseBlock();

        SymbolManger.getInstance().popScope();

        return new FuncDef(this.funcType, this.ident,
                this.lparent, this.funcFParams, this.rparent, this.block);
}
```

```java
public Block parseBlock() {
        this.blockItemList = new ArrayList<>();
        this.lbrace = this.iterator.readNextToken();

        boolean skip = SymbolManger.getInstance().isSkipNextBlockPush();
        if(!skip){
            SymbolManger.getInstance().pushScope();
        }else{
            SymbolManger.getInstance().setSkipNextBlockPush(false);
        }

        Token token = this.iterator.readNextToken();
        while (!(token.getType().equals(TokenType.RBRACE))) {
           	//.....
        }
        this.rbrace = token;

        if(!skip){
            SymbolManger.getInstance().popScope();
        }

        return new Block(this.lbrace, this.blockItemList, this.rbrace);
}
```



对于符号的添加，我们只需要考虑常量、变量、函数的定义即可（`static` 关键字出现在声明中，可以在全局管理器中记录）。以 `ConstDef` 为例：

```java
public ConstDef parseConstDef() {
        Token token = this.iterator.readNextToken();
        this.ident = token;
        token = this.iterator.readNextToken();
        if (token.getType().equals(TokenType.LBRACK)) {
            this.leftBrack = token;
            //.......
        }
        
        //.......

        addSymbol();

        return new ConstDef(this.ident, this.leftBrack,
                this.constExp, this.rightBrack, this.assign, this.constInitVal);
}

private void addSymbol() {
        SymbolType type;
        if (this.leftBrack == null) {
            type = SymbolType.ConstInt;
        } else {
            type = SymbolType.ConstIntArray;
        }
        
        Symbol symbol = new Symbol(type, this.ident.getValue(), this.ident.getLineNum());
        symbolTable.addSymbol( symbol);
}
```



## 错误处理

这是本次实验的难点，让我们逐个分析

### BTypeError

![image-20251017125533150](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510171255288.png)

在符号表中实现错误处理方法，然后在 `addSymbol()` 时调用即可

```java
public boolean checkBTypeError(Symbol symbol) {
        return table.containsKey(symbol.getName());
}
```

```java
private void addSymbol() {
        SymbolType type;
        if (this.leftBrack == null) {
            type = SymbolType.ConstInt;
        } else {
            type = SymbolType.ConstIntArray;
        }
        
        Symbol symbol = new Symbol(type, this.ident.getValue(), this.ident.getLineNum());
        SymbolTable symbolTable = SymbolManger.getInstance().getCurrentTable();
        
        if(symbolTable.checkBTypeError( symbol)){
            int lineNum = this.ident.getLineNum();
            Error error = new Error(lineNum, ErrorType.DUPLICATED_IDENT);
            ErrorReporter.addError(error);
            System.out.println("In ConstDefParser, At Line"+ lineNum+ ":   DUPLICATED_IDENT");
        }else{
            symbolTable.addSymbol( symbol);
        }
    }
```



### CTypeError

![image-20251017125914076](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510171259300.png)

在符号表中实现错误处理方法，然后在对应文法解析时调用即可

```java
public boolean checkCTypeError(String name) {
        if(table.containsKey(name)) {
            return false;
        }
        if(parent != null){
            return parent.checkCTypeError(name);
        }
        return true;
}
```

```java
public LVal parseLVal() {
        this.ident = this.iterator.readNextToken();
        handleCError(this.ident);

        //.....
        
        return new LVal(this.ident, this.lbrack, this.exp, this.rbrack);
}

private void handleCError(Token token) {
    SymbolTable symbolTable = SymbolManger.getInstance().getCurrentTable();
    if(symbolTable.checkCTypeError(token.getValue())){
        int lineNum = token.getLineNum();
        Error error = new Error(lineNum, ErrorType.UNDEFINED_IDENT);
        ErrorReporter.addError(error);
        System.out.println("In LValParser, At Line"+ lineNum+ ":   UNDEFINED IDENT");
    }
}
```



### DTypeError

![image-20251017130229938](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510171302169.png)

在解析函数定义时，我们就要将参数信息写入函数符号中去

```java
private  void addParamsToFuncSymbol(ArrayList<Symbol> symbols) {
    for (Symbol symbol : symbols) {
        this.funcSymbol.addParam(symbol.getType());
    }
}
```

解析对应文法时，检查参数个数是否匹配即可

```java
private void handleDError() {
        Symbol symbol = SymbolManger.getInstance().getCurrentTable().getSymbol(this.ident.getValue());
    
    	//先排除其他错误
        if(!(symbol instanceof FuncSymbol)){
            return ;
        }
        
        FuncSymbol funcSymbol = (FuncSymbol) symbol;
        if(this.funcRParams ==  null && funcSymbol.getParamNum() == 0){
            return ;
        }
        
        if((this.funcRParams == null && funcSymbol.getParamNum() != 0)||
            this.funcRParams.getSize()!= funcSymbol.getParamNum()){

            int lineNum = this.ident.getLineNum();
            Error error = new Error(lineNum, ErrorType.MISMATCH_PARAM_NUM);
            ErrorReporter.addError(error);
            System.out.println("In FuncUnaryExpParser, At Line"+ lineNum+ ":   MISMATCH PARAM NUM");
        }
}
```



### ETypeError

![image-20251017143147512](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510171432961.png)

笔者认为这个是最复杂的错误处理

只需要考虑整型和数组两种类型即可。实参为数组，当且仅当识别为单独的数组 `Ident`，其余情况均为整型（不考虑实参为指针运算或 `void` 型函数）

```java
public void handleEError() {
        Symbol symbol = SymbolManger.getInstance().getCurrentTable().getSymbol(this.ident.getValue());
        
        // 先排除其他类型错误
        // ......

        int len = funcRParams.getSize();
        for(int i = 0; i < len; i++){
            SymbolType paramType = funcSymbol.getParamTypeList().get(i);
            SymbolType expType = this.funcRParams.getExpList().get(i).getType();

            if(paramType != expType){
                int lineNum = this.ident.getLineNum();
                Error error = new Error(lineNum, ErrorType.MISMATCH_PARAM_TYPE);
                ErrorReporter.addError(error);
                System.out.println("In FuncUnaryExpParser, At Line"+ lineNum+ ":   MISMATCH PARAM TYPE");
            }
        }
}
```

这里的 `Exp.getType()` 方法需要递归调用子成分的方法，如下图示例路径，返回最后解析到的 `Ident` 类型，其余分支一律返回整型

```
Exp → AddExp → MulExp → unaryExp → PrimaryExp → LVal → Ident
```

注意 `Ident` 有 `StaticInt、Int、ConstInt、StaticIntArray、IntArray、ConstIntArray` 六种类型，而函数参数只有`Int`和`IntArray` 两种类型，所以比较时要转化一下

````java
if(expType.equals(SymbolType.ConstInt)||expType.equals(SymbolType.StaticInt)){
    expType = SymbolType.Int;
}

if(expType.equals(SymbolType.ConstIntArray)||expType.equals(SymbolType.StaticIntArray)){
    expType = SymbolType.IntArray;
}
````



### FTypeError

![image-20251017145248149](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510171452262.png)

检查 `void` 型函数中是否出现了 `return Exp` 语句。注意，可能不只有多条错误语句，均需要判断并输出

我们在文法规则 `Stmt → 'return' [Exp] ';'` 解析时进行检查。首先需要判断语句是否出现在 `void` 型函数中，我们在全局管理器中添加标志 `isInFuncDef` 和 `isFuncTypeVoid`，当两个值都为`true` 时才对 `return` 语句进行检查

```java
private void handleFError() {
    if(this.exp != null &&
            SymbolManger.getInstance().isInFuncDef() &&
            SymbolManger.getInstance().isFuncTypeVoid()){

        int lineNum = this.returnToken.getLineNum();
        Error error = new Error(lineNum, ErrorType.RETURN_VALUE_VOID);
        ErrorReporter.addError(error);
        System.out.println("In ReturnStmtParser, At Line"+ lineNum+ ":   RETURN VALUE VOID");
    }
}
```

```java
public FuncDef parseFuncDef() {
    this.funcType = new FuncTypeParser(this.iterator).parseFuncType();
    this.ident = this.iterator.readNextToken();
    this.lparent = this.iterator.readNextToken();

    SymbolManger.getInstance().setInFuncDef(true);
    addFuncSymbol();

   	//....

    SymbolManger.getInstance().popScope();
    SymbolManger.getInstance().setInFuncDef(false);

    return new FuncDef(this.funcType, this.ident,
            this.lparent, this.funcFParams, this.rparent, this.block);
}

private void addFuncSymbol() {
    SymbolType type;
    if (this.funcType.getType().equals(TokenType.VOIDTK)) {
        type = SymbolType.VoidFunc;
        SymbolManger.getInstance().setFuncTypeVoid(true);
    } else {
        type = SymbolType.IntFunc;
        SymbolManger.getInstance().setFuncTypeVoid(false);
    }
    //.......
}
```



### GTypeError

![image-20251017150800752](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510171508076.png)

检查 `Int` 型函数的函数体的末尾是否有 `return` 语句，即检查 `Block` 的最后一个 `BlockItem`，是否满足下述解析路径

```
BlockItem → Stmt → return [Exp] ;
```

故也需要递归调用 `checkReturn()` 方法

```java
private void handleGError() {
    if(this.funcType.getType().equals(TokenType.INTTK)){
        if(!this.block.checkReturn()){
            int lineNum = this.block.getRbrace().getLineNum();
            Error error = new Error(lineNum, ErrorType.MISSING_RETURN);
            ErrorReporter.addError(error);
            System.out.println("In FuncDefParser, At Line"+ lineNum+ ":   MISSING_RETURN");
        }
    }
}
```

```java
public boolean checkReturn(){
    if(this.blockItemList == null || this.blockItemList.size() == 0){
        return false;
    }
    int len = this.blockItemList.size();
    return this.blockItemList.get(len-1).checkReturn();
}
```



### HTypeError

![image-20251017151640828](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510171516134.png)

检查 `LVal` 的 `Ident` 类型是否为常量即可。注意文法 `ForStmt → LVal '=' Exp { ',' LVal '=' Exp }` 也要判断

```java
private void handleHError() {
    if(this.lVal.getSymbolType()==null){
        return;
    }
    if(this.lVal.getSymbolType().equals(SymbolType.ConstInt)||
        this.lVal.getSymbolType().equals(SymbolType.ConstIntArray)){

        int lineNum = this.lVal.getIdent().getLineNum();
        Error error = new Error(lineNum, ErrorType.ALTER_CONST);
        ErrorReporter.addError(error);
        System.out.println("In AssignStmtParser, At Line"+ lineNum+ ":   ALTER_CONST");
    }
}
```

这里的 `getint()` 函数，笔者在语法分析时当做普通函数处理的，故在语义分析中会识别为未定义错误。全局管理器初始化时添加序号为 `-1` 的符号表，将该函数加入其中即可，最后不输出



### LTypeError

![image-20251017152414896](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510171524297.png)

```java
private void handleLError(String formatString) {
    String target = "%d";

    int cnt1 = (formatString.length() - formatString.replace(target, "").length())
            / (target.length());

    int cnt2 = this.expList.size();
    
    if (cnt1 != cnt2) {
        Error error = new Error(this.printToken.getLineNum(), ErrorType.MISMATCCH_PRINTF);
        ErrorReporter.addError(error);
        System.out.println("In PrintfStmtParser, At Line"+ this.printToken.getLineNum()+ ":   MISMATCH_PRINTF");
    }
}
```



### MTypeError

![image-20251017152553980](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510171525413.png)

方法与 `F` 类错误处理相同，通过全局标志 `isInLoop` 判断是否处在循环块中

```java
private void handleMError(){
    if(!SymbolManger.getInstance().isInLoop()){
        int lineNum = this.breakToken.getLineNum();
        Error error = new Error(lineNum, ErrorType.MISUSE_END_LOOP);
        ErrorReporter.addError(error);
        System.out.println("In BreakStmtParser, At Line"+ lineNum+ ":   MISUSE_END_LOOP");
    }
}
```

