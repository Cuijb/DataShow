
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

var curDate = "", curDatas = [];
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
        dateLabel.text(curDate);
        showCurDatas(curDatas);
    }, config.refresh_interval);
};

var barH = 1.4 * config.font_size;
var barRx = barH / 2;
var barTextH = barH + (config.font_size - 4) / 2;
const svgP = 60;
var svgW = config.width;
var svgH = config.height;
var svg = d3.select("#svg4Bar").attr("width", svgW).attr("height", svgH);
var svgWInner = svgW - 2 * svgP;
var svgHInner = svgH - 2 * svgP;
const rootG = svg.append("g").attr("transform", `translate(${svgP},${svgP})`);
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

var dateLabel = rootG.append("text")
    .attr("class", "dateLabel")
    .attr("text-anchor", "end")
    .attr("transform", `translate(${svgWInner},${config.sorted < 0 ? svgHInner : svgP})`);

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
    return d3.schemeCategory10[Math.floor(data.type.charCodeAt() % 10)];
};

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
    enterG.append("rect")
        .attr("class", "barRect")
        .attr("x", 0)
        .attr("y", barH / 2)
        .attr("width", 0)
        .attr("height", barH)
        .attr("rx", barRx)
        .attr("fill", dataColor)
        .attr("fill-opacity", 0);
    enterG.append("text")
        .attr("class", "barType")
        .attr("x", 0)
        .attr("y", barTextH)
        .attr("fill", "#FFFFFF")
        .attr("fill-opacity", 0.5)
        .attr("font-size", config.font_size)
        .attr("text-anchor", "end")
        .text(dataLabel);
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
            var round = d3.interpolateRound(this.textContent, data4X(data));
            return function (t) {
                this.textContent = round(t);
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