---
title: '悬臂梁多目标优化设计'
date: 2025-02-01
categories: [程序设计]
tags: [MATLAB, 悬臂梁问题, NSGA-II算法]
author: 谨言
---

## I 问题描述

悬臂梁设计是多目标优化领域的经典工程问题，简述如下：给定梁的材料参数和载荷条件，设计一根圆形截面悬臂梁，需要同时考虑梁的重量和端部挠度，目标是在满足强度约束的条件下，找到重量和挠度均最小的设计方案。

悬臂梁设计问题的挑战主要源于多目标之间的权衡关系。重量最小化倾向于采用较小截面尺寸，而挠度最小化则需要较大截面尺寸。这两个冲突目标导致不存在单一最优解，而是存在一组 Pareto 最优解，每个解代表不同的权衡。

## II 源代码

```matlab
clear all
close all
clc

%% 1. 问题定义
problem.rho = 7800;       % kg/m³, 密度
problem.P = 1e3;          % N, 端部载荷 (1kN)
problem.E = 207e9;        % Pa, 弹性模量 (207GPa)
problem.S_y = 300e6;      % Pa, 允许应力 (300MPa)
problem.delta_max = 5e-3; % m, 最大允许挠度 (5mm)
problem.d_min = 0.01;     % m, 最小直径
problem.d_max = 0.05;     % m, 最大直径
problem.l_min = 0.2;      % m, 最小长度
problem.l_max = 1.0;      % m, 最大长度

%% 2. 算法参数
pop_size = 50;       % 种群大小
max_gen = 100;       % 最大代数
pc = 0.9;            % 交叉概率
pm = 0.1;            % 变异概率

%% 3. 运行参数
num_runs = 50;       % 重复运行次数
run_stats = zeros(num_runs, 4); % [运行时间, 解数量, 最佳f1, 最佳f2]
all_solutions = cell(num_runs, 1);

%% 4. 重复运行50次
fprintf('开始进行%d次独立运行...\n\n', num_runs);

for run = 1:num_runs
    fprintf('正在运行第%d次...', run);
    tic;
    
    % 调用NSGA-II算法
    [solutions, objectives] = simplified_nsga_ii(problem, pop_size, max_gen, pc, pm);
    
    % 存储结果
    all_solutions{run} = solutions;
    
    % 计算统计信息
    run_time = toc;
    num_solutions = size(solutions, 1);
    
    if num_solutions > 0
        best_f1 = min(objectives(:, 1));
        best_f2 = min(objectives(:, 2));
    else
        best_f1 = inf;
        best_f2 = inf;
    end
    
    % 记录运行统计
    run_stats(run, :) = [run_time, num_solutions, best_f1, best_f2];
    
    % 输出单次运行结果
    fprintf('完成: 时间=%.2fs, 解数=%d, 最佳f1=%.3f, 最佳f2=%.6f\n', ...
            run_time, num_solutions, best_f1, best_f2);
end

%% 5. 统计分析
fprintf('\n=== 50次运行统计结果 ===\n\n');

% 运行时间统计
time_stats = run_stats(:, 1);
fprintf('运行时间统计:\n');
fprintf('  平均值: %.2f ± %.2f 秒\n', mean(time_stats), std(time_stats));
fprintf('  最小值: %.2f 秒\n', min(time_stats));
fprintf('  最大值: %.2f 秒\n\n', max(time_stats));

% 解数量统计
solution_counts = run_stats(:, 2);
fprintf('解数量统计:\n');
fprintf('  平均值: %.1f ± %.1f\n', mean(solution_counts), std(solution_counts));
fprintf('  最小值: %d\n', min(solution_counts));
fprintf('  最大值: %d\n\n', max(solution_counts));

% 最佳目标值统计
best_f1_values = run_stats(:, 3);
best_f2_values = run_stats(:, 4);
fprintf('最佳f1(重量)统计:\n');
fprintf('  平均值: %.3f ± %.3f kg\n', mean(best_f1_values), std(best_f1_values));
fprintf('  最小值: %.3f kg\n', min(best_f1_values));
fprintf('  最大值: %.3f kg\n\n', max(best_f1_values));

fprintf('最佳f2(挠度)统计:\n');
fprintf('  平均值: %.6f ± %.6f m\n', mean(best_f2_values), std(best_f2_values));
fprintf('  最小值: %.6f m\n', min(best_f2_values));
fprintf('  最大值: %.6f m\n\n', max(best_f2_values));

%% 6. 简单可视化
fprintf('正在生成可视化结果...\n');

% 6.1 寻找一次典型运行（解数量最接近平均值的运行）
[~, idx] = min(abs(solution_counts - mean(solution_counts)));
if ~isempty(all_solutions{idx})
    % 获取设计变量和对应的目标函数值
    solutions = all_solutions{idx};
    objectives = zeros(size(solutions, 1), 2);
    
    for i = 1:size(solutions, 1)
        d = solutions(i, 1);
        l = solutions(i, 2);
        [f1, f2, ~, ~] = evaluate_cantilever(d, l, problem);
        objectives(i, :) = [f1, f2];
    end
    
    % 绘制Pareto前沿
    figure('Position', [100, 100, 800, 600]);
    
    subplot(2, 2, 1);
    scatter(objectives(:, 1), objectives(:, 2), 30, 'b', 'filled');
    hold on;
    if size(objectives, 1) > 1
        [sorted_f1, sort_idx] = sort(objectives(:, 1));
        sorted_f2 = objectives(sort_idx, 2);
        plot(sorted_f1, sorted_f2, 'b-', 'LineWidth', 1);
    end
    xlabel('重量 f1 (kg)');
    ylabel('挠度 f2 (m)');
    title(sprintf('典型运行#%d的Pareto前沿', idx));
    grid on;
    
    % 绘制设计变量分布
    subplot(2, 2, 2);
    scatter(solutions(:, 1), solutions(:, 2), 30, 'r', 'filled');
    xlabel('直径 d (m)');
    ylabel('长度 l (m)');
    title(sprintf('运行#%d的设计变量分布', idx));
    grid on;
    
    % 绘制统计分布
    subplot(2, 2, 3);
    histogram(solution_counts, 10);
    xlabel('非支配解数量');
    ylabel('运行次数');
    title('50次运行的解数量分布');
    grid on;
    
    subplot(2, 2, 4);
    histogram(time_stats, 10);
    xlabel('运行时间 (秒)');
    ylabel('运行次数');
    title('50次运行的运行时间分布');
    grid on;
end

fprintf('\n=== 程序执行完毕 ===\n');

%% ==================== 函数定义 ====================

function [f1, f2, g1, g2] = evaluate_cantilever(d, l, problem)
    % 评估悬臂梁设计
    % 输入: d - 直径, l - 长度
    % 输出: f1 - 重量, f2 - 挠度, g1 - 应力约束违反, g2 - 挠度约束违反
    
    % 目标函数1: 重量
    f1 = problem.rho * (pi * d^2 / 4) * l;
    
    % 目标函数2: 挠度
    f2 = (64 * problem.P * l^3) / (3 * problem.E * pi * d^4);
    
    % 约束1: 应力约束
    sigma_max = (32 * problem.P * l) / (pi * d^3);
    g1 = sigma_max - problem.S_y;  % 需要满足 g1 ≤ 0
    
    % 约束2: 挠度约束
    g2 = f2 - problem.delta_max;   % 需要满足 g2 ≤ 0
end

function [non_dominated, objectives] = simplified_nsga_ii(problem, pop_size, max_gen, pc, pm)
    % NSGA-II算法
    num_vars = 2;
    
    % 初始化种群
    population = zeros(pop_size, num_vars);
    population(:, 1) = problem.d_min + rand(pop_size, 1) * (problem.d_max - problem.d_min);
    population(:, 2) = problem.l_min + rand(pop_size, 1) * (problem.l_max - problem.l_min);
    
    for gen = 1:max_gen
        % 评估种群
        objectives = zeros(pop_size, 2);
        constraints = zeros(pop_size, 2);
        
        for i = 1:pop_size
            d = population(i, 1);
            l = population(i, 2);
            [f1, f2, g1, g2] = evaluate_cantilever(d, l, problem);
            objectives(i, :) = [f1, f2];
            constraints(i, :) = [g1, g2];
        end
        
        % 非支配排序
        fronts = simple_non_dominated_sort(objectives, constraints);
        
        % 生成子代
        offspring = generate_offspring_simple(population, problem, pop_size, pc, pm);
        
        % 合并父代和子代
        combined_pop = [population; offspring];
        
        % 选择下一代
        population = select_next_generation_simple(combined_pop, problem, pop_size);
    end
    
    % 最终评估并获取非支配解
    objectives = zeros(pop_size, 2);
    constraints = zeros(pop_size, 2);
    
    for i = 1:pop_size
        d = population(i, 1);
        l = population(i, 2);
        [f1, f2, g1, g2] = evaluate_cantilever(d, l, problem);
        objectives(i, :) = [f1, f2];
        constraints(i, :) = [g1, g2];
    end
    
    % 获取第一前沿的非支配解
    fronts = simple_non_dominated_sort(objectives, constraints);
    if ~isempty(fronts) && ~isempty(fronts{1})
        non_dominated = population(fronts{1}, :);
        objectives = objectives(fronts{1}, :);
    else
        non_dominated = [];
        objectives = [];
    end
end

function fronts = simple_non_dominated_sort(objectives, constraints)
    % 简化的非支配排序
    n = size(objectives, 1);
    fronts = {};
    current_front = 1;
    
    % 计算约束违反程度
    cv = sum(max(0, constraints), 2);
    
    % 已排序的个体集合
    remaining = 1:n;
    
    while ~isempty(remaining)
        front = [];
        
        for i = 1:length(remaining)
            p = remaining(i);
            dominated = false;
            
            for j = 1:length(remaining)
                q = remaining(j);
                if p ~= q
                    % 检查q是否支配p
                    if cv(q) < cv(p) || ...
                       (cv(q) == cv(p) && all(objectives(q, :) <= objectives(p, :)) && ...
                        any(objectives(q, :) < objectives(p, :)))
                        dominated = true;
                        break;
                    end
                end
            end
            
            if ~dominated
                front = [front, p];
            end
        end
        
        if ~isempty(front)
            fronts{current_front} = front;
            current_front = current_front + 1;
            % 从remaining中移除front中的个体
            remaining = setdiff(remaining, front);
        else
            break;
        end
    end
end

function offspring = generate_offspring_simple(parents, problem, pop_size, pc, pm)
    % 简化的子代生成
    n = size(parents, 1);
    offspring = zeros(n, 2);
    
    for i = 1:2:n
        if i+1 > n
            break;
        end
        
        % 随机选择两个父代
        idx1 = randi(n);
        idx2 = randi(n);
        parent1 = parents(idx1, :);
        parent2 = parents(idx2, :);
        
        % 交叉
        if rand < pc
            beta = rand(1, 2);
            child1 = parent1 .* beta + parent2 .* (1 - beta);
            child2 = parent2 .* beta + parent1 .* (1 - beta);
        else
            child1 = parent1;
            child2 = parent2;
        end
        
        % 变异
        for j = 1:2
            if rand < pm
                if j == 1
                    child1(j) = problem.d_min + rand * (problem.d_max - problem.d_min);
                else
                    child1(j) = problem.l_min + rand * (problem.l_max - problem.l_min);
                end
            end
            
            if rand < pm
                if j == 1
                    child2(j) = problem.d_min + rand * (problem.d_max - problem.d_min);
                else
                    child2(j) = problem.l_min + rand * (problem.l_max - problem.l_min);
                end
            end
        end
        
        % 边界检查
        child1(1) = min(max(child1(1), problem.d_min), problem.d_max);
        child1(2) = min(max(child1(2), problem.l_min), problem.l_max);
        child2(1) = min(max(child2(1), problem.d_min), problem.d_max);
        child2(2) = min(max(child2(2), problem.l_min), problem.l_max);
        
        offspring(i, :) = child1;
        if i+1 <= n
            offspring(i+1, :) = child2;
        end
    end
end

function next_population = select_next_generation_simple(combined_pop, problem, pop_size)
    % 简化的下一代选择
    n_combined = size(combined_pop, 1);
    objectives = zeros(n_combined, 2);
    constraints = zeros(n_combined, 2);
    
    % 评估所有个体
    for i = 1:n_combined
        d = combined_pop(i, 1);
        l = combined_pop(i, 2);
        [f1, f2, g1, g2] = evaluate_cantilever(d, l, problem);
        objectives(i, :) = [f1, f2];
        constraints(i, :) = [g1, g2];
    end
    
    % 非支配排序
    fronts = simple_non_dominated_sort(objectives, constraints);
    
    % 选择个体
    next_population = [];
    remaining = pop_size;
    
    for f = 1:length(fronts)
        front_idx = fronts{f};
        front_size = length(front_idx);
        
        if remaining >= front_size
            % 添加整个前沿
            next_population = [next_population; combined_pop(front_idx, :)];
            remaining = remaining - front_size;
        else
            % 如果前沿大小超过剩余空间，随机选择
            selected_idx = randperm(front_size, remaining);
            next_population = [next_population; combined_pop(front_idx(selected_idx), :)];
            break;
        end
    end
    
    % 如果还没填满，随机选择
    if size(next_population, 1) < pop_size
        needed = pop_size - size(next_population, 1);
        available = setdiff(1:n_combined, next_population);
        selected = randperm(length(available), min(needed, length(available)));
        next_population = [next_population; combined_pop(available(selected), :)];
    end
end
```


