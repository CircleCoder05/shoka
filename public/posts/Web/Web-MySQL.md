---
layout: post
title: 'MySQL'
date: 2025-05-02
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

### 数据行操作

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

#### 什么是ORM

ORM（Object-Relational Mapping）对象关系映射，是一种编程技术，用于在面向对象编程语言中，将关系型数据库的表结构映射为对象模型。简单来说，就是让我们可以用Python对象的方式来操作数据库，而不需要写SQL语句。

#### ORM的优势

- **开发效率高**：无需手写SQL，减少代码量
- **安全性好**：自动防止SQL注入攻击
- **可维护性强**：代码结构清晰，易于维护
- **跨数据库**：可以轻松切换不同的数据库
- **类型安全**：Python的类型提示和IDE支持

---

### Django ORM 使用

#### 1. 模型定义（Models）

在Django中，我们通过定义Python类来创建数据库表。每个类对应一个表，每个属性对应一个字段。

##### 基础模型示例

```python
# models.py
from django.db import models
from django.utils import timezone

class User(models.Model):
    """用户模型"""
    username = models.CharField(max_length=50, unique=True, verbose_name='用户名')
    email = models.EmailField(unique=True, verbose_name='邮箱')
    password = models.CharField(max_length=128, verbose_name='密码')
    is_active = models.BooleanField(default=True, verbose_name='是否激活')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'users'  # 指定表名
        verbose_name = '用户'
        verbose_name_plural = '用户'
        ordering = ['-created_at']  # 默认排序

    def __str__(self):
        return self.username

class Category(models.Model):
    """分类模型"""
    name = models.CharField(max_length=100, verbose_name='分类名称')
    description = models.TextField(blank=True, verbose_name='分类描述')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, verbose_name='父分类')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '分类'
        verbose_name_plural = '分类'

    def __str__(self):
        return self.name

class Article(models.Model):
    """文章模型"""
    STATUS_CHOICES = [
        ('draft', '草稿'),
        ('published', '已发布'),
        ('archived', '已归档'),
    ]

    title = models.CharField(max_length=200, verbose_name='标题')
    content = models.TextField(verbose_name='内容')
    summary = models.TextField(blank=True, verbose_name='摘要')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name='状态')
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='作者')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name='分类')
    tags = models.ManyToManyField('Tag', blank=True, verbose_name='标签')
    views = models.PositiveIntegerField(default=0, verbose_name='浏览量')
    is_featured = models.BooleanField(default=False, verbose_name='是否推荐')
    published_at = models.DateTimeField(null=True, blank=True, verbose_name='发布时间')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '文章'
        verbose_name_plural = '文章'
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['author', 'created_at']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # 自定义保存逻辑
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

class Tag(models.Model):
    """标签模型"""
    name = models.CharField(max_length=50, unique=True, verbose_name='标签名')
    color = models.CharField(max_length=7, default='#007bff', verbose_name='标签颜色')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '标签'
        verbose_name_plural = '标签'

    def __str__(self):
        return self.name
```

##### 字段类型详解

```python
class ExampleModel(models.Model):
    # 字符串字段
    char_field = models.CharField(max_length=100, verbose_name='字符串')
    text_field = models.TextField(verbose_name='长文本')

    # 数字字段
    integer_field = models.IntegerField(verbose_name='整数')
    positive_integer = models.PositiveIntegerField(verbose_name='正整数')
    decimal_field = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='小数')
    float_field = models.FloatField(verbose_name='浮点数')

    # 日期时间字段
    date_field = models.DateField(verbose_name='日期')
    datetime_field = models.DateTimeField(verbose_name='日期时间')
    time_field = models.TimeField(verbose_name='时间')

    # 布尔字段
    boolean_field = models.BooleanField(default=False, verbose_name='布尔值')

    # 文件字段
    file_field = models.FileField(upload_to='uploads/', verbose_name='文件')
    image_field = models.ImageField(upload_to='images/', verbose_name='图片')

    # 关系字段
    foreign_key = models.ForeignKey('OtherModel', on_delete=models.CASCADE, verbose_name='外键')
    many_to_many = models.ManyToManyField('OtherModel', verbose_name='多对多')
    one_to_one = models.OneToOneField('OtherModel', on_delete=models.CASCADE, verbose_name='一对一')
```

