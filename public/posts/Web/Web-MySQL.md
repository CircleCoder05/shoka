---
layout: post
title: "MySQL"
date:   2025-05-02
tags: [Web]
comments: true
categories:
- [Web]
author: CircleCoder
---

![image-20250516164719054](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505161647465.png)

连接 `MySQL`

```mysql
mysql -u root -p
```

---

### 数据库管理 （文件夹）


- 查看已有数据库

    ```mysql
    show databases;
    ```

- 创建数据库

    ```mysql
    create database [name];

    create database [name] DEFAULT CHARSET utf8 COLLATE utf8_general_ci;
    ```

- 删除数据库

    ```mysql
    drop database [name];
    ```

- 进入数据库

  ```mysql
  use [name];
  ```

- 查看数据库中所有数据表

  ```mysql
  show tables;
  ```

---

### 数据表的管理（文件）

- 进入数据库（进入文件夹）

  ```mysql
  use [name];
  ```

- 查看当前数据库下的所有 表（文件）

  ```mysql
  show tables;
  ```

- 创建表（文件文件）

  ```mysql
  create table 表名称(
  	列名称 类型,
      列名称 类型,
      列名称 类型
  )default charset=utf8;
  ```

  ![image-20211123140828409](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505161334581.png)

  ```mysql
  create table tb1(id int, name varchar(16),age int) default charset=utf8;
  ```

  ```mysql
  create table tb1(
      id int, 
      name varchar(16) not null,   -- 不允许为空
      age int null,                -- 允许为空（默认）
  ) default charset=utf8;
  ```

  ```mysql
  create table tb1(
      id int, 
      name varchar(16),
      age int default 3        -- 插入数据时，age列的值默认3
  ) default charset=utf8;
  ```

  ```mysql
  create table tb1(
      id int primary key,     -- 主键（不允许为空，不允许重复）
      name varchar(16),
      age int
  ) default charset=utf8;
  ```

  主键一般用于表示当前行的数据的编号（类似于人的身份证）。

  ```mysql
  create table tb1(
      id int auto_increment primary key, -- 内部维护，自增
      name varchar(16),
      age int
  ) default charset=utf8;
  ```

  一般情况下，我们再创建表时都会这样来写：【标准】

  ```mysql
  create table tb1(
      id int not null auto_increment primary key,
      name varchar(16),
      age int
  ) default charset=utf8;
  ```

  ```shell
  mysql> desc tb1;
  +-------+-------------+------+-----+---------+----------------+
  | Field | Type        | Null | Key | Default | Extra          |
  +-------+-------------+------+-----+---------+----------------+
  | id    | int(11)     | NO   | PRI | NULL    | auto_increment |
  | name  | varchar(16) | YES  |     | NULL    |                |
  | age   | int(11)     | YES  |     | NULL    |                |
  +-------+-------------+------+-----+---------+----------------+
  3 rows in set (0.00 sec)
  ```

- 删除表

  ```mysql
  drop table 表名称;
  ```

---

### 常用数据类型：

- `tinyint`

  ```
  有符号，取值范围：-128 ～ 127 (有正有负)【默认】
  无符号，取值范围：0 ～ 255（只有正）
  ```

  ```sql
  create table tb2(
      id int not null auto_increment primary key,
      age tinyint   -- 有符号：取值范围：-128 ～ 127
  ) default charset=utf8;
  ```

  ```sql
  create table tb3(
      id int not null auto_increment primary key,
      age tinyint unsigned -- 无符号：取值范围：0 ～ 255
  ) default charset=utf8;
  ```

- `int`

  ```c
  int				表示有符号，取值范围：-2147483648 ～ 2147483647
  int unsigned	表示无符号，取值范围：0 ～ 4294967295
  ```

- `bigint`

  ```c
  有符号，取值范围：-9223372036854775808 ～ 9223372036854775807
  无符号，取值范围：0  ～  18446744073709551615
  ```


- `float`

- `double`

- `decimal`

  ```mysql
  准确的小数值，m是数字总个数（负号不算），d是小数点后个数。 m最大值为65，d最大值为30。
  
  例如：
  create table tb3(
  	id int not null primary key auto_increment,
  	salary decimal(8,2)
  )default charset=utf8;
  
  insert into tb3(salary) values(1.28);
  insert into tb3(salary) values(5.289);
  insert into tb3(salary) values(5.282);
  insert into tb3(salary) values(122115.11);
  
  select * from tb3;
  ```

