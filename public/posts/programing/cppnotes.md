---
title: 'C++程序设计笔记'
date: 2025-08-08
categories: [编程]
tags: [C++]
author: Manifold
---


# 第一章 C++简单程序设计

## 1.1 C++标识符的构成规则

C++标识符的构成规则如下：

 - 以大写字母、小写字母或下划线_开始。
 - 可以由大写字母、小写字母、下划线_或数字0-9组成。
 - 大写字母和小写字母代表不同的标识符。
 - 不能是C++关键字。

## 1.2 运算符与表达式

除了+，-，*，/这四种简单的运算，还有：

1. “%”表示取余运算，只能用于整型操作数，优先级与“/”相同。
2. 自增和自减。注意`cout<<i++`是先输出`i`原先的值，然后对`i`自增，如果是`cout<<++i`就是先对`i`自增，然后输出其自增后的值。
3. 赋值运算符与赋值表达式：一般来说赋值运算从右往左计算。除了简单的“=”，还有一些复合赋值运算符。
4. 逻辑运算与逻辑表达式：常见的有<，<=，>，>=，==，!=，还有几个比较难记住的，分别是：
   - ！，也就是“非”。
   - &&，即“与”，只有符号两边都为true时，结果才为true。
   - ||，即“或”，只要符号两边有一个是true，结果就是true。
   - 注意，&&和||运算符具有短路特性，即对于&&，先对第一个操作数求值，若为false则不会对第二个操作数求值；类似地，对于||，若第一个操作数为true，则不再对第二个操作数求值。
5. 条件运算符与条件表达式：`(a<b)? a:b`表示：如果括号里的内容为true，输出a，否则输出b，这个实际上可以实现求出两个数a，b中较小数的值的目的。另外，`cout<<((score>=60)? "Pass":"Fail")`可以实现判断学生成绩是否及格的作用。
6. `sizeof`运算符：该运算符可以计算某种类型的对象在内存中所占的字节数，使用方式为：`sizeof (类型名)`或者`sizeof 表达式`，例如`sizeof(x)`可以计算出`x`在内存中所占的字节数。
7. 位运算：有下面几种
   - 按位与“&”：两个二进制数，如果对应的数字都是1就落下来，否则就是0；
   - 按位或“|”：如果对应的两个数字中有1就写1，都是零就写0；
   - 按位异或“^”：如果对应数字不同，则为1，相同则为零；
   - 按位取反“~”：即对二进制数的每一位取反；
   - 移位：
     - 左移：低位补0，溢出的高位舍弃；
     - 右移：高位补0，溢出的低位舍弃。
8. 混合运算时数据类型的转换：
   - 隐含转换：
      - 在算术运算和关系运算中参与运算的操作数类型不一致，自动将低类型数据转换为高类型数据。数据类型从低到高分别为：`char < short < int < unsigned < long < unsigned long < float < double`。
      - 逻辑运算符要求参与运算的操作数必须是bool型，如果是其他类型，则将非0数据转换为true，0转换为false。
      - 赋值运算中，直接将赋值运算符右边的值转换为左边值的类型。
   - 显式转换：语法为：`类型说明符 （表达式）`。还有四种类型转换说明符，如下：
     - `const_cast<类型说明符>(表达式)`
     - `dynamic_cast<类型说明符>(表达式)`
     - `reinterpret_cast<类型说明符>(表达式)`
     - `static_cast<类型说明符>(表达式)`

## 1.2 算法的基本控制结构

### 1.2.1 用if语句实现选择结构

基本的语法以下例示意：

```cpp
if (x>y)
    cout<<x;
else
    cout<<y;
```

事实上，else后面的语句可以为空，此时else可以被省略，成为如下形式：

```cpp
if(x>y) cout<<x;
```

这样的话如果不满足条件，就没有代码被执行。

### 1.2.2 多重选择结构

有很多问题是一次简单的判断解决不了的，需要进行多次判断选择。具体地，有以下几种方法：

1. 嵌套的if语句(原理简单，省略)；
2. `if···elseif`语句。基本的语法结构为：

```cpp
if(表达式1)  语句1
else if(表达式2)  语句2
else if(表达式3)  语句3
else  语句4
```

3. `switch`语句，其基本的语法结构为：

```cpp
switch  (表达式){
   case  常量表达式1：语句1
   case  常量表达式2：语句2
   default ： 语句3
}
```

### 1.2.3 循环结构

在C++中有如下三种循环控制语句。

1. `while`语句。以下面的示例表征其特征：

```cpp
int i=1,sum=0;
while (i<=10){
   sum+=i;
   i++;
}
//或者也可以写作
int i=1,sum=0;
while (i<=10) sum+=i,i++;
```

2. `do···while`语句。其基本的语法结构是：

```cpp
do 语句
while (表达式)
```

执行顺序是，先执行循环体语句，后判断循环条件表达式的值，表达式为true时，继续执行循环体，表达式为false则结束循环。

3. `for`语句。其基本语法结构为：

```cpp
for (初始语句;表达式1;表达式2) 语句
```

执行时，先执行初始语句，然后计算表达式1（循环控制条件）的值，若表达式1为true，则执行一次循环体，如果表达式1为false，则退出循环。每执行一次循环体后，计算表达式2的值，然后再计算表达式1，并根据表达式1的值决定是否继续执行循环体。

另外，初始语句，表达式1，表达式2都可以省略，但分号不能省略。初始语句可以放在`for`语句的前面，表达式2可以放在后面执行的语句里面，但如果省略了表达式1，循环就会无休止地进行下去。

### 1.2.4 其他控制语句

1. `break`语句：出现在`switch`语句或者循环语句中，使程序从循环体和`switch`语句中跳出，继续执行逻辑上的下一条语句。
2. `continue`语句：可以出现在循环体中，其作用是结束本次循环，接着开始判断决定是否继续执行下次循环。

### 1.2.5 自定义数据类型

1. typedef 声明：略；
2. 枚举类型 enum ，以一个具体实例体现其结构，如下：

```cpp
enum Weekday {SUN, MON, TUE, WED, THU, FRI, SAT};
```

这个枚举结构具有默认值，从左到右依次为：0，1，2，···。

我们还可以在声明时另行定义枚举元素的值，如：

```cpp
enum Weekday {SUN=7, MON=1, TUE, WED, THU, FRI, SAT};
```

这样的话从 MON 之后依此加1，SAT 为6。注意整数不能直接赋值给枚举变量，但是可以把枚举值赋给整数。

## 第一章练习题

多选题
1. 下列二进制数中是奇数的有( ACD )。
    A．00101001111110101
    B．00010000110111010
    C．10111011111101
    D．1000000011110101
2. 下列十六进制数中是奇数的有( AD )。
    A．37F
    B．2B8
    C．34E
    D．FF7
3. 下列十六进制数中是偶数的有( BD )。
    A．37F
    B．2B8
    C．34D
    D．F3E
4. 比十进制数0.1D大的数是( AC )。
    A．二进制数0.1B
    B．二进制数0.0001B
    C．八进制数0.1Q
    D．十六进制数0.1H
5. 比十进制数10D小的数是( BD )。
    A．十六进制数10H
    B．二进制数10B
    C．二进制数00010000B
    D．八进制数10Q
6. 下列二进制数中能被4整除的有( AC )。
    A．0010100111111000
    B．00010000110111010
    C．1011101111100
    D．1000000011110101
7. 下列十六进制数中能被4整除的有( AB )。
    A．37C
    B．2B8
    C．34D
    D．F3E
8. 下列八进制数中能被4整除的有( BD )。
    A．3732
    B．3614
    C．5216
    D．6710
9. 下列十六进制数中能被8整除的有( AC )。
    A．37C0
    B．2B7
    C．348
    D．F3E

单选题
1. 十进制数127.25对应二进制数为( A )。
    A．1111111.01
    B．10000000.10
    C．1111110.01
    D．1100011.11
2. 下列二进制数中是奇数的有( A )。
    A．00101001111110101
    B．00010000110111010
    C．10111.01111110
    D．100000001111010
3. 下列十六进制数中是奇数的有( A )。
    A．37F
    B．2B8
    C．34E
    D．FFA
4. 下列十六进制数中是偶数的有( B )。
    A．37F
    B．2BC
    C．34D
    D．F39
5. 十进制数26.625对应的二进制数为( C )。
    A．11010.111
    B．1100.011
    C．11010.101
    D．0101.11111110
6. 十六进制数5FE对应的二进制数为( D )。
    A．101 1100 1011
    B．111 0011 1100
    C．1101 0101
    D．0101 1111 1110
7. 二进制数1101011.011对应的十进制数为( A )。
    A．107.375
    B．124.365
    C．224.125
    D．95.625
8. 二进制数1101011.011对应的八进制数为( C )。
    A．273.6
    B．115.3
    C．153.3
    D．69.6
9. 二进制数1101011.011对应的十六进制数为( D )。
    A．153.6
    B．115.6
    C．6B.3
    D．6B.6
10. 与二进制数10110等值的十进制数是( B )。
    A．31
    B．22
    C．47
    D．18

判断题
1.	十进制数26.625对应的二进制数为11010.101B。正确

2.	十六进制数5FE对应的二进制数为010111111110B。正确

3.	十进制数25.625对应的二进制数为11010.101B。错误

4.	十六进制数5FD对应的二进制数为010111111110B。错误

5.	二进制数1101011B对应的十进制数为107D。正确

## 第一章问答题

1.	下列标识符哪些是合法的?
Program， -page， _lock， test2， 3in1， @mail， A_B_C_D
答：Program，_lock，test2，A_B_C_D

2.	请写出C++语句声明一个常量PI，值为3.1416；再声明一个浮点型变量a，把PI的值赋给a。
答：const double PI = 3.1416;
double a = PI;

3.	整数的正负，在计算机内部是如何区分的？
答：计算机内部使用补码来区分正数和负数。正数的补码与原码相同，也就是直接以二进制形式表示该数值。对于负数，计算机则采用补码进行表示。首先，负数的补码是通过将其对应正数的原码除符号位外的所有位取反（即0变为1，1变为0），然后在此基础上加1得到的。

4.	下列表达式的值是多少？
（1） 201 / 4
（2） 201 % 4
（3） 201 / 4.0
答：50,1,50.25

5.	执行完下列语句后，a、b、c三个变量的值为多少？

```cpp
a = 30;
b = a++;
c = ++a;
```

答：a=30;b=30;c=32;

6.	写一条for语句，输出100以内所有奇数，步长为2；然后用while和do…while语句完成同样的循环。
答：

```cpp
//for 语句：
for(int i = 1;i<=99;i+=2){cout<<i;}

//while语句：
int j = 1;
while(j<=99){cout<<j;j+=2;}

//do while语句：
int k = 1;
do{cout<<k;k+=2}
while(k<=99);
```

7.	写出C++语句，打印ASCII码为64~127的字符
答：

```cpp
#include<iostream>
Using namespace:std;
Int main(){
For(int i=64;i<=127;i++){Cout<<static_cast<char>(i)<<””;}
Cout<<endl;
Return 0;   }
```

8.	写出C++语句，输出’0’,’1’,’2’,’3’,’4’,’5’,’6’,’7’,’8’,’9’对应的ASCII码
答：

```cpp
#include<iostream>
Using namespace:std;
Int main(){
For(char c=’0’;c<=’9’;c++){Cout<<”character:”<<c<<”,ascii code:”<<static_cast<int>(c)<<endl;}
Return 0;   }
```

9.	写出下列表达式的值：
	（1）2<3&&6<9
	（2）!(4<7)
	（3）!(3>5)||(6<2)
答：（1）1（2）0（3）1

10.	若a=1, b=2, c=3, 下列各式的结果是什么？
（1）	a|b-c
（2）	a^b&-c
（3）	a&b|c
（4）	a|b&c
答：（1）0（2）1（3）3（4）3

11.	若a=1, 下列各式的结果是什么？
	（1）!a|a
	（2）~a|a
	（3）a^a
	（4）a>>2
答：（1）1（2）-1（3）0（4）0

## 第一章作业题

完成以下程序编写，程序代码在一个源程序里，输入输出界面友好（有清晰的输入输出提示）：

1. 完成以下运算及输出

  - 设定两个整型变量a,b；
  - 设定a的值为7，b的值为4；
  - 计算并输出以下的值，并用注释说明a/b、a%b、a&b、a|b、a^b运算结果的原因：
a+b，a/b，a%b，a*b，b-a，a&b，a|b，a^b

2. 完成以下运算及输出：

  - 设定两个实型变量x,y；
  - 设定x的值为5.4，y的值为4.2；
  - 计算并输出以下的值：
x+y，x/y，x*y，y-x

3. 完成以下运算及输出：

  - 用以上变量a、b、x、y计算并输出以下的值：
x+b，x/a，y*b，b-y

4. 以程序实现变参数式子y=Ax2+Bx+C的计算

  - 先输入A、B、C、x的值（要有提示说明输入什么值），系统计算出y的值，并用输出结果。

程序实现如下：

```cpp
#include<iostream>
using namespace std;

int main()
{
	int a = 7;
	int b = 4;
	cout << "a+b=" << a + b << endl;
	cout << "a/b=" << a / b << endl;//a/b表示商的整数部分，小数部分被自动舍弃，因此输出1
	cout << "a%b=" << a % b << endl;//a%b代表a被b除的余数，7除以4余3，因此输出3
	cout << "b-a=" << b - a << endl;
	cout << "a&b=" << (a & b) << endl;//a的二进制数为0111，b的二进制数为0100，按位与运算得到0100，换成十进制就是4。
	cout << "a|b=" << (a | b) << endl;//a的二进制数为0111，b的二进制数为0100，按位或运算得到0111，换成十进制就是7。
	cout << "a^b=" << (a ^ b) << endl;//a的二进制数为0111，b的二进制数为0100，按位异运算得到0011，换成十进制就是3。

	double x = 5.4, y = 4.2;
	cout << "x+y=" << x + y << endl;
	cout << "x/y=" << x / y << endl;
	cout << "x*y=" << x * y << endl;
	cout << "y-x=" << y - x << endl;
	cout << "x+b=" << x + b << endl;
	cout << "x/a=" << x / a << endl;
	cout << "y*b=" << x * y << endl;
	cout << "b-y=" << y - x << endl;

	double A, B, C, X;
	cout << "请输入A的值：" << endl;
	cin >> A;
	cout << "请输入B的值：" << endl;
	cin >> B;
	cout << "请输入C的值：" << endl;
	cin >> C;
	cout << "请输入X的值：" << endl;
	cin >> X;
	double Y = A * x * x + B * x + C;
	cout << "Y的值为：" << Y << endl;

	return 0;
}
```

# 第二章 函数

## 2.1 函数的定义

1. 函数定义的语法形式，如下：

```cpp
类型说明符  函数名(含类型说明的形式参数表){
   语句序列
}
```

2. 形式参数
3. 函数的返回值和返回值类型：对于有返回值的函数，需要写一个`return 表达式`语句；而对于没有返回值的`void`函数，可以不写该语句

## 2.2 函数的调用

1. 嵌套调用。以一个求平方和的函数为例，如下：

```cpp
int fun2(int m){
   return m*m;
}

int fun1(int x,int y){
   return fun2(x)+fun1(y);
}
```

2. 递归调用。以一个计算阶乘的函数为例，如下：

```cpp
unsigned fac(unsigned n){
   unsigned f;
   if(n==0)
       f=1;
   else
       f=fac(n-1)*n;
   return f;
}
```

## 2.3 函数的参数传递

1. 值传递
值传递是指当发生函数调用时，直接将实参的值传递给形参，这一过程是参数值的单向传递过程，一旦形参获得了值便与实参脱离关系，从此以后无论形参发生了怎样的改变，都不会影响到实参。比如下面这个程序：

```cpp
#include<iostream>
using namespace std;

void swap(int a,int b){
   int t=a;
   a=b;
   b=t;
}

int main(){
   int x=5,y=10;
   cout<<"x="<<x<<"  "<<"y="<<y<<endl;
   swap (x,y);
   cout<<"x="<<x<<"  "<<"y="<<y<<endl;
   return 0;
}
```

我们的swap函数仅仅是将x=5，y=10赋给了函数中的形式参数x，y，然后对函数中的形式参数进行操作，并没有影响到实际参数的值，因此输出结果不会改变，仍然是x=5，y=10。

2. 引用传递
引用是一种特殊类型的变量，可以被认为是另一个变量的别名。通过引用名与通过被引用的变量名访问变量的效果是一样的。其基本形式是：`int &ri=i;`，这样就定义了ri为i的引用。有了引用的概念，我们可以将上述程序改写为：

```cpp
#include<iostream>
using namespace std;

void swap(int &a,int &b){
   int t=a;
   a=b;
   b=t;
}

int main(){
   int x=5,y=10;
   cout<<"x="<<x<<"  "<<"y="<<y<<endl;
   swap (x,y);
   cout<<"x="<<x<<"  "<<"y="<<y<<endl;
   return 0;
}
```

这个和之前的区别在于，我们定义了形参是实参的一个引用，因此对于形参的改变，也会反映到实参上。

## 2.4 内联函数

内联函数的定义与普通函数定义方式几乎一样，只是在前面加了一个关键字`inline`，其语法形式如下：

```cpp
inline 类型说明符 函数名(含类型说明的形参表){
   语句序列
}
```

## 2.5 带默认形参值的函数

注意，有默认值的形参必须放在形参列表的最后，也就是说，在有默认值的形参右边，不能出现无默认值的形参。因为在函数调用中，实参与形参是按从左到右的顺序建立对应关系的。以下是一个应用举例：

```cpp
#include<iostream>
using namespace std;

int add(int x=5,int y=6){
   return x+y;
}

int main(){
   add(10);
   cout<<add(10)<<endl;
}
```

由于有默认形参值，因此输出为 10+6=16 。

## 2.6 函数重载

两个以上的函数，具有相同的函数名，但是形参的个数或者类型不同，编译器根据实参和形参的类型及个数的最佳匹配，自动确定调用哪一个函数，这就是函数的重载。注意：

- 可以根据形参的类型区分重载函数；
- 可以根据形参的个数区分重载函数；
- 编译器不以形参名来区分函数；
- 编译器不以返回值来区分函数（例如`int add(int x,int y); void add(int x,int y);`编译器就无法区分）；
- 当使用具有默认形参值的函数重载形式时，需要注意防止二义性。

## 2.7 C++系统函数

例如，可以在头文件处输入`#include<cmath>`，然后在下面的程序中就可以调用这里面的系统函数，像`sin(angle)`可以用来求正弦值。

## 第二章问答题