#### 2. 数据库迁移

定义好模型后，需要创建并应用数据库迁移：

```bash
# 创建迁移文件
python manage.py makemigrations

# 应用迁移到数据库
python manage.py migrate

# 查看迁移状态
python manage.py showmigrations

# 回滚迁移
python manage.py migrate app_name 0001
```

#### 3. CRUD 操作

##### 创建数据（Create）

```python
# 方式1：使用create()方法
user = User.objects.create(
    username='zhangsan',
    email='zhangsan@example.com',
    password='password123'
)

# 方式2：先创建对象，再保存
user = User(
    username='lisi',
    email='lisi@example.com',
    password='password123'
)
user.save()

# 方式3：使用get_or_create()，避免重复创建
user, created = User.objects.get_or_create(
    username='wangwu',
    defaults={
        'email': 'wangwu@example.com',
        'password': 'password123'
    }
)
if created:
    print(f"创建了新用户: {user.username}")
else:
    print(f"用户已存在: {user.username}")

# 批量创建
users_data = [
    {'username': 'user1', 'email': 'user1@example.com', 'password': 'pass1'},
    {'username': 'user2', 'email': 'user2@example.com', 'password': 'pass2'},
    {'username': 'user3', 'email': 'user3@example.com', 'password': 'pass3'},
]
User.objects.bulk_create([User(**data) for data in users_data])
```

##### 查询数据（Read）

```python
# 获取所有用户
all_users = User.objects.all()

# 获取单个用户
try:
    user = User.objects.get(username='zhangsan')
except User.DoesNotExist:
    print("用户不存在")

# 获取用户（如果不存在返回None）
user = User.objects.filter(username='zhangsan').first()

# 条件查询
active_users = User.objects.filter(is_active=True)
recent_users = User.objects.filter(created_at__gte=timezone.now() - timezone.timedelta(days=7))

# 复杂查询
from django.db.models import Q
users = User.objects.filter(
    Q(username__icontains='zhang') | Q(email__icontains='zhang'),
    is_active=True,
    created_at__year=2025
)

# 排序
users_ordered = User.objects.order_by('-created_at', 'username')

# 分页
from django.core.paginator import Paginator
paginator = Paginator(User.objects.all(), 10)  # 每页10条
page = paginator.get_page(1)
users_on_page = page.object_list

# 聚合查询
from django.db.models import Count, Avg, Max, Min
stats = User.objects.aggregate(
    total_users=Count('id'),
    active_users=Count('id', filter=models.Q(is_active=True)),
    avg_created=Avg('created_at')
)

# 分组查询
category_stats = Article.objects.values('category__name').annotate(
    article_count=Count('id'),
    avg_views=Avg('views')
).order_by('-article_count')
```

##### 更新数据（Update）

```python
# 方式1：更新单个对象
user = User.objects.get(username='zhangsan')
user.email = 'new_email@example.com'
user.save()

# 方式2：批量更新
User.objects.filter(is_active=False).update(is_active=True)

# 方式3：使用F()表达式进行字段运算
from django.db.models import F
Article.objects.filter(views__lt=100).update(views=F('views') + 10)

# 方式4：条件更新
User.objects.filter(
    created_at__lt=timezone.now() - timezone.timedelta(days=30)
).update(is_active=False)
```

##### 删除数据（Delete）

```python
# 删除单个对象
user = User.objects.get(username='zhangsan')
user.delete()

# 批量删除
User.objects.filter(is_active=False).delete()

# 条件删除
Article.objects.filter(
    status='draft',
    created_at__lt=timezone.now() - timezone.timedelta(days=90)
).delete()
```

#### 4. 高级查询技巧

##### 字段查找（Field Lookups）

