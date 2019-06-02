
$("#dataFile").change(function () {
    // console.log("data file changed!");
    $("#fileProgress").val(0);
    reader.readAsText(this.files[0], "UTF-8");
});

var dates = [], datasByDate = {};
var readerOnload = function (result) {
    $("#fileProgress").val(100);
    try {
        var datas = d3.csvParse(result);
        if (datas.length <= 0) {
            return;
        }
        $("header").toggle(transition.delay);
        datas.forEach(function (data) {
            if (!dates.includes(data.date)) {
                dates.push(data.date)
                datasByDate[data.date] = [];
            }
            datasByDate[data.date].push(data);
        });
        dates.sort();
        showDatas();
    } catch (error) {
        console.log(error);
    }
};

var curDate = "", curDatas = [], curColors = { "num": 0 };
var showDatas = function () {
    var refreshInterval = setInterval(function () {
        if (!dates.length) {
            clearInterval(refreshInterval);
            $("header").toggle(transition.delay);
            return;
        }
        curDate = dates.shift();
        curDatas = datasByDate[curDate];
        curDatas.sort(function (d1, d2) {
            return config.sorted * (Number(d1.value) - Number(d2.value));
        });
        var showedDatas = curDatas.slice(0, d3.max([5, config.limit_num]));
        showedDatas.forEach(function (data) {
            if (!!!curColors[data.type]) {
                var color = colors[curColors.num % colors.length];
                curColors.num++;
                curColors[data.type] = color;
            }
        });

        dateLabel.text(curDate);
        showCurDatas(showedDatas);
    }, config.refresh_interval);
};

var showLeftLabel = function () {
    return "both" == config.label_y_position || "left" == config.label_y_position;
};

var showRightLabel = function () {
    return "both" == config.label_y_position || "right" == config.label_y_position;
};

var data4X = function (data) {
    return Number(data.value);
};

var data4Y = function (data) {
    return data.type;
};

var scale4X = function (data) {
    return xScale(data4X(data));
}

var scale4Y = function (data) {
    return yScale(data4Y(data));
};

var dataLabel = function (data) {
    return data.type;
};

var dataColor = function (data) {
    return curColors[data.type];
};

var barH = 1.4 * config.font_size;
var barRx = barH / 2;
var barTextH = barH + (config.font_size - 4) / 2;
var svg_left_padding = showLeftLabel() ? padding.label_left : padding.left;
var svgW = config.width;
var svgH = config.height;
var svg = d3.select("#svg4Bar").attr("width", svgW).attr("height", svgH);
var svgWInner = svgW - svg_left_padding - padding.right;
var svgHInner = svgH - padding.top - padding.bottom;
var rootG = svg.append("g").attr("transform", `translate(${svg_left_padding},${padding.top})`);
var xAxisG = rootG.append("g").attr("class", "xAxis4Bar").attr("transform", `translate(0,${svgHInner})`);
var yAxisG = rootG.append("g").attr("class", "yAxis4Bar").attr("fill-opacity", 0);
var xScale = d3.scaleLinear().range([0, svgWInner]);
var yScale = d3.scaleBand().range([svgHInner, 0]);
var xAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(config.ticks)
    .tickPadding(10)
    .tickSizeInner(-svgHInner)
    .tickSizeOuter(0)
    .tickFormat(function (value) {
        return value < 0 ? "" : value;
    });
var yAxis = d3.axisLeft().scale(yScale);

var captionLabel = svg.append("text")
    .attr("x", svgW / 2)
    .attr("y", padding.top / 2)
    .attr("width", svgW)
    .attr("height", padding.top)
    .attr("fill", caption.fill)
    .attr("font-size", caption.font_size)
    .attr("text-anchor", "middle")
    .text(caption.title);

var dateLabel = rootG.append("text")
    .attr("fill", dateConfig.fill)
    .attr("font-size", dateConfig.font_size)
    .attr("text-anchor", "end")
    .attr("transform", `translate(${svgWInner},${config.sorted < 0 ? svgHInner : padding.top})`);