1. C++中如何定义并使用一个函数？ 
答：定义函数需要在函数头处说明函数的名称、返回类型以及参数列表，然后在函数体中写下实现函数功能的代码。使用函数时只需要在需要的位置写上需要的函数，然后在函数里面输入实参即可。

2. 观察下面程序的运行输出，说明什么是引用？ 
源程序：

```cpp
#include <iostream.h> 
int main()
{
int intOne;
int &rSomeRef = intOne;
intOne = 5;
cout << "intOne:\t\t" << intOne << endl;
cout << "rSomeRef:\t" << rSomeRef << endl;
int intTwo = 8;
rSomeRef = intTwo; // 会有什么后果？
cout << "\nintOne:\t\t" << intOne << endl;
cout << "intTwo:\t\t" << intTwo << endl;
cout << "rSomeRef:\t" << rSomeRef << endl;
return 0;
}
```

答：引用就是某个已存在的变量的别名。在上面的程序中，在前面的输出中，我们给intOne赋值5，因此rSomeRef的值也变成了5，就会输出：

```cpp
intOne: 5 
rSomeRef: 5 
```

下面我们又给intTwo赋值了8，然后将其值赋给rSomeRef，故rSomeRef和intOne的值也变成了8，因此后面还会输出：

```cpp
intOne: 8 
intTwo: 8 
rSomeRef: 8
```

3. 比较值调用和引用调用的相同点与不同点。
答： 相同点：无论是值调用还是引用调用，它们的最终目的都是将数据传递给函数，以便在函数内部进行操作或计算。
不同点：由于值调用传递的是数据的副本，函数内部对参数的修改不会影响原始数据。引用调用允许函数修改原始数据。如果函数内部对参数进行了修改，这些修改将反映在原始数据上。

4. 函数原型中的参数名与函数定义中的参数名以及函数调用中的参数名必须一样吗？
答： 不必须一样。函数原型中的参数名只是表明函数中参数的类型；函数定义中的参数是形式参数，它用于表明函数的内部代码运行的规则；函数调用中的参数名是实际参与运算的参数，三者不需要一样。

5. 重载函数时通过什么来区分？
答： 重载函数通过形式参数的数量以及形式参数的类型来区分。另外，重载函数不以形参名和返回值来区分函数。

6. 什么叫作嵌套调用？什么叫作递归调用？
答： 嵌套调用是指在一个函数的执行过程中调用另一个函数。递归调用是指一个函数直接或间接地调用自身。

## 第二章作业题 

1. 定义两个整型变量x和y。请直接利用cin为变量x和y输入数值。如果`x<y`，则x与y的值进行交换，从而保证x中肯定存放着较大的数据。
最终，借助cout输出变量x和变量y的值,输出界面友好，带有必要的提示信息。

```cpp
#include<iostream>
using namespace std;

int main() {
	int x, y;
	cout << "请输入两个整数：" << endl;
	cin >> x >> y;

	if (x < y) {
		int z = x;
		x = y;
		y = z;
	}

	cout << "较大的数是：" << x << endl;
	cout << "较小的数是：" << y << endl;

	return 0;

}
```

2. 使用switch语句实现如下功能：
输入变量day，day介于1~7之间，根据day的值输出对应星期几的英语单词（day等于7时输出星期日），如果day超出这个范围则输出Error。输入、输出界面要友好。

```cpp
#include<iostream>
using namespace std;

int main() {
	int day;
	cout << "请输入对应的数字：" << endl;
	cin >> day;
	switch (day) {
	case 1:
		cout << "星期一" << endl;
		break;
	case 2:
		cout << "星期二" << endl;
		break;
	case 3:
		cout << "星期三" << endl;
		break;
	case 4:
		cout << "星期四" << endl;
		break;
	case 5:
		cout << "星期五" << endl;
		break;
	case 6:
		cout << "星期六" << endl;
		break;
	case 7:
		cout << "星期日" << endl;
		break;
	default:
		cout << "Error" << endl;
		break;
	}
	return 0;
}
```

3. 循环范例：由0到4五个数字，组成5位数，每个数字用一次，但十位和百位不能为3（当然万位不能为0），输出所有可能的五位数。 

```cpp
#include<iostream>
using namespace std;

int main() {
	int i, j, k, l, m, count = 0;
	for (i = 1; i <= 4; i++) {
		for (j = 0; j <= 4; j++) {
			if (j == i) continue;
			for (k = 0; k <= 4; k++) {
				if (k == 3 || k == i || k == j) continue;
				for (l = 0; l <= 4; l++) {
					if (l == 3 || l == i || l == j || l == k) continue;
					for (m = 0; m <= 4; m++) {
						if (m == i || m == j || m == k || m == l) continue;
						cout << i << j << k << l << m << '\t';
						count++;
						if (count % 5 == 0) cout << endl;
					}
				}
			}
		}
	}
	return 0;
}
```

4. 编程求出所有的“水仙花数”。所谓“水仙花数”是指一个3位数，其中各位数字的立方和等于该数本身，例如153就是一个“水仙花数”，因为153=1+125+27。要求采用枚举法。

```cpp
#include<iostream>
using namespace std;

int main() {
	int a, b, c;
	for (a = 1; a <= 9; a++) {
		for (b = 0; b <= 9; b++) {
			for (c = 0; c <= 9; c++) {
				if ((a * a * a + b * b * b + c * c * c) != (a * 100 + b * 10 + c))continue;
					cout << a << b << c << '\n';
			}
		}
	}
	return 0;
}
```

5. 求输入数字n的阶乘`n!=1*2*3*4……*n`。（递推法）
由于`n!=1*2*3*……*n`,因此，要计算n的阶乘可以从1开始，由1的阶乘乘以2得到2的阶乘，再乘以3得到3的阶乘.......以此类推。 

```cpp
#include<iostream>
using namespace std;

int main() {
	int i = 1, n,result=1;
	cin >> n;
	while (i <= n) {
		result = result * i;
		i++;
	}
	cout << result << endl;
	return 0;
}
```

6. 求方程 xlg(x)=1 的实根的近似值，要求函数误差不超过0.00001。（二分迭代法）

```cpp
#include<iostream>
using namespace std;
#include<math.h>
int main() {
	double a = 2.0, b = 3.0, ep = 0.00001;
	int max = 30, j;
	double x1, x2, f1, f2, temp, ftemp;
	//二分法求根
	f1 = a * log10(a) - 1;
	f2 = b * log10(b) - 1;
	if (f1 * f2 >= 0) {
		cout << "初始错误！" << endl;
		system("pause");
		return 0;
	}
	x1 = a;
	x2 = b;
	for (j = 1; j <= max; j++) {
		if (fabs(f2 - f1) < ep) {
			cout << "方程根为：" << x1 << endl;
			system("pause");
			return 0;
		}
		temp = (x1 + x2) / 2;
		ftemp = temp * log10(temp) - 1;
		if ((ftemp * f1) > 0) {
			x1 = temp;
		}
		else {
			x2 = temp;
		}
		f1 = x1 * log10(x1) - 1;
		f2 = x2 * log10(x2) - 1;
		cout << "迭代次数：" << j << endl;
		cout << "x1=" << x1 << "\tf1=" << f1 << endl;
		cout << "x2=" << x2 << "\tf2=" << f2 << endl;
		cout << "误差" << f2 - f1 << endl;
	}
	return 0;
}
```


7. 枚举类型的使用
定义星期几的枚举类型，输入今天是周几，然后计算经过若干工作日和若干自然日后是周几。提示：自然日的计算是除以7求余数，工作日的计算是除以5求余数。输出的时候使用`switch`语句进行输出。

```cpp
#include <iostream>
using namespace std;

void f(int day, int x, int c)
{
	switch ((day + x) % c )
	{
	case 1: cout << "一" << endl; break;
	case 2: cout << "二" << endl; break;
	case 3: cout << "三" << endl; break;
	case 4: cout << "四" << endl; break;
	case 5: cout << "五" << endl; break;
	case 6: cout << "六" << endl; break;
	case 7: cout << "日" << endl; break;
	}
	return;
}

int main()
{
	cout << "今天是星期几？";
	int day, a, b;
	cin >> day;
	cout << "经过多少个工作日：";
	cin >> a;
	cout << "经过多少个自然日：";
	cin >> b;
	cout << "经过" << a << "个工作日后是星期";
	f(day, a, 5);
	cout << "经过" << b << "个自然日后是星期";
	f(day, b, 7);
	return 0;
}
```

8. 数学函数的幂级数展开

```cpp
// 循环方式计算e^x
#include <iostream>
using namespace std;

int power1(int n);
double power2(double x, int n);

double e;

int main()
{
    int n;
    double x;
    cout << "请输入x和n：";
    cin >> x >> n;
    for (int i = 0; i <= n; i++)
    {
        e += (double)(power2(x, i)) / (double)(power1(i));
    }
    cout << "e^x=" << e << endl;
}

int power1(int n)
{
    int times = 1;
    int i = 1;
    while (i <= n) {
        times *= i;
        i++;
    }
    return times;
}

double power2(double x, int n)
{
    if (n == 0) return 1;
    double val = 1;
    while (n--)
        val *= x;
    return val;
}

//递归方式计算sinx
#include <iostream>
using namespace std;

int factorial(int);
double power(double x, int n);

double s;

int main()
{
    int n;
    double x;
    cout << "请输入x和n：";
    cin >> x >> n;
    for (int i = 0; i <= n; i++)
    {
        s += (double)(power(-1, i)) * (double)(power(x, 2 * i + 1)) / (double)(factorial(2 * i + 1));
    }
    cout << "sinx=" << s << endl;
}

int factorial(int n)
{
    if (n == 1 || n == 0)
        return 1;
    else
        return n * factorial(n - 1);
}

double power(double x, int n)
{
    if (n == 0) return 1;
    double a = 1;
    while (n--)
        a *= x;
    return a;
}
```

9.  Fibonacci数列指的是这样一个数列：1，1，2，3，5，8，13，21，34，55，89...，这个数列从第3项开始，每一项都等于前两项之和。
分别用循环和递归函数求第n项（n>=5）Fibonacci 级数。

```cpp
#include <iostream>
using namespace std;

int Fibonacci1(int n);
unsigned Fibonacci2(unsigned m);
int main()
{
	cout << "用循环方式计算第n项Fibonacci级数" << endl;
	cout << "请输入n的值：" << endl;
	int n;
	cin >> n;
	cout << Fibonacci1(n) << endl;
	cout << "用递归函数计算第m项Fibonacci级数" << endl;
	cout << "请输入m的值：" << endl;
	int m;
	cin >> m;
	cout << Fibonacci2(m) << endl;
	return 0;
}
int Fibonacci1(int n) {
		int c;
		if (n == 1 || n == 2)
			c = 1;
		else {
			int a;
			int b;
			int i = 1;
			a = 1;
			b = 1;
			while (i <= n - 2) {
				c = a + b;
				a = b;
				b = c;
				i++;
			}
		}
		return c;
}
unsigned Fibonacci2(unsigned m) {
	unsigned fib;
	if (m <= 2)
		fib = 1;
	else {
		fib = Fibonacci2(m - 1) + Fibonacci2(m - 2);
	}
	return fib;
}
```

10. 编写两个函数max和swap求4个数a、b、c、d中最大的数，算法要求是从前往后两个数开始进行比较，大的那个数放在后面（两个数进行交换），以此类推最后d数据为最大值。其中一个函数是max（a,b,c,d）函数，在其中调用交换函数swap(a,b)。输入数据时输入任意4个数据，运算max函数求出4个数据中的最大值并输出结果。
注意：参数传递的方式，要求swap函数能修改实参的值。

```cpp
#include <iostream>
using namespace std;

int max(int a, int b, int c, int d);
void swap(int &a, int &b);

int main() {
    int a, b, c, d;
    cout << "A.输入数据进行运算" << endl;
    cout << "B.输入“B”或者“b”表示退出循环，结束程序" << endl;
    cout << "请选择菜单选项：" << endl;
    char x;
    cin >> x;
    while (x=='A') {
        cout << "请输入4个数字：" << endl;
        cin >> a >> b >> c >> d;
        cout <<"4个数字中最大的数字是：" << max(a, b, c, d) << endl;
        cout << "A.输入数据进行运算" << endl;
        cout << "B.输入“B”或者“b”表示退出循环，结束程序" << endl;
        cout << "请选择菜单选项：" << endl;
        cin >> x;
    }
    return 0;
}

int max(int a, int b, int c, int d) {
    if (a > b)
        swap(a, b);
    if (b > c)
        swap(b, c);
    if (c > d)
        swap(c, d);
    return d;
}

void swap(int &a, int &b) {
    if (a > b) {
        int temp = a;
        a = b;
        b = temp;
    }
}
```

11. 编写一个带有默认参数的函数MAX求2个到4个正数的最大值，默认是2个数。输入数据时先输入需要比较的数据个数，再调用MAX函数计算输入数据的最大值并输出。
提示：函数声明形式为MAX（a,b,c,d），可以用负数作为默认参数并以此判断参数是否参与运算。

```cpp
#include <iostream>
using namespace std;

int MAX(int x = -1, int y = -1, int z = -1, int m = -1);
void swap(int& a, int& b);

int main() {
    int a=-1, b=-1, c=-1, d=-1;
    cout << "A.输入数据进行运算" << endl;
    cout << "B.输入“B”或者“b”表示退出循环，结束程序" << endl;
    cout << "请选择菜单选项：" << endl;
    char x;
    cin >> x;
    while (x == 'A') {
        cout << "请输入需要比较的数据个数：" << endl;
        int y;
        cin >> y;
        switch (y){
        case 2:
            cout << "请输入2个正数：" << endl;
            cin >> a >> b;
            cout << "2个正数中最大的数字是：" << MAX(a, b) << endl;
            cout << "A.输入数据进行运算" << endl;
            cout << "B.输入“B”或者“b”表示退出循环，结束程序" << endl;
            cout << "请选择菜单选项：" << endl;
            cin >> x;
            break;

        case 3:
            cout << "请输入3个正数：" << endl;
            cin >> a >> b >> c;
            cout << "3个正数中最大的数字是：" << MAX(a, b, c) << endl;
            cout << "A.输入数据进行运算" << endl;
            cout << "B.输入“B”或者“b”表示退出循环，结束程序" << endl;
            cout << "请选择菜单选项：" << endl;
            cin >> x;
            break;

        case 4:
            cout << "请输入4个正数：" << endl;
            cin >> a >> b >> c >> d;
            cout << "4个正数中最大的数字是：" << MAX(a, b, c, d) << endl;
            cout << "A.输入数据进行运算" << endl;
            cout << "B.输入“B”或者“b”表示退出循环，结束程序" << endl;
            cout << "请选择菜单选项：" << endl;
            cin >> x;
            break;
        }

    }
    return 0;
}

int MAX(int a, int b, int c, int d) {
    if (a > b)
        swap(a, b);
    if (b > c)
        swap(b, c);
    if (c > d)
        swap(c, d);
    return d;
}

void swap(int& a, int& b) {
    if (a > b) {
        int temp = a;
        a = b;
        b = temp;
    }
}
```

12. 使用同一个函数名add重载实现对两个整数、三个整数、两个实数、三个实数的相加，并在每次循环中完成对2个整数、3个整数、2个实数、3个实数、1个整数和2个实数、2个整数和1个实数的相加运算（要求参数全为整数的时候返回值类型是整数，参数有实数的时候返回值是实数），并求出数据的平均值（直接除以2或者3），说明平均值数据类型，在调用函数后面用注释说明调用的是哪个函数。输入数据时提示输入的数据类型。

```cpp
#include <iostream>
using namespace std;

int add(int a, int b) {
    return a + b;
}

int add(int a, int b, int c) {
    return a + b + c;
}

double add(double a, double b) {
    return a + b;
}

double add(double a, double b, double c) {
    return a + b + c;
}

double add(int a, double b) {
    return a + b;
}

double add(int a, int b, double c) {
    return a + b + c;
}

int main() {
    cout << "A.输入数据进行运算" << endl;
    cout << "B.输入“B”或者“b”表示退出循环，结束程序" << endl;
    cout << "请选择菜单选项：" << endl;
    char x;
    cin >> x;
    while (x == 'A') {
        int a, b, c;
        double d, e, f;
        cout << "请输入两个整数：" << endl;
        cin >> a >> b;
        cout << "调用函数：add(int, int)" << endl;
        cout << "两数之和为：" << add(a, b) << endl;
        cout << "平均值为：" << (a + b) / 2.0 << "，数据类型为：double" << endl;

        cout << "请输入三个整数：" << endl;
        cin >> a >> b >> c;
        cout << "调用函数：add(int, int, int)" << endl;
        cout << "三数之和为：" << add(a, b, c) << endl;
        cout << "平均值为：" << (a + b + c) / 3.0 << "，数据类型为：double" << endl;

        cout << "请输入两个实数：" << endl;
        cin >> d >> e;
        cout << "调用函数：add(double, double)" << endl;
        cout << "两数之和为：" << add(d, e) << endl;
        cout << "平均值为：" << (d + e) / 2.0 << "，数据类型为：double" << endl;

        cout << "请输入三个实数：" << endl;
        cin >> d >> e >> f;
        cout << "调用函数：add(double, double, double)" << endl;
        cout << "三数之和为：" << add(d, e, f) << endl;
        cout << "平均值为：" << (d + e + f) / 3.0 << "，数据类型为：double" << endl;

        cout << "请输入一个整数和一个实数：" << endl;
        cin >> a >> d;
        cout << "调用函数：add(int, double)" << endl;
        cout << "两数之和为：" << add(a, d) << endl;
        cout << "平均值为：" << (a + d) / 2.0 << "，数据类型为：double" << endl;

        cout << "请输入两个整数和一个实数：" << endl;
        cin >> a >> b >> d;
        cout << "调用函数：add(int, int, double)" << endl;
        cout << "三数之和为：" << add(a, b, d) << endl;
        cout << "平均值为：" << (a + b + d) / 3.0 << "，数据类型为：double" << endl<<endl;

        cout << "A.输入数据进行运算" << endl;
        cout << "B.输入“B”或者“b”表示退出循环，结束程序" << endl;
        cout << "请选择菜单选项：" << endl;
        cin >> x;
    }
    return 0;
}
```

# 第三章 类与对象

## 3.1 类和对象

### 3.1.1 类的定义

定义类的语法形式如下：

```cpp
class 类名称{
   public:
       外部接口
   protected:
       保护型成员
   private:
       私有成员
};
```

### 3.1.2 类成员的访问控制

1. 公有类型成员定义了类的外部接口；
2. 私有成员只能被本类的成员函数访问，来自类外部的任何访问都是非法的；
3. 保护类型成员的性质和私有成员的性质相似，其差别在于继承过程中对产生的新类影响不同，后面会详细介绍。

