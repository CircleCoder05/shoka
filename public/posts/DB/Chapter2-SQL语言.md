---
layout: post
title: 'DB-Chapter2-SQL'
date: 2025-10-09
tags: [DB, 理论]
comments: true
categories: [数据库]
author: CircleCoder
---

## 基本概念

- **特点**： 综合统一（集数据定义、查询、更新、控制于一体） 高度非过程化（用户只需指出“做什么”） 面向集合的操作方式 两种使用方式（独立使用/嵌入式） 语法简洁

- **基本表（Base Table）**：实际存储数据的表。
- **导出表**： **视图（View）**：虚表，仅存储定义，数据来自基本表（示例：`CREATE VIEW CS_Student AS ...`）。
- **快照（Snapshot）**：某一时刻的数据副本。
- **三级模式结构**：视图对应外模式，基本表对应模式，存储文件对应内模式。

## 数据查询（SELECT）

### 基本结构

![image-20251010152832579](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510101528823.png)

水平选择（WHERE） + 垂直投影（SELECT）。

```sql
SELECT 目标列
FROM 表/视图
WHERE 条件；
```

![image-20251010122845640](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510101228790.png)

### 投影检索

```sql
SELECT SN, SA FROM S;  -- 查询姓名、年龄
SELECT DISTINCT C# FROM SC;  -- 去重查询
```

### 选取检索

![image-20251010155934413](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510101559693.png)

```sql
SELECT S#, G FROM SC WHERE C#='C2';  -- 检索选修C2课程的所有学生的学号和成绩
SELECT S#, C#, G FROM SC WHERE G BETWEEN 70 AND 85;  -- 检索成绩在70至85分之间的学生学号、课程号和成绩。
```

### 排序检索

```sql
ORDER BY 列名 ASC 或 DESC	-- 缺省为升序
```

```sql
SELECT * FROM S ORDER BY SD, SA DESC;  -- 多列排序: 检索全体学生信息，并按系号升序，同一个系按年龄降序排列
```

### 连表检索

```sql
SELECT	—— 指明选取的列名（来自多个表）
FROM	—— 指明要进行连接的表名
WHERE	——指明连接条件（连接谓词）与选取条件。
```

- 普通连接：

  ```sql
  SELECT SN, C#, G
  	FROM S, SC
  	WHERE S.S#=SC.S# AND SN='张华';	-- 检索学生张华所学课程的成绩
  ```

- 自连接（定义别名）：

  ```sql
  SELECT X.SN, X.SA
  	FROM S X, S Y
  	WHERE X.SA>Y.SA AND Y.SN='李勇';	-- 检索所有比李勇年龄大的学生姓名、年龄
  ```

- 外连接（用\*或+）：

  ![image-20251010151112568](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202510101511816.png)

  ```sql
  SELECT *
  	FROM S, SC
  	WHERE S.S#=SC.S#(*);  -- 检索所有学生的全部信息，包含未选课学生
  ```

### 子查询嵌套

先执行子查询，再将子查询的结果作为条件值或数据源，提供给主查询使用

- 普通子查询（独立执行）：

  ```sql
  SELECT SN
  	FROM S
  	WHERE SA = (SELECT SA FROM S WHERE SN='李勇');	-- 检索与李勇同岁的学生姓名
  ```

- 相关子查询（依赖外部查询）：

  ```sql
  SELECT SN
  	FROM S
  	WHERE EXISTS
  		(SELECT * FROM SC WHERE S#=S.S# AND C#='C2');
  ```

- 用`IN`/`NOT IN`：

  ```sql
  SELECT SN
  	FROM S
  	WHERE S# IN
  		(SELECT S# FROM SC WHERE C#='C2');
  ```

- 用`EXISTS`/`NOT EXISTS`（尤其用于全称查询）：

  ```sql
  -- 查询选修所有课程的学生（等价于“没有不选修的课程”）
  SELECT SN FROM S WHERE NOT EXISTS (
      SELECT * FROM C WHERE NOT EXISTS (
          SELECT * FROM SC WHERE S#=S.S# AND C#=C.C#
      )
  );
  ```

### 集合运算

`UNION`（并）、`MINUS`（差）、`INTERSECT`（交），需要相容关系

```sql
SELECT S# FROM SC WHERE C#='C1'
UNION
SELECT S# FROM SC WHERE C#='C2';
```

### 库函数

`COUNT()`, `SUM()`, `AVG()`, `MAX()`, `MIN()`

只能在`SELECT`子句和`HAVING`子句中出现

```sql
SELECT COUNT(DISTINCT S#) FROM SC;  -- 选修课程的学生人数
```

### 分组检索

按属性列（列组）将关系的元组分组，每组在这些分组属性列（列组）上具有相同值，对每一组执行SELECT操作。