- `char(m)`，速度快。

  ```mysql
  定长字符串，m代表字符串的长度，最多可容纳255个字符。
  
  char(11)，固定用11个字符串进行存储，哪怕真是没有11个字符，也会按照11存储。
  
  create table tb4(
  	id int not null primary key auto_increment,
  	mobile char(11)
  )default charset=utf8;
  
  insert into tb4(mobile) values("151");
  insert into tb4(mobile) values("15131255555");
  ```

- `varchar(m)`，节省空间。

  ```mysql
  变长字符串，m代表字符的长度。   最大65535字节/3 = 最大的m
  
  varchar(11)，真实数据有多少长久按照多长存储。
  
  create table tb5(
  	id int not null primary key auto_increment,
  	mobile varchar(11)
  )default charset=utf8;
  
  insert into tb5(mobile) values("151");
  insert into tb5(mobile) values("15131255555");
  ```

- `text`

  ```mysql
  text数据类型用于保存变长的大字符串，可以组多到65535 (2**16 − 1)个字符。
  
  一般情况下，长文本会用text类型。例如：文章、新闻等。
  
  create table tb6(
  	id int not null primary key auto_increment,
      title varchar(128),
  	content text
  )default charset=utf8;
  ```

- `mediumtext`

  ```mysql
  A TEXT column with a maximum length of 16,777,215 (2**24 − 1) characters.
  ```

- `longtext`

  ```mysql
  A TEXT column with a maximum length of 4,294,967,295 or 4GB (2**32 − 1)
  ```

- `datetime`

  ```mysql
  YYYY-MM-DD HH:MM:SS（1000-01-01 00:00:00/9999-12-31 23:59:59）
  ```

- `date`

  ```mysql
  YYYY-MM-DD（1000-01-01/9999-12-31）
  ```

---

###  数据行操作

#### 1. 新增数据

```sql
insert into 表名(列名,列名) values(值,值);
insert into 表名(列名,列名) values(值,值),(值,值),(值,值),(值,值);
```

#### 2.删除数据

```sql
delete from 表名;
delete from 表名 where 条件;
```

```sql
delete from tb7;
delete from tb7 where id = 3;
delete from tb7 where id = 4 and name="谢涛";
delete from tb7 where id = 4 or name="谢涛";
delete from tb7 where id > 4;
delete from tb7 where id >= 4;
delete from tb7 where id != 4;
delete from tb7 where id in (1,5);
```

#### 3.修改数据

```sql
update 表名 set 列=值;
update 表名 set 列=值,列=值;
update 表名 set 列=值 where 条件;
```

```sql
update tb7 set password="哈哈哈";
update tb7 set email="哈哈哈" where id > 5;

update tb7 set age=age+10 where id > 5;
```

#### 4.查询数据

```sql
select * from 表名称;
select 列名称,列名称 from 表名称;

select 列名称,列名称 from 表名称 where 条件;
```

```sql
select * from tb7;
select id,name from tb7;
select id,name from tb7 where id > 10;
select id,name from tb7 where name="xx" and password="xx";
```

---

### python 操作 MySQL

#### 1.创建数据

```python
import pymysql

# 1.连接MySQL
conn = pymysql.connect(host="127.0.0.1", port=3306, user='root', passwd="root123", charset='utf8', db='unicom')
cursor = conn.cursor(cursor=pymysql.cursors.DictCursor)

# 2.发送指令
cursor.execute("insert into admin(username,password,mobile) values('wupeiqi','qwe123','15155555555')")
conn.commit()

# 3.关闭
cursor.close()
conn.close()
```

```python
import pymysql

# 1.连接MySQL
conn = pymysql.connect(host="127.0.0.1", port=3306, user='root', passwd="root123", charset='utf8', db='unicom')
cursor = conn.cursor(cursor=pymysql.cursors.DictCursor)

# 2.发送指令（千万不要用字符串格式化去做SQL的拼接，安全隐患SQL注入）
# sql = "insert into admin(username,password,mobile) values(%s,%s,%s)"
# cursor.execute(sql, ["韩超", "qwe123", "1999999999"])

# sql = "insert into admin(username,password,mobile) values( %(n1)s, %(n2)s, %(n3)s)"
# cursor.execute(sql, {"n1": "集宁", "n2": "qwe123", "n3": "1999999999"})

conn.commit()

# 3.关闭
cursor.close()
conn.close()
```

