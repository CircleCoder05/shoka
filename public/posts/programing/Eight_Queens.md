---
title: '顺序编码遗传算法求解八皇后问题'
date: 2025-11-15
categories: [程序设计]
tags: [MATLAB, 八皇后问题, 顺序编码遗传算法]
author: 谨言
---

## I 问题描述

八皇后问题是一个经典的组合优化问题，要求在一个标准的 8×8 国际象棋棋盘上放置八个皇后。这些皇后需要满足特定的约束条件：任意两个皇后都不能互相攻击。由于在国际象棋规则中，皇后可以横向、纵向或沿任意对角线移动任意格数，因此该问题的核心在于确保没有两个皇后位于同一行、同一列或同一对角线上。

## II 源代码

```matlab
clear all;close all;clc
%% 参数设置
N = 50;          % 种群规模 (PPT 102页建议20-100)
L = 8;           % 染色体长度，八皇后问题对应L=8
pc = 0.8;        % 交叉概率 (PPT 104页建议0.4-0.99)
pm = 0.1;        % 变异概率 (PPT 105页建议0.0001-0.1)
Gm = 200;        % 最大进化代数 (PPT 107页建议100-1000)

%% 初始化种群
% 生成N个1~L的随机排列
queens = zeros(N, L);
for i = 1:N
    queens(i, :) = randperm(L);
end

sol = [];              % 存储最终的解
fitm = 0;              % 存储最终的最大适应度
genfit = zeros(Gm, 1); % 存储每代的适应度

%% 主循环
for gen = 1:Gm
    %% 计算适应度
    fit = zeros(N, 1);
    for i = 1:N
        fit(i) = fitfunc(queens(i, :), L);  % 适应度函数的具体定义写在主循环之后
    end

    %% 记录最优解
    [current_fitm, idxm] = max(fit);
    genfit(gen) = current_fitm;

    if current_fitm > fitm
        fitm = current_fitm;
        sol = queens(idxm, :);
    end

    %% 终止条件
    % 进化代数每达到100的整数倍，就显示一次进度
    if mod(gen, 100) == 0
        fprintf('代数 %d: 最优适应度 = %.4f\n', gen, fitm);
    end

    % 若找到最优解则显示最优解
    if fitm == 1
        fprintf('在第 %d 代找到最优解！\n', gen);
        break;
    end

    %% 选择操作 - 轮盘赌选择
    lpd = lpdfunc(fit, N);  % 轮盘赌函数的具体定义写在主循环之后

    %% 交叉操作 - 单点排序交叉
    zidai = [];   % 存储子代
    for i = 1:2:N
        parent1 = queens(lpd(i), :);
        parent2 = queens(lpd(i+1), :);

        % 决定是否交叉
        if rand() < pc
            [child1, child2] = ddpxjcfunc(parent1, parent2); % 单点排序交叉函数的具体定义写在主循环之后
        else
            child1 = parent1;
            child2 = parent2;
        end
        zidai = [zidai; child1; child2];
    end

    %% 变异操作 - 交换变异
    for i = 1:N
        if rand() < pm
            zidai(i, :) = jhbyfunc(zidai(i, :)); % 交换变异函数的具体定义写在主循环之后
        end
    end

    %% 幸存者选择 - 精英保留策略
    % 合并父代和子代
    hbjq = [queens; zidai];           % 合并后的种群
    fithe = zeros(size(hbjq, 1), 1);  % 存储合并后的适应度

    for i = 1:size(hbjq, 1)
        fithe(i) = fitfunc(hbjq(i, :), L);
    end

    % 选择适应度最高的N个个体
    [~, midxs] = sort(fithe, 'descend');  % 找出最大适应度对应的指标
    queens = hbjq(midxs(1:N), :);
end

%% 输出结果
fprintf('\n=== 八皇后问题求解结果 ===\n');
fprintf('最优解适应度: %.4f\n', fitm);
fprintf('皇后位置 (列->行): \n');
for i = 1:L
    fprintf('第%d列: 第%d行\n', i, sol(i));
end

% 绘制收敛曲线
figure;
plot(genfit(1:gen), 'b-', 'LineWidth', 2);
xlabel('进化代数');
ylabel('最优适应度');
title('遗传算法收敛曲线');
grid on;

% 绘制棋盘
if fitm == 1
    figure;
    hold on;

    n = length(sol);

    % 绘制棋盘格子
    for i = 1:n
        for j = 1:n
            if mod(i+j, 2) == 0
                color = [1, 1, 1]; % 白色
            else
                color = [0.8, 0.8, 0.8]; % 灰色
            end
            rectangle('Position', [i-0.5, j-0.5, 1, 1], ...
                'FaceColor', color, 'EdgeColor', 'k', 'LineWidth', 1);
        end
    end

    % 绘制皇后
    for col = 1:n
        row = sol(col);
        plot(col, row, 'ro', 'MarkerSize', 30, 'LineWidth', 3);
        text(col, row, 'Q', 'HorizontalAlignment', 'center', ...
            'VerticalAlignment', 'middle', 'FontSize', 14, 'FontWeight', 'bold');
    end

    axis equal;
    xlim([0.5, n+0.5]);
    ylim([0.5, n+0.5]);
    set(gca, 'XTick', 1:n, 'YTick', 1:n);
    grid on;
    title('八皇后问题最优解布局');
    xlabel('列');
    ylabel('行');
    hold off;
end

%% 运行50次测试
nrun = 50;
nsuc = 0;                 % 成功找到最优解的次数
gensuc = zeros(nrun, 1);  % 记录每次找到最优解的代数
tsuc = zeros(nrun, 1);    % 记录每次运行的时间

fprintf('开始进行%d次独立测试...\n\n', nrun);

for nrun = 1:nrun
    fprintf('第%d次测试... ', nrun);
    tic;  % 开始计时
    
    %% 初始化种群
    queens = zeros(N, L);
    for i = 1:N
        queens(i, :) = randperm(L);
    end

    sol = [];              % 存储最终的解
    fitm = 0;              % 存储最终的最大适应度
    genfit = zeros(Gm, 1); % 存储每代的适应度
    fgensuc = Gm; % 记录找到最优解的代数，默认设为最大代数

    %% 主循环
    for gen = 1:Gm
        %% 计算适应度
        fit = zeros(N, 1);
        for i = 1:N
            fit(i) = fitfunc(queens(i, :), L);
        end

        %% 记录最优解
        [current_fitm, idxm] = max(fit);
        genfit(gen) = current_fitm;

        if current_fitm > fitm
            fitm = current_fitm;
            sol = queens(idxm, :);
        end

        %% 终止条件
        % 若找到最优解则记录并跳出循环
        if fitm == 1
            fgensuc = gen;
            break;
        end

        %% 选择操作 - 轮盘赌选择
        lpd = lpdfunc(fit, N);

        %% 交叉操作 - 单点排序交叉
        zidai = [];   % 存储子代
        for i = 1:2:N
            parent1 = queens(lpd(i), :);
            parent2 = queens(lpd(i+1), :);

            % 决定是否交叉
            if rand() < pc
                [child1, child2] = ddpxjcfunc(parent1, parent2);
            else
                child1 = parent1;
                child2 = parent2;
            end
            zidai = [zidai; child1; child2];
        end

        %% 变异操作 - 交换变异
        for i = 1:N
            if rand() < pm
                zidai(i, :) = jhbyfunc(zidai(i, :));
            end
        end

        %% 幸存者选择 - 精英保留策略
        % 合并父代和子代
        hbjq = [queens; zidai];
        fithe = zeros(size(hbjq, 1), 1);

        for i = 1:size(hbjq, 1)
            fithe(i) = fitfunc(hbjq(i, :), L);
        end

        % 选择适应度最高的N个个体
        [~, midxs] = sort(fithe, 'descend');
        queens = hbjq(midxs(1:N), :);
    end

    %% 记录本次运行结果
    endt = toc;  % 结束计时
    tsuc(nrun) = endt;
    gensuc(nrun) = fgensuc;
    
    if fitm == 1
        nsuc = nsuc + 1;
        fprintf('成功! 代数: %d, 时间: %.4f秒\n', fgensuc, endt);
    else
        fprintf('失败! 最终适应度: %.4f, 时间: %.4f秒\n', fitm, endt);
    end
end

%% 输出统计结果
fprintf('\n=== 50次测试统计结果 ===\n');
fprintf('成功率: %.2f%% (%d/%d)\n', nsuc/nrun*100, nsuc, nrun);

if nsuc > 0
    sucgen = gensuc(gensuc < Gm);
    suct = tsuc(gensuc < Gm);
    
    fprintf('\n成功找到最优解的测试统计:\n');
    fprintf('平均代数: %.2f\n', mean(sucgen));
    fprintf('平均时间: %.4f秒\n', mean(suct));
    fprintf('最快代数: %d\n', min(sucgen));
    fprintf('最慢代数: %d\n', max(sucgen));
    fprintf('最快时间: %.4f秒\n', min(suct));
    fprintf('最慢时间: %.4f秒\n', max(suct));
end

fprintf('\n所有测试统计:\n');
fprintf('平均结束代数: %.2f\n', mean(gensuc));
fprintf('平均运行时间: %.4f秒\n', mean(tsuc));


%% 适应度函数
function fit = fitfunc(geti, L)
n = 0;
% 检查所有皇后对
for i = 1:L-1
    for j = i+1:L
        % 检查是否在同一对角线
        if abs(i - j) == abs(geti(i) - geti(j))
            n = n + 1;
        end
    end
end
fit = 1 / (1 + n);
end

%% 轮盘赌选择函数
function lpd = lpdfunc(fit, N)
% 轮盘赌选择

% 计算选择概率
sumfit = sum(fit);
p_i = fit / sumfit;
cum_p_i = cumsum(p_i);

% 执行选择
lpd = zeros(N, 1);
for i = 1:N
    r = rand();
    lpd(i) = find(cum_p_i >= r, 1);
end
end

%% 单点排序交叉函数
function [child1, child2] = ddpxjcfunc(parent1, parent2)
n = length(parent1);

% 随机选择交叉点
k = randi([1, n-1]);

% 复制左侧片段
child1_left = parent1(1:k);
child2_left = parent2(1:k);

% 从另一个父代按顺序填充右侧
child1_right = [];
child2_right = [];

% 填充child1的右侧
for i = 1:n
    if ~ismember(parent2(i), child1_left)
        child1_right = [child1_right, parent2(i)];
    end
end

% 填充child2的右侧
for i = 1:n
    if ~ismember(parent1(i), child2_left)
        child2_right = [child2_right, parent1(i)];
    end
end

child1 = [child1_left, child1_right];
child2 = [child2_left, child2_right];
end

%% 交换变异函数
function jhby = jhbyfunc(geti)
l = length(geti);

% 随机选择两个不同的位置
pos1 = randi([1, l]);
pos2 = randi([1, l]);
while pos2 == pos1
    pos2 = randi([1, l]);
end

% 交换基因
jhby = geti;
jhby([pos1, pos2]) = jhby([pos2, pos1]);
end
```


