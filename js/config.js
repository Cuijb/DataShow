
const transition = {
    // 动态切换过程的持续时长，毫秒
    duration: 1000,

    // 动态切换后稳定展示时长，毫秒
    delay: 500
};

const config = {
    // 数据显示区域的宽度，像素
    width: 1600,

    // 数据显示区域的高度，像素
    height: 900,

    // 数据刷新间隔 = 动画切换时长 + 稳定展示时长
    refresh_interval: transition.duration + transition.delay,

    // 数据排序：-1，从大到小倒序；0，显示原始顺序；1，从小到大正序
    sorted: 1,

    // 字体大小
    font_size: 18,

    // x轴上期望的刻度数（接近，不一定准确）
    ticks: 10
};