### 3.1.3 对象

声明一个对象和声明一个一般变量相同，采用以下的方式：

```cpp
类名 对象名;
例如：
Clock myClock;
```

定义了类及其对象，就可以访问对象的成员。例如，我们可以访问类`Clock`的对象`myClock`的函数成员`ShowTime()`，可以采用下面的代码：

```cpp
myClock.ShowTime()
```

在类的外部只能访问到类的公有成员；在类的成员函数中，可以访问到类的全部成员。

### 3.1.4 类的成员函数

1. 成员函数的实现
类的成员函数的具体形式为：

```cpp
返回值类型 类名::函数成员名（参数表）{
   函数体
}
```

例如：

```cpp
void Clock::ShowTime(){
   cout<<hour<<":"<<minute<<":"<<second<<endl;
}
```

成员函数调用时要有目的对象。

2. 带默认形参值的成员函数
类的成员函数也可以有默认形参值，其调用规则与普通函数相同。类成员函数的默认值，一定要写在类的定义中，而不能写在类定义之外的函数实现中。例如：

```cpp
class Clock{
   public:
       void setTime(int newH=0, int newM=0, int newS=0);
};
```

这样，如果调用这个函数时没有给出实参，就会按照默认形参值将时钟设置到午夜零点。

4. 内联成员函数
如果有的函数成员需要被频繁调用，而且代码比较简单，这个函数也可以被定义为内联函数。内联函数的声明有两种方式：
   - 将函数体直接放在类体内，这种方法称之为隐式声明；
   - 在类体外，在成员函数前面加上`inline`前缀，这种方法称之为显式声明。

## 3.2 构造函数和析构函数

### 3.2.1 构造函数

构造函数的作用就是在对象被创建时利用特定的值构造对象，将对象初始化为一个特定的状态。

构造函数的具体实现样式为：

```cpp
Clock::Clock(int newH,int newM,int newS){
   hour=newH;
   minute=newM;
   second=newS;
}
```

用法如下：

```cpp
int main(){
   Clock c(0,0,0);
}
```

### 3.2.2 拷贝构造函数

拷贝构造函数是一种特殊的构造函数，具有一般构造函数的所有特性，其形参是本类的对象的引用。其作用是使用一个已经存在的对象(由拷贝构造函数的参数指定)，去初始化同类的一个对象。

拷贝构造函数的功能是，把初始值对象的每个数据成员的值都复制到新建立的对象中。下面是声明和实现拷贝构造函数的具体方法：

```cpp
class Point{
   public:
   Point(Point &p);
};

Point::Point(Point &p){
   x=p.x;
   y=p.y;
}
```

普通构造函数是在对象创建时被调用，而复制构造函数在以下3种情况下都会被调用：

   - 当用类的一个对象去初始化该类的另一个对象时，例如`Point b(a),Point c=a`；
   - 如果函数的形参是类的对象，调用函数时进行形参和实参结合时，例如

```cpp
Point a(1,2);
f(a)；
```

   - 如果函数的返回值是类的对象，函数执行完成返回调用者时。

```cpp
Point a(1,2);
return a；
```

### 3.2.3 析构函数

简单来说，析构函数与构造函数的作用几乎正好相反，它用来完成对象被删除前的一些清理工作。析构函数是在对象的生存期即将结束的时刻被自动调用的。

与构造函数一样，析构函数通常也是类的一个公有函数成员，它的名称是由类名前面加“~”构成（例如`~Clock(){}`），没有返回值。和构造函数不同的是，析构函数不接受任何参数，如果不进行显式说明，系统也会生成一个函数体为空的隐含析构函数。

## 3.3 类的组合

我们直接以一个实例来了解，如下：

```cpp
class Line{
   public:
      Line(Point xp1,Point xp2);
      Line(Line &l);
      ~Line(){};
   private:
      Point p1,p2;  //Point类的对象作为Line类的成员
}
   //组合类的构造函数
   Line::Line(Point xp1,Point xp2):p1(xp1),p2(xp2){}
   //组合类的拷贝构造函数
   Line::Line(Line &l):p1(l.p1),p2(l.p2){}
   //调用组合类的构造函数
   Point myp1(1,1),myp2(4,5);
   Line l1(myp1,myp2);
   //调用组合类的拷贝构造函数
   Line l2(l1);
```

## 3.4 结构体和联合体（暂时省略，用到再说）

## 第三章问答题

1. 解释public和private的作用，公有类型成员与私有类型成员有些什么区别？
答： public定义类的外部接口，private将私有成员隐蔽在类中，保护了数据的安全性；
公有类型成员在类外可以被访问，私有类型成员只能被本类的成员函数访问，来自类外部的任何访问都是非法的。

2. 构造函数和析构函数有什么作用？
答：构造函数的作用就是在对象被创建时利用特定的值构造对象，将对象初始化为一个特定的状态。析构函数用来完成对象被删除前的一些清理工作。

3. 数据成员可以为公有的吗？成员函数可以为私有的吗？
答： 数据成员可以为公有，但这样做违背了面向对象编程中的封装原则；成员函数也可以声明为私有，这通常用于实现辅助功能，这些功能不需要被类的外部代码直接调用。例如，一些内部计算或帮助函数可能只在类的内部逻辑中使用，因此声明为私有是合适的。私有成员函数可以被类的其他成员函数调用，但不能被类的外部代码直接调用。

4. 已知class A中有数据成员int a，如果定义了A的两个对象A1、A2，它们各自的数据成员a的值可以不同吗？为什么？
答： 可以，因为每个对象都有自己的一套成员，并且每个对象的成员的内存空间都是互相独立的。

5. 什么叫做拷贝构造函数？拷贝构造函数何时被调用？
答： 拷贝构造函数是一类特殊的构造函数，其形参是本类型的对象的引用。其作用是使用一个已经存在的对象(由复制构造函数的参数指定)，去初始化同类的一个新对象。当用一个对象去初始化另一个对象时，拷贝构造函数被调用；如果函数的形参是类的对象，调用函数时，进行形参和实参的结合时，拷贝构造函数被调用；如果函数的返回值是类的对象，函数执行完成返回调用者时，拷贝构造函数被调用。

6. 一个类C的对象有类A和类B的对象作为数据成员，如下所示

```cpp
class A{
	int a;
public:
	A(int newA){
		a=newA;
}
……//其余代码
};
class B{
	int b;
public:
	B(int newB){
		b=newB;
}
……//其余代码
};
class C{
    B b; 
    A a;
……
};
```

那么类C的构造函数应该怎么编写？A、B、C构造函数的代码运行顺序会是怎样的？

答：

```cpp
C(int newB, int newA) : b(newB), a(newA) {}  //或者
C(B newb,A newa):b(newb),a(newa){}
```

构造函数的代码运行顺序为：B的构造函数、A的构造函数、C的构造函数

## 第三章作业题

1. 完成下述实验

    - 定义一个复数类Complex，私有数据成员为实部real、虚部imag，公有成员函数set用于设置实部与虚部的值、display用于显示复数的值、add用于两个复数相加并把结果存于调用对象
    - 增加构造函数、析构函数、拷贝析构函数（输出”正在构造值为......的复数”、“正在析构值为......复数”、“正在拷贝值为......复数”），使下面代码能够正常运行，并分析一共调用了几次构造函数、拷贝构造函数、析构函数（用注释在程序中回答，即在调用对应函数的代码后注释出来）。
Complex c1(3,5);//c1为3+5i
Complex c2(4);
Complex c3(c1);
c1.add(c2); //将c1和c2相加，并将结果保存在c1中
c1.display(); //输出c1，按“实部+虚部i”模式
c2.display(); //输出c2
c3.display(); //输出c3
c3.set(3,10);//设置c3的值是3+10i
c3.display(); //输出c3

```cpp
#include <iostream>
using namespace std;

class Complex {
private:
    double real;
    double imag;

public:
    // 构造函数
    Complex(double r=0 , double i=0 ) {
        real = r;
        imag = i;
        cout << "正在构造值为(" << real << " + " << imag << "i)的复数" << endl;
    }

    // 拷贝构造函数
    Complex(const Complex& c) {
        real = c.real;
        imag = c.imag;
        cout << "正在拷贝值为(" << real << " + " << imag << "i)的复数" << endl;
    }

    // 析构函数
    ~Complex() {
        cout << "正在析构值为(" << real << " + " << imag << "i)的复数" << endl;
    }

    // 设置复数的实部和虚部
    void set(double r, double i) {
        real = r;
        imag = i;
    }

    // 显示复数的值
    void display() const {
        cout << "(" << real << " + " << imag << "i)" << endl;
    }

    // 两个复数相加并把结果存于调用对象
    Complex& add(const Complex& c) {
        real += c.real;
        imag += c.imag;
        return *this;
    }
};

int main() {
    {
        Complex c1(3, 5);//第1次构造函数调用
        Complex c2(4);//第2次构造函数调用
        Complex c3(c1);//第3次构造函数调用，第1次拷贝构造函数调用
        c1.add(c2); //将c1和c2相加，并将结果保存在c1中
        c1.display(); //输出c1，按“实部+虚部i”模式
        c2.display(); //输出c2
        c3.display(); //输出c3
        c3.set(3, 10);//设置c3的值是3+10i
        c3.display(); //输出c3
        // 第一次析构函数调用(c3),第2次析构函数调用(c2)，第3次析构函数调用(c1)
    }
    system("PAUSE");
    return 0; 
}
/*综上所述，构造函数被调用了3次，拷贝构造函数被调用了1次，析构函数被调用了3次。*/
```


2. 类的组合实验

    - 声明一个 CPU 类，包含等级（rank）、频率（frequency）、电压（voltage）等属性， 有两个公有成员函数 run、stop。其中，rank 为枚举类型 CPU_Rank，声明为 enum CPU_Rank {P1=1,P2,P3,P4,P5,P6,P7}，frequency 为单位是 MHz 的整型数，voltage 为浮点型的电压值。
    - 声明一个DATE结构体，包含year、month、day数据成员。
    - 声明一个RAM类（一个数据成员为RAM容量，GB为单位）和一个HARDDISK类（一个数据成员为硬盘大小，GB为单位）。
    - 声明一个简单的 Computer 类，有数据成员芯片（cpu）、内存（ram）、硬盘（harddisk）、生产日期等等，有两个公有成员函数 run、stop。cpu 为 CPU 类的一个对象，ram 为 RAM 类的一个对象，harddisk为HARDDISK类对象。
构建Computer对象时需要设置生产日期、CPU信息、内存大小、硬盘大小。
    - 每种类型都有一个启动运行Run函数与停止Stop函数，Run函数输出自己的数据，Stop函数只是输出停止工作信息即可。
    - 每个类型都有构造函数和析构函数，构造函数输出构造的参数信息，析构函数输出正在析构的类型。
    - 主程序中定义一个Computer对象，运行其run函数，然后运行stop函数。
    - 总结类的组合的情况下，构造函数、析构函数的执行顺序（在程序中用注释回答你的代码中各个构造函数的调用顺序）。
提示：检查析构函数用块语句。

```cpp
#include<iostream>
using namespace std;

enum CPU_Rank { P1 = 1, P2, P3, P4, P5, P6, P7 };

class CPU {
	CPU_Rank rank;
	int frequency;
	float voltage;
public:
	CPU(CPU_Rank r, int f=0, float v=0) {
		rank = r;
		frequency = f;
		voltage = v;
		cout << "CPU Constructing:\nRank=" << rank << " Frequency=" << frequency << "MHz Volt=" << voltage << "V" << endl;
	}

	CPU(CPU& c) {
		rank = c.rank;
		frequency = c.frequency;
		voltage = c.voltage;
		cout << "CPU Copy Constructing:\nRank=" << rank << " Frequency=" << frequency << "MHz Volt=" << voltage << "V" << endl;
	}

	void run() {
		cout << "CPU is running...\nRank=" << rank << " Frequency=" << frequency << "MHz Volt=" << voltage << "V" << endl;
	}

	void stop() {
		cout << "CPU is stopping...\nRank=" << rank << " Frequency=" << frequency << "MHz Volt=" << voltage << "V" << endl;
	}

	~CPU() {
		cout << "CPU is Destroying...\nRank=" << rank << " Frequency=" << frequency << "MHz，Volt=" << voltage << "V" << endl;
	}
};

struct DATE {
	int year;
	int month;
	int day;

	DATE(int y, int m, int d) {
		year = y;
		month = m;
		day = d;
	}
};

class RAM {
public:
	int ramsize;

	RAM(int rams = 0) {
		ramsize = rams;
		cout << "RAM Construction:\nSize=" << ramsize << "GB" << endl;
	}

	RAM(RAM& c) {
		ramsize = c.ramsize;
		cout << "RAM Copy Construction:\nSize=" << ramsize << "GB" << endl;
	}

	void run() {
		cout << "RAM is running...\nSize= " << ramsize << " GB" << endl;
	}

	void stop() {
		cout << "RAM is stopping...\nSize = " << ramsize << "GB" << endl;
	}

	~RAM() {
		cout << "RAM size=" << ramsize << "GB" << "is Destroying..." << endl;
	}
};

class HARDDISK {
	int disksize;
public:
	HARDDISK(int disks = 0) {
		disksize = disks;
		cout << "HARDDISK Construction:\nSize=" << disksize << "GB" << endl;
	}

	HARDDISK(HARDDISK& c) {
		disksize = c.disksize;
		cout << "HARDDISK Copy Construction:\nSize=" << disksize << "GB" << endl;
	}

	void run() {
		cout << "HARDDISK is running...\nSize=" << disksize << "GB" << endl;
	}

	void stop() {
		cout << "HARDDISK is stopping...\nSize=" << disksize << "GB" << endl;
	}

	~HARDDISK() {
		cout << "HARDDISK size=" << disksize << "GB" << "is Destroying..." << endl;
	}
};

class Computer {
	CPU cpu;
	RAM ram;
	HARDDISK harddisk;
	DATE buildday;
public:
	Computer(CPU c, RAM r, HARDDISK d, int year, int month, int day):cpu(c), ram(r), harddisk(d), buildday(year,month,day){
		buildday.year = year;
		buildday.month = month;
		buildday.day = day;
		cout << "Computer Object Construction..." << endl;
	}
	Computer(CPU_Rank r = P1, int f = 0, float v = 0, int ramsize = 0, int disksize = 0, int year = 0, int month = 0, int day = 0) :
		cpu(r, f, v), ram(ramsize), harddisk(disksize), buildday(year, month, day) {
		buildday.year = year;
		buildday.month = month;
		buildday.day = day;
		cout << "Computer Parameters Construction..."<< endl;
	}
	Computer(Computer& c) : cpu(c.cpu), ram(c.ram), harddisk(c.harddisk), buildday(c.buildday) {
		buildday.year = c.buildday.year;
		buildday.month = c.buildday.month;
		buildday.day = c.buildday.day;
		cout << "Computer Copy Parameters Construction..." << endl;
	}

	void run() {
		cpu.run();
		ram.run();
		harddisk.run();
		cout << "Computer is running..." << "Builddate is" << buildday.year << "-" << buildday.month << "-" << buildday.day << endl;
	}
	void stop() {
		cout << "Computer is stopping..." << "Builddate is" << buildday.year << "-" << buildday.month << "-" << buildday.day << endl;
		harddisk.stop();
		ram.stop();
		cpu.stop();
	}
	~Computer() {
		cout << "Computer is Destroying..." << "Builddate is" << buildday.year << "-" << buildday.month << "-" << buildday.day << endl;
	}
};

int main() {
	{
		Computer c1(P5, 3, 5.0, 4, 1000, 2010, 12, 1);//调用CPU，RAM，HARDDISK，Computer的构造函数
		Computer c2(c1);//调用CPU，RAM，HARDDISK，Computer的拷贝构造函数
		c1.run();
		c2.run();
		c1.stop();
		//全部运行完后调用Computer，HARDDISK，RAM，CPU析构函数，重复这个过程两次，分别析构c2，c1
	}
	system("pause");
}
```

# 第四章 数据的保护与共享

## 4.1 标识符的作用域与可见性

## 4.2 对象的生存期

### 4.2.1 静态生存期

如果对象的生存期与程序的运行期相同，则称它具有静态生存期。在命名空间作用域中声明的对象都是具有静态生存期的。如果要在函数内部的局部作用域中声明具有静态生存期的对象，则要使用关键字`static`，例如`static int i;`。

局部作用域中静态变量的特点是，它并不会随着每次函数调用而产生一个副本，也不会随着函数的返回而失效。也就是说，当一个函数返回后，下一次再调用时，该变量还会保持上一回的值。

在定义静态变量的同时也可以为它赋初值，例如：

```cpp
static int i=5;
```

这表示 i 会被赋予 5 初始化，而非每次执行函数时都将 i 赋值为 5 。

### 4.2.2 动态生存期

除了上述两种情况，其余的对象都具有动态生存期。在局部作用域中声明的具有动态生存期的对象，习惯上也称为局部生存期对象。局部生存期对象诞生于声明点，结束语声明所在的块执行完毕之时。

例如，函数中的局部变量具有动态生存期，在每次进入函数时都会初始化。

## 4.3 类的静态成员 

静态成员是解决同一个类的不同对象之间数据和函数共享问题的。

### 4.3.1 静态数据成员

面向对象方法中还有“类属性”的概念。如果某个属性为整个类所共有，不属于任何一个具体对象，则采用`static`关键字来声明为静态成员。静态成员在每个类只有一个副本，由该类的所有对象共同维护和使用，从而实现了同一类的不同对象之间的数据共享。类属性是描述类的所有对象共同特征的一个数据项，对于任何对象实例，它的属性是相同的。

我们可以在`private:`中声明静态数据成员，形如`static int count;`我们还可以对静态数据成员进行初始化，例如：

```cpp
int Point::count=0;    //静态数据成员定义和初始化，使用类名限定
```

### 4.3.2 静态函数成员

由于`count`是为整个类共有的，不属于任何对象，因此我们自然会希望对`count`的访问也不要通过对象。但我们知道，对普通函数成员的调用必须通过对象名。

为了实现上面的目的，我们可以使用静态成员函数。静态成员函数可以直接访问该类的静态数据成员和函数成员。而访问非静态成员，必须通过对象名。

以下是一个定义和使用的实例：

```cpp
public:
static void showcount(){
   cout<<count<<endl;     //静态成员函数的定义
}

Point::shoucount();       //静态成员函数的调用
```

事实上，在主函数中既可以使用类名也可以使用对象名来调用静态成员函数。

## 4.4 类的友元

友元关系提供了不同类或对象的成员函数之间、类的成员函数与一般函数之间进行数据共享的机制。通过友元关系，一个普通函数或者类的成员函数可以访问封装于另外一个类中的数据。

