var isMouseDown = false;

$(document).ready(function () {

    $('body').mousedown(function () {
        isMouseDown = true;
    }).mouseup(function () {
            isMouseDown = false;
    });

    var m = [29, 20, 20, 19], // top right bottom left margin
        w = 1240 - m[1] - m[3], // width
        h = 180 - m[0] - m[2], // height
        z = 20; // cell size

    var cycleColours = ["#eee", "#d6e685", "#8cc665", "#44a340", "#1e6823"];
    var day = d3.time.format("%w");

    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    var startDate = new Date(currentDate.getTime() - (365 * 86400 * 1000));
    var endDate = new Date(currentDate.getTime() + (86400 * 1000));
    var startDay = startDate.getDay(),
        diff = startDate.getDate() - startDay + (startDay == 0 ? -6 : 0);
    var startWeek = new Date(startDate);
    startWeek.setDate(diff);

    var svg = d3.select("#graph").selectAll(".year")
        .data([endDate])
        .enter().append("div")
        .attr("class", "year")
        .style("width", w + m[1] + m[3] + "px")
        .style("height", h + m[0] + m[2] + "px")
        .style("display", "inline-block")
        .append("svg:svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .attr("class", "RdYlGn")
        .append("svg:g");

    svg.append("svg:text")
        .attr("transform", "translate(-6," + z * 3.5 + ")rotate(-90)")
        .attr("text-anchor", "middle")
        .text("Draw");

    var highlightSquare = function (d) {
        if (this.currentCycle === undefined) {
            this.currentCycle = 1;
        } else {
            this.currentCycle = (this.currentCycle + 1) % cycleColours.length;
        }

        this.style.fill = cycleColours[this.currentCycle];
    };

    var rect = svg.selectAll("rect.day")
        .data(function (d) {
            return d3.time.day.utc.range(startDate, d);
        })
        .enter().append("svg:rect")
        .attr("class", "day")
        .attr("width", z)
        .attr("height", z)
        .attr("x", function (d) {
            var weekDiff = (d.getTime() - startWeek.getTime()) / (7 * 86400000);
            return Math.floor(weekDiff) * z;
        })
        .attr("y", function (d) {
            return day(d) * z;
        })
        .on("mouseover", function () {
            if (isMouseDown) {
                highlightSquare.apply(this);
            }
        })
        .on("click", highlightSquare);

    $("#create-button").click(function (e) {
        e.preventDefault();

        var commitDates = [];
        svg.selectAll("rect.day").each(function (d) {
            var currentCycle = this.currentCycle;
            if (currentCycle != undefined && currentCycle > 0) {
                commitDates.push((d.getTime() / 1000) + 86400)
            }
        });

        $.post("/create", { dates: JSON.stringify(commitDates) });
    });

});