## III 50次运行测试程序效率

50次运行的结果如下。

```matlabTextOutput
第1次测试... 
成功! 代数: 14, 时间: 0.0124秒
第2次测试... 
成功! 代数: 11, 时间: 0.0032秒
第3次测试... 
成功! 代数: 3, 时间: 0.0012秒
第4次测试... 
成功! 代数: 7, 时间: 0.0018秒
第5次测试... 
成功! 代数: 5, 时间: 0.0020秒
第6次测试... 
成功! 代数: 1, 时间: 0.0001秒
第7次测试... 
成功! 代数: 8, 时间: 0.0020秒
第8次测试... 
成功! 代数: 4, 时间: 0.0009秒
第9次测试... 
成功! 代数: 9, 时间: 0.0021秒
第10次测试... 
成功! 代数: 4, 时间: 0.0008秒
第11次测试... 
成功! 代数: 7, 时间: 0.0016秒
第12次测试... 
成功! 代数: 1, 时间: 0.0000秒
第13次测试... 
成功! 代数: 5, 时间: 0.0011秒
第14次测试... 
成功! 代数: 11, 时间: 0.0027秒
第15次测试... 
成功! 代数: 4, 时间: 0.0011秒
第16次测试... 
成功! 代数: 27, 时间: 0.0061秒
第17次测试... 
成功! 代数: 18, 时间: 0.0042秒
第18次测试... 
成功! 代数: 7, 时间: 0.0016秒
第19次测试... 
成功! 代数: 7, 时间: 0.0018秒
第20次测试... 
成功! 代数: 12, 时间: 0.0027秒
第21次测试... 
成功! 代数: 5, 时间: 0.0012秒
第22次测试... 
成功! 代数: 5, 时间: 0.0011秒
第23次测试... 
成功! 代数: 13, 时间: 0.0030秒
第24次测试... 
成功! 代数: 3, 时间: 0.0006秒
第25次测试... 
成功! 代数: 10, 时间: 0.0023秒
第26次测试... 
成功! 代数: 3, 时间: 0.0006秒
第27次测试... 
成功! 代数: 5, 时间: 0.0012秒
第28次测试... 
成功! 代数: 1, 时间: 0.0000秒
第29次测试... 
成功! 代数: 5, 时间: 0.0010秒
第30次测试... 
成功! 代数: 2, 时间: 0.0004秒
第31次测试... 
成功! 代数: 5, 时间: 0.0011秒
第32次测试... 
成功! 代数: 3, 时间: 0.0006秒
第33次测试... 
成功! 代数: 2, 时间: 0.0006秒
第34次测试... 
成功! 代数: 6, 时间: 0.0019秒
第35次测试... 
成功! 代数: 3, 时间: 0.0023秒
第36次测试... 
成功! 代数: 6, 时间: 0.0020秒
第37次测试... 
成功! 代数: 8, 时间: 0.0018秒
第38次测试... 
成功! 代数: 18, 时间: 0.0054秒
第39次测试... 
成功! 代数: 4, 时间: 0.0012秒
第40次测试... 
成功! 代数: 6, 时间: 0.0013秒
第41次测试... 
成功! 代数: 67, 时间: 0.0159秒
第42次测试... 
成功! 代数: 75, 时间: 0.0191秒
第43次测试... 
成功! 代数: 3, 时间: 0.0007秒
第44次测试... 
成功! 代数: 4, 时间: 0.0008秒
第45次测试... 
成功! 代数: 12, 时间: 0.0028秒
第46次测试... 
成功! 代数: 24, 时间: 0.0052秒
第47次测试... 
成功! 代数: 8, 时间: 0.0020秒
第48次测试... 
成功! 代数: 5, 时间: 0.0012秒
第49次测试... 
成功! 代数: 3, 时间: 0.0005秒
第50次测试... 
成功! 代数: 3, 时间: 0.0006秒

=== 50次测试统计结果 ===
成功率: 100.00 % (50/50)
成功找到最优解的测试统计:
平均代数: 9.64
平均时间: 0.0025秒
最快代数: 1
最慢代数: 75
最快时间: 0.0000秒
最慢时间: 0.0191秒

所有测试统计:
平均结束代数: 9.64
平均运行时间: 0.0025秒
```

程序还会绘制收敛曲线图(记录每一代的最优适应度值)和棋盘布局图。

---
*注：本站使用vue3框架，技术问题可致信CircleCoder。*