### 4.4.1 友元函数 

友元函数是在类中用关键字`friend`修饰的非成员函数。友元函数可以是一个普通的函数，也可以是其他类的成员函数。虽然它不是本类的成员函数，但是在它的函数体中可以通过对象名访问类的私有和保护成员。

具体地，我们需要在类内部声明友元函数，然后可以在类外具体实现。比如 

```cpp
class Point{
   public:
      friend float dist(Point &p1,Point &p2);  //友元函数声明
   ···
}；

float dist(Point &p1,Point &p2){  //友元函数实现
   double x=p1.x-p2.x;
   double y=p1,y-p2.y;
   return static_cast<float>(sqrt(x*x+y*y));
}
```

### 4.4.2 友元类

若类A是类B的友元类，则A类的所有成员函数都是B类的友元函数，都可以访问B类的私有和保护成员。声明友元类的语法形式为：

```cpp
class B{
   ···
   friend class A;
   ···
};
```

值得注意的是：

 - 友元关系是不能传递的，B类是A类的友元，C类是B类的友元，C类和A类之间，如果没有声明，就没有任何友元关系，不能进行数据共享；
 - 友元关系是单向的，如果声明B类为A类的友元，B类的成员函数就可以访问A类的私有和保护数据，但是A类的成员函数却不能访问B类的私有、保护数据。
 - 友元关系是不被继承的，如果类B是类A的友元，类B的派生类并不会自动成为类A的友元。

## 4.5 共享数据的保护

### 4.5.1 常对象

常对象是这样的对象：它的数据成员值在对象的整个生存期间内不能被改变。也就是说，常对象必须进行初始化，且不能被更新。声明常对象的语法形式为：

```cpp
const 类型说明符 对象名；
```

例如，下面我们声明了类型A的一个常对象a：

```cpp
const A a(3,4);
```

### 4.5.2 用const修饰的类成员

1. 常成员函数
使用const修饰的函数为常成员函数，其声明格式如下：

```cpp
类型说明符 函数名（参数表） const；
```

注意：

 - const是函数类型的一个组成部分，因此在函数的定义部分也要带着const关键字；4
 - 如果将一个对象说明为常对象，则通过该常对象只能调用它的常成员函数，而不能通过其他成员函数。
 - 常成员函数也不能更改目的常对象的数据成员。实际上，常成员函数不能更改任何数据成员。
 - const关键字可以用于对重载函数的区分，加后缀const和不加后缀const的两个函数可以作为有效的重载函数。

下面是一个应用实例：

```cpp
void R::print() const{
   cout<<r1<<";"<<r2<<endl;
}

int main(){
   const R b(20,52);  //声明且初始化一个常数据对象
   b.print()  //调用void print() const
}
```

2. 常数据成员
就像一般数据一样，类的成员数据也可以是常量，使用const说明的数据成员为常数据成员。如果在一个类中说明了常数据成员，那么任何函数中都不能对该成员赋值。构造函数对该数据成员进行初始化，就只能通过初始化列表。下面是具体实例。

```cpp
class A{
   public:
      A(int i):a(i){};
      ···
   private:
      const int a;
      static const b;
};

const int A::b=10;  //静态常数据成员在类外说明和初始化
A a1(100),a2(0);  //通过构造函数对静态数据成员赋初值
```

### 4.5.3 常引用

如果在声明时用const修饰，被声明的引用就是常引用。常引用所引用的对象不能被更新。如果用常引用作形参，就不会意外地发生对实参的更改。常引用的声明形式如下：

```cpp
const 类型说明符 &引用名；
```

## 4.6 多文件结构和编译预处理命令

### 4.6.1 外部变量与外部函数

1. 外部变量
命名空间作用域中定义的变量，默认情况下都是外部变量。在其他文件想要使用外部变量，需要用到`extern`关键字加以声明。例如，在某文件中定义了`int i;`，那么，在另一个文件中想使用它，需要用`extern int i;`进行处理。
2. 外部函数
所有类之外声明的函数，都是具有命名空间作用域的，如果没有特殊说明，这样的函数都可以在不同的编译单元中被调用，只要在调用之前声明函数原型即可。当然，也可以用`extern`修饰，效果是一样的。
3. 将变量和函数限制在编译单元内
应当将并不希望被其他编译单元引用的函数和变量放在匿名的命名空间中。如下：

```cpp
namespace{
   int n;
   void f(){
      n++;
   }
}
```

### 4.6.2 编译预处理

1. `include`指令
作用是将另一个源文件嵌入到当前源文件中该点处。通常用`#include`指令来嵌入头文件。文件包含指令有以下两种形式：

   - `#include <文件名>`：按标准方式搜索，文件位于系统目录的 include 子目录下。
   - `#include "文件名"`：首先在当前目录中搜索，再按标准方式搜索。

另外，该指令可以嵌套使用，即在头文件中，你仍然可以使用该指令嵌入其他头文件。

2. `#define`与`#undef`指令
`#define`可以用来定义符号常量，如 

```cpp
#define PI 3.1415926
```

`#undef`的作用是删除已定义的宏，使之不再起作用。

3. 条件编译指令
使用条件编译指令，可以限定程序中的某些内容要在满足一定条件的情况下才被编译。常见的条件编译语句有下列五种形式。

```cpp
//形式1
#if 常量表达式
   程序段  //当常量表达式非零时编译此程序段
#endif
//形式2
#if 常量表达式
   程序段1  //当常量表达式非零时编译此程序段
#else
   程序段2  //当常量表达式为零时编译此程序段
//形式3
#if 常量表达式1
   程序段1  //当常量表达式非零时编译此程序段
#elif 常量表达式2
  程序段2  //当1为零而2非零时编译此程序段
#else
  程序段3  //前面的常量表达式都是零时编译此程序段
#endif
//形式4
#ifdef 标识符
  程序段1  //标识符被#define定义过且未被#undef删除，则编译此程序段1
#else
  程序段2  //否则编译程序段2
#endif
//形式5
#ifndef 标识符
  程序段1  //标识符未被#define定义则编译此程序段1
#else
  程序段2  //否则编译程序段2
#endif
```

4. `defined`标识符
具体来说，下面两种方式是等价的：

```cpp
#ifndef MYHEAD_H
#if!defined(MYHEAD_H)
```

另外，由于`#include`的嵌套使用，可能出现某个头文件被包含了两次的情况，这会导致类的重定义，为了避免这种情况，我们可以在可能被重复的头文件中使用条件编译指令。例如，我们在头文件head.h中使用：

```cpp
#ifndef HEAD_H
#define HEAD_H
   ···
class Point{
   ···
}
   ···
#endif
```

在这个头文件中，首先判断标识符`HEAD_H`是否被定义过，若是定义过，后面的文件就参与过编译了，因此就不再重复编译。

## 第四章问答题

暂未获得。

## 第四章作业题

1. 用注释说明变量x，y的变化

```cpp
#include <iostream>
using namespace std;


void fn1();
int x = 1, y = 2;//x的值变为1，y的值变为2，这在全局中生效


int main()
{
	cout << "Begin..." << endl;
	cout << "x = " << x << endl;
	cout << "y = " << y << endl;
	cout << "Evaluate x and y in main()..." << endl;
	int x = 10, y = 20;//在主函数main（）里面，x的值变为10，y的值变为20，不影响main（）函数之外的区域的x，y值
	cout << "x = " << x << endl;
	cout << "y = " << y << endl;
	cout << "Step into fn1()..." << endl;
	fn1();//在函数fn1（）中，x的值为1，y的值变为200，但不会影响main（）函数中的x，y值
	cout << "Back in main" << endl;
	cout << "x = " << x << endl;
	cout << "y = " << y << endl;
	return 0;
}
void fn1()
{
	int y = 200;
	cout << "x = " << x << endl;
	cout << "y = " << y << endl;
}
/*
在程序开始时，全局变量x和y被初始化为1和2。
在main()函数中，局部变量x和y被声明并初始化为10和20，它们在main()函数内部遮蔽了全局变量x，y的值，但对main()之外的区域的x，y的值没有影响。
在fn1()函数中，局部变量y被声明并初始化为200，这仅仅改变了fn1()函数内部的y值，对函数外的y值没有影响。而x没有被声明，所以fn1()中的x引用的是全局变量x，其值为1。
fn1()函数的执行并没有改变main()中的局部变量的值，因此main()中的局部变量x和y的值分别为10和20。
*/
```

2.	在一个文件中定义一个全局变量 n，主函数 main()，函数fn1()、fn2()，在 fn1()中也对 n 赋值30，在fn2()中也定义一个变量n，对n赋值20，在 main()中对n赋值10，再依次调用 fn1()、fn2()，显示 n 最后的值。（在程序最后用注释说明变量n的生存期和变化过程）

```cpp
#include<iostream>
using namespace std;

void fn1();
void fn2();
int n;

int main() {
	n = 10;
	fn1();
	fn2();
	cout << "n最后的值是：" << n << endl;
	return 0;
}

void fn1() {
	n = 30;
}

void fn2() {
	int n;
	n = 20;
}
/*
全局变量n的生存期从程序开始一直持续到程序结束。
在main()函数中，n被初始化为10。
调用fn1()后，全局变量n的值变为30。
调用fn2()时，定义了一个同名的局部变量n，但这个n与全局变量n不是同一个变量，所以全局变量n的值不变。
程序结束时，n的值为30。
*/
```

3.	在函数 fn1()中定义一个静态变量 n，fn1()中对 n 的值加 1，在主函数中，调用 fn1()十次，显示 n 的值。（在程序最后用注释说明变量n的生存期和变化过程）

```cpp
#include<iostream>
using namespace std;

void fn1();

int main() {
	for (int i = 0; i < 10; i++) { fn1(); }
	return 0;
}

void fn1() {
	static int n = 0;
	n++;
	cout << "n的值是：" << n << endl;
}
/*
	静态变量n的生存期与程序的生存期相同，从fn1()第一次被调用开始初始化为0，
	之后每次调用fn1()，n的值都会增加1，并且保持这个值直到下一次调用。
	由于n是静态的，它的值在函数调用结束后不会消失，所以调用fn1()十次后，
	n的值将变为10。
*/
```

4. 实现客户机（Client）类，数据成员都是私有，成员函数都是公有访问：
  - 声明字符型静态数据成员ServerName，用以保存其服务器名称，初值为空格；
  - 声明整型静态数据成员ClientNum，记录已定义的客户数量；
  - 声明字符型数据成员Name，用以保存本地计算机名称，初值为空格；
  - 定义无参构造函数，注意对ClientNum增一；
  - 定义构造函数Client(char local),参数为客户机名称，注意对ClientNum增一；
  - 定义静态函数changeServerName(char s)改变服务器名称；
  - 定义成员函数SetName(char local)，修改本地计算机名称；
  - 定义信息显示函数DisplayInfo()，输出服务器名称，客户机名称，客户机数量，注意要有提示信息，如“ServerName:a；LocalName：x；ClientNum：3”；
  - 定义析构函数，对ClientNum减一；
  - 在头文件Client.h中声明类CLIENT，在文件Client.cpp中实现（注意静态数据成员的初始化），在文件test.cpp中测试这个类，观察相应的成员变量取值的变化情况。
提示：多文件结构需要建立Console Application工程，有的版本Dev-C++中“工程”也叫做“项目”，注意头文件不能放到工程（项目）中，而是使用#include编译预处理命令引入。
  - 在主程序中用注释写出输出结果，说明ServerName、LocalName、ClientNum为什么是这个值。

```cpp
//client.h
#ifndef CLIENT_H
#define CLIENT_H

#include <iostream>

class Client {
private:
    static char ServerName;
    static int ClientNum;
    char Name;

public:
    Client();
    Client(char local);
    static void changeServerName(char s);
    void SetName(char local);
    void DisplayInfo();
    ~Client();
};

#endif

//client.cpp
#include "Client.h"
using namespace std;

char Client::ServerName = ' ';
int Client::ClientNum = 0;

Client::Client() {
	ClientNum++;
}

Client::Client(char local) : Name(local) {
	ClientNum++;
}

void Client::changeServerName(char s) {
	ServerName = s;
}

void Client::SetName(char local) {
	Name = local;
}

void Client::DisplayInfo() {
	cout << "ServerName:" << ServerName << endl;
	cout << "LocalName:" << Name << endl;
	cout << "ClientNum:" << ClientNum << endl;
}

Client::~Client() {
	ClientNum--;
}

//test.cpp
#include "Client.h"
using namespace std;

int main() {
	Client c1,c2('x');//调用2次构造函数，ClientNUm=2，c2的Nmae变成x 
	cout<<"c1 change Server："<<endl;
	c1.changeServerName('a');//将静态常数据成员ServerName变成a 
	c1.SetName('y');//将c1的Name变成y 
	cout<<"c1 Info:"<<endl;
	c1.DisplayInfo();//此时输出常数据成员ServerName、c1的Name和常数据成员ClientNum，分别为a、y、2 
	cout<<"c2 Info:"<<endl;
	c2.DisplayInfo();//此时输出常数据成员ServerName、c2的Name和常数据成员ClientNum，分别为a、x、2
	cout<<endl;

	cout<<"c2 change Server："<<endl;
	c2.changeServerName('b');//将静态常数据成员ServerName变成b 
	cout<<"c1 Info:"<<endl;
	c1.DisplayInfo();//此时输出常数据成员ServerName、c1的Name和常数据成员ClientNum，分别为b、y、2 
	cout<<"c2 Info:"<<endl;
	c2.DisplayInfo();//此时输出常数据成员ServerName、c2的Name和常数据成员ClientNum，分别为b、x、2
	cout<<endl;

	cout<<"Client change Server:"<<endl;
	Client::changeServerName('c');//将静态常数据成员ServerName变成c 
	cout<<"c1 Info:"<<endl;
	c1.DisplayInfo();//此时输出常数据成员ServerName、c1的Name和常数据成员ClientNum，分别为c、y、2 
	cout<<"c3 Info:"<<endl;
	c2.DisplayInfo();//此时输出常数据成员ServerName、c2的Name和常数据成员ClientNum，分别为c、x、2
	cout<<endl;

	{
		Client c3('z');//调用构造函数，使得c3的Name变成z，并使得ClientNum增加1，变成3 
		cout<<"c3 change Server："<<endl;
		c3.changeServerName('d');//将静态常数据成员ServerName变成d 
		cout<<"c3 Info:"<<endl;
		c3.DisplayInfo();//此时输出常数据成员ServerName、c3的Name和常数据成员ClientNum，分别为d、z、3 
		
		cout<<"c1 Info:"<<endl;
		c1.DisplayInfo();//此时输出常数据成员ServerName、c1的Name和常数据成员ClientNum，分别为d、y、3 
		cout<<"c2 Info:"<<endl;
		c2.DisplayInfo();//此时输出常数据成员ServerName、c2的Name和常数据成员ClientNum，分别为d、x、3 	
		//此时调用析构函数，析构掉c3，因此ClientNum-1，变成2	
	}	
	
	cout<<endl;
	cout<<"After c3:"<<endl;
	cout<<"c1 Info:"<<endl;
	c1.DisplayInfo();//此时输出常数据成员ServerName、c1的Name和常数据成员ClientNum，分别为d、y、2 
	cout<<"c2 Info:"<<endl;
	c2.DisplayInfo();//此时输出常数据成员ServerName、c2的Name和常数据成员ClientNum，分别为d、x、2
	
	return 0;
}
```

# 第五章 数组、指针和字符串

## 5.1 数组

### 5.1.1 数组的声明和初始化

可以直接用一个例子来理解：

```cpp
#include<iostream>
using namespace std;
int main(){
   int a[10],b[10];
   for (int i=0;i<10;i++){
      a[i]=i*2-1;
      b[10-i-1]=a[i];
   }
   for(int i=0;i<10;i++){
      cout<<"a["<<i<<"]"<<a[i]<<endl;
      cout<<"b["<<i<<"]"<<b[i]<<endl;
   }
   return 0;
}
```

### 5.1.2 数组的存储和初始化

1. 数组的存储
数组元素在内存中是顺序、连续存储的。
2. 数组的初始化
数组的初始化就是在声明数组时给部分或者全部元素赋初值。对于一维数组，有以下几种初始化的写法：

```cpp
int a[3]={1,2,3};  //对全部元素赋初值
int a[]={1,2,3};  //对全部元素赋初值，与上面等价
float a[5]={1.0,2.0,3.0}  //对部分元素赋初值
const float fa[5]={1.0,2.0,3.0};  //数组也可以被声明为常量
```

对于二维的数组，有以下几种写法：

```cpp
int a[2][3]={1,0,0,0,1,0}  //输入了6个元素，对全部元素赋初值
int a[][3]={1,0,0,0,1,0}  //与上面的形式等价
int a[2][3]={{1,0,0},{0,1,0}}  //按第一维下标分组赋初值
```

### 5.1.3 数组作为函数参数

将数组作为函数参数定义函数时，一般不指定数组第一维的大小，即使指定，也会被
忽略，下面是一个例子：

```cpp
//计算二维数组a每行元素的值的和，nRow是行数。
void rowSum(int a[][b],int nRow){
    for(int i=0;i<nRow;i++){
        for(int j=1;j<4;j++) a[i][0]+=a[i][j];
    }
}
```

当我们想调用该函数时，可以这样写：

```cpp
int table[3][4]={{1,2,3,4},{2,3,4,5},{4,5,6,7}};  //先定义一个数组作为参数
rowSum(table,3);  //数组作参数调用不必加下标，直接写table即可
```

### 5.1.4 对象数组

声明一个一维对象数组的语句形式是：

```cpp
类名 数组名[常量表达式]；
```

例如，我们可以声明并初始化一个对象数组为

```cpp
Location a[2]={Location(1,2),Location(3,4)};
```

你也可以只给出部分数组元素的初始值，例如

```cpp
Location a[2]={Location(1,2)};
```

这样系统会调用默认构造函数初始化第二个数组元素。

## 5.2 指针

### 5.2.1 指针变量的声明

指针变量声明的语法形式是：

```cpp
数据类型 *标识符;
```
这是一个实例：

```cpp
int* ptr;
```

### 5.2.2 与地址相关的运算“*”和“&”

这两个地址运算符的作用分别是：

  - “*” 是指针运算符，表示获取指针所指向的变量的值，例如，`*ptr`代表指针 `ptr`指向的`int`型数据的值。
  - “&”为取地址运算符，用来得到一个对象的地址。

应该注意“&”符号有不同的含义。当它出现在变量声明语句中位于被声明的
变量左边时，表示声明的是引用，例如：

```cpp
int &i;  //声明一个int型的引用i
```

