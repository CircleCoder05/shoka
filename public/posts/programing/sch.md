---
title: '施瓦西时空引力效应的MATLAB可视化'
date: 2025-08-08
categories: [程序设计]
tags: [MATLAB, 施瓦西时空, 星光偏折, 引力红移, 施瓦西黑洞, 黑洞阴影, 嵌入图]
author: 谨言
---

## 一、星光偏折方程的求解

**方法一：利用dsolve解析求解。**
```matlab
syms mu(phi) M
eqn = diff(mu, phi, 2) + mu == 3*M*mu^2;
sol=dsolve(eqn)
```

注意到求解结果并非显式解，尝试使用simplify和expand等指令化简均未果，这可能不是一个好的解决办法。数值解法在实际应用中更方便。

**方法二：直接绘制一阶解析解，该方法只对较小的质量有效。**

```matlab
clear; clc;

% 此即解析解中的积分常数l，不同l对应不同轨道
l = linspace(4, 8, 10);

% 须转置为列向量
phi = linspace(0.05, pi, 1000)';

figure;

% 越大越蓝，越小越红，符合引力红移
colors = flipud(jet(length(l)));

for M = 0.1:0.01:1.5
    % 一阶修正解析解
    mu1 = (1./l) .* sin(phi) + (M./(l.^2)) .* (1 - cos(phi)).^2;

    % 转换为矢径长r
    r = 1 ./ mu1;

    % 绘制中心星体
    polarplot(0, 0, 'o', 'MarkerSize', 20, 'MarkerFaceColor', [1, 0.9, 0], 'MarkerEdgeColor', 'none');

    hold on;

    % 通过改变i来改变颜色，实现引力红移
    for i = 1:length(l)
        polarplot(phi, r(:, i), 'LineWidth', 0.8, 'Color', colors(i, :));
    end

    hold off;

    rlim([0 10]);

    title(['一阶解析解的极坐标图: r = 1/μ, M = ', num2str(M)]);

    legend(['星体'; cellstr(num2str(l', 'l=%.1f'))], 'Location', 'best');

    % 暂停0.03秒，形成动画效果
    pause(0.03);
end
```

**方法三：利用ode45进行数值求解。**
```matlab
clear; clc;

%% 参数设置
Mi = 9.6:0.01:11;     % 星体质量M的变化范围
span = [0.01, 1.8*pi];     % 求解区间

%% 多个初始条件
mu0i = linspace(0.019, 0.02, 8);

figure;
pax = polaraxes;  % 只创建一次极坐标轴
hold(pax, 'on');
colors = parula(length(mu0i));

% 绘制中心恒星(只须绘制一次)
polarplot(pax, 0, 0, 'o', 'MarkerSize', 20, 'MarkerFaceColor', [1, 0.9, 0], 'MarkerEdgeColor', 'none');

for Mid = 1:length(Mi)
    M = Mi(Mid);
    
    %% 定义微分方程系统
    ode_func = @(phi, y) [y(2); 3*M*y(1)^2 - y(1)];
    
    %% 清除上一帧的轨迹线
    % 找到所有的line对象(排除中心恒星)
    h = findobj(gca, 'Type', 'line');
    if length(h) > 1  % 如果有多个线对象(排除中心恒星)
        delete(h(1:end-1));  % 删除除了最后一个(中心恒星)以外的所有线
    end
    
    %% 内层循环：绘制每个初始条件的轨迹
    for i = 1:length(mu0i)
        mu0 = [0; mu0i(i)];
        
        %% 使用ode45数值求解
        [phi, sol] = ode45(ode_func, span, mu0);
        mu = sol(:, 1);    % μ(φ)的解
        
        %% 计算 r = 1/μ
        r = 1 ./ mu;
        
        %% 在极坐标轴上绘图
        polarplot(pax, phi, r, 'LineWidth', 0.5,'Color', colors(i, :));
    end
    
    %% 更新标题
    title(pax, sprintf('数值解的极坐标图: r = 1/μ, M = %.1f', M));
    rlim(pax, [0 50]);

    drawnow;    % 刷新图形
    pause(0.1); % 暂停一下，形成动画效果
end
```

## 二、引力红移的可视化
**1、引力源质量M不变，观察者位置变化的引力红移动画**
```matlab
clear; clc; close all;

%% 参数设置
M = 1;                            % 质量固定
r_obs_values = linspace(2.1, 150, 200);  % 观察者位置从近到远变化

%% 初始化图形
figure('Position', [100, 100, 600, 500]);
polaraxes;

% 创建径向和角度坐标
r = linspace(2.1, 15, 80);        % 径向坐标
theta = linspace(0, 2*pi, 200);   % 角度坐标

% 使用jet颜色映射
cmap = jet(256);

% 存储所有圆环的句柄
ring_handles = zeros(1, length(r));

% 预先创建所有圆环
for i = 1:length(r)
    ring_handles(i) = polarplot(theta, r(i)*ones(size(theta)), 'LineWidth', 5);
    hold on;
end

% 标记视界
horizon = polarplot(linspace(0, 2*pi, 100), 2*ones(1, 100), ...
    'k', 'LineWidth', 2);

% 设置图形属性
rlim([0, 7]);
grid on;

% 添加颜色条
colormap(jet);
cbar = colorbar('eastoutside');
cbar.Label.String = '红移强度';
cbar.Label.FontSize = 10;

% 设置背景为白色
set(gca, 'Color', 'white', 'GridColor', [0.3, 0.3, 0.3], 'GridAlpha', 0.3);
set(gcf, 'Color', 'white');

%% 动画循环 - 观察者位置变化
for idx = 1:length(r_obs_values)
    r_obs = r_obs_values(idx);
    
    % 更新每个圆环的颜色
    for i = 1:length(r)
        % 计算红移比
        ratio = sqrt(1 - 2*M/r_obs) / sqrt(1 - 2*M/r(i));
        
        % 归一化到[0,1]范围
        norm_ratio = (ratio - 0.5) / (2.5 - 0.5);
        norm_ratio = max(min(norm_ratio, 1), 0);
        
        % 获取颜色索引
        color_idx = round(norm_ratio * 255) + 1;
        color_idx = min(max(color_idx, 1), 256);
        color = cmap(color_idx, :);
        
        % 更新圆环颜色
        set(ring_handles(i), 'Color', color);
    end
    
    % 更新标题
    title(['施瓦西时空引力红移动画 (M=', num2str(M), ', r_{obs}=', ...
        sprintf('%.1f', r_obs), ')']);
    
    % 设置颜色条标签
    cbar.Ticks = linspace(0, 1, 5);
    cbar.TickLabels = arrayfun(@(x) sprintf('%.1f', x), ...
        linspace(0.5, 2.5, 5), 'UniformOutput', false);
    
    % 暂停，形成动画效果
    pause(0.01);
end

% 添加视界图例
legend(horizon, '视界 (r=2M)', 'Location', 'best');
```

