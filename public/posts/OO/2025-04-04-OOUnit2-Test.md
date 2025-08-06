---
layout: post
title: "OO-Unit2-评测机搭建思路"
date:   2025-04-04
tags: [OO]
comments: true
categories:
- [面向对象设计与构造]
author: CircleCoder
---

{% media audio %}

- https://music.163.com/#/song?id=5237721

{% endmedia %}

### 整体框架

评测机由三部分构成：

- 数据生成器：***dataMaker***
- 输出评判器：***checker***
- 图形用户界面

其中前两个是核心，我的思路可以简括为 **“块式生成，状态检测”**。而最后的图形用户界面非必须，但是好的交互设计能带来舒适的评测体验。

评测机的运作模式有两种，一种是单测一份代码，适于自己 debug ；另一种是群测多份代码，主要是应对互测。评测时将会开辟多个线程以节省时间。

评测机的数据来源也有两种，*dataMaker* 生成的随机数据 和 本地保存的数据。前者是人海战术，后者是靶向施策。

效果图如下：

![d0e66f398560ecf129c5906d147e1c5](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202504050018337.png)

![bc1d9e5ccfbad361e5da5582fee977e](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202504050020478.png)



### dataMaker

与去年计组实验的评测机同理，为了构造流水线冲突的数据，采取的策略便是按 **数据块** 生成。

对于本单元的电梯情境，我们要构造 **乘客高峰期** 数据块，在高峰期将涌入大量乘客，并且在发出请求、电梯接收请求、乘客进入电梯的这些时间点，电梯均有可能接到临时调度的指令。我们所构造的数据块就是要模拟这些情况。

```python
import random
from typing import List


def generate_simple_requests(
        requests_per_block: int = 8,
        sche_prob: float = 0.5,
        current_time: float = 0.1
) -> List[str]:
    """
    简化版电梯请求生成器
    :param current_time: 起始时间
    :param requests_per_block: 每个时间块的请求数(8-16条)
    :param sche_prob: 生成SCHE指令的概率
    :return: 请求列表
    """
    
    requests = []
    time_block_end = min(current_time + 0.3, 30.0)
    timestamp =[]
    for _ in range(requests_per_block):
        timestamp.append(round(random.uniform(current_time, time_block_end), 3))
    timestamp.sort()
   
    for _ in range(requests_per_block):
        if _ < 5:
            sche_prob = 0.3
        else:
            sche_prob = 0.7

        # 生成临时调度指令
        if (random.random() < sche_prob and
                any(timestamp[_] - sche_records[eid] >= 6 for eid in sche_records)):

            # 选择符合条件的电梯
            valid_elevators = [eid for eid in sche_records
                               if timestamp[_] - sche_records[eid] >= 6]
            elevator_id = random.choice(valid_elevators)
            speed = round(random.uniform(0.2, 0.5), 1)
            target_floor = random.choice(['B2', 'B1', 'F1', 'F2', 'F3', 'F4', 'F5'])

            requests.append(f"[{timestamp[_]:.3f}]SCHE-{elevator_id}-{speed}-{target_floor}")
            sche_records[elevator_id] = timestamp[_]
        
        # 生成普通乘客请求
        else:
            
            request_id = random.randint(1, 1000)
            while request_id in used_ids:
                request_id = random.randint(1, 1000)
            used_ids.add(request_id)

            while True:
                from_floor, to_floor = random.choices(
                    ['B4', 'B3', 'B2', 'B1', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7'],
                    k=2
                )
                if from_floor != to_floor:
                    break

            requests.append(
                f"[{timestamp[_]:.3f}]{request_id}-PRI-{random.randint(1, 100)}-"
                f"FROM-{from_floor}-TO-{to_floor}"
            )
            
    return requests

used_ids = set()

if __name__ == "__main__":
    current_time = round(random.uniform(0.5, 4), 3)
    block_cnt = random.randint(3, 6)
    sche_records = {eid: -10.0 for eid in range(1, 7)}  # 记录电梯上次调度时间

    while block_cnt > 0 :
        block_cnt -= 1
        requests = generate_simple_requests(
            requests_per_block= random.randint(8, 17),
            current_time = current_time,
        )
        for req in requests:
            print(req)
        right = min(30.0, current_time + 15.0)
        current_time = round(random.uniform(current_time, right), 3)
```