如果“&”在给变量赋初值时出现在等好的右边或者在执行语句中作为一元运算符
出现时，表示取对象的地址，例如：

```cpp
int a,b;
int *pa,*pb=&b;
pa=&a;
```

### 5.2.3 指针的赋值

与其它类型的变量一样，对指针赋值也有两种方法，如下所述：

  - 在定义指针的同时进行初始化赋值，其语法形式为：`存储类型 数据类型 *指针名=初始地址;`
  - 在定义之后，单独使用赋值语句。赋值语句的语法形式为：`指针名=地址;`

对于一般的情况，我们可以用“&”符号取地址，然后赋值给指针。

如果使用对象地址作为指针的初值，或在赋值语句中将对象地址赋给指针变量，该对象必须在赋值之前就已经声明过，而且这个对象应该和指针类型一致。也可以使用一个已经赋值的指针去初始化另一个指针，这就是说，可以使多个指针指向同一个变量。

一个数组，可以用它的名称直接表示它的起始地址。数组名称实际上就是一个不能被赋值的指针，即指针常量。例如下面的语句：

```cpp
int a[10];  //定义int型数组
int *ptr=a;  //定义并初始化int型指针
```

另外，0专用于表示空指针，也就是一个不指向任何有效地址的指针。因此你可以直接将0赋值给指针，但是不能将非零整数赋值给指针。

关于指针的类型，还应该注意以下几点：

  - 可以声明指向常量的指针，此时不能通过指针来改变所指对象的值，但指针本身可以改变，可以指向另外的对象。例如：

```cpp
int a;
const int*p1=&a;  //p1是指向常量的指针
int b;
p1=&b;  //正确，p1本身的值可以改变
*p1=1;  //编译时出错，不能通过p1改变所指的对象
```

使用指向常量的指针，可以确保指针所指向的常量不被意外更改。如果用一般指针存放常量的地址，编译器就不能确保指针所指的对象不被更改。

  - 可以声明指针类型的常量，这时指针本身的值不能被改变。例如：

```cpp
int *const p2=&a;
p2=&b;  //错误，p2是指针常量，其值不能改变
```

  - 一般情况下，指针的值只能赋给相同类型的指针。但是有一种特殊的`void`类型指针，可以存储任何类型的对象地址，就是说任何类型的指针都可以赋值给`void`类型的指针变量。经过使用类型的显示转换，通过`void`类型的指针便可以访问任何类型的数据。

### 5.2.4 指针运算

有指针`p1`和整数`n1`，那么可以进行这样的运算：

```cpp
*(p1+n1)  //代表p1当前所指位置后方n1个数的内容
*p1[n1]  //与上面的表述是等价的
p1++  //表示指针当前所指位置的下一个的地址
p1--  //表示当前位置前一个的地址
```

### 5.2.5 用指针处理数组元素
如果有一个数组：`int array[5]`，那么数组名`array`就是数组的首地址，即`array`与`&array[0]`等同，`*array=array[0]`，`*(array+3)=array[3]`。有了这个内容，我们可以使用指针处理数组元素，例如，我们可以有下面额外的两种方式输出数组的内容：

```cpp
int a[10]={1,2,3,4,5,6,7,8,9,0};
//第一种方式：使用数组名和指针运算
for(int i=0;i<10;i++) cout<<*(a+i)<<"   ";
//第二种方式：指针变量
for(int *p=a;p<(a+10);p++) cout<<*p<<"   ";
```

### 5.2.6 指针数组

如果一个数组的每个元素都是指针变量，这个数组就是指针数组。指针数组的每个元素都必须是同一类型的指针。

声明一维指针数组的语法形式为：

```cpp
数据类型*数组名 [下标表达式];
```

下标表达式指出数组元素的个数，数据类型确定每个元素指针的类型，数组名是指针数组的名称，同时也是这个数组的首地址。

下面是一个例子：
```cpp
int line1[]={1,0,0};
int line2[]={0,1,0};
int line3[]={0,0,1};

int *pline[3]={line1,line2,line3};
for(int i=0;i<3;i++){
    for(int j=0;j<3;j++) cout<<pline[i][j]<<"  ";
    cout<<endl;
}
```

这样就可以定义并输出一个指针数组。实际上`pline[i][j]`等同于`*(pline[i]+j)`，实际上是把对应的元素的地址加了`j`个然后取其内容，例如，`pline[0]+j`就代表`line1+1`，指的是数组`line1`的第2个元素的地址，`pline[0][1]`即`*(pline[0]+1)`，代表数组`line1`的第2个元素的地址的内容。

另外，对于一个二维数组`array2[2][3]`，我们可以用`*(*(array2+i)+j)`表示该数组在第i行第j列的元素，对应于下标表示的`array2[i][j]`。

### 5.2.7 用指针作为函数参数

例如，我们可以用指针将实数x分为整数部分和小数部分：

```cpp
void splitfloat(float x,int *intpart,int *fracpart){
    *intpart=static_cast<int>x;
    *fracpart=x-*intpart;
}

splitfloat(x,&n,&f);  //调用时变量地址作为实参
```
### 5.2.8 指针型函数

返回值是指针的函数为指针型函数，其形式为：

```cpp
数据类型 *函数名（参数表）{
    函数体
}
```

### 5.2.9 指向函数的指针

函数指针就是专门用来存放函数代码首地址的变量。在程序中可以像使用函数名一样使用指向函数的指针来调用函数。暂且省略，有点难懂。

### 5.2.10 对象指针

1. 对象指针的一般概念
声明对象指针的一般语法形式为：
```cpp
类名*对象指针名；
```
例如 
```cpp
Point*PointPtr;  //声明Point类的对象指针变量PointPtr
Point p1;  //声明Point类的对象p1
PointPtr=&p1;  //将对象p1的地址赋给PointPtr
```

通过对象指针访问对象成员的语法形式为：
```cpp
对象指针名->成员名  //这等价于 (*对象指针名).成员名
```
2. `this`指针

在C++中，`this`是一个指针，用于指向正在被成员函数操作的对象。每个非静态成员函数都被隐式地传递了一个名为`this`的指针参数，指向调用该成员函数的对象。使用`this`指针可以访问类的私有成员，也可以用来区分成员变量和参数。

以下是一些`this`指针的使用场景：

  - 访问成员变量：
   当成员函数的参数名与类的成员变量名相同时，可以使用`this`指针来区分它们。

   ```cpp
   class MyClass {
   public:
       int value;
       void setValue(int value) {
           this->value = value; // 使用this指针来访问成员变量
       }
   };
   ```

  - 返回对象本身：
   成员函数可以返回`*this`来返回对象的引用。

   ```cpp
   class MyClass {
   public:
       MyClass& doSomething() {
           // ... do something with the object
           return *this; // 返回对象的引用
       }
   };
   ```

  - 链式调用：
   通过返回`*this`，可以支持链式调用。

   ```cpp
   class MyClass {
   public:
       MyClass& setValue(int value) {
           this->value = value;
           return *this; // 返回对象的引用，支持链式调用
       }
   };

   MyClass obj;
   obj.setValue(10).doSomething(); // 链式调用
   ```

  - 区分成员变量和局部变量：
   当成员函数中有局部变量和成员变量同名时，`this`指针可以明确指出要访问的是成员变量。

   ```cpp
   class MyClass {
   private:
       int value;
   public:
       void setValue(int value) {
           this->value = value; // 设置成员变量
       }
       void printValue() {
           cout << this->value << endl; // 打印成员变量
       }
   };
   ```

  - 在构造函数中使用：
   `this`指针也可以在构造函数中使用，尤其是在初始化列表中。

   ```cpp
   class MyClass {
   public:
       MyClass(int initialValue) : value(initialValue) {
           // 使用this指针在初始化列表中设置成员变量
       }
   private:
       int value;
   };
   ```

  - 在静态成员函数中：
   静态成员函数不接收`this`指针，因为它们不与特定的对象实例关联。但是，你可以通过`ClassName::instance()`的方式来访问非静态成员。

   ```cpp
   class MyClass {
   public:
       static MyClass& getInstance() {
           static MyClass instance; // 局部静态实例
           return instance;
       }
   };
   ```

`this`指针是一个非常有用的工具，可以帮助你更好地管理对象的状态和行为。然而，过度使用`this`指针可能会使代码变得冗长和难以阅读，因此应谨慎使用。

3. 指向类的非静态成员的指针
声明指针语句的一般形式为

```cpp
类型说明符 类名::*指针名;
类型说明符 (类名::*指针名)(参数表);
```

对数据成员的指针赋值的一般语法形式为：

```cpp
指针名=&类名::数据成员名;
```

访问数据成员时，语法为

```cpp
对象名.*类成员指针名
对象指针名->*类成员指针名
```

成员函数指针在声明之后要用以下形式的语句对其赋值：

```cpp
指针名=&类名::函数成员名;
```

4. 指向类的静态成员的指针
类的静态成员是不依赖于对象的，因此可以用普通的指针来指向和访问静态成员。

## 5.3 动态内存分配

在C++中，动态内存分配技术可以保证程序在运行的过程中按照实际需要申请适量的内存，使用结束后还可以释放，这种在程序运行过程中申请和释放的存储单元也称为堆对象，申请和释放过程一般称为建立和删除。

运算符`new`的功能是动态分配内存，语法形式为

```cpp
new 数据类型 (初始化参数列表);
```

该语句在程序运行过程中申请分配用于存放指定类型的数据的内存空间，并根据初始化参数列表给出的值进行初始化。如果内存申请成功，`new`运算便会返回一个指向新分配内存首地址的类型的指针，可以通过这个指针对堆对象进行访问；如果申请失败，会抛出异常。

如果建立的对象是一个基本类型变量，初始化过程就是赋值，例如

```cpp
int *point;
point=new int(2);
```

动态分配了用于存放`int`类型数据的内存空间，并将初值2存入该空间中，然后将首地址赋值给指针`point`。

还有下面两种情况：

```cpp
int *point=new int;  //不会在分配内存后设定初值
int *point=new int();  //用0表示该对象的初始化
```

如果建立的对象是某一个类的实例对象，就是要根据初始化参数列表的参数类型和个数调用该类的构造函数。

运算符`delete`用于删除由`new`建立的对象，释放指针所指向的内存空间，格式为：

```cpp
delete 指针名；
```

如果被删除的是对象，该对象的析构函数将被调用。对于`new`建立的对象，只能使用`delete`进行一次删除操作，不能多次。

另外，使用运算符`new`也可以创建数组类型的对象，这时需要给出数组的结构说明。用`new`运算符动态创建一维数组的语法形式为：

```cpp
new 类型名 [数组长度];
```

如果是用`new`建立的数组，用`delete`删除时在指针名前面要加“[]”，格式如下：

```cpp
delete[] 指针名;
```

## 5.4 用vector创建数组对象

用vector定义动态数组的形式为：

```cpp
vector<元素类型>数组对象名(数组长度);
```

另外，数组的初值可以自己指定，但只能为所有元素指定相同的初值，形式为：

```cpp
vector<元素类型>数组对象名(数组长度，元素初值);
```

## 5.5 深复制与浅复制

1. 浅复制
浅复制通常发生在没有明确定义复制构造函数的情况下，对象的每个成员变量都会被复制，但如果成员是指针，那么复制构造函数将只复制指针的值，而不是指针指向的内存。

```cpp
#include <iostream>
#include <vector>

class MyClass {
public:
    int value;
    std::vector<int> vec;

    MyClass(int v, const std::vector<int>& vvec) : value(v), vec(vvec) {}
};

MyClass shallowCopy(const MyClass& other) {
    return other; // 默认复制构造函数进行浅复制
}

int main() {
    MyClass obj(10, {1, 2, 3});
    MyClass copiedObj = shallowCopy(obj);

    // 修改浅复制对象的vector
    copiedObj.vec.push_back(4);

    // 原始对象的vector也被修改了
    std::cout << "Original vector size: " << obj.vec.size() << std::endl;
    return 0;
}
```

2. 深复制
深复制意味着不仅复制对象的成员变量，还要复制成员变量指向的内存。如果成员是指针，深复制会重新分配内存并复制内容。

```cpp
#include <iostream>
#include <vector>

class MyClass {
public:
    int* value; // 指针类型
    std::vector<int>* vec; // 指针类型

    MyClass(int v, const std::vector<int>& vvec) {
        value = new int(v);
        vec = new std::vector<int>(vvec);
    }

    // 深复制构造函数
    MyClass(const MyClass& other) {
        *value = other.value; // 复制值
        vec = new std::vector<int>(*(other.vec)); // 复制vector内容
    }

    ~MyClass() {
        delete value;
        delete vec;
    }
};

int main() {
    MyClass obj(10, {1, 2, 3});
    MyClass copiedObj(obj); // 使用深复制构造函数

    // 修改深复制对象的vector
    copiedObj.vec->push_back(4);

    // 原始对象的vector未被修改
    std::cout << "Original vector size: " << obj.vec->size() << std::endl;
    return 0;
}
```

这一节的内容复制自 kimi.ai，感觉不重要。


## 5.6 字符串

### 5.6.1 用字符串数组存储和处理字符串

创建字符串变量的方法有下面三种：

```cpp
char str[8]={'p','r','o','g','r','a','m','\0'};
char str[8]="program";
char str[]="program";
```

这3种写法是等价的。

注意，数组以`'\0'`或者`0`作为结尾标记，如果你的数组中间存在`0`，那么直接输出数组时会在`0`处终止。例如：

```cpp
char str[8]={'p','r','o',0,'r','a','m','\0'};
cout<<str;
//输出只有0前面的三个字符：pro
```

### 5.6.2 string类

1. 构造函数的原型

```cpp
string();  //默认构造函数，构造一个长度为0的串
string(const string& rhs);  //复制构造函数
string(const char*s);  //用指针s指向的字符串常量初始化string类对象
string(const string& rhs,unsigned int pos,unsigned int n);
// 将对象rhs中的串从位置pos开始取n个字符，用来初始化string类的对象
// 注：串中的第一个字符的位置为0
string(const char*s,unsigned int n);
// 用指针s所指向的字符串中的前n个字符初始化类string 的对象
string(unsigned int n,char c);
// 将参数c中的字符重复n次，用来初始化string类的对象
```

2. `string`类的操作符
  - `s+t`：将串s和串t连接成一个新串
  - `s=t`：用t更新s
  - `s+=t`：等价于`s=s+t`
  - `s==t`：判断 s 和 t 是否相等
  - `s!=t`：判断 s 与 t 是否不等
  - `s<t`：判断 s 是否小于 t 
  - `s<=t`：判断 s 是否小于等于 t
  - `s>t` ；判断 s 是否大于 t
  - `s>=t`：判断 s 是否大于等于 t
  - `s[i]`：访问串中下标为 i 的字符

3. 字符串的大小比较是什么含义
这里所说的对两串大小的比较，是依据字典顺序的比较。设有两字符串 s1与 s2,二
者大小的比较规则如下。
  - 如果 s1 与 s2 长度相同，且所有字符完全相同，则 s1=s2。
  - 如果 s1 与 s2 所有字符不完全相同，则比较第一对不相同字符的 ASCII 码，较小字符所在的串为较小的串。
  - 如果 s1 的长度 n1 小于 s2 的长度 n2,且两字符串的前 n1 个字符完全相同，则`s1<s2`。

4. 常用成员函数功能简介
在下面的函数说明中，将成员函数所属的对象称为“本对象”，其中存放的字符串称为“本字符串”。

```cpp
string append(const char * s);  //将字符串s添加在本串尾
string assign(const char * s);  //赋值，将s所指向的字符串赋值给本对象
int compare(const string &str) const; //比较本串与str中串的大小，当本串<str字符串时，返回负数，大于则返回正数，等于则返回0
string & insert(unsigned int p0,const char * s);
// 将s所指向的字符串插入在本串中位置p0之前
string substr(unsigned int pos,unsigned int n) const;
// 取子串，取本串中位置pos开始的n个字符，构成新的string类对象作为返回值
unsigned int find(const basic_string &str) const;
// 查找并返回str在本串中第一次出现的位置
unsigned int length() const;
// 返回串的字符个数
void swap(string& str);
// 将本串与str中的字符串进行交换
```

### 5.6.3 cstring头文件与cstring函数

`cstring`是C++标准库中的一个头文件，它提供了一系列用于处理C风格字符串（即以空字符`'\0'`结尾的字符数组）的函数。以下是一些`cstring`中常用的函数及其用法：

1. **`strcpy`** - 复制字符串
    ```cpp
    char dst[50];
    const char* src = "Hello, World!";
    strcpy(dst, src); // 将src复制到dst
    ```

2. **`strncpy`** - 复制指定数量的字符
    ```cpp
    char dst[50];
    const char* src = "Hello, World!";
    strncpy(dst, src, 5); // 只复制前5个字符到dst
    ```

3. **`strcat`** - 连接字符串
    ```cpp
    char str1[50] = "Hello, ";
    const char* str2 = "World!";
    strcat(str1, str2); // 将str2连接到str1的末尾
    ```

4. **`strncat`** - 连接指定数量的字符
    ```cpp
    char str1[50] = "Hello, ";
    const char* str2 = "World!";
    strncat(str1, str2, 5); // 只连接前5个字符到str1的末尾
    ```

5. **`strcmp`** - 比较两个字符串
    ```cpp
    const char* str1 = "Hello";
    const char* str2 = "World";
    int result = strcmp(str1, str2); // 如果str1等于str2，返回0；如果str1在字典序上小于str2，返回负数；否则返回正数
    ```

6. **`strncmp`** - 比较两个字符串的前n个字符
    ```cpp
    const char* str1 = "Hello";
    const char* str2 = "Hi";
    int result = strncmp(str1, str2, 2); // 比较前两个字符
    ```

7. **`strlen`** - 获取字符串长度
    ```cpp
    const char* str = "Hello, World!";
    size_t length = strlen(str); // 返回字符串的长度，不包括结尾的空字符
    ```

8. **`strchr`** - 查找字符第一次出现的位置
    ```cpp
    const char* str = "Hello, World!";
    char c = 'W';
    char* found = strchr(str, c); // 返回第一次出现字符c的位置，如果没有找到，返回NULL
    ```

9. **`strrchr`** - 查找字符最后一次出现的位置
    ```cpp
    const char* str = "Hello, World!";
    char c = 'o';
    char* found = strrchr(str, c); // 返回最后一次出现字符c的位置，如果没有找到，返回NULL
    ```

10. **`strstr`** - 查找子字符串
    ```cpp
    const char* str = "Hello, World!";
    const char* subStr = "World";
    char* found = strstr(str, subStr); // 返回子字符串subStr在str中第一次出现的位置，如果没有找到，返回NULL
    ```