**2、观察者位置不变，引力源质量M变化的引力红移动画**
```matlab
clear; clc; close all;

%% 参数设置
r_obs = 20;                            % 观察者位置固定
M_values = linspace(0.5, 5, 200);     % 质量变化范围，限制在5以内确保视界小于15

%% 初始化图形
figure('Position', [100, 100, 600, 500]);
polaraxes;

% 角度坐标
theta = linspace(0, 2*pi, 200);       % 角度坐标

% 使用jet颜色映射
cmap = jet(256);

% 初始化圆环数量
n_rings = 80;

% 存储所有圆环的句柄
ring_handles = zeros(1, n_rings);

% 预先创建所有圆环(初始半径待设置)
for i = 1:n_rings
    ring_handles(i) = polarplot(theta, ones(size(theta)), 'LineWidth', 5);
    hold on;
end

% 标记视界(初始)
horizon = polarplot(linspace(0, 2*pi, 100), 2*M_values(1)*ones(1, 100), ...
    'k', 'LineWidth', 2);

% 设置图形属性
rlim([0, 15]);  % 固定显示范围
grid on;

% 添加颜色条
colormap(jet);
cbar = colorbar('eastoutside');
cbar.Label.String = '红移强度';
cbar.Label.FontSize = 10;

% 设置背景为白色
set(gca, 'Color', 'white', 'GridColor', [0.3, 0.3, 0.3], 'GridAlpha', 0.3);
set(gcf, 'Color', 'white');

%% 动画循环 - M变化
for idx = 1:length(M_values)
    M = M_values(idx);
    
    % 根据当前M值重新计算径向坐标
    % 最小半径为视界加上一个小偏移
    min_r = 2*M + 0.1;
    max_r = 15;  % 固定最大半径
    
    % 确保最小半径小于最大半径
    if min_r >= max_r
        min_r = max_r - 0.1;
    end
    
    % 生成径向坐标
    r = linspace(min_r, max_r, n_rings);
    
    % 更新每个圆环的半径和颜色
    for i = 1:n_rings
        % 更新圆环半径
        set(ring_handles(i), 'YData', r(i)*ones(size(theta)));
        
        % 计算红移比
        ratio = sqrt(1 - 2*M/r_obs) / sqrt(1 - 2*M/r(i));
        
        % 归一化到[0,1]范围
        norm_ratio = (ratio - 0.5) / (2.5 - 0.5);
        norm_ratio = max(min(norm_ratio, 1), 0);
        
        % 获取颜色索引
        color_idx = round(norm_ratio * 255) + 1;
        color_idx = min(max(color_idx, 1), 256);
        color = cmap(color_idx, :);
        
        % 更新圆环颜色
        set(ring_handles(i), 'Color', color);
    end
    
    % 更新视界位置
    set(horizon, 'YData', 2*M*ones(1, 100));
    
    % 更新标题
    title(['施瓦西时空引力红移动画 (r_{obs}=', num2str(r_obs), ', M=', ...
        sprintf('%.2f', M), ')']);
    
    % 设置颜色条标签
    cbar.Ticks = linspace(0, 1, 5);
    cbar.TickLabels = arrayfun(@(x) sprintf('%.1f', x), ...
        linspace(0.5, 2.5, 5), 'UniformOutput', false);
    
    % 暂停，形成动画效果
    pause(0.05);  % 增加暂停时间，使变化更平滑
end

% 添加视界图例
legend(horizon, sprintf('视界 (r=%.1f)', 2*M_values(end)), 'Location', 'best');
```

### 三、施瓦西黑洞径向类光测地线的求解

**方法一：利用dsolve解析求解。**
内向族显然是斜率为-1的直线族，外向族的方程可以用dsolve求解。
```matlab
clear; clc; close all;
syms t(r) M
ode = diff(t, r) == (r + 2*M)/(r - 2*M);
sol = dsolve(ode)
```

dsolve得到的是复数域上的解，将其写成实数表达式即可绘制解析解对应的测地线族的图像。