```sql
GROUP BY 列名
[ HAVING 条件表达式] ——分组条件
```

```sql
SELECT S#, COUNT(*)
	FROM SC
		GROUP BY S#
		HAVING COUNT(*)>=3;  -- 选修≥3门课的学生
```

```sql
SELECT S#，SUM（G）
	FROM SC
	WHERE G>=60
		GROUP BY S#
		HAVING COUNT(*) >=4
		ORDER BY SUM(G) DESC;	-- 求选修四门以上课程的学生学号和总成绩（不统计不及格的课程）。最后按降序列出总成绩排序名单
```

### 部分匹配

```sql
SELECT S#, SN FROM S WHERE SN LIKE '刘%';  -- 姓刘的学生
```

### 派生表

子查询在FROM中

```sql
SELECT S#, C#
	FROM SC, (SELECT S#, AVG(G) FROM SC GROUP BY S#) AS AVG_SC
	WHERE SC.S#=AVG_SC.S# AND SC.G>=AVG_SC.AVG_G;
```

## 数据定义

### 基本表

- **创建表**：

  ```sql
  Create Table <表名>
  (<列名><数据类型>[<列级完整性约束>]
  [{,<列名><数据类型>[<列级完整性约束>]}]
  [{, [<表级完整性约束>]}]);
  ```

  ```sql
  CREATE TABLE S (
      S# CHAR(5) NOT NULL UNIQUE,
      SN CHAR(20) NOT NULL,
      SA INT,
      SD CHAR(15),
      PRIMARY KEY(S#),
      CHECK(SA>=18 AND SA<=45)
  );
  ```

- **修改表**：

  ```sql
  ALTER TABLE S ADD Scome DATE;  -- 增加列
  ALTER TABLE S MODIFY SA SMALLINT;  -- 修改类型
  ```

- **删除表**：`DROP TABLE S;`

### 索引

- **创建索引**：

  ```sql
  Create [Unique][Cluster] Index <索引名>
  On <表名> (<列名>[次序][, <列名>[次序]] …);
  ```

  ```sql
  CREATE UNIQUE INDEX Scno ON SC(S# ASC, C# DESC);
  ```

- **删除索引**：`DROP INDEX Stusno;`

### 视图

- **定义视图**：

  ```sql
  Create View <视图名>
  [(<列名>[,<列名>] …)]
  As <子查询>
  [With Check Option]
  ```

  ```sql
  CREATE VIEW CS_Student AS
      SELECT S#, SN, SA FROM S WHERE SD='CS';
  ```

- **删除视图**：`DROP VIEW CS_Student;`

- **视图查询（视图消解）**：DBMS将视图查询转换为对基本表的查询。

## 数据更新

- **插入数据**：

  ```sql
  # 插入单个元组
  Insert Into <表名>[(<属性列>[{,<属性列>}])]
  	Values(<值>[{,<值>}])

  # 插入子查询
  Insert Into <表名>[(<属性列>[{,<属性列>}])]
  	<子查询>
  ```

  ```sql
  INSERT INTO S
  	VALUES ('S10', '陈冬', 'IS', 18);  -- 插入元组

  INSERT INTO Dept_Age(Sdept, Avgage)
  	SELECT SD, AVG(SA) FROM S GROUP BY SD;  -- 插入子查询结果
  ```

- **修改数据**：

  ```sql
  Update <表名>
  	Set <列名>=<表达式>[{, <列名>=<表达式>}]
  	[Where <条件>]
  ```

  ```sql
  UPDATE S SET SA=22 WHERE S#='S1';
  ```

- **删除数据**：

  ```sql
  Delete From <表名> [Where <条件>]
  ```

  ```
  DELETE FROM SC WHERE 'CS' = (SELECT SD FROM S WHERE S.S#=SC.S#);  -- 删除计算机系学生的选课记录
  ```

## 数据控制

- **授权**：

  ```
  GRANT 权限 ON 对象 TO 用户;
  ```

- **收回权限**：

  ```
  REVOKE 权限 ON 对象 FROM 用户;
  ```

## 空值处理

- **特点**：表示未知/不存在/无意义（`NULL`）。

- **约束**：主属性、`NOT NULL`或`UNIQUE`列不可为空。

- **运算**：与任何值运算结果为`NULL`，比较结果为`UNKNOWN`（三值逻辑）。

- **检索**：

  ```
  SELECT * FROM S WHERE SD IS NULL;  -- 判断空值
  ```

## 嵌入式SQL

- **意义**：将SQL嵌入高级语言（如C），结合SQL功能与过程处理能力。
- **处理方式**：预编译（将SQL翻译为主语言代码） + 动态SQL（运行时组装语句）。