```python
# 精确匹配
users = User.objects.filter(username='zhangsan')

# 包含查询（不区分大小写）
users = User.objects.filter(username__icontains='zhang')

# 开头结尾查询
users = User.objects.filter(username__startswith='zhang')
users = User.objects.filter(email__endswith='@gmail.com')

# 范围查询
users = User.objects.filter(created_at__range=(
    timezone.now() - timezone.timedelta(days=7),
    timezone.now()
))

# 空值查询
users = User.objects.filter(email__isnull=True)
users = User.objects.filter(email__isnull=False)

# 正则表达式查询
import re
users = User.objects.filter(username__regex=r'^zhang.*')

# 日期查询
users = User.objects.filter(created_at__year=2025)
users = User.objects.filter(created_at__month=5)
users = User.objects.filter(created_at__day=15)
users = User.objects.filter(created_at__week_day=1)  # 周一
```

##### 关联查询

```python
# 正向查询：从文章查询作者
article = Article.objects.get(id=1)
author = article.author  # 获取作者对象

# 反向查询：从作者查询文章
author = User.objects.get(username='zhangsan')
articles = author.article_set.all()  # 获取所有文章

# 使用related_name自定义反向查询名
class Article(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='articles')
    # 现在可以使用 author.articles.all() 而不是 author.article_set.all()

# 跨表查询
articles = Article.objects.filter(author__username='zhangsan')
articles = Article.objects.filter(category__name='技术')

# 反向跨表查询
users = User.objects.filter(articles__status='published')
categories = Category.objects.filter(articles__author__username='zhangsan')
```

##### 聚合和注解

```python
from django.db.models import Count, Avg, Max, Min, Sum, F, ExpressionWrapper, DecimalField

# 基础聚合
total_articles = Article.objects.count()
avg_views = Article.objects.aggregate(Avg('views'))

# 分组聚合
category_stats = Article.objects.values('category__name').annotate(
    article_count=Count('id'),
    total_views=Sum('views'),
    avg_views=Avg('views'),
    max_views=Max('views')
)

# 复杂聚合
from django.db.models import Case, When, Value, IntegerField
article_stats = Article.objects.aggregate(
    total_articles=Count('id'),
    published_articles=Count('id', filter=models.Q(status='published')),
    draft_articles=Count('id', filter=models.Q(status='draft')),
    high_view_articles=Count('id', filter=models.Q(views__gte=1000))
)

# 使用注解添加计算字段
articles = Article.objects.annotate(
    days_since_created=ExpressionWrapper(
        timezone.now() - F('created_at'),
        output_field=models.DurationField()
    ),
    view_ratio=F('views') / 1000.0
)
```

#### 5. 模型管理器（Model Manager）

自定义模型管理器可以封装常用的查询逻辑：

```python
class ArticleManager(models.Manager):
    def published(self):
        """获取已发布的文章"""
        return self.filter(status='published', published_at__lte=timezone.now())

    def featured(self):
        """获取推荐文章"""
        return self.filter(is_featured=True, status='published')

    def by_category(self, category_name):
        """根据分类获取文章"""
        return self.filter(category__name=category_name, status='published')

    def popular(self, limit=10):
        """获取热门文章"""
        return self.filter(status='published').order_by('-views')[:limit]

class Article(models.Model):
    # ... 其他字段 ...

    objects = ArticleManager()  # 使用自定义管理器

    # 也可以定义多个管理器
    published = ArticleManager()
    featured = ArticleManager()

    # 使用示例
    # Article.published.all()  # 获取所有已发布文章
    # Article.featured.all()   # 获取所有推荐文章
    # Article.objects.by_category('技术')  # 获取技术分类的文章
```

#### 6. 信号（Signals）

Django的信号系统可以在模型操作前后执行自定义代码：

```python
from django.db.models.signals import pre_save, post_save, pre_delete, post_delete
from django.dispatch import receiver

@receiver(post_save, sender=Article)
def article_saved(sender, instance, created, **kwargs):
    """文章保存后的处理"""
    if created:
        print(f"新文章已创建: {instance.title}")
    else:
        print(f"文章已更新: {instance.title}")

@receiver(pre_delete, sender=Article)
def article_pre_delete(sender, instance, **kwargs):
    """文章删除前的处理"""
    print(f"即将删除文章: {instance.title}")
    # 可以在这里进行一些清理工作

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """用户创建后自动创建用户资料"""
    if created:
        # 这里可以创建相关的用户资料表
        pass
```

#### 7. 事务处理