```matlab
clear; clc; close all;

% 参数
M = 1;          % 质量
r = 0.01:0.01:5; % 半径范围

% 内向族测地线：dt/dr = -1
c1 = linspace(-5, 5, 11); % 积分常数

% 外向族测地线：dt/dr = (r+2M)/(r-2M)
c2 = linspace(-5, 5, 11);

% 创建图形
figure('Position', [100, 100, 600, 500]);
hold on;

% 首先绘制内向族的所有线
for i = 1:length(c1)
    t = -r + c1(i);  % t = -r + C1
    if i == 1
        % 只保存第一条线的句柄用于图例
        h_in = plot(r, t, 'b-', 'LineWidth', 0.6);
    else
        plot(r, t, 'b-', 'LineWidth', 0.6);
    end
end

% 然后绘制外向族的所有线
h_out_plotted = false;  % 标记是否已经保存了外向族的句柄
for i = 1:length(c2)
    % 分离视界内外部
    r1 = r(r < 2*M);  % 视界内
    r2 = r(r > 2*M);  % 视界外
    
    % 检查是否有数据点(避免空数组)
    if ~isempty(r1) && ~isempty(r2)
        % 视界内：t = r + 4M*ln(2M-r) + C2
        t1 = r1 + 4*M*log(2*M - r1) + c2(i);
        % 视界外：t = r + 4M*ln(r-2M) + C2
        t2 = r2 + 4*M*log(r2 - 2*M) + c2(i);
        
        if ~h_out_plotted
            % 只保存第一条线的句柄用于图例
            h_out = plot(r1, t1, 'r-', 'LineWidth', 0.6);
            plot(r2, t2, 'r-', 'LineWidth', 0.6);  % 继续画第二部分
            h_out_plotted = true;
        else
            plot(r1, t1, 'r-', r2, t2, 'r-', 'LineWidth', 0.6);
        end
    end
end

% 标记视界
h_horizon = plot([2*M, 2*M], [-10, 10], 'k--', 'LineWidth', 1);

% 图形设置
xlabel('$r$', 'Interpreter', 'latex', 'FontSize', 14);
ylabel('$\tilde{t}$', 'Interpreter', 'latex', 'FontSize', 14);
title('施瓦西黑洞径向类光测地线族', 'FontSize', 14);
xlim([0, 5]);
ylim([-10, 10]);
grid on;

% 创建图例
if exist('h_in', 'var') && exist('h_out', 'var') && exist('h_horizon', 'var')
    legend([h_in, h_out, h_horizon], {'内向族', '外向族', '视界 (r=2M)'}, ...
        'Location', 'best', 'FontSize', 10);
end
```

**方法二：利用ode45进行数值求解。**
```matlab
clear; clc; close all;

% 参数
M = 1;          % 质量

% 内向族测地线：dt/dr = -1
c1 = linspace(-5, 5, 11); % 积分常数

% 数值求解外向族测地线：dt/dr = (r+2M)/(r-2M)
% 使用不同的初始条件
t0 = linspace(1, 15, 11); % 不同的初始t值

% 创建图形
figure('Position', [100, 100, 600, 500]);
hold on;

% 绘制内向族(蓝色实线)
for i = 1:length(c1)
    r = 0.01:0.01:5;
    t = -r + c1(i);  % t = -r + C1
    plot(r, t, 'b-', 'LineWidth', 0.6);
end

% 绘制外向族(红色实线)
for i = 1:length(t0)
    % 定义微分方程
    ode = @(r, t) (r+2*M)/(r-2*M);
    
    % 设置高精度选项
    options = odeset('RelTol', 1e-9, 'AbsTol', 1e-11, 'MaxStep', 0.001);
    
    % 视界外部：从远离视界处向视界积分(反向积分更稳定)
    rspan1 = [5, 2.001];  % 反向积分：从5积分到2.001
    [r1, t1] = ode45(ode, rspan1, t0(i), options);
    plot(r1, t1, 'r-', 'LineWidth', 0.6);
    
    % 视界内部：从视界内向外积分
    rspan2 = [0.01,1.99];  % 反向积分：从1.999积分到0.01
    [r2, t2] = ode45(ode, rspan2, t0(i), options);
    plot(r2, t2, 'r-', 'LineWidth', 0.6);
end

% 标记视界
plot([2*M, 2*M], [-10, 10], 'k--', 'LineWidth', 1);

% 创建 dummy plot 用于图例(不显示在实际图形中)
h_dummy_in = plot(NaN, NaN, 'b-', 'LineWidth', 0.6);
h_dummy_out = plot(NaN, NaN, 'r-', 'LineWidth', 0.6);
h_dummy_horizon = plot(NaN, NaN, 'k--', 'LineWidth', 1);

% 图形设置
xlabel('$r$', 'Interpreter', 'latex', 'FontSize', 14);
ylabel('$\tilde{t}$', 'Interpreter', 'latex', 'FontSize', 14);
title('施瓦西黑洞径向类光测地线族', 'FontSize', 14);
xlim([0, 5]);
ylim([-10, 10]);
grid on;

% 图例
legend([h_dummy_in, h_dummy_out, h_dummy_horizon], ...
    {'内向族', '外向族', '视界 (r=2M)'}, ...
    'Location', 'best', 'FontSize', 10);
```

### 四、施瓦西黑洞的阴影与吸积盘成像模拟

