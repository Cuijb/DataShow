
const transition = {
    // 动态切换过程的持续时长，毫秒
    duration: 600,

    // 动态切换后稳定展示时长，毫秒
    delay: 400
};

const config = {
    // 数据刷新间隔 = 动画切换时长 + 稳定展示时长
    refresh_interval: transition.duration + transition.delay,

    // 数据显示区域的宽度，像素
    width: 1200,

    // 数据显示区域的高度，像素
    height: 700,

    // 数据显示区域四周的空白宽度，像素
    padding: 40,

    // 数据排序：-1，从大到小倒序；0，显示原始顺序；1，从小到大正序
    sorted: -1,

    // 字体大小
    font_size: 18,

    // x轴上期望的刻度数（接近，不一定准确）
    ticks: 10,

    // y轴标签显示位置
    // left: 仅显示在左边
    // right: 仅显示在右边
    // both: left+right
    label_y_position: "both",

    // y轴标签显示占用宽度，字数越多越宽
    // 当 左边显示y轴标签时 生效
    label_y_padding: 100
};