11. **`strtok`** - 分割字符串
    ```cpp
    char str[] = "Hello, World!";
    const char* delimiters = " ,!";
    char* token = strtok(str, delimiters); // 使用delimiters中的字符作为分隔符分割str
    while(token != NULL) {
        std::cout << token << std::endl;
        token = strtok(NULL, delimiters); // 继续获取下一个token
    }
    ```

12. **`strrev`** - 反转字符串（非标准C++库函数，但通常被包含在`cstring`中）
    ```cpp
    char str[] = "Hello, World!";
    strrev(str); // 将str反转
    ```

13. **`strerror`** - 根据错误代码返回描述性错误消息
    ```cpp
    int errCode = errno;
    const char* errMsg = strerror(errCode); // 返回错误代码对应的描述性消息
    ```

请注意，`strtok`函数会修改原始字符串，因为它在分割点处插入空字符。此外，`strrev`函数不是标准C++库的一部分，但在某些编译器中可用。

在使用这些函数时，需要特别注意内存管理和空指针的检查，以避免潜在的安全问题，如缓冲区溢出。此外，C++中更推荐使用`std::string`类来处理字符串，因为它提供了更安全和方便的字符串操作。

## 第五章问答题

1. 数组A[10][5][15]一共有多少个元素？
解：`n=10*5*15=750`

2. 在数组A[20]中第一个元素和最后一个元素是哪一个？
解：`A[0],A[19]`

3. 用一条语句定义一个有五个元素的整型数组，并依次赋予1~5的初值。
解：`int arr[5]={1,2,3,4,5};`

4. 已知有一个数组名叫`oneArray`，用一条语句求出其元素的个数。
解：`int count = sizeof(oneArray) / sizeof(oneArray[0]);`

5. 用一条语句定义一个有5×3个元素的二维整型数组，并依次赋予1~15的初值。
解：`int arr[5][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}, {10, 11, 12}, {13, 14, 15}};`

6. 运算符`*`和`&`的作用是什么？
解：`*`是指针运算符，表示获取指针所指向的变量的值；
`&`为取地址运算符，用来得到一个对象的地址。

7. 什么叫做指针？指针中储存的地址和这个地址中的值有何区别？
解：指针是一种变量，它存储了另一个变量的地址；指针中储存的地址是一串代表地址的字符，而地址中的值是实际的数据或变量的值，二者并不相同。

8. 定义一个整型指针，用new语句为其分配包含10个整型元素的地址空间。
解：`int *p=new int[10];` 


9. 在字符串“Hello，world!”中结束符是什么？
解：`\0`

10. 定义一个有五个元素的整型数组，在程序中提示用户输入元素值，最后再在屏幕上显示出来。
解：
```cpp

#include <iostream>
using namespace std;
int main() {
    int arr[5]; 
    int i;

    cout << "请输入五个整数：" << endl;
    for (i = 0; i < 5; ++i) {
        cout << "元素 " << i + 1 << "：";
        cin >> arr[i]; 
    }

    cout << "您输入的数组元素为：" << endl;
    for (i = 0; i < 5; ++i) {
        cout << arr[i] << " ";
    }
    cout << endl;

    return 0;
}
```

11. 引用和指针有何区别？何时只能使用指针而不能使用引用？
解：引用只是原对象的一个别名，不会额外占用内存空间；指针是对象的地址，需要额外占用内存空间来存储。当涉及地址时，只能用指针而不能使用引用。

12. 声明下列指针：float类型变量的指针pFloat，char类型的指针pString和struct customer型的指针prec。
解：
```cpp
// 声明一个指向float类型变量的指针
float *pFloat;

// 声明一个指向char类型数组（字符串）的指针
char *pString;

// 声明一个struct customer型的指针
struct customer *prec;
```

13. 给定float类型的指针fp，写出显示fp所指向的值的输出流语句。
解：`cout<<*fp<<endl;`

14. 程序中定义一个`double`类型变量的指针。分别显示指针占了多少字节和指针所指的变量占了多少字节。
解：
```cpp
int main() {
    // 定义一个double类型的变量
    double myDouble = 3.14159;
    
    // 定义一个指向double类型变量的指针
    double *pDouble = &myDouble;
    
    // 输出指针所占的字节数
    cout << "指针所占字节数为: " << sizeof(pDouble) <<endl;
    
    // 输出指针所指向的变量所占的字节数
    cout << "变量所占字节数为: " << sizeof(*pDouble) <<endl;
    
    return 0;
}
```

15. `const int * p1` 和 `int * const p2`的区别是什么？

解： 
 - `const int * p1`：定义了一个指针 `p1`，它指向一个 `const int` 类型的值。
`const` 关键字位于 `int` 的左边，表示指针指向的数据是 `const` 的，即不能通过这个指针来修改它所指向的数据。但是指针 `p1` 自身是可以修改的，也就是说，可以改变 `p1` 指向的地址。
  - `int * const p2`：定义了一个指针常量 `p2`，它指向一个 `int` 类型的值。
`const` 关键字位于 `*` 的右边，表示指针本身是 `const` 的，即不能通过这个指针来修改它所指向的地址。但是指针 `p2` 指向的数据是可以修改的，也就是说，可以通过 `p2` 来改变它所指向的 `int` 变量的值。

总结来说，`const int * p1` 表示指针指向的数据不能被修改，而指针本身的值可以改变；`int * const p2` 表示指针本身的值不能被改变，但指针指向的数据可以被修改。

16. 定义一个整型变量`a`，一个整型指针`p`，一个引用`r`，通过`p`把`a`的值改为10，通过`r`把`a`的值改为5
解：

```cpp
    // 定义一个整型变量a
    int a = 0;

    // 定义一个整型指针p
    int *p = &a; // p指向a的地址

    // 通过指针p把a的值改为10
    *p = 10;

    // 定义一个引用r
    int &r = a; // r是a的别名

    // 通过引用r把a的值改为5
    r = 5;
```

17. 下列程序有何问题，请仔细体会使用指针时应避免出现这个的问题。
```cpp
#include <iostream.h>
int main()
{
int *p;
*p = 9;
cout << "The value at p: " << *p;
return 0;
}
```

解：错误是没有给`p`分配指向的地址，但是却对`p`指向的地址（实际上`p`此时没有指向的地址）对应的内容赋值了。我们可以在定义`p`时使用：`int *p=new int;` 这样就不会有问题了。

## 第五章作业题

1. 数组排序：定义整型一维数组a[100]，利用while循环依次从键盘输入自然数数值（输入为-1时结束输入）；编写一个函数对数组排序（参考教学平台“相关资源”下“经典训练60题”第六项排序类程序，任意一个都行）。

```cpp
#include<iostream>
using namespace std;

int num=0;

void display(int a[]){
    cout<<"数组序列的内容为：";
	for(int i=0;i<num;i++)
	cout<<a[i]<<"   "; 
	cout<<endl;
}

void BubbleSort(int a[],int n){
    int mark;
	for(int i=1;i<n;i++){
		for(int j=0;j<n-1;j++)
		    if(a[j+1]<a[j]) {
			    mark=a[j+1];
				a[j+1]=a[j];
				a[j]=mark;
		    }
	} 
}

int main(){
	int aa[100];
	int k=0;
	while(k<100){
		cout << "请输入自然数，输入-1结束输入：" << endl;
		int n;
		cin>>n;
		if(n==-1){
			break;
		}
		else{
			aa[k]=n;
			k++;
			num++;
		}
	}
	BubbleSort(aa,num);
	display(aa);
	system("pause");
}
```

2. 编写并测试 3×3 矩阵转置函数，使用数组保存 3×3 矩阵；要求定义数组时初始化数组内容。
转置矩阵：把矩阵A的行换成相应的列，得到的新矩阵称为A的转置矩阵。
提示：使用2维数组。

```cpp
#include <iostream>
using namespace std;

// 矩阵转置函数
void transpose(int mat[3][3]) {
    int temp;
    for (int i = 0; i < 3; i++) {
        for (int j = i + 1; j < 3; j++) {
            temp = mat[i][j];
            mat[i][j] = mat[j][i];
            mat[j][i] = temp;
        }
    }
}

// 打印矩阵函数
void printMatrix(int mat[3][3]) {
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            cout << mat[i][j] << " ";
        }
        cout << endl;
    }
}

int main() {
    int mat[3][3] = {{1, 2, 3},{4, 5, 6},{7, 8, 9}};

    cout << "原始矩阵为：" << endl;
    printMatrix(mat);

    transpose(mat);

    cout << "转置后的矩阵为：" << endl;
    printMatrix(mat);
    system("pause");
    return 0;
}
```

3. 编写函数实现两字符串的连接。要求使用字符数组保存字符串，不要使用系统函数。返回并输出连接后的字符串。
提示：字符串最后的一个字符值为0；

```cpp
#include <iostream>
using namespace std;

// 连接两个字符串的函数
char* lianjie(char str1[], char str2[]) {
    static char result[256]; // 假设连接后的字符串不会超过255个字符
    int i = 0, j = 0;

    // 将第一个字符串复制到结果数组
    while (str1[i] != '\0') {
        result[i] = str1[i];
        i++;
    }

    // 将第二个字符串复制到结果数组的剩余部分
    while (str2[j] != '\0') {
        result[i + j] = str2[j];
        j++;
    }

    // 在字符串末尾添加结束符
    result[i + j] = '\0';

    return result;
}

int main() {
    char str1[100] = "Hello, ";
    char str2[100] = "World!";

    char* result = lianjie(str1, str2);
    cout << "连接后的字符串为: " << result << endl;

    return 0;
}
```

4. 声明两个string类型字符串，声明的同时初始化，用string类的操作实现字符串的连接；输出连接后的字符串；

```cpp
#include <iostream>
#include <string> // 引入string类
using namespace std;

int main() {
    // 声明并初始化两个string类型的字符串
    string str1 = "Hello, ";
    string str2 = "World!";

    // 使用+操作符连接字符串
    string result = str1 + str2;

    // 输出连接后的字符串
    cout << "连接后的字符串为: " << result << endl;
    
    system("pause");
    return 0;
}
```

5. 编写如下代码，添加注释说明每个add函数的含义，以及对实际变量的影响，说明main函数中每个cout输出的内容的含义。 

```cpp
#include <iostream> 
using namespace std; 
 
 void Add1(int* i)  //令指针指向的地址向前移动一个位置 ，并不会改变实际变量的值，并且由于这只是对形参进行了操作，并不会实际上改变指针指向的地址。 
  { 
  	++i;
  } 
 void Add2(int& i)  //令整数引用的值增加1 ，可以让实际变量值增加1 
  { 
	++i; 
  } 
 void Add3(int* i)  // 使指针i指向的地址对应的数值加1，尽管是对形参进行操作，但是形参对应的地址和实参是一样的，
                    //这里对形参指向的地址对应的内容进行操作，实际上也改变了实参指向的地址对应的值，这样导致了实际变量增加1 
  { 
     (*i)++;  
  } 
 void Add4(int*& i)  // 让指向引用i的指针指向的地址向前移动一个位置，并不会改变实际变量的值 
  { 
    ++i;  
  } 

int main() 
{ 
    int a = 124; 
    cout << "a: " << a << endl << "a's address:" << &a << endl; //输出a的值和a的地址 
    int* p = &a; 
    cout << "p: " << p << endl; //前面定义了p为指向a的地址的指针，这里是输出p，也就是输出a的地址 
    cout << "*p's value: " << *p << endl; //输出p指向的地址对应的值，也就是输出a的值 
    cout << "p's address: " << &p << endl; //输出指针p本身的地址 
    cout << "*&p: " << *&p << endl; //输出指针p的地址对应的内容，也就是输出a的地址
    cout << "**&p: " << **&p << endl; //输出指针p的地址对应的内容的值，也就是a的地址对应的值，即a的值124 
 
    Add1(&a); 
    cout << "Add1：形参为*i,实参为&a，运算为a的地址直接加1。运算后a的值： " << a << endl; //使形式参数的地址加1，没有改变指针的地址，也没有改变a的值，仍然输出a的原值 ，即输出124 
    Add2(a); 
    cout << "Add2：形参为&i，实参为a，运算是a直接加1。运算后a的值：" << a << endl;  //函数对a的引用进行操作，使a的值加1然后输出 ，结果是125 
    Add3(&a); 
    cout << "Add3：形参为*i,实参为a的地址,运算为地址指向的内容加1。运算后a的值：" << a << endl; // 使a的地址对应的值增加1，也就是使得a增加1，输出126 
    Add4(p); 
    cout << "Add4：形参为*&i,一个指针的引用，实参为指向a的指针p，必须是一个变量而不能取址，运算为参数直接加 1。运算后a的值：" << a << endl; //指针p指向的地址加1，不再指向a的地址，但没有
	//改变a的值，仍然输出126 
    cout << "Add4运算后实参p的值：" << p << endl;//发现p指针存储的已经不是a的地址了，如果下面再用*p程序将可能出错 
    return 0; 
} 
```

# 第六章 继承与派生

## 6.1 类的继承与派生

### 6.1.1 派生类的定义

从已有的类产生新类的过程就是类的派生。原有的类被称为基类或父类，产生的新类被称为派生类或子类。

在C++中，派生类的一般定义语法为：

```cpp
class 派生类名：继承方式 基类名1，继承方式 基类名2，···{
    派生类成员声明;
};
```

一个派生类可以同时有多个基类，这种情况称为多继承；一个派生类只有一个直接基类的情况，称为单继承。

在类族中，直接参与派生出某类的基类被称为直接基类，基类的基类甚至更高层的基类被称为间接基类。

### 6.1.2 派生类生成过程

1. 吸收基类成员
派生类将基类的成员全盘接受，这样，派生类实际就包含了它的全部基类中除构造函数和析构函数之外的所有成员。

2. 改造基类成员
如果派生类声明了一个和某基类成员同名的新成员(如果是成员函数，则参数表也要相同，参数不同的情况属于重载)，派生的新成员就隐藏了外层同名成员。简单来说，如果基类和派生类中有同名的成员，以派生类中的为准。

3. 添加新的成员
可以根据实际情况的需要，给派生类添加适当的数据和函数成员，来实现必要的新功能。

## 6.2 访问控制

### 6.2.1 公有继承

当类的继承方式为公有继承时，基类的公有成员和保护成员的访问属性在派生类中不变，而基类的私有成员不可直接访问(除非友元)。

也就是说，基类的公有成员和保护成员也是派生类的公有和保护成员，但派生类中无法访问基类的私有成员。    

### 6.2.2 私有继承

当类的继承方式为私有继承时，基类中的公有成员和保护成员都以私有成员身份出现在派生类中，而基类的私有成员在派生类中不可直接访问。

### 6.2.3 保护继承

保护继承中，基类的公有成员和保护成员都以保护成员的身份出现在派生类中，而基类的私有成员不可直接访问。

## 6.3 类型兼容规则

类型兼容规则是指在需要基类对象的任何地方，都可以使用公有派生类的对象来替代。通过公有继承，派生类得到了基类中除构造函数、析构函数之外的所有成员。这样，公有派生类实际就具备了基类的所有功能，凡是基类能解决的问题，公有派生类都可以解决。类型兼容规则中所指的替代包括以下的情况。

  - 派生类的对象可以隐含转换为基类对象。
  - 派生类的对象可以初始化基类的引用。
  - 派生类的指针可以隐含转换为基类的指针。

在替代之后，派生类对象就可以作为基类的对象使用，但只能使用从基类继承的成员。

## 6.4 派生类的构造和析构函数

### 6.4.1 构造函数

构造派生类的对象时，需要对基类的成员对象和新增成员对象进行初始化。派生类构造函数的一般语法形式为：

```cpp
派生类名::派生类名(参数表)：基类名1(基类1初始化参数表)，···，基类名n(基类n初始化参数表)，成员对象名1(成员对象1初始化参数表)，···，成员对象名m(成员对象m初始化参数表){
    派生类构造函数的其他初始化操作;
}
```

如果对基类初始化时，需要调用基类的带有形参表的构造函数时，派生类就必须声明构造函数。

下面是一个实例：

```cpp
Derived(int a,int b,int c,int d):Base1(a),member2(d),member1(c),Base2(b){}
```

### 6.4.2 复制构造函数

如果要为派生类编写复制构造函数，一般需要为基类相应的复制构造函数传递参数。例如，假设`Derived`类是`Base`类的派生类，`Derived`类的复制构造函数形式如下；

```cpp
Derived::Derived(const Derived &v):Base(v){···}
```
### 6.4.3 析构函数

系统有默认的析构函数。

## 6.5 派生类成员的标识与访问

### 6.5.1 作用域分辨符

作用域分辨符`::`可以用来限定要访问的成员所在的类的名称，一般的使用形式是：

```cpp
类名::成员名 //数据成员
类名::成员名(参数表) //函数成员
```

如果派生类中声明了与基类成员函数同名的新函数，即使函数的参数表不同，从基类继承的同名函数的所有重载形式也都会被隐藏。

如果某派生类的多个基类拥有同名的成员，同时，派生类又新增了这样的同名成员，在这种情况下，派生类成员将隐藏所有基类的同名成员。

### 6.5.2 虚基类

可以将共同基类设置为虚基类，这时从不同的路径继承过来的同名数据成员在内存中就只有一个副本，同一个函数名也只有一个映射。

虚基类的声明是在派生类的定义过程中进行的，其语法形式为：

```cpp
class 派生类名:virtual 继承方式 基类名
```

上述预计声明基类为派生类的虚基类。在多继承情况下，虚基类关键字的作用范围和继承方式关键字相同，只对紧跟其后的基类起作用。

### 6.5.3 虚基类及其派生类的构造函数

当派生类继承虚基类时，需要在构造函数的初始化列表中显式地调用基类的构造函数。

```cpp
class Derived : public virtual Base {
    // ...
public:
    Derived(int x, double y) : Base(x) { /* ... */ }
};
```

注意：在派生类的构造函数中，必须在初始化列表中明确调用虚基类的构造函数。否则，虚基类的成员将不会被正确初始化。

无论派生类的其他基类中是否含有虚基类作为基类，最终的派生类的构造函数都必须显式地调用虚基类的构造函数。

## 第六章问答题

1. 比较类的三种继承方式`public`公有继承、`protected`保护继承、`private`私有继承之间的差别。
解： 当类的继承方式为公有继承时，基类的公有成员和保护成员的访问属性在派生类中不变，而基类的私有成员不可直接访问(除非友元)。也就是说，基类的公有成员和保护成员也是派生类的公有和保护成员，但派生类中无法访问基类的私有成员。
当类的继承方式为私有继承时，基类中的公有成员和保护成员都以私有成员身份出现在派生类中，而基类的私有成员在派生类中不可直接访问。
保护继承中，基类的公有成员和保护成员都以保护成员的身份出现在派生类中，而基类的私有成员不可直接访问。