注意：该程序在生成图像后需要输入y/n来选择是否保存图像才能继续运行，如果出现半天跑不出来可能是因为没有输入选项，程序在中间停止了。
```matlab
clear all; close all; clc;

%% 1. 主脚本
%% 参数设置
M = 1;                  % 黑洞质量 (几何化单位)
rs = 2*M;               % 施瓦西半径 (视界)
camera_distance = 50*M; % 相机距离黑洞的距离
image_size = 100;       % 图像分辨率 (image_size x image_size)
fov = 60;               % 视场角 (度)
max_steps = 5000;       % 最大积分步数
step_size = 0.05;       % 积分步长

fprintf('========================================\n');
fprintf('施瓦西黑洞光线追踪模拟\n');
fprintf('========================================\n');
fprintf('参数:\n');
fprintf('  黑洞质量 M = %.1f\n', M);
fprintf('  施瓦西半径 r_s = %.1f\n', rs);
fprintf('  相机距离 = %.1f M\n', camera_distance);
fprintf('  图像分辨率 = %d x %d\n', image_size, image_size);
fprintf('  视场角 = %.0f 度\n', fov);
fprintf('========================================\n\n');

% 生成黑洞图像
tic;
black_hole_image = generate_black_hole_image(...
    M, rs, camera_distance, image_size, fov, max_steps, step_size);
fprintf('计算时间: %.2f 秒\n', toc);

% 可视化结果
visualize_results(black_hole_image, rs, camera_distance);

% 可选: 保存结果
save_image = input('是否保存图像? (y/n): ', 's');
if strcmpi(save_image, 'y')
    filename = sprintf('black_hole_image_%dx%d_%.0fM.png', ...
        image_size, image_size, camera_distance);
    imwrite(black_hole_image, filename);
    fprintf('图像已保存为: %s\n', filename);

    % 保存数据
    save('black_hole_simulation.mat', 'black_hole_image', ...
        'M', 'rs', 'camera_distance', 'image_size', 'fov');
end

% 估算阴影大小
pixel_size = deg2rad(fov) / image_size;
shadow_radius_pixels = 0;
for i = 1:image_size
    for j = 1:image_size
        if black_hole_image(i, j) == 0
            % 计算到图像中心的距离
            dist = sqrt((i - image_size/2)^2 + (j - image_size/2)^2);
            if dist > shadow_radius_pixels
                shadow_radius_pixels = dist;
            end
        end
    end
end

% 转换为物理单位 (角度)
shadow_radius_rad = shadow_radius_pixels * pixel_size;
shadow_radius_mas = rad2mas(shadow_radius_rad);  % 毫角秒

fprintf('估算阴影角直径: %.2f 微角秒\n', shadow_radius_mas * 2 * 1000);

fprintf('\n模拟完成!\n');

%% 2. 生成黑洞图像函数
function image = generate_black_hole_image(M, rs, camera_distance, ...
                                           image_size, fov, max_steps, step_size)
    % 生成黑洞图像
    
    fprintf('正在生成黑洞图像...\n');
    
    image = zeros(image_size, image_size);
    
    % 相机参数
    camera_theta = pi/2;  % 在赤道面上
    camera_phi = 0;
    
    % 计算像素对应的角度
    fov_rad = deg2rad(fov);
    pixel_size = fov_rad / image_size;
    
    for i = 1:image_size
        for j = 1:image_size
            % 计算像素在相机局部坐标系中的方向
            % 假设相机朝向黑洞中心
            x = (j - image_size/2) * pixel_size;
            y = (i - image_size/2) * pixel_size;
            
            % 归一化方向向量 (在相机局部坐标系)
            direction = [1, -x, -y];  % 负号因为图像坐标系与物理坐标系可能相反
            direction = direction / norm(direction);
            
            % 将方向转换为球坐标动量分量
            % 在远处，度规近似平直，动量方向近似空间方向
            
            % 假设相机在赤道面(theta=pi/2)看向负z方向
            pr0 = -direction(1);      % 径向向内
            ptheta0 = -direction(2);  % 对应theta方向
            pphi0 = direction(3);     % 对应phi方向
            
            % 调整动量为单位长度 (光子在平直时空)
            norm_p = sqrt(pr0^2 + (camera_distance*ptheta0)^2 + ...
                         (camera_distance*sin(camera_theta)*pphi0)^2);
            pr0 = pr0 / norm_p;
            ptheta0 = ptheta0 / norm_p;
            pphi0 = pphi0 / norm_p;
            
            % 追踪光线
            [trajectory, hit_type] = trace_ray(...
                camera_distance, camera_theta, camera_phi, ...
                pr0, ptheta0, pphi0, M, max_steps, step_size);
            
            % 根据命中类型赋值颜色
            if hit_type == 1
                % 落入视界 - 黑色
                image(i, j) = 0;
            else
                % 逃逸 - 根据是否穿过吸积盘着色
                
                % 简单吸积盘模型 (在赤道面)
                % 检查是否穿过 r=6M 到 r=20M 的圆盘
                disk_inner = 6*M;
                disk_outer = 20*M;
                
                crossed_disk = false;
                for k = 1:size(trajectory, 1)
                    r = trajectory(k, 2);
                    theta = trajectory(k, 3);
                    
                    % 检查是否接近赤道面且在吸积盘半径内
                    if r >= disk_inner && r <= disk_outer && ...
                       abs(theta - pi/2) < 0.1
                        crossed_disk = true;
                        break;
                    end
                end
                
                if crossed_disk
                    % 穿过吸积盘 - 白色/亮色
                    image(i, j) = 1;
                else
                    % 未穿过吸积盘 - 灰色背景
                    image(i, j) = 0.3;
                end
            end
        end
        
        % 显示进度
        if mod(i, 10) == 0
            fprintf('进度: %.1f%%\n', 100*i/image_size);
        end
    end
    
    fprintf('图像生成完成!\n');
end

%% 3. 施瓦西度规函数
% 逆变度规张量 g^μν
function g_uu = schwarzschild_metric(r, theta, M)
    % 返回施瓦西度规的逆变分量
    g_uu = zeros(4,4);
    
    % 施瓦西度规在球坐标中的逆变形式
    tmp = 1 - 2*M/r;  % 注意：这里使用M
    g_uu(1,1) = -1/tmp;        % g^tt
    g_uu(2,2) = tmp;           % g^rr
    g_uu(3,3) = 1/(r^2);       % g^θθ
    g_uu(4,4) = 1/((r*sin(theta))^2);  % g^φφ
end

%% 4. 计算四动量
function p4 = calculate_four_momentum(r, theta, p3, is_null, M)
    % 计算四动量 (能量分量 p_t)
    % p3 = [p_r, p_theta, p_phi] 三动量
    % is_null: true 表示零测地线(光子), false 表示类时测地线
    
    g_uu = schwarzschild_metric(r, theta, M);
    
    % 初始化四动量 (p_t 待计算)
    p4 = zeros(4,1);
    p4(2:4) = p3(:);
    
    % 归一化条件: g^μν p_μ p_ν = -m²
    % 对于光子: m=0
    A = g_uu(1,1);                     % g^tt
    B = 2 * g_uu(1,4) * p4(4);         % 2g^tφ p_φ (施瓦西度规中此项为0)
    C = g_uu(2,2)*(p4(2)^2) + ...
        g_uu(3,3)*(p4(3)^2) + ...
        g_uu(4,4)*(p4(4)^2) + ...
        (~is_null);                    % 类时粒子: +1, 光子: 0
    
    % 求解 p_t (能量)
    % 选择正号 (向前传播的光子)
    p4(1) = (-B + sqrt(B^2 - 4*A*C)) / (2*A);
end

%% 5. 测地线方程的导数函数 (用于ODE求解)
function dydlambda = geodesic_equations(lambda, y, is_null, M)
    % y = [t, r, theta, phi, p_t, p_r, p_theta, p_phi]
    % 返回 dy/dλ
    
    t = y(1);
    r = y(2);
    theta = y(3);
    phi = y(4);
    pt = y(5);
    pr = y(6);
    ptheta = y(7);
    pphi = y(8);
    
    % 获取度规
    g_uu = schwarzschild_metric(r, theta, M);
    
    % 坐标对仿射参数的导数: dx^μ/dλ = g^μν p_ν
    dtdlambda = g_uu(1,1)*pt;           % + g_uu(1,4)*pphi (克尔黑洞)
    drdlambda = g_uu(2,2)*pr;
    dthetadlambda = g_uu(3,3)*ptheta;
    dphidlambda = g_uu(4,4)*pphi;       % + g_uu(1,4)*pt (克尔黑洞)
    
    % 动量对仿射参数的导数: dp_μ/dλ = 0.5 * ∂_μ(g^αβ) p_α p_β
    % 施瓦西度规只依赖于 r 和 theta
    dptdlambda = 0;  % 时间平移对称性 => p_t 守恒
    
    % 计算度规导数
    if r > 2.001*M  % 避免视界处奇点
        % ∂g^tt/∂r
        dgtt_dr = -2*M/(r^2) / (1 - 2*M/r)^2;
        
        % ∂g^rr/∂r
        dgrr_dr = 2*M/(r^2);
        
        % ∂g^θθ/∂r
        dgthetatheta_dr = -2/(r^3);
        
        % ∂g^φφ/∂r
        dgphiphi_dr = -2/(r^3 * sin(theta)^2);
        
        % ∂g^φφ/∂θ
        dgphiphi_dtheta = -2*cos(theta)/(r^2 * sin(theta)^3);
    else
        dgtt_dr = 0;
        dgrr_dr = 0;
        dgthetatheta_dr = 0;
        dgphiphi_dr = 0;
        dgphiphi_dtheta = 0;
    end
    
    % 动量导数
    dprdlambda = 0.5 * (dgtt_dr * pt^2 + ...
                       dgrr_dr * pr^2 + ...
                       dgthetatheta_dr * ptheta^2 + ...
                       dgphiphi_dr * pphi^2);
    
    dpthetadlambda = 0.5 * dgphiphi_dtheta * pphi^2;
    
    dpphidlambda = 0;  % 轴对称性 => p_φ 守恒
    
    % 组装导数向量
    dydlambda = [dtdlambda; drdlambda; dthetadlambda; dphidlambda;
                 dptdlambda; dprdlambda; dpthetadlambda; dpphidlambda];
end

%% 6. 光线追踪函数
function [trajectory, hit_type] = trace_ray(r0, theta0, phi0, pr0, ptheta0, pphi0, M, max_steps, step_size)
    % 从初始条件追踪一条光线
    % 返回: 轨迹和命中类型
    
    % 初始条件
    is_null = true;  % 光子
    
    % 计算初始四动量
    p4_initial = calculate_four_momentum(r0, theta0, [pr0; ptheta0; pphi0], is_null, M);
    
    % 初始状态向量
    y0 = [0; r0; theta0; phi0;        % 位置 (t=0)
          p4_initial(1);              % p_t
          p4_initial(2);              % p_r
          p4_initial(3);              % p_theta
          p4_initial(4)];             % p_phi
    
    % 积分参数
    lambda_span = [0, max_steps*step_size];
    
    % 自定义RK4积分 (跟ode45差不多，但是更加可控)
    trajectory = zeros(max_steps+1, 8);
    trajectory(1, :) = y0';
    
    hit_type = 0;  % 0: 未结束, 1: 落入视界, 2: 逃逸
    
    for step = 1:max_steps
        % 当前状态
        y_current = trajectory(step, :)';
        
        % 检查停止条件
        r_current = y_current(2);
        
        % 落入视界
        if r_current < 2.001*M
            hit_type = 1;
            trajectory = trajectory(1:step, :);
            break;
        end
        
        % 逃逸到远处
        if r_current > r0 * 2
            hit_type = 2;
            trajectory = trajectory(1:step, :);
            break;
        end
        
        % RK4积分
        k1 = step_size * geodesic_equations(step*step_size, y_current, is_null, M);
        k2 = step_size * geodesic_equations(step*step_size + step_size/2, ...
                                           y_current + k1/2, is_null, M);
        k3 = step_size * geodesic_equations(step*step_size + step_size/2, ...
                                           y_current + k2/2, is_null, M);
        k4 = step_size * geodesic_equations(step*step_size + step_size, ...
                                           y_current + k3, is_null, M);
        
        y_next = y_current + (k1 + 2*k2 + 2*k3 + k4)/6;
        
        trajectory(step+1, :) = y_next';
    end
    
    if hit_type == 0
        hit_type = 2;  % 默认视为逃逸
    end
end

%% 7. 可视化函数
function visualize_results(image, rs, camera_distance)
    % 可视化黑洞图像
    
    image_size = size(image, 1);
    
    figure('Position', [100, 100, 800, 600]);
    
    % 绘制黑洞图像
    imagesc(image);
    colormap(gray);
    axis equal tight;
    title('施瓦西黑洞阴影与吸积盘','FontWeight', 'bold');
    xlabel('像素 X');
    ylabel('像素 Y');
    colorbar;
    
    % 添加注释
    text(15, 10, '黑色区域: 黑洞阴影', 'Color', 'white');
    text(15, 20, '亮环: 吸积盘', 'Color', 'white');
    text(15, 30, sprintf('相机距离: %.0f M', camera_distance),'Color', 'white');
    
    % 添加坐标轴刻度
    xticks([1, image_size/4, image_size/2, 3*image_size/4, image_size]);
    yticks([1, image_size/4, image_size/2, 3*image_size/4, image_size]);
    grid on;
    
    % 设置图形背景
    set(gca, 'Color', [0.2, 0.2, 0.2]);
end

%% 8. 辅助函数
function mas = rad2mas(rad)
    % 弧度转换为毫角秒
    mas = rad * (180/pi) * 3600 * 1000;
end
```

