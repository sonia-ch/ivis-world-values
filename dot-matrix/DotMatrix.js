function DotMatrixChart(dataset, options) {

    var dotRadius = options.dot_radius;
    var noOfCirclesInARow = options.no_of_circles_in_a_row;
    var dotPaddingLeft = options.dot_padding_left;
    var dotPaddingRight = options.dot_padding_right;
    var dotPaddingTop = options.dot_padding_top;
    var dotPaddingBottom = options.dot_padding_bottom;

    if (isNaN(dotRadius)) {
        throw new Error("dot_radius must be a Number");
    }
    if (isNaN(noOfCirclesInARow)) {
        throw new Error("no_of_circles_in_a_row must be a Number");
    }
    if (isNaN(dotPaddingLeft)) {
        throw new Error("dot_padding_left must be a Number");
    }
    if (isNaN(dotPaddingRight)) {
        throw new Error("dot_padding_right must be a Number");
    }
    if (isNaN(dotPaddingTop)) {
        throw new Error("dot_padding_top must be a Number");
    }
    if (isNaN(dotPaddingBottom)) {
        throw new Error("dot_padding_bottom must be a Number");
    }

    
    var flags = [], uniqueCategories = [], uniqueGroups = [], l = dataset.length, i;
    for (i = 0; i < l; i++) {
        if (flags[dataset[i].category]) continue;
        flags[dataset[i].category] = true;
        uniqueCategories.push(dataset[i].category);
    }
    flags = [];
    for (i = 0; i < l; i++) {
        if (flags[dataset[i].group]) continue;
        flags[dataset[i].group] = true;
        uniqueGroups.push(dataset[i].group);
    }

    var sumOfEveryGroup = {}; // This must be 50 per group
    for (var i = 0; i < dataset.length; i++) {
        if (sumOfEveryGroup[dataset[i]['group']] == null) {
            sumOfEveryGroup[dataset[i]['group']] = 0;
        }
        sumOfEveryGroup[dataset[i]['group']] += dataset[i]['count'];
    }

    var maxNoOfLinesInGroup = 0; //Should be 5
    for (var group in sumOfEveryGroup) {
        if (sumOfEveryGroup[group] / noOfCirclesInARow > maxNoOfLinesInGroup) {
            maxNoOfLinesInGroup = Math.ceil(sumOfEveryGroup[group] / noOfCirclesInARow);
        }
    }

    var numberOfLines = maxNoOfLinesInGroup * uniqueGroups.length;
    //console.log("Number of lines: ", numberOfLines);

    var groupScale = d3.scalePoint().domain(uniqueGroups).range([0, uniqueGroups.length - 1]);
    var categoryScale = d3.scalePoint().domain(uniqueCategories).range([0, uniqueCategories.length]);

    //var colors = ['#69c242', '#64bbe3', '#ffcc00', '#ff7300', '#cf2030'];
    //var color = d3.scaleOrdinal(d3.schemeCategory20)
    //var color = d3.scaleOrdinal().range(colors);

    function getColor(category) {
        categs = ["Very important", "Rather important", "Not very important", "Not at all important", "Others"];
        categs_happy= ["Very happy", "Quite happy", "Not very happy", "Not at all happy", "Others"];
        var colors = ['#69c242', '#64bbe3', '#ffcc00', '#cf2030', '#ff7300'];
        var colors = [d3.interpolateRdYlGn(1), d3.interpolateRdYlGn(0.66), d3.interpolateRdYlGn(0.33), d3.interpolateRdYlGn(0), "#999999"];
        //categs.indexOf(category);
        if (categs_happy.indexOf(category) != -1) {
            return colors[categs_happy.indexOf(category)];
        }
        return colors[categs.indexOf(category)];
    }

    // Set the dimensions of the canvas / graph
    var margin = { top: dotRadius * 10, right: dotRadius * 15, bottom: dotRadius * 10, left: dotRadius * 15 };

    height = numberOfLines * (dotRadius * 2 + dotPaddingBottom + dotPaddingTop);
    width = (dotRadius * 2 + dotPaddingLeft + dotPaddingRight) * noOfCirclesInARow;

    // Set the ranges
    var xScale = d3.scaleLinear().range([margin.left, width]);
    var yScale = d3.scaleLinear().range([height, margin.bottom]);

    var xAxis = d3.axisBottom(xScale);

    var yAxis = d3.axisLeft(yScale)
        .tickFormat(function (d) {
            return uniqueGroups[d];
        })
        .ticks(uniqueGroups.length)
        .tickSize(-width + margin.left - (dotRadius * 2), 0, 0)


    xScale.domain([0, noOfCirclesInARow]);
    yScale.domain([0, d3.max(dataset, function (d) { return groupScale(d.group) + 1; })]);

    //Create SVG element
    var svg = d3.select("#DotMatrixChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right + 50)
        .attr("height", height + margin.top + margin.bottom);
        //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Create Y axis
    svg.append("g")
        .attr("transform", "translate(" + (margin.left - (dotRadius * 2)) + ",0)")
        .attr("class", "y axis")
        .call(yAxis)
        .selectAll("text")
        .attr("y", -dotRadius * 5)
        .attr("x", 0)
        .attr("dy", ".35em")
        .style("font-size", dotRadius * 3 + "px")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "start");

    //Create Y axis
    svg
        .append("line")
        .attr("x1", width)
        .attr("y1", margin.top)
        .attr("x2", width)
        .attr("y2", height)
        .style("stroke", "black")
        .style("stroke-width", 1)

    var globalLineNoForGroup = {};
    var globalLineSizeForGroup = {};
    var globalDotXPosition = {};
    function generate_array(d) {

        if (globalLineSizeForGroup[d.group] == null) {
            globalLineSizeForGroup[d.group] = 0;
        }
        if (globalLineNoForGroup[d.group] == null) {
            globalLineNoForGroup[d.group] = 0.5 / (maxNoOfLinesInGroup);
        }
        if (globalDotXPosition[d.group] == null) {
            globalDotXPosition[d.group] = 0;
        }

        var arr = new Array(d.count);
        for (var i = 0; i < d.count; i++) {

            if (globalLineSizeForGroup[d.group] != 0 && globalLineSizeForGroup[d.group] % noOfCirclesInARow == 0) {
                globalLineNoForGroup[d.group] += 1 / (maxNoOfLinesInGroup);
                globalDotXPosition[d.group] = 1;
            } else {
                globalDotXPosition[d.group] += 1;
            }

            arr[i] = { y: groupScale(d.group) + globalLineNoForGroup[d.group], x: globalDotXPosition[d.group] - 1, group: d.group, category: d.category, count: d.count };
            globalLineSizeForGroup[d.group] += 1;
        }
        //console.log("Arr", arr);
        return arr;
    }

    var groups = svg
        .selectAll("g.group")
        .data(dataset)
        .enter()
        .append('g')
        .attr("class", "group");

    var circleArray = groups.selectAll("g.circleArray")
        .data(function (d) { return generate_array(d); });

    circleArray.enter()
        .append('g')
        .attr("class", "circleArray")
        .append("circle")
        .style("fill", function (d) { return getColor(d.category); })
        .attr("r", dotRadius)
        .attr("cx", function (d, i) { return xScale(d.x); })
        .attr("cy", function (d, i) { return yScale(d.y); });

    // add legend
    var legend = svg
        .selectAll(".legend")
        .data(uniqueCategories)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + 0 + "," + (margin.top + dotRadius) + ")");

    legend
        .append("circle")
        .attr("cx", width + dotRadius * 4)
        .attr("cy", function (d, i) { return i * dotRadius * 4; })
        .attr("r", dotRadius)
        .style("fill", function (d) {return getColor(d);})

    legend
        .append("text")
        .attr("x", width + dotRadius * 4 + dotRadius * 3)
        .attr("text-anchor", 'start')
        .attr("y", function (d, i) { return i * dotRadius * 4 + dotRadius; })
        .style("font-size", dotRadius * 3 + "px")
        .text(function (d) { return d });


    var tooltip = d3.select("body")
        .append('div')
        .attr('class', 'tooltip');

    tooltip.append('div')
        .attr('class', 'group');
    tooltip.append('div')
        .attr('class', 'category');
    tooltip.append('div')
        .attr('class', 'count');

    svg.selectAll(".circleArray > circle")
        .on('mouseover', function (d, i) {
            //console.log(d);
            //tooltip.select('.group').html("<b>Group: " + d.group + "</b>");
            //tooltip.select('.category').html("<b>Category: " + d.category + "</b>");
            tooltip.select('.count').html("<b>Percentage: " + d.count*2 + "%</b>");

            tooltip.style('display', 'block');
            tooltip.style('opacity', 2);

        })
        .on('mousemove', function (d) {
            tooltip.style('top', (d3.event.layerY + 10) + 'px')
                .style('left', (d3.event.layerX - 25) + 'px');
        })
        .on('mouseout', function () {
            tooltip.style('display', 'none');
            tooltip.style('opacity', 0);
        });
}