var showCurDatas = function (datas) {
    var minX = d3.min(datas, data4X);
    var maxX = d3.max(datas, data4X);
    var domainStart = minX >= 0 ? 0 : (minX + 1 / config.ticks * minX);
    var domainEnd = maxX + (maxX - minX) * (1 / config.ticks / 2);

    if ((minX - domainStart) <= ((config.ticks - 1) / config.ticks) * (maxX - domainStart)) {
        xScale.domain([domainStart, domainEnd]);
    } else {
        xScale.domain([minX - (maxX - minX), domainEnd]);
    }
    yScale.domain(datas.map(function (data) {
        return data.type;
    }).reverse());
    xAxisG.transition().ease(d3.easeLinear).duration(transition.duration).call(xAxis);
    yAxisG.transition().ease(d3.easeLinear).duration(transition.duration).call(yAxis);

    var bars = rootG.selectAll(".barGroup")
        .data(datas, function (data) {
            return data.type;
        });
    dataExistRefresh(bars);
    dataEnterInit(bars.enter());
    dataExitRemove(bars.exit());
};

var dataEnterInit = function (enters) {
    var enterG = enters
        .append("g")
        .attr("class", "barGroup")
        .attr("transform", `translate(0, ${svgH})`);
    if (showLeftLabel()) {
        enterG.append("text")
            .attr("x", -8)
            .attr("y", barTextH)
            .attr("fill", dataColor)
            .attr("fill-opacity", 1)
            .attr("font-size", config.font_size - 2)
            .attr("text-anchor", "end")
            .text(dataLabel);
    }
    enterG.append("rect")
        .attr("class", "barRect")
        .attr("x", 0)
        .attr("y", barH / 2)
        .attr("width", 0)
        .attr("height", barH)
        .attr("rx", barRx)
        .attr("fill", dataColor)
        .attr("fill-opacity", 0);
    if (showRightLabel()) {
        enterG.append("text")
            .attr("class", "barType")
            .attr("x", 0)
            .attr("y", barTextH)
            .attr("fill", "#FFFFFF")
            .attr("fill-opacity", 0.5)
            .attr("font-size", config.font_size)
            .attr("text-anchor", "end")
            .text(dataLabel);
    }
    enterG.append("text")
        .attr("class", "barValue")
        .attr("x", 0)
        .attr("y", barTextH)
        .attr("fill", dataColor)
        .attr("fill-opacity", 0.5)
        .attr("font-size", config.font_size)
        .attr("text-anchor", "start")
        .text(0);
    dataExistRefresh(enterG);
};

var dataExistRefresh = function (exits) {
    // 条形柱长度、位置更新
    var refreshTransition = exits.transition()
        .ease(d3.easeLinear)
        .duration(transition.duration);
    refreshTransition.attr("transform", function (data) {
        return `translate(0, ${scale4Y(data)})`;
    });
    refreshTransition.select("rect.barRect")
        .attr("width", scale4X)
        .attr("fill-opacity", 1);
    refreshTransition.select("text.barType")
        .attr("x", function (data) {
            return scale4X(data) - 10;
        })
        .attr("fill-opacity", 1);
    refreshTransition.select("text.barValue")
        .attr("x", function (data) {
            return scale4X(data) + 10;
        })
        .attr("fill-opacity", 1)
        .tween("text", function (data) {
            var from = Number(this.textContent);
            var to = data4X(data);
            var round = parseInt(to) == to ? d3.interpolateRound(from, to) : d3.interpolateNumber(from, to);
            return function (t) {
                this.textContent = d3.format(".1~f")(round(t));
            };
        });
};

var dataExitRemove = function (exits) {
    var exitTransition = exits.transition()
        .ease(d3.easeLinear)
        .duration(transition.duration);
    exitTransition.attr("transform", `translate(0,${svgH})`)
        .attr("fill-opacity", 0);
    exitTransition.select("rect.barRect")
        .attr("width", 0)
        .attr("fill-opacity", 0);
    exitTransition.select("text.barType")
        .attr("x", 0)
        .attr("fill-opacity", 0);
    exitTransition.select("text.barValue")
        .attr("x", 0)
        .attr("fill-opacity", 0);
    exitTransition.remove();
};