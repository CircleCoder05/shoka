---
layout: post
title: '云服务器和项目部署'
date: 2025-05-03
tags: [Web, 云服务器, 宝塔面板, 部署]
comments: true
categories:
  - [Web]
author: CircleCoder
---

### 前言

笔者的五一假期花了好多时间在这，始作俑者也是仓颉大作业，要求作业用网页的形式展示。其实本地展示就行，但是打开网页、运行 `python` 、运行 `cangjie` 一系列操作实在繁冗。况且笔者还要发给另外两位负责测试的队友，过于笨拙了

笔者追求优雅，决定将项目部署在云服务器上，这样无论是谁，输入域名打开网址就可以啦！以后笔者写的评测机也可以部署网页端啦！

---

### 云服务器

#### 作用

云服务器本质上就是一台远程电脑，之所以使用它是基于它的两大优点：

- 所有资源通过互联网提供

  通过配置安全组/防火墙规则，开放特定端口（如HTTP 80、HTTPS 443），允许外部访问部署的服务（网站、API等）。

- 持续运行

  应用程序可永久运行（除非主动停止）。

笔者的仓颉代码工具正是需要这两点

#### 购买云服务器

笔者使用的是阿里云的 ESC 云服务器，2核 2GB。当然腾讯云、华为云都可以，价格基本上也都差不多，应该都有学生优惠，看个人喜好选择

![image-20250503233246462](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505032342166.png)

创建实例时：

- 可用区选择便宜的或者离自己近的就行。之前看过有的教程建议选中国香港，便于域名的申请绑定。笔者没买域名，这个不太懂
- 操作系统推荐 `Alibaba Cloud Linux 3.2104 LTS 64位` ，网上的大多数教程也都是 `Linux`。如果不是的话，可以停止云服务器，然后重装操作系统（这会丢失原有数据，所以要提前备份）
- 重置密码
- 公网 `ip` 后面常用

然后点击 "远程连接" 就可以打开云服务器了。

`Linux` 是没有图形界面的，所有操作都通过命令来进行。笔者由于技术太浅，感觉这样挺麻烦，而且容易出错，所以安装了后文的 "宝塔" 来操作服务器

![image-20250503234335833](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505032343908.png)

---

### 宝塔面板（以下为AI生成）

#### 什么是宝塔面板

宝塔面板是一个基于Web的服务器管理面板，它提供了图形化界面来管理Linux服务器，让不懂Linux命令的用户也能轻松管理服务器。对于笔者这种Linux新手来说，简直是神器！

#### 安装宝塔面板

在云服务器上安装宝塔面板非常简单，只需要一行命令：

```bash
# CentOS/RedHat系统
yum install -y wget && wget -O install.sh http://download.bt.cn/install/install_6.0.sh && sh install.sh

# Ubuntu/Debian系统
wget -O install.sh http://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh

# 阿里云Linux系统（推荐使用这个）
wget -O install.sh http://download.bt.cn/install/install_6.0.sh && sh install.sh
```

安装完成后，会显示以下信息：

- 宝塔面板地址：`http://你的服务器IP:8888/`
- 用户名：`bt_default`
- 密码：一串随机字符（请务必保存）

#### 首次登录配置

1. **修改默认密码**
   首次登录后，系统会要求修改默认密码，建议设置一个强密码

2. **安装推荐软件**
   宝塔会推荐安装一些常用软件，笔者建议安装：
   - Nginx（Web服务器）
   - MySQL（数据库）
   - PHP（如果需要PHP环境）
   - Python项目管理器（Python项目必备）

3. **安全设置**
   - 修改面板端口（默认8888容易被攻击）
   - 设置面板访问IP白名单
   - 开启面板SSL

---

### 宝塔面板配置使用

#### 1. 网站管理

##### 添加站点

在宝塔面板中，点击"网站"→"添加站点"：

- **域名**：填写你的域名，如果没有域名就填写服务器IP
- **根目录**：网站文件存放的目录，默认是 `/www/wwwroot/域名`
- **FTP**：可选，用于文件上传
- **数据库**：如果需要数据库，可以同时创建
- **SSL**：如果有域名，建议开启HTTPS

##### 上传网站文件

有几种方式上传文件：

1. **在线文件管理器**
   - 在宝塔面板中点击"文件"
   - 进入网站根目录
   - 直接上传文件或创建文件夹

2. **FTP上传**
   - 使用FileZilla等FTP客户端
   - 连接信息在站点设置中查看

3. **Git克隆**
   - 在文件管理器中右键选择"Git克隆"
   - 输入仓库地址和分支

#### 2. 数据库管理

##### MySQL数据库

宝塔面板提供了可视化的MySQL管理：

- **创建数据库**：设置数据库名、用户名、密码
- **phpMyAdmin**：Web界面的数据库管理工具
- **数据库备份**：定期备份数据库，防止数据丢失

##### 数据库连接