### 五、施瓦西时空的嵌入图

**1. 星体嵌入图**
```matlab
clear; clc; close all;  % 清除变量、命令窗口和图形窗口
% 参数设置
M = 0.25;    % 星体质量
R = 0.58;    % 星体半径（R > 2M，不适用于黑洞）
k = M / R^3; % 正比于星体密度的常量

% 微分方程定义
% 星体内部：r < R
F = @(r, z) (2 * k * r.^2 ./ (1 - 2 * r.^2)).^(1/2);
% 星体外部：r >= R
FF = @(r, z) (2 * M ./ (r - 2 * M)).^(1/2);

% 求解微分方程
[r1, z1] = ode45(F, [0, R], 0.01);      % 内部解
[r2, z2] = ode45(FF, [R, 4*R], z1(end)); % 外部解

% 生成三维嵌入图数据
N = 100;                              % 圆周方向点数
the = linspace(0, 2*pi, N);          % 角度数组
n1 = length(r1);
n2 = length(r2);
n = n1 + n2;                         % 总点数

% 初始化坐标数组
x = zeros(n, N);
y = zeros(n, N);
z = zeros(n, N);

% 计算三维坐标
x(1:n1, :) = r1 .* cos(the);          % 内部x坐标
x(n1+1:n, :) = r2 .* cos(the);        % 外部x坐标
y(1:n1, :) = r1 .* sin(the);          % 内部y坐标
y(n1+1:n, :) = r2 .* sin(the);        % 外部y坐标
z(1:n1, :) = z1 .* ones(n1, N);       % 内部z坐标
z(n1+1:n, :) = z2 .* ones(n2, N);     % 外部z坐标

% 绘制三维嵌入图
figure;
h = surf(x, y, z, 'FaceAlpha', 0.5, 'LineStyle', 'none');
hold on;

% 绘制黄色球体（星体本身）
t = linspace(0, pi, 25);
p = linspace(0, 2*pi, 25);
[theta, phi] = meshgrid(t, p);
xx = R .* sin(theta) .* sin(phi);
yy = R .* sin(theta) .* cos(phi);
zz = z2(end) + R .* cos(theta);
s = surf(xx, yy, zz, 'LineStyle', 'none', 'EdgeColor', 'b', 'FaceColor', 'y', 'FaceAlpha', 0.8);

title('静态球对称恒星内外空间的嵌入图');
xlabel('X'); ylabel('Y'); zlabel('Z');
axis equal;
view(-37.5, 10);
grid on;
hold off;
```