```python
import pymysql

while True:
    user = input("用户名：")
    if user.upper() == 'Q':
        break
    pwd = input("密码：")
    mobile = input("手机号：")

    # 1.连接MySQL
    conn = pymysql.connect(host="127.0.0.1", port=3306, user='root', passwd="root123", charset='utf8', db='unicom')
    cursor = conn.cursor(cursor=pymysql.cursors.DictCursor)

    # 2.发送指令（千万不要用字符串格式化去做SQL的拼接，安全隐患SQL注入）
    sql = "insert into admin(username,password,mobile) values(%s,%s,%s)"
    cursor.execute(sql, [user, pwd, mobile])
    conn.commit()

    # 3.关闭
    cursor.close()
    conn.close()
```



#### 2.查询数据

```python
import pymysql

# 1.连接MySQL
conn = pymysql.connect(host="127.0.0.1", port=3306, user='root', passwd="root123", charset='utf8', db='unicom')
cursor = conn.cursor(cursor=pymysql.cursors.DictCursor)

# 2.发送指令（ *** 千万不要用字符串格式化去做SQL的拼接，安全隐患SQL注入***）
cursor.execute("select * from admin where id > %s", [2, ])

# 获取符合条件的所有数据，得到的是 [ 字典,字典, ]    空列表
data_list = cursor.fetchall()
for row_dict in data_list:
    print(row_dict)

# 3.关闭连接
cursor.close()
conn.close()
```

```python
import pymysql

# 1.连接MySQL
conn = pymysql.connect(host="127.0.0.1", port=3306, user='root', passwd="root123", charset='utf8', db='unicom')
cursor = conn.cursor(cursor=pymysql.cursors.DictCursor)

# 2.发送指令（ *** 千万不要用字符串格式化去做SQL的拼接，安全隐患SQL注入***）
cursor.execute("select * from admin where id > %s", [2, ])

# 获取符合条件的第一条数据，字典    None
res = cursor.fetchone()
print(res)  # {'id': 3, 'username': '集宁', 'password': 'qwe123', 'mobile': '1999999999'}

# 3.关闭连接
cursor.close()
conn.close()
```



#### 删除数据

```python
import pymysql

# 1.连接MySQL
conn = pymysql.connect(host="127.0.0.1", port=3306, user='root', passwd="root123", charset='utf8', db='unicom')
cursor = conn.cursor(cursor=pymysql.cursors.DictCursor)

# 2.发送指令（ *** 千万不要用字符串格式化去做SQL的拼接，安全隐患SQL注入***）
cursor.execute("delete from admin where id=%s", [3, ])
conn.commit()

# 3.关闭
cursor.close()
conn.close()
```



#### 修改数据

```python
import pymysql

# 1.连接MySQL
conn = pymysql.connect(host="127.0.0.1", port=3306, user='root', passwd="root123", charset='utf8', db='unicom')
cursor = conn.cursor(cursor=pymysql.cursors.DictCursor)

# 2.发送指令（ *** 千万不要用字符串格式化去做SQL的拼接，安全隐患SQL注入***）
cursor.execute("update admin set mobile=%s where id=%s", ["1888888888", 4, ])
conn.commit()

# 3.关闭
cursor.close()
conn.close()
```



注意：

- 在进行 新增、删除、修改时，一定要记得 `commit`，不然数据库么有数据。

  ```python
  cursor.execute("..")
  conn.commit()
  ```

- 在查询时，不需要 `commit`，执行 `fetchall / fetchone`

  ```python
  cursor.execute("...")
  
  # 第一条数据，字典，无数据时是空列表
  v1 = cursor.fetchone()
  
  # 所有数据，列表套字典，无数据时是None
  v1 = cursor.fetchall()
  ```

- 对于 `SQL` 语句不要用 `Python` 的字符串格式化进行拼接（会被 `SQL` 注入），一定要用 `execute` +参数

  ```python
  cursor.execute(".%s..... %s", ["xx","xx"])
  ```

  





### orm 框架