### checker

这个采用了实时模拟，检验状态转移是否合法的策略。

将输入和输出按照时间戳排序（输出的时间戳可能会略早于对应输入，需要加入修正时间），然后遍历每条指令，判断状态转移是否合法即可：

```python
import re
import sys


class Elevator:
    def __init__(self, id):
        self.id = id
        self.lastFloor = 0  			# 上次到达的楼层
        self.lastArrivedTime = -1  		# 上次到达楼层的时间
        self.num = 0  					# 电梯内的乘客人数
        self.receivedNum = 0  			# 接收的请求数
        self.isClosed = True  			# 电梯门是否关闭
        self.lastOpenTime = 0
        self.speed = 0.4  				# 电梯速度
        self.scheSpeed = 0.4  			# 电梯临时调度速度
        self.passengerList = []  		# 乘客列表

        # 临时调度相关
        self.isSche = False  			# 是否处于临时调度中
        self.isScheAccepted = False  	# 是否接受临时调度
        self.shceTargetFloor = 0  		# 临时调度的目标楼层
        self.moveNumFromSche = 0  		# 临时调度从接受到开始所移动的层数
        self.isTStopReached = False  	# 是否可以结束临时调度
        self.scheAcceptTime = 0  		# 接收临时调度的时间


    def checkArrive(self, time, parts):
        pass

    def checkReceive(self, time, parts):
        pass

    def scheAccept(self, time, parts):
        pass

    def checkScheBegin(self, time, parts):
        pass

    def checkScheEnd(self, time, parts):
        pass
    
    def checkOpen(self, time, parts):
        pass

    def checkClose(self, time, parts):
        pass

    def checkIn(self, time, parts):
        pass

    def checkOutS(self, time, parts):
        pass

    def checkOutF(self, time, parts):
        pass


class PassengerState:
    def __init__(self, id, priority, fromFloor, targetFloor):
        self.id = int(id)  							# 乘客id
        self.priority = int(priority)  				# 乘客优先级
        self.targetFloor = floorMap[targetFloor]  	# 乘客目标楼层
        self.fromFloor = floorMap[fromFloor]  		# 乘客起始楼层
        self.isReceived = 0  						# 乘客被哪部电梯接受


def parse_and_merge_files(input_file: str, output_file: str):
    """
    合并输入和输出文件并按时间戳排序
    :param input_file: 输入文件路径
    :param output_file: 输出文件路径
    :return: 按时间戳排序后的合并列表
    """
    pass

def main():
    input_file = f'Input.txt'
    output_file = f'Output.txt'
    all_entries = parse_and_merge_files(input_file, output_file)
    for entry in all_entries:
        parts = entry[1].split('-')
        
        if parts[0].isdigit():
            passengers[int(parts[0])] = PassengerState(parts[0], parts[2], parts[4], parts[6])
            continue
        elif parts[0] == 'SCHE' and parts[1].isdigit():
            continue
        elif parts[0] == 'SCHE' and parts[1] == 'ACCEPT':
            elevatorId = int(parts[2])
            Elevators[elevatorId].scheAccept(entry[0], parts)
            continue

        elevatorId = int(parts[-1])
        if parts[0] == 'ARRIVE':
            isValid = Elevators[elevatorId].checkArrive(entry[0], parts)
        elif parts[0] == 'RECEIVE':
            isValid = Elevators[elevatorId].checkReceive(entry[0], parts)
        elif parts[0] == 'SCHE' and parts[1] == 'BEGIN':
            isValid = Elevators[elevatorId].checkScheBegin(entry[0], parts)
        elif parts[0] == 'SCHE' and parts[1] == 'END':
            isValid = Elevators[elevatorId].checkScheEnd(entry[0], parts)
        elif parts[0] == 'OPEN':
            isValid = Elevators[elevatorId].checkOpen(entry[0], parts)
        elif parts[0] == 'CLOSE':
            isValid = Elevators[elevatorId].checkClose(entry[0], parts)
        elif parts[0] == 'IN':
            isValid = Elevators[elevatorId].checkIn(entry[0], parts)
        elif parts[0] == 'OUT' and parts[1] == 'S':
            isValid = Elevators[elevatorId].checkOutS(entry[0], parts)
        elif parts[0] == 'OUT' and parts[1] == 'F':
            isValid = Elevators[elevatorId].checkOutF(entry[0], parts)
        else:
            isValid = "Invalid command:"

        if isValid != "VALID":
            print(isValid)
            return

    for elevator in Elevators:
        if elevator.isClosed is False:
            print(f"Elevator {elevator.id} is still open at the end")
            return
        if elevator.num != 0:
            print(f"Elevator {elevator.id} still has {elevator.num} passengers at the end")
            return
        if elevator.isSche:
            print(f"Elevator {elevator.id} is still scheduling at the end")
            return

    for passengerId in passengers.keys():
        print(f"Passenger {passengerId} is still waiting at the end")
        return

    print("Accepted")


if __name__ == '__main__':
    Elevators = [Elevator(i) for i in range(0, 7)]
	passengers = {}
	floorMap = {
    	"B4": -4, "B3": -3, "B2": -2, "B1": -1,
   		"F1": 0, "F2": 1, "F3": 2, "F4": 3,
    	"F5": 4, "F6": 5, "F7": 6
	}
    main()


```