**2.嵌入图随参数变化的动画（一）**
```matlab
clear; clc; close all;  % 清除变量、命令窗口和图形窗口
% 功能：展示嵌入图随星体质量和半径的变化
% 1. 固定半径，改变质量
% 2. 固定质量，改变半径

%% 参数设置
M = 0.01;    % 初始星体质量
R = 0.6;     % 初始星体半径（R > 2M，不适用于黑洞）
k = M / R^3; % 正比于星体密度的常量

%% 嵌入图应满足的微分方程
% 星体内部：r < R
F = @(r, z) (2 * k * r.^2 ./ (1 - 2 * r.^2)).^(1/2);
% 星体外部：r >= R
FF = @(r, z) (2 * M ./ (r - 2 * M)).^(1/2);

%% 初始求解微分方程
[r1, z1] = ode45(F, [0, R], 0.01);
[r2, z2] = ode45(FF, [R, 4*R], z1(end));

%% 生成初始三维数据
N = 100;                 % 圆周方向点数
the = linspace(0, 2*pi, N);  % 角度数组

% 合并内外解数据
n1 = length(r1);
n2 = length(r2);
n = n1 + n2;  % 总点数

% 初始化坐标数组
x = zeros(n, N);
y = zeros(n, N);
z = zeros(n, N);

% 计算初始三维坐标
x(1:n1, :) = r1 .* cos(the);   % 内部x坐标
x(n1+1:n, :) = r2 .* cos(the); % 外部x坐标
y(1:n1, :) = r1 .* sin(the);   % 内部y坐标
y(n1+1:n, :) = r2 .* sin(the); % 外部y坐标
z(1:n1, :) = z1 .* ones(n1, N);   % 内部z坐标
z(n1+1:n, :) = z2 .* ones(n2, N); % 外部z坐标

%% 生成星体球面数据
t = linspace(0, pi, 25);
p = linspace(0, 2*pi, 25);
[theta, phi] = meshgrid(t, p);
xx = R .* sin(theta) .* sin(phi);
yy = R .* sin(theta) .* cos(phi);
zz = z2(end) + R .* cos(theta);

%% 创建初始图形
figure;
h = surf(x, y, z, 'FaceAlpha', 0.9);           % 嵌入图句柄
hold on;
s = surf(xx, yy, zz, 'LineStyle', 'none', ...  % 星体球面句柄
         'EdgeColor', 'b', 'FaceColor', 'y');
view(-37.5, 30);
axis equal;
title('嵌入图随质量变化的动画');

%% 第一部分动画：固定半径，改变质量
for i = 1:100
    % 更新质量
    M = 0.001 * i;
    
    % 更新微分方程
    F = @(r, z) (2 * k * r.^2 ./ (1 - 2 * r.^2)).^(1/2);
    FF = @(r, z) (2 * M ./ (r - 2 * M)).^(1/2);
    
    % 重新求解微分方程
    [r1, z1] = ode45(F, [0, R], 0.01);
    [r2, z2] = ode45(FF, [R, 4*R], z1(end));
    
    % 更新嵌入图数据
    n1 = length(r1);
    n2 = length(r2);
    n = n1 + n2;
    
    x = zeros(n, N);
    y = zeros(n, N);
    z = zeros(n, N);
    x(1:n1, :) = r1 .* cos(the);
    x(n1+1:n, :) = r2 .* cos(the);
    y(1:n1, :) = r1 .* sin(the);
    y(n1+1:n, :) = r2 .* sin(the);
    z(1:n1, :) = z1 .* ones(n1, N);
    z(n1+1:n, :) = z2 .* ones(n2, N);
    
    % 更新星体球面z坐标
    zz = z2(end) + R .* cos(theta);
    
    % 更新图形数据
    set(h, 'XData', x, 'YData', y, 'ZData', z);
    set(s, 'XData', xx, 'YData', yy, 'ZData', zz);
    
    % 更新标题
    title(sprintf('嵌入图随质量变化 (M = %.3f)', M));
    
    % 调整视角和坐标轴
    view(-37.5, 10);
    axis([-2, 2, -2, 2, 0, 1.5]);
    
    % 刷新图形
    drawnow;
    pause(0.1);
end

%% 第二部分动画：固定质量，改变半径
% 注意：此时M为上一循环结束时的值(M=0.1)
for i = 1:100
    % 更新半径
    R = 0.6 - 0.0035 * i;
    
    % 更新k值
    k = M / R^3;
    
    % 更新微分方程
    F = @(r, z) (2 * k * r.^2 ./ (1 - 2 * r.^2)).^(1/2);
    FF = @(r, z) (2 * M ./ (r - 2 * M)).^(1/2);
    
    % 重新求解微分方程
    [r1, z1] = ode45(F, [0, R], 0.01);
    [r2, z2] = ode45(FF, [R, 4*R], z1(end));
    
    % 更新嵌入图数据
    n1 = length(r1);
    n2 = length(r2);
    n = n1 + n2;
    
    x = zeros(n, N);
    y = zeros(n, N);
    z = zeros(n, N);
    x(1:n1, :) = r1 .* cos(the);
    x(n1+1:n, :) = r2 .* cos(the);
    y(1:n1, :) = r1 .* sin(the);
    y(n1+1:n, :) = r2 .* sin(the);
    z(1:n1, :) = z1 .* ones(n1, N);
    z(n1+1:n, :) = z2 .* ones(n2, N);
    
    % 更新星体球面
    xx = R .* sin(theta) .* sin(phi);
    yy = R .* sin(theta) .* cos(phi);
    zz = z2(end) + R .* cos(theta);
    
    % 更新图形数据
    set(h, 'XData', x, 'YData', y, 'ZData', z);
    set(s, 'XData', xx, 'YData', yy, 'ZData', zz);
    
    % 更新标题
    title(sprintf('嵌入图随半径变化 (R = %.3f)', R));
    
    % 调整视角和坐标轴
    view(-37.5, 10);
    axis([-2, 2, -2, 2, 0, 1.5]);
    
    % 刷新图形
    drawnow;
    pause(0.1);
end
```
**3.嵌入图随参数变化的动画（二）**
```matlab
%% 嵌入图随参数变化的动画
% 功能：展示嵌入图随星体质量和半径的变化
% 1. 固定半径，改变质量
% 2. 固定质量，改变半径

%% 参数设置
M = 0.01;    % 初始星体质量
R = 0.6;     % 初始星体半径（R > 2M，不适用于黑洞）
k = M / R^3; % 正比于星体密度的常量

%% 嵌入图应满足的微分方程
% 星体内部：r < R
F = @(r, z) (2 * k * r.^2 ./ (1 - 2 * r.^2)).^(1/2);
% 星体外部：r >= R
FF = @(r, z) (2 * M ./ (r - 2 * M)).^(1/2);

%% 初始求解微分方程
[r1, z1] = ode45(F, [0, R], 0.01);
[r2, z2] = ode45(FF, [R, 4*R], z1(end));

%% 生成初始三维数据
N = 100;                 % 圆周方向点数
the = linspace(0, 2*pi, N);  % 角度数组

% 合并内外解数据
n1 = length(r1);
n2 = length(r2);
n = n1 + n2;  % 总点数

% 初始化坐标数组
x = zeros(n, N);
y = zeros(n, N);
z = zeros(n, N);

% 计算初始三维坐标
x(1:n1, :) = r1 .* cos(the);   % 内部x坐标
x(n1+1:n, :) = r2 .* cos(the); % 外部x坐标
y(1:n1, :) = r1 .* sin(the);   % 内部y坐标
y(n1+1:n, :) = r2 .* sin(the); % 外部y坐标
z(1:n1, :) = z1 .* ones(n1, N);   % 内部z坐标
z(n1+1:n, :) = z2 .* ones(n2, N); % 外部z坐标

%% 生成星体球面数据
t = linspace(0, pi, 25);
p = linspace(0, 2*pi, 25);
[theta, phi] = meshgrid(t, p);
xx = R .* sin(theta) .* sin(phi);
yy = R .* sin(theta) .* cos(phi);
zz = z2(end) + R .* cos(theta);

%% 创建初始图形
figure;
h = surf(x, y, z, 'FaceAlpha', 0.9);           % 嵌入图句柄
hold on;
s = surf(xx, yy, zz, 'LineStyle', 'none', ...  % 星体球面句柄
         'EdgeColor', 'b', 'FaceColor', 'y');
view(-37.5, 30);
axis equal;
title('嵌入图随参数变化的动画');

%% 创建视频文件
vidObj = VideoWriter('star_embedding_animation.avi');  % 建立avi文件
open(vidObj);                                           % 打开文件

%% 第一部分动画：固定半径，改变质量
for i = 1:100
    % 更新质量
    M = 0.001 * i;
    
    % 更新微分方程
    F = @(r, z) (2 * k * r.^2 ./ (1 - 2 * r.^2)).^(1/2);
    FF = @(r, z) (2 * M ./ (r - 2 * M)).^(1/2);
    
    % 重新求解微分方程
    [r1, z1] = ode45(F, [0, R], 0.01);
    [r2, z2] = ode45(FF, [R, 4*R], z1(end));
    
    % 更新嵌入图数据
    n1 = length(r1);
    n2 = length(r2);
    n = n1 + n2;
    
    x = zeros(n, N);
    y = zeros(n, N);
    z = zeros(n, N);
    x(1:n1, :) = r1 .* cos(the);
    x(n1+1:n, :) = r2 .* cos(the);
    y(1:n1, :) = r1 .* sin(the);
    y(n1+1:n, :) = r2 .* sin(the);
    z(1:n1, :) = z1 .* ones(n1, N);
    z(n1+1:n, :) = z2 .* ones(n2, N);
    
    % 更新星体球面z坐标
    zz = z2(end) + R .* cos(theta);
    
    % 更新图形数据
    set(h, 'XData', x, 'YData', y, 'ZData', z);
    set(s, 'XData', xx, 'YData', yy, 'ZData', zz);
    
    % 更新标题
    title(sprintf('嵌入图随质量变化 (M = %.3f, R = %.3f)', M, R));
    
    % 调整视角和坐标轴
    view(-37.5, 10);
    axis([-2, 2, -2, 2, 0, 1.5]);
    
    % 刷新图形
    drawnow;
    
    % 捕捉当前帧并写入视频文件
    currFrame = getframe(gcf);
    writeVideo(vidObj, currFrame);
    
    pause(0.1);
end

%% 第二部分动画：固定质量，改变半径
% 注意：此时M为上一循环结束时的值(M=0.1)
for i = 1:100
    % 更新半径
    R = 0.6 - 0.0035 * i;
    
    % 更新k值
    k = M / R^3;
    
    % 更新微分方程
    F = @(r, z) (2 * k * r.^2 ./ (1 - 2 * r.^2)).^(1/2);
    FF = @(r, z) (2 * M ./ (r - 2 * M)).^(1/2);
    
    % 重新求解微分方程
    [r1, z1] = ode45(F, [0, R], 0.01);
    [r2, z2] = ode45(FF, [R, 4*R], z1(end));
    
    % 更新嵌入图数据
    n1 = length(r1);
    n2 = length(r2);
    n = n1 + n2;
    
    x = zeros(n, N);
    y = zeros(n, N);
    z = zeros(n, N);
    x(1:n1, :) = r1 .* cos(the);
    x(n1+1:n, :) = r2 .* cos(the);
    y(1:n1, :) = r1 .* sin(the);
    y(n1+1:n, :) = r2 .* sin(the);
    z(1:n1, :) = z1 .* ones(n1, N);
    z(n1+1:n, :) = z2 .* ones(n2, N);
    
    % 更新星体球面
    xx = R .* sin(theta) .* sin(phi);
    yy = R .* sin(theta) .* cos(phi);
    zz = z2(end) + R .* cos(theta);
    
    % 更新图形数据
    set(h, 'XData', x, 'YData', y, 'ZData', z);
    set(s, 'XData', xx, 'YData', yy, 'ZData', zz);
    
    % 更新标题
    title(sprintf('嵌入图随半径变化 (M = %.3f, R = %.3f)', M, R));
    
    % 调整视角和坐标轴
    view(-37.5, 10);
    axis([-2, 2, -2, 2, 0, 1.5]);
    
    % 刷新图形
    drawnow;
    
    % 捕捉当前帧并写入视频文件
    currFrame = getframe(gcf);
    writeVideo(vidObj, currFrame);
    
    pause(0.1);
end

%% 关闭视频文件
close(vidObj);

fprintf('动画演示完成！\n');
fprintf('视频已保存为 star_embedding_animation.avi\n');
```

