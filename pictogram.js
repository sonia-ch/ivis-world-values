// Pictogram
//placeholder div for jquery slider
//d3.select("#Pictogram").append("div").attr("id", "sliderDiv");

// Get the color for each category
function getColor(category) {
    categs = ["Very important", "Rather important", "Not very important", "Not at all important", "Others"];
    categs_happy = ["Very happy", "Quite happy", "Not very happy", "Not at all happy", "Others"];
    var colors = ['#69c242', '#64bbe3', '#ffcc00', '#cf2030', '#ff7300'];
    var colors = [d3.interpolateRdYlGn(1), d3.interpolateRdYlGn(0.66), d3.interpolateRdYlGn(0.33), d3.interpolateRdYlGn(0), "#999999"];
    //categs.indexOf(category);
    if (categs_happy.indexOf(category) != -1) {
        return colors[categs_happy.indexOf(category)];
    }
    return colors[categs.indexOf(category)];
}

function drawPic(dataset) {

    var svgDoc = d3.select("#Pictogram").selectAll("svg").remove();

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

    var counts = [];
    var tempCounts = [];

    for (j = 0; j < uniqueGroups.length; j++) {
        for (i = 0; i < l; i++) {
            if (dataset[i].group == uniqueGroups[j]) {
                tempCounts.push(dataset[i].count);
                counts[j] = tempCounts;
            }
        }
        tempCounts = [];
    }
    //console.log(counts);
    //console.log(uniqueGroups);
    var pos = [[0, 0], [0, 0], [0, 0]];

    for (k = 0; k < uniqueGroups.length; k++) {
        drawOnePic(counts[k], uniqueCategories, uniqueGroups, pos[k], k);
    }

    addLegend(uniqueCategories);
}

function drawOnePic(counts, uniqueCategories, uniqueGroups, pos, ind) {
    //create svg element
    var svgDoc = d3.select("#Pictogram")
        .append("svg")
        .attr("viewBox", "0 0 50 50")
        .attr("class", "svgPic")
        .attr("transform", "translate(" + pos + ")");

    //define an icon store it in svg <defs> elements as a reusable component - this geometry can be generated from Inkscape, Illustrator or similar
    svgDoc.append("defs")
        .append("g")
        .attr("id", "iconCustom" + ind)
        .append("path")
        .attr("d", "M3.5,2H2.7C3,1.8,3.3,1.5,3.3,1.1c0-0.6-0.4-1-1-1c-0.6,0-1,0.4-1,1c0,0.4,0.2,0.7,0.6,0.9H1.1C0.7,2,0.4,2.3,0.4,2.6v1.9c0,0.3,0.3,0.6,0.6,0.6h0.2c0,0,0,0.1,0,0.1v1.9c0,0.3,0.2,0.6,0.3,0.6h1.3c0.2,0,0.3-0.3,0.3-0.6V5.3c0,0,0-0.1,0-0.1h0.2c0.3,0,0.6-0.3,0.6-0.6V2.6C4.1,2.3,3.8,2,3.5,2z")
        .attr("transform", "scale(0.75)");


    //background rectangle
    svgDoc.append("rect").attr("width", 50).attr("height", 50);

    //specify the number of columns and rows for pictogram layout
    var numCols = 10;
    var numRows = 5;

    //padding for the grid
    var xPadding = 5;
    var yPadding = 8;

    //horizontal and vertical spacing between the icons
    var hBuffer = 8;
    var wBuffer = 4;

    //Array with the count of each category


    //generate a d3 range for the total number of required elements
    var myIndex = [];
    var sum_counts = [];
    counts.reduce(function (a, b, i) { return sum_counts[i] = a + b; }, 0);
    //console.log(sum_counts);
    var cat = [];
    var value = [];

    for (i = 0; i < (numCols * numRows); i++) {
        cat[i] = uniqueCategories[0];
        value[i] = counts[0];
        for (j = 0; j < uniqueCategories.length; j++) {
            if (i >= sum_counts[j]) {
                cat[i] = uniqueCategories[j+1];
                value[i] = counts[j+1];
            }
        }

        myIndex.push({ index: i, category: cat[i], count: value[i] });
    }
    //console.log(myIndex);

    //text element to display number of icons highlighted
    svgDoc.append("text")
        .attr("id", "txtValue" + ind)
        .attr("x", xPadding)
        .attr("y", yPadding)
        .attr("dy", -3)
        .text(uniqueGroups[ind])
        .attr("font-size","8pt");

    //create group element and create an svg <use> element for each icon
    svgDoc.append("g")
        .attr("id", "pictoLayer" + ind)
        .selectAll("use")
        .data(myIndex)
        .enter()
        .append("use")
        .attr("xlink:href", "#iconCustom" + ind)
        .attr("class","pics")
        .attr("id", function (d) {
            return "icon" + d.index + "_" + ind;
        })
        .attr("x", function (d) {
            var remainder = d.index % numCols;//calculates the x position (column number) using modulus
            return xPadding + (remainder * wBuffer);//apply the buffer and return value
        })
        .attr("y", function (d) {
            var whole = Math.floor(d.index / numCols)//calculates the y position (row number)
            return yPadding + (whole * hBuffer);//apply the buffer and return the value
        })
        //.classed("iconPlain", true)
        .style("fill", function (d) { return getColor(d.category); });


//create a jquery slider to control the pictogram         
//$("#sliderDiv").slider({
//    orientation: "horizontal",
//    min: 0,
//    max: numCols * numRows,
//    value: 0,
//    slide: function (event, ui) {
//        d3.select("#txtValue").text(ui.value);
//        d3.selectAll("use").attr("class", function (d, i) {
//            if (d < ui.value) {
//                return "iconSelected";
//            } else {
//                return "iconPlain";
//            }
//        });
//    }
//});

    var tooltip = d3.select("body")
        .append('div')
        .attr('class', 'tooltip');
    tooltip.append('div')
        .attr('class', 'count');

    svgDoc.selectAll(".pics")
        .on('mouseover', function (d, i) {
            //console.log(d);
            //tooltip.select('.group').html("<b>Group: " + d.group + "</b>");
            //tooltip.select('.category').html("<b>Category: " + d.category + "</b>");
            tooltip.select('.count').html("<b>" + d.category + ": " + d.count * 2 + " %</b > ");

            tooltip.style('display', 'block');
            tooltip.style('opacity', 2);

        })
        .on('mousemove', function (d) {
            tooltip.style('top', (d3.event.pageY + 10) + 'px')
                .style('left', (d3.event.pageX - 25) + 'px');
        })
        .on('mouseout', function () {
            tooltip.style('display', 'none');
            tooltip.style('opacity', 0);
        });
}

function addLegend(uniqueCategories) {
    //Remove previous legend
    d3.select("#Legend").selectAll("svg").remove();

    // add legend
    var dotRadius = 5;

    var legend = d3.select("#Legend").append("svg")
        .selectAll(".legend")
        .data(uniqueCategories)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + 0 + "," + dotRadius * 4 + ")"); //(margin.top + dotRadius)

    legend
        .append("circle")
        //.attr("cx", width + dotRadius * 4)
        .attr("cx", dotRadius * 4)

        .attr("cy", function (d, i) { return i * dotRadius * 4; })
        .attr("r", dotRadius)
        .style("fill", function (d) { return getColor(d); })

    legend
        .append("text")
        .attr("x", dotRadius * 4 + dotRadius * 3)
        .attr("text-anchor", 'start')
        .attr("y", function (d, i) { return i * dotRadius * 4 + dotRadius; })
        .style("font-size", dotRadius * 2.5 + "px")
        .text(function (d) { return d });
}