### 用户须知

欢迎来到昆仑评测！

本应用旨在为用户提供 OO-unit2 测评服务，帮助用户 debug 和优化自己的代码。以下是一些使用时的基本注意事项：

- 请确保您已经正确安装了 Java 环境，并且 java 和 javac 的版本一致

- 请将您要测评的 `.java` 文件 粘贴到 `D:/00Test/unit2/source` 目录中。

  只需粘贴您的源码即可，无需依赖包和压缩，非常便捷。

- 开始评测前，请点击“编译”按钮，确保代码编译成功。同一份代码编译一次即可；每次修改代码后，请重新点击“编译”按钮，否则将会运行上次编译成功的代码。

- 点击“开始评测”按钮后，将会进行 6 次评测，评测结果将会显示在屏幕右侧。其中“AC”有两种颜色，绿色代表性能满分，橙色代表性能扣分。

- 点击评测结果可查看详细信息，也可点击 “Download” 按钮下载评测结果至 `D:/00Test/unit1/data` 目录中。



### 待完善功能

- 提升数据生成器的强度
- 群测模式的支持
- 设置最大运行时间，定时掐断，避免关闭程序时图形界面卡顿
- 在 *checker* 中计算性能



### 下载地址

;;;id1 项目源码

{% links %}

- site: CircleCoder05
  owner: CircleCoder
  url: https://github.com/CircleCoder05/OO/tree/main/unit2/hw6/%E8%AF%84%E6%B5%8B%E6%9C%BA
  desc: hw6评测机源码
  image: https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202504051045285.jpg
  color: "#e9546b"

{% endlinks %}
;;;

;;;id1 可执行程序

{% links %}

- site: CircleCoder05
  owner: CircleCoder
  url: https://bhpan.buaa.edu.cn/link/AA122ADC58B60140ACAFFAC0D3D027B5EA
  desc: Unit2-2-昆仑评测1.0
  image: https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202504051051777.jpg
  color: "#e9546b"

{% endlinks %}

;;;