**4. 史瓦西最大延拓时空 T=0 时刻嵌入图**
```matlab
% 说明：制作两个嵌入图在 r=2M 处相接，展示完整时空结构

clear; clc; close all;  % 清除变量、命令窗口和图形窗口

%% 参数设置
M = 0.2;    % 星体质量
R = 0.5;    % 星体半径（R > 2M，不适用于黑洞）
k = M / R^3; % 正比于星体密度的常量

%% 嵌入图微分方程定义
% 星体内部方程：r < R
F = @(r, z) (2 * k * r.^2 ./ (1 - 2 * r.^2)).^(1/2);
% 星体外部方程：r >= R
FF = @(r, z) (2 * M ./ (r - 2 * M)).^(1/2);

%% 求解微分方程
[r1, z1] = ode45(F, [0, R], 0.01);      % 求解内部（星体内）
[r2, z2] = ode45(FF, [R, 4*R], z1(end)); % 求解外部（星体外）

%% 构造下半部分嵌入图
% 获取上半部分数据长度
n1 = length(r2);

% 初始化下半部分数组
r3 = zeros(n1, 1);
z3 = zeros(n1, 1);

% 调整上半部分z坐标，使其从0开始
z2 = z2 - z2(1) .* ones(n1, 1);

% 构造下半部分：翻转上半部分并取负z值
for i = 1:n1
    r3(i) = r2(n1 + 1 - i);  % r值翻转
    z3(i) = -z2(n1 + 1 - i); % z值翻转并取负
end

%% 生成三维嵌入图数据
N = 100;                 % 圆周方向点数
the = linspace(0, 2*pi, N);  % 角度数组

% 合并上下两部分数据
n = 2 * n1;  % 总点数：下半部分 + 上半部分

% 初始化三维坐标数组
X = zeros(n, N);
Y = zeros(n, N);
Z = zeros(n, N);

% 计算下半部分坐标
X(1:n1, :) = r3 .* cos(the);
Y(1:n1, :) = r3 .* sin(the);
Z(1:n1, :) = z3 .* ones(n1, N);

% 计算上半部分坐标
X(n1+1:n, :) = r2 .* cos(the);
Y(n1+1:n, :) = r2 .* sin(the);
Z(n1+1:n, :) = z2 .* ones(n1, N);

%% 绘制嵌入图
figure;
surf(X, Y, Z);
title('施瓦西最大延拓时空 T=0 时刻嵌入图');
xlabel('X'); ylabel('Y'); zlabel('Z');
axis([-2, 2, -2, 2, -1.5, 1.5]);  % 固定坐标轴范围
axis equal;  % 保持坐标轴比例
view(-37.5, 30);  % 设置视角
grid on;
```

---
*注：本站使用vue3框架，详细技术可致信CircleCoder。*