2. 派生类构造函数执行的次序是怎样的？
解：首先，基类的构造函数会被调用。如果派生类是从多个基类派生的，那么基类构造函数的调用顺序会根据它们在类声明中的顺序来确定，即按照它们在类声明中出现的顺序，从左到右。
在基类构造函数执行之后，成员对象的构造函数会被调用。成员对象的构造函数的调用顺序取决于它们在类声明中的顺序，同样是从左到右。

3. 如果在派生类`B`已经重载了基类`A`的一个成员函数`fn1()`，没有重载成员函数`fn2()`，如何调用基类的成员函数`fn1()、fn2()`？
解： 调用`fn1()`时需要在前面加作用域运算符，如`b.A::fn1();`就是调用在`A`中声明的`fn1()`；调用`fn2()`时直接调用即可，例如`b.fn2();`

4. 什么叫做虚基类？有何作用？
解：虚基类是C++中为了解决多重继承问题而引入的类。它可以避免冗余，确保在多重继承结构中，共同的基类成员不会被重复继承多次。并且解决二义性，在复杂的继承关系中，虚基类可以明确指定哪些基类是共享的，从而避免成员访问时的二义性问题。

5. 定义基类`Base`，有两个共有成员函数`fn1()、fn2()`，私有派生出`Derived`类，如果想在`Derived`类的对象中使用基类函数`fn1()`，应怎么办？
解： 可以将在`Base`类中将`Derived`声明为友元类，这样在类`Derived`中就可以使用`Base`类的函数`fn1()`。


## 第六章作业题
1. 声明一个 `Employee`  类，其中包括姓名、地址（使用指针，动态分配空间和设置内容）、邮编等属性，以及 `change name、change_address`和 `display`等函数。`display()`显示姓名、地址、邮编等属性，`change_name`改变对象的姓名属性，`change_address`更改地址信息。（可使用`cstring`函数`strcpy`，`strlen`）
注意字符串要用字符指针，使用动态数组，不要用`string`类。有动态内存分配`new`操作就要有动态内存释放`delete`操作。
提示：要有构造函数、拷贝构造函数、析构函数，在构造函数中使用`new`分配`address`空间并拷贝内容。

2. 使用`Employee`类，设定第一个对象的属性后第二个对象用第一个对象初始化；修改第二个对象的姓名和地址，分别显示每个对象信息；

```cpp
#include <iostream>
#include <cstring>
using namespace std;

class Employee {
private:
    char* name;
    char* address;
    int zipCode;

public:
    // 构造函数
    Employee(const char* name, const char* address, int zipCode) {
        this->name = new char[strlen(name) + 1];// 给正在操作的对象的成员变量name动态分配内存，加1是为了存储字符'\0' 
        strcpy(this->name, name);//将name指向的内存中的内容复制到上一行分配的空间中 
        this->address = new char[strlen(address) + 1];
        strcpy(this->address, address);
        this->zipCode = zipCode;
    }

    // 拷贝构造函数
    Employee(const Employee& other) {
        this->name = new char[strlen(other.name) + 1];
        strcpy(this->name, other.name); 
        this->address = new char[strlen(other.address) + 1];
        strcpy(this->address, other.address);
        this->zipCode = other.zipCode;
    }

    // 析构函数
    ~Employee() {
        delete[] name;//析构的同时删除掉动态分配的内存 
        delete[] address;
    }

    // 更改姓名
    void changeName(const char* newName) {
        delete[] name;//先删除掉动态分配的内存 
        name = new char[strlen(newName) + 1];//分配新的内存 
        strcpy(name, newName);//进行复制 
    }

    // 更改地址
    void changeAddress(const char* newAddress) {
        delete[] address;
        address = new char[strlen(newAddress) + 1];
        strcpy(address, newAddress);
    }

    // 显示信息
    void display() const {
        cout << "Name: " << name << endl;
		cout << "Address: " << address << endl;
        cout << "Zip Code: " << zipCode << endl;
    }
};

int main() {
    Employee emp1("Xie Donghui", "BNU, The department of phisics", 100080);
    emp1.display();

    Employee emp2(emp1); // 使用emp1初始化emp2
    emp2.changeName("Teacher Yao Ziming");
    emp2.changeAddress("BNU, Education");
    emp2.display();

    return 0;
}
```

3. 声明一个基类 `Animal`，有私有整型成员变量 `age`，构造其派生类 `dog`，在其成员函 数 `SetAge(int n)`中直接给 `age` 赋值，看看会有什么问题，把 `age` 改为公有成员变量，还会有问题吗？编程试试看并上交word文档说明。

```cpp
#include<iostream>
using namespace std;

class Animal {
private:
    
public:
	int age;
    Animal(int a) : age(a) {}
    void SetAge(int n) {
        age = n; 
    }
};

class Dog : public Animal {
public:
    Dog(int a) : Animal(a) {}
};

int main(){
	Dog a(10);
	cout<<a.age<<endl;
	a.SetAge(18);
	cout<<a.age<<endl;
}
```

4. 声明一个基类 `BaseClass`，有整型成员变量 `Number`，构造函数中设定其初始值（带默认值），输出构造信息，析构函数中设置`Number`为0，输出析构信息；构造其派生类 `DerivedClass`，新增整型成员变量`NewNumber`，编写构造函数输出构造信息、析构函数输出析构信息。 观察派生类构造函数和析构函数的执行顺序并在程序后用注释说明（提示：使用对象指针，`new` 和`delete`操作；或者使用块语句）。

```cpp
#include<iostream>
using namespace std;

class BaseClass {
protected:
    int Number;
public:
    BaseClass(int num = 1) : Number(num) {
        cout << "正在构造Number为" << Number <<"的类BaseClass的对象"<< endl;
    }
    ~BaseClass() {
        Number = 0;
        cout << "正在析构BaseClass，Number值被设置为0" << endl;
    }
};

class DerivedClass : public BaseClass {
protected:
    int NewNumber;
public:
    DerivedClass(int num, int newNum) : BaseClass(num), NewNumber(newNum) {
        cout << "正在构造NewNumber为" << NewNumber <<"的类DerivedClass的对象"<< endl;
    }
    ~DerivedClass() {
        cout << "正在析构DerivedClass" << endl;
    }
};

int main() {
    DerivedClass* obj = new DerivedClass(10, 20);
	// 使用new操作符动态创建DerivedClass对象
    // 使用对象指针访问成员函数或数据成员
	delete obj;// 当不再需要对象时，使用delete操作符释放内存
    return 0;
}
// 构造顺序：BaseClass -> DerivedClass
// 析构顺序：DerivedClass -> BaseClass
```

5. 声明一个车（`vehicle`）基类，具有 `MaxSpeed`、`Weight` 等保护成员变量，由此派生出自行车（`bicycle`）类、汽车（`motorcar`）类。自行车（`bicycle`）类有高度（`Height`）等保护成员变量，汽车（`motorcar`）类有座位数（`SeatNum`）等保护成员变量。从 `bicycle` 和 `motorcar` 派生出摩托车（`motocycle`）类，在`motocycle`中有成员函数`Display`，输出所有成员数据信息（`MaxSpeed`、`Weight`、`Height`、`SeatNum`）。
每个类型都有自己的构造函数，输出构造信息，析构函数输出析构信息。观察构造顺序和析构顺序并在程序中用注释说明。
如果不把 `vehicle` 设置为虚基类，会有什么问题？如何解决这个问题？编程试试看并在程序中用注释说明。
如果把vehcile设置为虚基类，请在程序中用注释说明构造函数和析构函数调用顺序。
（提示：使用`new motocyle`和`delete`操作进行测试；或者使用块语句测试）

```cpp
#include<iostream>
using namespace std;

//声明一个车(vehicle)基类
class vehicle{
	protected:
		int MaxSpeed;
		double Weight;
	public:
		vehicle(int maxspeed,double weight):MaxSpeed(maxspeed),Weight(weight){
			cout<<"正在构造vehicle，其最大速率为："<<MaxSpeed<<"，重量为："<<Weight<<endl;
		}
		
		virtual ~vehicle(){
			cout<<"正在析构vehicle"<<endl;
		}
}; 

//派生类 bicycle
class bicycle:public virtual vehicle{//在此处声明虚基类 vehicle 
	protected:
		double Height;
	public:
		bicycle(int maxspeed,double weight,double height):vehicle(maxspeed,weight),Height(height){
			cout<<"正在构造bicycle，其高度为："<<Height<<endl;
		}
		~bicycle(){
			cout<<"正在析构bicycle"<<endl;
		}
};

//派生类motorcar
class motorcar:public virtual vehicle{
	protected:
		int SeatNum;
	public:
		motorcar(int maxspeed,double weight,int seatnum):vehicle(maxspeed,weight),SeatNum(seatnum){
			cout<<"正在构造motorcar，座位数为："<<SeatNum<<endl;
		}
		~motorcar(){
			cout<<"正在析构motorcar"<<endl;
		}
}; 

//从类bicycle和motorcar派生出motorcycle 
class motorcycle:public bicycle,public motorcar{
	public:
		motorcycle(int maxspeed,double weight,double height,int seatnum):bicycle(maxspeed,weight,height),motorcar(maxspeed,weight,seatnum),vehicle(maxspeed,weight){
			cout<<"正在构建motorcycle"<<endl;
		}
		~motorcycle(){
			cout<<"正在析构motorcycle"<<endl;
		}
		void display(){
			cout<<"MaxSpeed:"<<MaxSpeed<<", Weight:"<<Weight<<", Height:"<<Height<<", SeatNum:"<<SeatNum<<endl;
		}
};

int main(){
	motorcycle* moto=new motorcycle(100,200.0,1.5,4);
	//构造函数的调用顺序是 ：vehicle -> bicycle -> motorcar -> motorcycle
	(*moto).display(); //还可以写作moto->display(); 
	//析构函数的调用顺序是 ：motorcycle -> motorcar -> bicycle -> vehicl
	delete moto;
	return 0;
}
/*如果不把Vehicle设置为虚基类，那么motorcycle将从bicycle和motorcar各继承一份vehicle的成员，这会导致数据冗余。
通过将vehicle设置为虚基类，我们可以确保vehicle的成员在内存中只存在一份。*/
```

# 第七章 多态性

## 7.1 多态性概述

### 7.1.1 多态的类型

本章介绍的中点是重载和包含两种多态类型，其中重载主要是介绍运算符重载。

### 7.1.2 多态的实现

多态从实现的角度来讲可以划分为两类，**编译时的多态和运行时的多态**。前者在编译的过程中确定了同名操作的具体操作对象，而后者则是在程序运行过程中才动态地确定操作所针对的具体对象。这种确定操作的具体对象的过程就是绑定。**绑定是指计算机程序自身彼此关联的过程**，也就是把一个标识符名和一个存储地址联系在一起的过程，用面向对象的术语讲，就是**把一条消息和一个对象的方法相结合的过程**。按照绑定进行的阶段的不同，可以分为两种不同的绑定方法：静态绑定和动态绑定，这两种绑定过程中分别对应着多态的两种实现方式。

**绑定工作在编译连接阶段完成的情况称为静态绑定**。因为绑定过程是在程序开始执行之前进行的，因此有时也称为早期绑定或前绑定。在编译、连接过程中，系统就可以根据类型匹配等特征确定程序中操作调用与执行该操作代码的关系，即确定了某一个同名标识到底是要调用哪一段程序代码。有些多态类型，其同名操作的具体对象能够在编译、 连接阶段确定，通过静态绑定解决，比如重载、强制和参数多态。

和静态绑定相对应，**绑定工作在程序运行阶段完成的情况称为动态绑定**，也称为晚期绑定或后绑定。在编译，连接过程中无法解决的绑定问题，要等到程序开始运行之后再来确定。包含多态操作对象的确定就是通过动态绑定完成的。

## 7.2 运算符重载

运算符重载是对已有的运算符赋予多重含义，使同一个运算符作用于不同类型的数据时导致不同的行为。

### 7.2.1 运算符重载的规则

运算符重载为类的成员函数的一般语法形式为：

```cpp
返回类型 operator 运算符(形参表){
    函数体
}
```

运算符重载为非成员函数的一般语法形式为：

```cpp
返回类型 operator 运算符(形参表){
    函数体
}
```

返回值指定了重载运算符的返回值类型，也就是运算结果类型；`operator`是定义运算符重载函数的关键字；运算符即是要重载的运算符名称；形参表中给出重载运算符所需要的参数和类型。

### 7.2.2 运算符重载为成员函数

对于双目运算符 B，如果要重载为类的成员函数，使之能够实现表达式`oprd1 B oprd2`，其中`oprdl`为`A`类的对象，则应当**把 B 重载为`A`类的成员函数，该函数只有一个形参，形参的类型是`oprd2`所属的类型**。经过重载之后，表达式 `oprdl B oprd2` 就相当于函数调用 `oprdl. operator B(oprd2)`。

对于前置单目运算符 U，如“-”(负号)等，如果要重载为类的成员函数，用来实现表达式`U oprd`，其中 `oprd` 为 `A` 类的对象，则 U 应当重载为 `A` 类的成员函数，函数没有形参。经过重载之后，表达式 `U oprd` 相当于函数调用 `oprd. operator U()`。

再来看后置运算符“++”和“--”，如果要将它们重载为类的成员函数，用来实现表达式`oprd++`或 `oprd--`，其中`oprd`为 `A` 类的对象，那么运算符就应当**重载为 `A` 类的成员函数，这时函数要带有一个整型(int)形参**。重载之后，表达式 `oprd++`和 `oprd--`就相当于函数调用 `oprd. operator++(0)`和 `oprd. operator--(0)`。这里的 `int` 类型参数在运算中不起任何作用，只是用于区别后置++、--与前置++、--。

### 7.2.3 运算符重载为非成员函数

**对于双目运算符 B，如果要实现 `oprd1 B oprd2`，其中 `oprd1` 和 `oprd2` 中只要有一个具有自定义类型，就可以将 B 重载为非成员函数，函数的形参为 `oprd1` 和 `oprd2`**。经过重载之后，表达式 `oprdl B oprd2` 就相当于函数调用 `operator B(oprdl,oprd2)`。

**对于前置单目运算符 U,如“-”(负号)等，如果要实现表达式 `U oprd`，其中 `oprd` 具有自定义类型，就可以将 U 重载为非成员函数，函数的形参为 `oprd`**。经过重载之后，表达式`Uoprd` 相当于函数调用 `operator U(oprd)`。

**对于后置运算符++和--，如果要实现表达式 `oprd ++`或 `oprd --`，其中 `oprd` 为自定义类型，那么运算符就可以重载为非成员函数。这时函数的形参有两个，一个是 `oprd`，另一个是 `int` 类型形参**。第二个参数是用于与前置运算符函数相区别的。重载之后，表达式 `oprd ++`和 `oprd--`就相当于函数调用 `operator ++(oprd,0)` 和`operator--(oprd,0)`。

## 7.3 虚函数

### 7.3.1 一般虚函数成员

一般虚函数成员的声明语法是：

```cpp
virtual 函数类型 函数名(形参表);
```

虚函数声明只能出现在类定义中的函数原型声明中，而不能在成员函数实现的时候。

### 7.3.2 虚析构函数

虚析构函数的声明语法为：

```cpp
virtual ~类名();
```

## 7.4 纯虚函数与抽象类

### 7.4.1 纯虚函数

纯虚函数的声明格式为：

```cpp
virtual 函数类型 函数名(参数表)=0;
```

实际上，它与一般虚函数成员的原型在书写格式上的不同就在于后面加了“=0”。声明为纯虚函数之后，基类中就可以不再给出函数的实现部分。纯虚函数的函数体由派生类给出。

### 7.4.2 抽象类

带有纯虚函数的类是抽象类。

抽象类不能实例化。

## 第七章问答题

1. 什么叫做多态性?在C++中是如何实现多态的？

多态性（Polymorphism）是面向对象编程中的一个核心概念，它指的是同一个接口可以被不同的数据类型以不同的方式实现或表示的能力。多态性允许编写的代码对数据类型进行操作，而不需要知道这些数据类型具体是什么，这增加了代码的灵活性和可重用性。

多态性主要有两种形式：

  - **编译时多态（静态多态或早期多态）**：通常通过函数重载（Overloading）和运算符重载实现。这种多态在编译时就已经确定。

  - **运行时多态（动态多态或晚期多态）**：通常通过虚函数（Virtual Functions）和继承实现。这种多态是在程序运行时确定的。

在C++中，多态性的实现主要通过以下几种方式：

  - 函数重载（Overloading）
函数重载是指在同一个作用域内可以有多个同名函数，只要它们的参数列表不同（参数的类型、数量或顺序不同）。编译器根据函数调用时提供的参数来确定应该调用哪个函数。

```cpp
void function(int a) {
    // ...
}

void function(double a) {
    // ...
}
```

  - 运算符重载（Operator Overloading）
运算符重载允许定义或修改大多数C++运算符的行为，使得它们可以作用于自定义类型。

```cpp
class MyClass {
    // ...
};

MyClass operator+(const MyClass& a, const MyClass& b) {
    MyClass result;
    // ...
    return result;
}
```

  - 虚函数（Virtual Functions）
虚函数是实现运行时多态的关键。通过将基类的成员函数声明为虚函数，可以在派生类中重写（Override）该函数，运行时将根据对象的实际类型调用相应的函数。

```cpp
class Base {
public:
    virtual void show() { std::cout << "Base show" << std::endl; }
};

class Derived : public Base {
public:
    void show() override { std::cout << "Derived show" << std::endl; }
};
```

  - 抽象类（Abstract Class）
抽象类是不能被实例化的类，它至少包含一个纯虚函数。抽象类通常用作基类，以确保派生类实现某些行为。

```cpp
class AbstractBase {
public:
    virtual void pureVirtualFunction() = 0; // 纯虚函数
};

class ConcreteDerived : public AbstractBase {
public:
    void pureVirtualFunction() override {
        // 实现细节
    }
};
```

  - 模板（Templates）
模板提供了一种方式，使得同一个代码可以用于多种数据类型，这也是一种编译时多态。

```cpp
template <typename T>
class TemplateClass {
    // ...
};

int main() {
    TemplateClass<int> intType;
    TemplateClass<double> doubleType;
    // ...
}
```

多态性是C++中实现代码复用和灵活性的重要机制，它允许开发者编写更通用、更可维护的代码。

2. 什么叫做抽象类？抽象类有何作用？抽象类的派生类是否一定要给出纯虚函数的实现？

**定义**：抽象类是一种特殊的类，它至少包含一个纯虚函数，不能被实例化。