## III 50次运行测试程序效率

50次运行的结果如下。

```matlabTextOutput
开始进行50次独立运行...

正在运行第1次...
完成: 时间=0.21s, 解数=50, 最佳f1=0.862, 最佳f2=0.000054
正在运行第2次...
完成: 时间=0.13s, 解数=50, 最佳f1=0.680, 最佳f2=0.000075
正在运行第3次...
完成: 时间=0.13s, 解数=50, 最佳f1=0.870, 最佳f2=0.000064
正在运行第4次...
完成: 时间=0.13s, 解数=50, 最佳f1=0.736, 最佳f2=0.000055
正在运行第5次...
完成: 时间=0.13s, 解数=50, 最佳f1=0.686, 最佳f2=0.000050
正在运行第6次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.632, 最佳f2=0.000095
正在运行第7次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.500, 最佳f2=0.000083
正在运行第8次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.551, 最佳f2=0.000044
正在运行第9次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.782, 最佳f2=0.000049
正在运行第10次...
完成: 时间=0.13s, 解数=50, 最佳f1=0.556, 最佳f2=0.000059
正在运行第11次...
完成: 时间=0.14s, 解数=50, 最佳f1=1.037, 最佳f2=0.000054
正在运行第12次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.535, 最佳f2=0.000048
正在运行第13次...
完成: 时间=0.13s, 解数=50, 最佳f1=0.559, 最佳f2=0.000063
正在运行第14次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.628, 最佳f2=0.000049
正在运行第15次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.834, 最佳f2=0.000061
正在运行第16次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.633, 最佳f2=0.000120
正在运行第17次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.771, 最佳f2=0.000050
正在运行第18次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.845, 最佳f2=0.000050
正在运行第19次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.567, 最佳f2=0.000046
正在运行第20次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.603, 最佳f2=0.000068
正在运行第21次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.486, 最佳f2=0.000062
正在运行第22次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.748, 最佳f2=0.000055
正在运行第23次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.535, 最佳f2=0.000121
正在运行第24次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.509, 最佳f2=0.000051
正在运行第25次...
完成: 时间=0.13s, 解数=50, 最佳f1=0.568, 最佳f2=0.000054
正在运行第26次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.484, 最佳f2=0.000062
正在运行第27次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.571, 最佳f2=0.000052
正在运行第28次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.483, 最佳f2=0.000052
正在运行第29次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.813, 最佳f2=0.000064
正在运行第30次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.831, 最佳f2=0.000052
正在运行第31次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.898, 最佳f2=0.000057
正在运行第32次...
完成: 时间=0.13s, 解数=50, 最佳f1=1.120, 最佳f2=0.000059
正在运行第33次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.460, 最佳f2=0.000057
正在运行第34次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.469, 最佳f2=0.000064
正在运行第35次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.662, 最佳f2=0.000100
正在运行第36次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.654, 最佳f2=0.000092
正在运行第37次...
完成: 时间=0.12s, 解数=50, 最佳f1=1.048, 最佳f2=0.000066
正在运行第38次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.628, 最佳f2=0.000047
正在运行第39次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.575, 最佳f2=0.000088
正在运行第40次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.819, 最佳f2=0.000064
正在运行第41次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.795, 最佳f2=0.000063
正在运行第42次...
完成: 时间=0.12s, 解数=50, 最佳f1=1.104, 最佳f2=0.000050
正在运行第43次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.592, 最佳f2=0.000062
正在运行第44次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.488, 最佳f2=0.000045
正在运行第45次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.583, 最佳f2=0.000053
正在运行第46次...
完成: 时间=0.13s, 解数=50, 最佳f1=0.698, 最佳f2=0.000089
正在运行第47次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.451, 最佳f2=0.000063
正在运行第48次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.854, 最佳f2=0.000053
正在运行第49次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.672, 最佳f2=0.000061
正在运行第50次...
完成: 时间=0.12s, 解数=50, 最佳f1=0.897, 最佳f2=0.000054

=== 50次运行统计结果 ===
运行时间统计: 
平均值: 0.12 ± 0.01 秒
最小值: 0.12 秒
最大值: 0.21 秒

解数量统计:
平均值: 50.0 ± 0.0
最小值: 50
最大值: 50

最佳f1(重量)统计:
平均值: 0.687 ± 0.175 kg
最小值: 0.451 kg
最大值: 1.120 kg

最佳f2(挠度)统计:
平均值: 0.000063 ± 0.000018 m
最小值: 0.000044 m
最大值: 0.000121 m

正在生成可视化结果...

=== 程序执行完毕 ===
```

程序还会绘制Pareto前沿图、设计变量分布图、解数量分布直方图和运行时间分布直方图。

---
*注：本站使用vue3框架，技术问题可致信CircleCoder。*