在Python项目中连接数据库：

```python
import pymysql

# 连接数据库
connection = pymysql.connect(
    host='localhost',      # 数据库主机
    user='your_username',  # 数据库用户名
    password='your_password', # 数据库密码
    database='your_database', # 数据库名
    charset='utf8mb4'
)
```

#### 3. Python项目管理

##### 安装Python项目管理器

在宝塔面板的"软件商店"中搜索"Python项目管理器"并安装。

##### 创建Python项目

1. 点击"Python项目"→"添加项目"
2. 填写项目信息：
   - **项目名称**：如"cangjie"
   - **项目路径**：项目文件存放路径
   - **Python版本**：选择3.8或更高版本
   - **运行方式**：选择"uwsgi"或"gunicorn"

##### 部署Python项目

以笔者的仓颉项目为例：

1. **上传项目文件**

   ```bash
   # 在项目目录中
   cd /www/wwwroot/cangjie
   # 上传你的Python文件
   ```

2. **安装依赖**

   ```bash
   # 在宝塔面板的终端中
   cd /www/wwwroot/cangjie
   pip3 install -r requirements.txt
   # 或者手动安装
   pip3 install flask pymysql
   ```

3. **配置启动文件**
   创建 `app.py`：

   ```python
   from flask import Flask, render_template, request, jsonify

   app = Flask(__name__)

   @app.route('/')
   def index():
       return render_template('index.html')

   @app.route('/run_cangjie', methods=['POST'])
   def run_cangjie():
       # 你的仓颉代码逻辑
       data = request.get_json()
       # 处理数据...
       return jsonify({'result': 'success'})

   if __name__ == '__main__':
       app.run(host='0.0.0.0', port=5000)
   ```

4. **启动项目**
   在宝塔面板的Python项目管理器中启动项目

#### 4. Nginx配置

##### 反向代理配置

如果Python项目运行在5000端口，需要配置Nginx反向代理：

```nginx
server {
    listen 80;
    server_name your_domain.com;  # 你的域名或IP

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 静态文件
    location /static {
        alias /www/wwwroot/cangjie/static;
    }
}
```

##### 配置SSL证书

如果有域名，建议配置HTTPS：

1. 在宝塔面板中申请Let's Encrypt免费证书
2. 开启强制HTTPS
3. 配置HTTP重定向到HTTPS

#### 5. 安全配置

##### 防火墙设置

在宝塔面板的"安全"页面中：

- **放行端口**：只开放必要的端口（80、443、22等）
- **SSH管理**：修改SSH端口，禁用root登录
- **面板安全**：设置访问IP白名单

##### 定期备份

- **文件备份**：定期备份网站文件
- **数据库备份**：设置自动备份数据库
- **系统快照**：在云服务商控制台创建系统快照

---

### 项目部署实战

#### 部署仓颉项目

以笔者的仓颉项目为例，完整部署流程：

1. **准备项目文件**

   ```bash
   # 本地项目目录结构
   cangjie/
   ├── app.py          # Flask主程序
   ├── requirements.txt # 依赖列表
   ├── static/         # 静态文件
   ├── templates/      # HTML模板
   └── cangjie.py      # 仓颉核心代码
   ```

2. **创建requirements.txt**

   ```txt
   Flask==2.3.3
   PyMySQL==1.1.0
   ```

3. **在宝塔面板中操作**
   - 创建网站：cangjie.yourdomain.com
   - 创建Python项目：cangjie
   - 上传项目文件
   - 安装依赖：`pip3 install -r requirements.txt`
   - 启动项目

4. **测试访问**
   - 访问 `http://你的域名/` 查看首页
   - 测试仓颉功能是否正常

#### 常见问题解决

1. **端口被占用**

   ```bash
   # 查看端口占用
   netstat -tlnp | grep :5000
   # 杀死进程
   kill -9 进程ID
   ```

2. **权限问题**

   ```bash
   # 修改文件权限
   chmod -R 755 /www/wwwroot/cangjie
   chown -R www:www /www/wwwroot/cangjie
   ```

3. **Python版本问题**
   ```bash
   # 查看Python版本
   python3 --version
   # 如果版本不对，在宝塔面板中重新选择
   ```

---

### 总结

通过宝塔面板，笔者成功将仓颉项目部署到了云服务器上。现在队友们只需要输入网址就能直接使用，大大提高了使用体验。

宝塔面板的优势：

- **图形化界面**：无需记忆复杂的Linux命令
- **一键安装**：常用软件一键安装配置
- **可视化管理**：文件、数据库、网站管理都很直观
- **安全防护**：内置防火墙、SSL证书等安全功能

对于Linux新手来说，宝塔面板确实是一个很好的选择。当然，随着技术水平的提高，也可以逐步学习命令行操作，这样能更灵活地控制服务器。

最后提醒一点：记得定期备份数据，云服务器虽然稳定，但数据安全永远是第一位的！