**作用**：
  - **定义接口**：抽象类通常用来定义一个接口，规定派生类必须实现的函数。
  - **强制实现**：确保派生类实现某些行为，通过纯虚函数强制派生类提供具体实现。
  - **多态性**：作为多态性的基础，允许通过基类指针或引用调用派生类重写的虚函数。

**派生类实现纯虚函数**：是的，抽象类的派生类必须提供所有纯虚函数的实现。如果派生类没有实现所有纯虚函数，那么该派生类也会变成抽象类，不能被实例化。

3. 声明一个参数为整型，无返回值，名为`fn1`的虚函数。

声明一个参数为整型，无返回值，名为 `fn1` 的虚函数可以这样写：

```cpp
virtual void fn1(int n) = 0;
```

这里，`fn1` 是一个纯虚函数，因为它后面跟着 `= 0`。这意味着任何从这个类派生出的类都必须实现 `fn1` 函数。

4. 在C++中，能否声明虚构造函数？为什么？能否声明虚析构函数？有何用途？

**虚构造函数**：在C++中，不能声明虚构造函数。构造函数的目的是初始化对象，而虚函数的目的是实现多态性，即在运行时确定调用哪个函数。由于对象在构造时其类型已经确定，因此不需要在构造函数中实现多态性。

**虚析构函数**：可以声明虚析构函数，并且通常是一个好的做法。虚析构函数的用途是确保当通过基类指针删除派生类对象时，能够正确地调用派生类的析构函数，然后才是基类的析构函数。这样可以避免资源泄露和未定义行为。

声明虚析构函数的示例：

```cpp
class Base {
public:
    virtual ~Base() {
        // 基类的析构代码
    }
};

class Derived : public Base {
public:
    ~Derived() {
        // 派生类的析构代码
    }
};
```

在这个例子中，`Base` 类有一个虚析构函数，这样当删除 `Derived` 类的对象时，首先调用 `Derived` 的析构函数，然后调用 `Base` 的析构函数，确保对象被正确地清理。

## 第七章作业题

1. 设计复数类，并以运算符重载的方式设计复数的加、乘运算。
复数的结构为`x+yi`，请以`(x,y)`作为成员变量定义复数类`complex`及其构造函数、输出函数；
  - 以友元函数方式，设计实现复数加法（即对“+”的运算符重载）；
  - 以友元函数方式，设计实现复数减法（即对“-”的运算符重载）；
  - 以成员函数方式，设计实现复数乘法（即对“*”的运算符重载）；
  - 以成员函数方式，设计实现复数赋值运算（即对“=”的运算符重载）；
在主程序中，创建3个复数对象，分别初始化这3个复数对象。最终以相应的重载运算符完成3个复数之间的运算，并输出运算结果。

```cpp
#include <iostream>
using namespace std;

class Complex {
private:
    double real; // 实部
    double imag; // 虚部

public:
    // 构造函数
    Complex(double r = 0.0, double i = 0.0) : real(r), imag(i) {}

    // 输出函数
    void display() {
        cout << "(" << real << " + " << imag << "i)" << endl;
    }

    // 运算符 "+" 的重载声明
    friend Complex operator+(const Complex& s1,const Complex& s2); 

    // 运算符 "-" 的重载声明
    friend Complex operator-(const Complex& s1,const Complex& s2);

    // 运算符 "*" 的重载声明
    Complex operator*(const Complex& rhs);//rhs即righthand s，指符号右边的对象s 

    // 运算符 "=" 的重载声明
    Complex& operator=(const Complex& rhs);
};

// 运算符 "+" 的重载定义
Complex operator+(const Complex& s1,const Complex& s2) {
    return Complex(s1.real + s2.real, s1.imag + s2.imag);
}

// 运算符 "-" 的重载定义
Complex operator-(const Complex& s1,const Complex& s2) {
    return Complex(s1.real - s2.real, s1.imag - s2.imag);
}

// 运算符 "*" 的重载定义
Complex Complex::operator*(const Complex& rhs) {
    return Complex(real * rhs.real - imag * rhs.imag, real * rhs.imag + imag * rhs.real);
}

// 运算符 "=" 的重载定义
Complex& Complex::operator=(const Complex& rhs) {
    real = rhs.real;
    imag = rhs.imag;
}

int main() {
    // 创建三个复数对象
    Complex c1(5, 3), c2(2, 7), c3;

    // 输出初始复数
    cout << "第一个复数是: ";
    c1.display();
    cout << "第二个复数是: ";
    c2.display();

    // 复数加法
    c3 = c1 + c2;
    cout << "两个复数之和是: ";
    c3.display();

    // 复数减法
    c3 = c1 - c2;
    cout << "两个复数之差是: ";
    c3.display();

    // 复数乘法
    c3 = c1 * c2;
    cout << "两个复数之积是: ";
    c3.display();

    return 0;
}
```

2. 声明一个车（`vehicle`）基类，有 `Run`、`Stop` 等成员函数（输出类和程序信息即可，如 `Vehicle is running`），由此派生出自行车（`bicycle`） 类、汽车（`motorcar`）类，从 `bicycle` 和 `motorcar` 派生出摩托车（`motorcycle`）类，它们都有 `Run`、`Stop` 等成员函数。观察虚函数的作用。
提示：用基类的指针数组，`vehicle * a[10];`每一个数组元素指向一个派生类对象地址（使用`new`操作生成对象，如`a[0]=new bicyle;`），用循环运行数组`a`每个元素的`run`和`stop`，用程序注释说明多态性是什么，如何实现多态，如果不用虚函数输出的结果是什么。

```cpp
#include <iostream>
using namespace std;

// 基类 Vehicle
class Vehicle {
public:
    virtual void Run() {
        cout << "Vehicle is running." << endl;
    }
    virtual void Stop() {
        cout << "Vehicle is stopping." << endl;
    }
    virtual ~Vehicle() {} // 虚析构函数
};

// 派生类 Bicycle
class Bicycle : virtual public Vehicle {
public:
    void Run() override {
        cout << "Bicycle is running." << endl;
    }
    void Stop() override {
        cout << "Bicycle is stopping." << endl;
    }
};

// 派生类 Motorcar
class Motorcar : virtual public Vehicle {
public:
    void Run() override {
        cout << "Motorcar is running." << endl;
    }
    void Stop() override {
        cout << "Motorcar is stopping." << endl;
    }
};

// 派生类 Motorcycle，从 Bicycle 和 Motorcar 派生
class Motorcycle : public Bicycle, public Motorcar {
public:
    void Run() override {
        cout << "Motorcycle is running." << endl;
    }
    void Stop() override {
        cout << "Motorcycle is stopping." << endl;
    }
};

int main() {
    Vehicle* a[3];

    // 创建对象
    a[0] = new Bicycle();
    a[1] = new Motorcar();
    a[2] = new Motorcycle();

    // 使用指针数组调用每个对象的 Run 和 Stop 函数
    for (int i = 0; i < 3; i++) {
        a[i]->Run();
        a[i]->Stop();
    }

    // 释放内存
    for (int i = 0; i < 3; i++) {
        delete a[i];
    }

    return 0;
}
/*(1) 多态性的实现：我们在 Vehicle 类中将 Run 和 Stop 函数声明为虚函数，使得它们可以在派生类中被重写。
然后又在 Bicycle、Motorcar 和 Motorcycle 类都重写了这些虚函数，提供了各自的不同的实现。
接着在 main 函数中，我们创建了一个 Vehicle 类型的指针数组 a，并将每个指针初始化为指向一个派生类对象。
通过基类指针数组，我们可以调用每个对象的 Run 和 Stop 函数。由于 Run 和 Stop 是虚函数，所以调用的是相
应派生类中重写的版本，这就是多态性的实现。

(2) 如果我们不使用虚函数，那么不管数组中实际对象的类型如何，总是会调用 Vehicle 类中的 Run 和 Stop 函数，
也就是总会输出"Vehicle is running."和"Vehicle is stopping."。*/
```

3. 纯虚函数与抽象类：
测试以下程序，说明是否能够正常运行，如果不能，说明错误原因是什么？并进行更改。将修改好的程序上传。用程序注释说明哪个是抽象类，抽象类的特点是什么。

```cpp
#include <string>
#include <iostream>
#include <stdlib.h>
using namespace std;
class Person
{
	public:
		Person(string name);
		virtual void work() = 0; //定义函数work()为纯虚函数
		virtual ~Person() { }
	private:
		string m_strName;
};
Person::Person(string name)
{
	m_strName =name;
}
class Worker:public Person
{
	public:
		Worker(string name, int age);
	private:
		int m_iAge;
};
Worker::Worker(string name, int age):Person(name)
{
	m_iAge =age;
}
int main()
{
	Worker worker("ZhangSan", 30);
	system("pause");
	return 0;
}
```
修改好的程序是：
```cpp
/*原始程序的错误原因是： 

(1)m_strName是类Person的私有成员，不可以被派生类Worker直接访问，因此应该改为公有成员。 

(2)纯虚函数未实现：Worker 类从 Person 类继承而来，但没有实现纯虚函数 work()，
因此 Worker 类也应该是抽象类，不能被实例化。需要在Worker类中实现虚函数work()，
后面才能构造worker对象。 

下面是修改后的程序：*/

#include <string>
#include <iostream>
#include <stdlib.h>
using namespace std;

class Person // Person 是抽象类，因为它含有纯虚函数 work()，其特点是
//不能被直接实例化，也就是说你不能创建一个抽象类的直接对象 
{
	public:
		Person(string name);
		virtual void work() = 0; //定义函数work()为纯虚函数
		virtual ~Person() {}
	//在此处删除掉了private，是为了使得派生类能够访问m_strName 
		string m_strName;
};

Person::Person(string name)
{
	m_strName =name;
}

class Worker:public Person
{
	public:
		Worker(string name, int age);
		void work() override {} //在此处实现了work函数，使得类Worker不再是抽象类 
	private:
		int m_iAge;
};

Worker::Worker(string name, int age):Person(name)
{
	m_iAge =age;
}

int main()
{
	Worker worker("ZhangSan", 30);
	system("pause");
	return 0;
}
```

# 第八章 流类库与输入输出

## 8.1 I/O流的概念及流类库结构

## 8.2 输出流

### 8.2.1 构造输出流对象

如果要使用文件流将信息输出到文件，便需要使用构造函数来建立流对象。

构造文件输出流的常用方法如下。

  - 使用默认构造函数，然后调用`open`成员函数。例如：

```cpp
ofstream myFile;  //定义一个静态文件输出流对象
myFile.open("filename");  //打开文件，使流对象与文件建立联系
```

  - 在调用构造函数时指定文件名：

```cpp
ofstream myFile("filename");
```

  - 也可以使用同一个流先后打开不同的文件(在同一时刻只有一个是打开的)：

```cpp
ofstream file;
file.open("FILE1");  //打开文件FILE1
// ······ 向文件FILE1输出
file.close();  //关闭FILE1
file.open("FILE2");  //打开文件FILE2
// ······ 向文件FILE2输出
file.close();  //关闭FILE2
//当对象file离开它的作用域时便消亡
```

### 8.2.2 使用插入运算符和操作符

1. 输出宽度
为了调整输出，可以通过在流中放入`stew`操作符或调用`width`成员函数为每个项指定输出宽度。

2. 对齐方式
我们可以通过使用带参数的`setiosflags`操作符来设置左右对齐，这个操作符定义在头文件`iomanip`中。参数`ios_base::left`是`ios_base`的静态常量，因此引用时必须包括`ios_base::`前缀。这里需要用`resetiosflags`操纵符关闭左对齐标志。`setiosflags`不同于`stew`和`width`，它的影响是持久的，直到用`resetiosflags`操纵符重新恢复默认值为止。

3. 精度
浮点数输出精度的默认值是6，为了改变精度，可以使用`setprecision`操纵符(定义在头文件`iomanip`中)。此外，还有两个标志会改变浮点数的输出格式，即`ios_base::fixed`和`ios_base::scientific`。前者使得小数点后有6位，后者是科学计数法。

4. 进制
`dec,oct,hex`操纵符设置输入和输出的默认进制，分别对应十进制、八进制、十六进制。

### 8.2.3 文件输出流成员函数

1. 输出流的`open`函数
要使用一个文件输出流(ofstream)，必须在构造函数或`open`函数中把该流与一个特定的磁盘文件关联起来。这两种情况下，描述文件的参数是相同的。

2. 输出流的`close`函数
`close`成员函数关于与一个文件输出流关联的磁盘文件。

3. `put`函数
`put`函数把一个字符写到输出流中，下面两个语句默认是相同的，但第二个受该流格式化参量的影响。

```cpp
cout.put('A');  //精确地输出一个字符
cout<<'A';  //输出一个字符，但此前设置的宽度和填充方式在此起作用
```

4. `write`函数
`write`函数把一个内存中的一块内容写到一个文件输出流中，长度参数指出写的字节数。

5. `seekp`和`tellp`函数
一个文件输出流保存一个内部指针指出下一次写数据的位置。`seekp`成员函数设置这个指针，因此可以以随机方式向磁盘文件输出。`tellp`成员函数返回该文件位置指针值。

6. 错误处理函数

### 8.2.4 二进制输出文件

### 8.2.5 字符串输出流

## 8.3 输入流

### 8.3.1 构造输入流对象

建立一个文件输入流的常用方式如下。

  - 使用默认构造函数建立对象，然后调用`open`成员函数打开文件，例如：

```cpp
ifstream myFile;  //建立一个文件流对象
myFile.open("filename");  //打开文件filename
```

  - 在调用构造函数建立文件流对象时指定文件名和模式，在构造过程中打开该文件，例如：

```cpp
ifstream myFile("filename");
```

### 8.3.2 使用提取运算符

### 8.3.3 输入流操纵符

### 8.3.4 输入流相关函数

1. 输入流的`open`函数
如果要使用一个文件输入流(ifstream)，必须在构造函数中或者使用`open`函数把该流与一个特定磁盘文件关联起来。无论用哪种方式，参数是相同的。

2. 输入流的`close`函数
`close`成员函数关闭与一个文件输入流关联的磁盘文件。

3. `get`函数
非格式化`get`函数的功能与提取运算符(">>")很相像，主要的不同点是`get`函数在读入数据时包括空白字符，而提取运算符在默认情况下拒绝接受空白字符。

4. `getline`函数
`istream` 类具有成员函数 `getline`，其功能是允许从输人流中读取多个字符，并且允许指定输入终止字符(默认值是换行字符)，在读取完成后，从读取的内容中删除该终止字符。然而该成员函数只能将输入结果存在字符数组中，字符数组的大小是不能自动扩展的，造成了使用上的不便。非成员函数 `getline` 能够完成相同的功能，但可以将结果保存在 `string` 类型的对象中，更加方便。这一函数可以接收两个参数，前两个分别表示输人流租保存结果的 `string` 对象，第三个参数可选，表示终止字符。使用非成员的 `getline` 函数的声明在 string 头文件中。

5. `read`函数
`read`成员函数从一个文件读字节到一个指定的存储器区域，由长度参数确定要读的字节数。如果给出长度参数，当遇到文件结束或者在文本模式文件中遇到文件结束标记字符时读结束。

6. `seekg`和`tellg`函数
在文件输入流中，保留着一个指向文件中下一个将读数据的位置的内部指针，可以用`seekg`函数来设置这个指针。

使用`seekg`可以实现面向记录的数据管理系统，用固定长度的记录尺寸乘以记录号便得到相对于文件末尾的字节位置，然后用`get`读这个记录。

`tellg`成员函数返回当前文件读指针的位置，这个值是`streampos`类型。

### 8.3.5 字符串输入流

## 8.4 输入输出流

## 第八章作业题

1. 编写程序，打开一个文件（附件test1.txt），在每一行前加行号，然后存到另一个文件中。
提示：使用`getline`函数读取行。

```cpp
#include <iostream> 
#include <fstream>   // 文件流库，用于文件读写操作
#include <string>    // 字符串库
using namespace std; 

int main() {
    ifstream inputFile("test1.txt");  // 创建输入文件流对象，尝试打开文件test1.txt
    ofstream outputFile("output.txt");  // 创建输出文件流对象，尝试打开文件output.txt

    int lineNumber = 1;  // 定义行号，初始化为1

    // 检查输入文件是否成功打开
    if (!inputFile.is_open()) {
        cerr << "Error opening input file." << endl;  // 如果失败，输出错误信息
        return 1;  // 返回错误代码1
    }
    // 检查输出文件是否成功打开
    if (!outputFile.is_open()) {
        cerr << "Error opening output file." << endl;  // 如果失败，输出错误信息
        return 1;  // 返回错误代码1
    }

    string line;  // 定义字符串变量，用于存储读取的每一行内容

    // 使用循环读取输入文件的每一行
    while (getline(inputFile, line)) {
        // 写入行号、空格、读取的行内容和换行符到输出文件
        outputFile << lineNumber++ << " " << line << endl;
    }

    // 关闭文件流
    inputFile.close();  // 关闭输入文件流
    outputFile.close();  // 关闭输出文件流

    return 0;
}
```

2. 重载流操作符
定义一个复数类`complex`
```cpp
class Complex {
     priate:
           int real;
           int imag;
     public:
           Complex(int r=0, int i=0):real(r),imag(i) {
                  cout << real << " + " << imag << "i" ;
                  cout << "complex class constructed."
           } 
           // overload global function
           friend ostream & operator<<(ostream & o, const Complex & c);
           friend istream & operator >> (istream & i, Complex & c);
}
```
定义对应输入输出操作。
最后用下列代码测试
```cpp
int main{
 Complex c, c1; 
 cin >> c; //input 
 cout << c <<";" << c1 << " complex output.";
 // output : 3+4i; 0+0i complex output. 
} 
```

解答如下：

```cpp
#include <iostream>
#include <ostream>   // 输出流库
#include <istream>   // 输入流库 
using namespace std; 

class Complex {
     private:
           int real;
           int imag;
     public:
           Complex(int r=0, int i=0):real(r),imag(i) {
                  cout << real << " + " << imag << "i" ;
                  cout << "complex class constructed."<<endl;
           } 
           // overload global function
           friend ostream & operator<<(ostream & o, const Complex & c){
           	return o << c.real << " + " << c.imag << "i";
           }
           friend istream & operator >> (istream & i, Complex & c){
           	return i >> c.real >> c.imag;
           }
};

int main(){
 Complex c, c1; 
 cout<<"请输入复数c："<<endl;
 cin >> c; //input 
 cout << c <<";" << c1 << " complex output.";
 // output : 3+4i; 0+0i complex output. 
} 
```

```cpp
#include<iostream>
using namespace std;
int main(){
    
}
```

---
*注：本站使用vue3框架，详细技术可致信CircleCoder。*