```python
from django.db import transaction

# 方式1：装饰器
@transaction.atomic
def transfer_money(from_user_id, to_user_id, amount):
    from_user = User.objects.select_for_update().get(id=from_user_id)
    to_user = User.objects.select_for_update().get(id=to_user_id)

    if from_user.balance < amount:
        raise ValueError("余额不足")

    from_user.balance -= amount
    to_user.balance += amount

    from_user.save()
    to_user.save()

# 方式2：上下文管理器
def create_user_with_profile(username, email, password):
    with transaction.atomic():
        user = User.objects.create(
            username=username,
            email=email,
            password=password
        )
        # 创建用户资料
        profile = UserProfile.objects.create(user=user)
        # 如果任何一步失败，整个事务都会回滚
        return user, profile

# 方式3：手动控制
def complex_operation():
    transaction_id = transaction.savepoint()
    try:
        # 执行一些操作
        user = User.objects.create(username='test')
        transaction.savepoint_commit(transaction_id)
    except Exception:
        transaction.savepoint_rollback(transaction_id)
        raise
```

#### 8. 性能优化

##### 查询优化

```python
# 使用select_related()优化外键查询
articles = Article.objects.select_related('author', 'category').all()
# 这样查询时不会产生额外的数据库查询

# 使用prefetch_related()优化多对多查询
articles = Article.objects.prefetch_related('tags').all()

# 使用only()只获取需要的字段
users = User.objects.only('username', 'email').all()

# 使用defer()排除不需要的字段
articles = Article.objects.defer('content').all()

# 使用values()获取字典格式的数据
user_data = User.objects.values('username', 'email', 'created_at')

# 使用values_list()获取元组格式的数据
user_tuples = User.objects.values_list('username', 'email')
```

##### 数据库索引

```python
class Article(models.Model):
    title = models.CharField(max_length=200, db_index=True)  # 单字段索引
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            # 复合索引
            models.Index(fields=['author', 'created_at']),
            # 部分索引
            models.Index(fields=['status'], condition=models.Q(status='published')),
            # 函数索引
            models.Index(fields=['created_at'], name='created_at_date_idx'),
        ]
```

#### 9. 实际应用示例

##### 博客系统查询

```python
class BlogService:
    @staticmethod
    def get_recent_posts(limit=10):
        """获取最近发布的文章"""
        return Article.objects.select_related('author', 'category').filter(
            status='published',
            published_at__lte=timezone.now()
        ).order_by('-published_at')[:limit]

    @staticmethod
    def get_posts_by_category(category_name, page=1, per_page=10):
        """根据分类获取文章"""
        articles = Article.objects.select_related('author', 'category').filter(
            category__name=category_name,
            status='published'
        ).order_by('-published_at')

        paginator = Paginator(articles, per_page)
        return paginator.get_page(page)

    @staticmethod
    def search_posts(query, page=1, per_page=10):
        """搜索文章"""
        articles = Article.objects.select_related('author', 'category').filter(
            Q(title__icontains=query) |
            Q(content__icontains=query) |
            Q(summary__icontains=query),
            status='published'
        ).order_by('-published_at')

        paginator = Paginator(articles, per_page)
        return paginator.get_page(page)

    @staticmethod
    def get_popular_tags(limit=20):
        """获取热门标签"""
        return Tag.objects.annotate(
            article_count=Count('article')
        ).filter(article_count__gt=0).order_by('-article_count')[:limit]
```

##### 用户统计服务

```python
class UserStatsService:
    @staticmethod
    def get_user_stats(user_id):
        """获取用户统计信息"""
        user = User.objects.get(id=user_id)

        stats = {
            'total_articles': user.articles.count(),
            'published_articles': user.articles.filter(status='published').count(),
            'total_views': user.articles.aggregate(Sum('views'))['views__sum'] or 0,
            'avg_views': user.articles.aggregate(Avg('views'))['views__avg'] or 0,
            'recent_activity': user.articles.filter(
                created_at__gte=timezone.now() - timezone.timedelta(days=30)
            ).count()
        }

        return stats

    @staticmethod
    def get_top_authors(limit=10):
        """获取顶级作者"""
        return User.objects.annotate(
            article_count=Count('articles'),
            total_views=Sum('articles__views')
        ).filter(article_count__gt=0).order_by('-total_views')[:limit]
```
