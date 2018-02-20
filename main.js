// JavaScript source code
var wave = 6;
var data_w6;
var data_w6_avg = [];
var coef = [2, 1, -1, -2];
var country = [];
//var country = ["Algeria", "Azerbaijan", "Argentina"];
var sortOrd = 1;
var sortBy = "Happiness";
var lastButton = "Happiness";
var gapVar = 0;
var gapButton = [];
var urlGit = "/ivis-world-values";


function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Show the default tab, and add an "active" class to the button of that tab
document.getElementById("Visualization").style.display = "block";
document.getElementById("vis-button").className += " active";


// Map visualization

// DEFINE VARIABLES
// Define size of map group
// Full world map is 2:1 ratio
// Using 12:5 because we will crop top and bottom of map
w = 2000;
h = 900;
// variables for catching min and max zoom factors
var minZoom;
var maxZoom;

// DEFINE FUNCTIONS/OBJECTS
// Define map projection
var projection = d3
    .geoEquirectangular()
    .center([0, 15]) // set centre to further North as we are cropping more off bottom of map
    .scale([w / (2 * Math.PI)]) // scale to fit group width
    .translate([w / 2, h / 2]) // ensure centred in group
    ;

// Define map path
var path = d3
    .geoPath()
    .projection(projection)
    ;

// Create function to apply zoom to countriesGroup
function zoomed() {
    t = d3
        .event
        .transform
        ;
    countriesGroup
        .attr("transform", "translate(" + [t.x, t.y] + ")scale(" + t.k + ")")
        ;
}

// Define map zoom behaviour
var zoom = d3.zoom().on("zoom", zoomed);

function getTextBox(selection) {
    selection
        .each(function (d) {
            d.bbox = this
                .getBBox();
        })
        ;
}

// Function that calculates zoom/pan limits and sets zoom to default value 
function initiateZoom() {
    // Define a "minzoom" whereby the "Countries" is as small possible without leaving white space at top/bottom or sides
    minZoom = Math.max($("#map-holder").width() / w, $("#map-holder").height() / h);
    // set max zoom to a suitable factor of this value
    maxZoom = 20 * minZoom;
    // set extent of zoom to chosen values
    // set translate extent so that panning can't cause map to move out of viewport
    zoom
        .scaleExtent([minZoom, maxZoom])
        .translateExtent([[0, 0], [w, h]])
        ;
    // define X and Y offset for centre of map to be shown in centre of holder
    midX = ($("#map-holder").width() - minZoom * w) / 2;
    midY = ($("#map-holder").height() - minZoom * h) / 2;
    // change zoom transform to min zoom and centre offsets
    svg.call(zoom.transform, d3.zoomIdentity.translate(midX, midY).scale(minZoom));
}

// zoom to show a bounding box, with optional additional padding as percentage of box size
function boxZoom(box, centroid, paddingPerc) {
    minXY = box[0];
    maxXY = box[1];
    // find size of map area defined
    zoomWidth = Math.abs(minXY[0] - maxXY[0]);
    zoomHeight = Math.abs(minXY[1] - maxXY[1]);
    // find midpoint of map area defined
    zoomMidX = centroid[0];
    zoomMidY = centroid[1];
    // increase map area to include padding
    zoomWidth = zoomWidth * (1 + paddingPerc / 100);
    zoomHeight = zoomHeight * (1 + paddingPerc / 100);
    // find scale required for area to fill svg
    maxXscale = $("svg").width() / zoomWidth;
    maxYscale = $("svg").height() / zoomHeight;
    zoomScale = Math.min(maxXscale, maxYscale);
    // handle some edge cases
    // limit to max zoom (handles tiny countries)
    zoomScale = Math.min(zoomScale, maxZoom);
    // limit to min zoom (handles large countries and countries that span the date line)
    zoomScale = Math.max(zoomScale, minZoom);
    // Find screen pixel equivalent once scaled
    offsetX = zoomScale * zoomMidX;
    offsetY = zoomScale * zoomMidY;
    // Find offset to centre, making sure no gap at left or top of holder
    dleft = Math.min(0, $("svg").width() / 2 - offsetX);
    dtop = Math.min(0, $("svg").height() / 2 - offsetY);
    // Make sure no gap at bottom or right of holder
    dleft = Math.max($("svg").width() - w * zoomScale, dleft);
    dtop = Math.max($("svg").height() - h * zoomScale, dtop);
    // set zoom
    svg
        .transition()
        .duration(500)
        .call(
        zoom.transform,
        d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale)
        );
}

// on window resize
$(window).resize(function () {
    // Resize SVG
    svg
        .attr("width", $("#map-holder").width())
        .attr("height", $("#map-holder").height())
        ;
    initiateZoom();
});

// create an SVG
var svg = d3
    .select("#map-holder")
    .append("svg")
    // set to the same size as the "map-holder" div
    .attr("width", $("#map-holder").width())
    .attr("height", $("#map-holder").height())
    // add zoom functionality
    .call(zoom)
    ;

function drawLegend() {
    var w = 500, h = 70;

    var key = d3.select("#legend1")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    var legend = key.append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

    legend.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d3.interpolateRdYlGn(0))
        .attr("stop-opacity", 1);

    legend.append("stop")
        .attr("offset", "25%")
        .attr("stop-color", d3.interpolateRdYlGn(0.25))
        .attr("stop-opacity", 1);

    legend.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", d3.interpolateRdYlGn(0.50))
        .attr("stop-opacity", 1);

    legend.append("stop")
        .attr("offset", "75%")
        .attr("stop-color", d3.interpolateRdYlGn(0.75))
        .attr("stop-opacity", 1);

    legend.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d3.interpolateRdYlGn(1))
        .attr("stop-opacity", 1);

    key.append("rect")
        .attr("width", w-200)
        .attr("height", h - 50)
        .style("fill", "url(#gradient)")
        .attr("transform", "translate(100,30)");

    //Append title
    key.append("g")
        .append("text")
        .attr("class", "legendTitle")
        .attr("x", 100)
        .attr("y", 65)
        .style("font-size", "10pt")
        .style("text-anchor", "middle")
        .text("Not important");

    key.append("g")
        .append("text")
        .attr("class", "legendTitle")
        .attr("x", 400)
        .attr("y", 65)
        .style("font-size", "10pt")
        .style("text-anchor", "middle")
        .text("Very important");

    //var y = d3.scaleLinear()
    //    .range([300, 0])
    //    .domain([68, 12]);

    //var yAxis = d3.axisBottom()
    //    .scale(y)
    //    .ticks(5);

    //key.append("g")
    //    .attr("class", "y axis")
    //    .attr("transform", "translate(0,50)")
    //    .call(yAxis)
    //    .append("text")
    //    .attr("transform", "rotate(-90)")
    //    .attr("y", 0)
    //    .attr("dy", ".71em")
    //    .style("text-anchor", "end")
    //    .text("axis title");

}
drawLegend();

// get map data
function UpdateMap(data_avg, min, max, gdp) {
    //console.log("Update map: ", data_avg[0].country);
    setTimeout(function () {
        //console.log("Update map: ", data_avg.length);
        d3.json(
            urlGit + "/data/custom.geo.json",
            function (json) {
                // Loop through each state data value in the .csv file
                for (var i = 0; i < data_avg.length; i++) {                
                    // Grab State Name                
                    var dataCountry = data_avg[i].country
                    //console.log(dataCountry);
                    // Grab data value 
                    var dataValue = data_avg[i].value;
                    //console.log("Value: ", dataValue);
                    // Find the corresponding state inside the GeoJSON
                    for (var j = 0; j < json.features.length; j++) {
                        var jsonCountry = json.features[j].properties.name;

                        if (dataCountry == jsonCountry) {
                            //console.log("json Country: ", jsonCountry);
                            // Copy the data value into the JSON
                            json.features[j].properties.value = dataValue;
                        }
                    }
                }

                var tooltip = d3.select("body")
                    .append('div')
                    .attr('class', 'tooltip');
                tooltip.append('div')
                    .attr('class', 'count');

                //Bind data and create one path per GeoJSON feature
                countriesGroup = svg.append("g").attr("id", "map");
                // add a background rectangle
                countriesGroup
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", w)
                    .attr("height", h);

                // draw a path for each feature/country
                countries = countriesGroup
                    .selectAll("path")
                    .data(json.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("id", function (d, i) {
                        return "country" + d.properties.iso_a3;
                    })
                    .attr("class", "country")
                    //      .attr("stroke-width", 10)
                    //      .attr("stroke", "#ff0000")
                    // add a mouseover action to show name label for feature/country
                    .on("mouseover", function (d, i) {
                        var value = d.properties.value;
                        if (value) {
                            d3.select(this).classed("country-on", true);

                            if (min == -200) {
                                tooltip.select('.count').html("<b>" + d.properties.name + ": " + Math.round((value - min) / (max - min) * 100) + "</b>");
                            } else {
                                tooltip.select('.count').html("<b>" + d.properties.name + ": " + value + "</b>");
                            }

                            tooltip.style('display', 'block');
                            tooltip.style('opacity', 2);
                        }                    
                    })
                    .on('mousemove', function (d) {
                        tooltip.style('top', (d3.event.layerY + 10) + 'px')
                            .style('left', (d3.event.layerX - 25) + 'px');
                    })
                    .on("mouseout", function (d, i) {
                        d3.select(this).classed("country-on", false);
                        tooltip.style('display', 'none');
                        tooltip.style('opacity', 0);
                    })
                    // add an onclick action to zoom into clicked country
                    .on("click", function (d, i) {
                        var value = d.properties.value;
                        if (value) {
                            d3.selectAll(".country").classed("country-on", false);
                            d3.select(this).classed("country-on", true);
                            addCountry(d.properties.name);
                            //console.log("Name: ", d.properties.name);
                            //boxZoom(path.bounds(d), path.centroid(d), 20);
                        }
                    
                    })
                    .style("fill", function (d) {
                        // Get data value
                        var value = d.properties.value;
                        if (value) {
                            //If value exists
                            var newMin = min;
                            var newMax = max;
                            if (gdp == 1) {
                                //Logarithmic scale
                                newMin = Math.log10(min);
                                newMax = Math.log10(max);
                                value = Math.log10(value);
                            }
                            var t = (value - newMin) / (newMax-newMin);
                            return d3.interpolateRdYlGn(t);
                        } else {
                            //If value is undefined
                            return "rgb(204,221,255)";
                        }
                    });
                // Add a label group to each feature/country. This will contain the country name and a background rectangle
                // Use CSS to have class "countryLabel" initially hidden
                countryLabels = countriesGroup
                    .selectAll("g")
                    .data(json.features)
                    .enter()
                    .append("g")
                    .attr("class", "countryLabel")
                    .attr("id", function (d) {
                        return "countryLabel" + d.properties.iso_a3;
                    })
                    .attr("transform", function (d) {
                        return (
                            "translate(" + path.centroid(d)[0] + "," + path.centroid(d)[1] + ")"
                        );
                    })
                    // add mouseover functionality to the label
                    .on("mouseover", function (d, i) {
                        d3.select(this).style("display", "block");
                    })
                    .on("mouseout", function (d, i) {
                        d3.select(this).style("display", "none");
                    })
                    // add an onlcick action to zoom into clicked country
                    .on("click", function (d, i) {
                        d3.selectAll(".country").classed("country-on", false);
                        d3.select("#country" + d.properties.iso_a3).classed("country-on", true);
                        //boxZoom(path.bounds(d), path.centroid(d), 20);
                    });
                // add the text to the label group showing country name
                countryLabels
                    .append("text")
                    .attr("class", "countryName")
                    .style("text-anchor", "middle")
                    .attr("dx", 0)
                    .attr("dy", 0)
                    .text(function (d) {
                        return d.properties.name;
                    })
                    .call(getTextBox);
                // add a background rectangle the same size as the text
                countryLabels
                    .insert("rect", "text")
                    .attr("class", "countryLabelBg")
                    .attr("transform", function (d) {
                        return "translate(" + (d.bbox.x - 2) + "," + d.bbox.y + ")";
                    })
                    .attr("width", function (d) {
                        return d.bbox.width + 4;
                    })
                    .attr("height", function (d) {
                        return d.bbox.height;
                    });
                initiateZoom();
            }
        );
    }, 500);
}

function getAvgData(buttonID, wave) {
    var data_avg = [];
    var coef = [2, 1, -1, -2];
    var avg = [];
    
    d3.csv(urlGit + "/data/w" + wave + "/" + buttonID + ".csv", function (data) {
        var all_countries = Object.keys(data[0]);
        avg.length = all_countries.length - 2;
        avg.fill(0);
        data.forEach(function (d, i) {
            if (i < 4) {
                for (j = 2; j < all_countries.length; j++) {
                    avg[j - 2] += coef[i] * +d[all_countries[j]];
                    if (i == 3) {
                        data_avg.push({ country: all_countries[j], value: avg[j - 2] });
                    }
                }
            }
        });
        //console.log("getAvg csv: ", data_avg);
        //return data_avg;
    });
    //console.log("getAvg: ", data_avg);

    return data_avg;
}

function getAvgDataGap(buttonID, wave) {
    gapButton = buttonID;
    console.log("gap button: ", gapButton);
    gapVar = 1;
    var gap_data = [];
    var waves = [1994, 1998, 2004, 2009, 2014];
    var year = waves[wave - 2];
    var min = [];
    var max = [];
    var val = [];

    d3.csv(urlGit + "/data/gap/" + buttonID + ".csv", function (data) {
        var all_countries = Object.keys(data[0]);
        data.forEach(function (d, i) {
            if (d[buttonID] == year.toString()) {
                for (j = 1; j < all_countries.length; j++) {
                    if (d[all_countries[j]] != "" && isNaN(+d[all_countries[j]]) != true) {
                        gap_data.push({ country: all_countries[j], value: +d[all_countries[j]] });
                        val.push(+d[all_countries[j]]);
                        if (isNaN(+d[all_countries[j]])) {
                            console.log(all_countries[j]);
                        }
                        
                    }
                } 
                min = Math.min.apply(null,val);
                max = Math.max.apply(null,val);
                //console.log(max, min);
            }
        });
        UpdateMap(gap_data, min, max,1);
    });
    //setTimeout(function () {
        console.log("All: ", min, max);
        return [gap_data, min, max];

    //}, 500);
    //console.log(max, min);
    //return [gap_data, min, max];
}

UpdateMap(getAvgData(lastButton,wave),-200,200,0);

//console.log(d3.interpolateRdYlGn(1));

// Import data
// Dot Matrix Visualization

//var lastButton = [];


function DrawDotMatrix(buttonID, wave) {    
    lastButton = buttonID;
    d3.csv(urlGit + "/data/w" + wave + "/" + buttonID + ".csv", function (data) {
        //var dataset = [];
        var data_w6_avg = [];
        var categories = [];
        data_w6 = data;
        var all_countries = Object.keys(data[0]);
        //var other_cat = [];
        //other_cat.length = all_countries.length - 2;
        var avg = [];
        avg.length = all_countries.length - 2;
        avg.fill(0);
        
        //other_cat.fill(50);
        data.forEach(function (d, i) {
            if (i < 4) {
                categories[i] = d["Category"];
                for (j = 2; j < all_countries.length; j++) {
                    avg[j-2] += coef[i] * +d[all_countries[j]];
                    if (i == 3) {
                        data_w6_avg.push({ country: all_countries[j], value: avg[j-2] });
                    }
                }
            }
        });
        categories.push("Others");
        //var value;
        var newCountry;
        //console.log(country);
        //newCountry = country;
        //console.log(newCountry);
        
        newCountry = sortCountries(sortOrd, getAvgData(sortBy, wave),categories,all_countries,data);
    });

}

function clearCountries() {
    country = [];
    d3.select("#DotMatrixChart").select("svg").remove();
    d3.select("#Pictogram").selectAll("svg").remove();
    d3.select("#Legend").selectAll("svg").remove();
}

function addCountry(newCountry) {
    if (country.indexOf(newCountry) == -1) {
        country.push(newCountry);
    }    
    DrawDotMatrix(lastButton, wave);
}

function changeVariable(evt, buttonID, wave) {
    // Get all buttons with class="btn" and remove the class "active"
    var buttons = document.getElementsByClassName("btn");
    for (i = 0; i < buttons.length; i++) {
        buttons[i].className = buttons[i].className.replace(" active", "");
    }
    evt.currentTarget.className += " active";
    updateVisuals(buttonID, wave);
}
function updateVisuals(buttonID, wave) {
    if (wave == null) {
        wave = 6; // Default wave
    }
    UpdateMap(getAvgData(buttonID, wave),-200,200,0);
    DrawDotMatrix(buttonID, wave);
}

function updateMapGap(buttonID, wave) {

    var all = getAvgDataGap(buttonID, wave);
    setTimeout(function(){
        console.log("All: ", all[1], all[2]);    
    }, 1000);
    //UpdateMap(data,min,max);

}

function updateYear(year) {
    wave = year;
    updateVisuals(lastButton, wave);
}

function slideVal(e, ui) {
    var number = ui.value;
    updateYear(number);
}
 
$("#year-range").slider({
    value: 6,
    min: 2,
    max: 6,
    step: 1,
    slide: slideVal

})
    .css("background", "#4CAF50")
    .each(function () {
        // Get the options for this slider
        var opt = $(this).data().uiSlider.options;
        // Get the number of possible values
        var vals = opt.max - opt.min;
        var years = [1994, 1998, 2004, 2009, 2014];

        // Space out values
        for (var i = 0; i <= vals; i++) {

            var el = $('<label>' + years[i] + '</label>').css('left', (i / vals * 100) + '%');
            // wave is (opt.min+opt.step*i)
            $("#year-range").append(el);
        }

    });

function sortCountries(asc, avgValues,categories,all_countries,data) {
    var value;
    var other_cat = [];
    var dataset = [];
    other_cat.length = all_countries.length - 2;
    other_cat.fill(50);
    // sort by happiness    
    //var avgValues = [];
    //avgValues = getAvgData(lastButton, wave);
    setTimeout(function(){
        //console.log("in: ",avgValues.length);
        //console.log(avgValues.length);
        var values = []; 
        var sortedValues = [];
        var sortedCountries = [];
        var unCountries = [];
        var indexDel = [];
        var help = [];
        var count = 0;
        for (i = 0; i < country.length; i++) { 
            for(k = 0; k <avgValues.length; k++) {
                if (avgValues[k]["country"] == country[i]) {
                    //console.log("c in loop: ", country[i]);
                    values.push(avgValues[k]["value"]);
                } else {
                    count++;
                }
            }
            if (count == avgValues.length) {
                //values.push(0)
                unCountries.push(country[i]);
                indexDel.push(i);

            }
            count = 0;
        }
        for (i = indexDel.length - 1; i >= 0; i--) {
            country.splice(indexDel[i], 1);
        }
        
        //if (values.length < country.length) {

        //}
        //console.log(values);
        help = values.slice(0);
        sortedValues = help.sort(function (a, b) { return (a - b) * asc });
        //console.log(sortedValues);
        //console.log(values);
        //console.log(country);
        for (i = 0; i < values.length; i++) {
            //console.log(sortedValues[i]);
            sortedCountries.push(country[values.indexOf(sortedValues[i])]);

            //console.log("countries: ", country[values.indexOf(sortedValues[i])]);
            //console.log("countries index: ", values.indexOf(sortedValues[i]));

        }
        console.log(unCountries);
        for (i = 0; i < unCountries.length; i++) {
            sortedCountries.push(unCountries[i]);
        }
        //console.log("sc1: ", sortedCountries);
        //
        for (i = 0; i < sortedCountries.length; i++) {
            for (j = 0; j < categories.length; j++) {
                value = Math.round(+data[j][sortedCountries[i]] / 2.0);
                if (j == 4) {
                    dataset.push({ group: sortedCountries[i], category: categories[j], count: +other_cat[i] });
                } else {
                    if (value <= other_cat[i]) {
                        other_cat[i] -= value;
                    } else if (isNaN(value)) {
                        value = 0;
                    } else {
                        value = other_cat[i];
                        other_cat[i] = 0;
                    }
                    dataset.push({ group: sortedCountries[i], category: categories[j], count: value });
                }
            }
        }
        //console.log("sc: ",sortedCountries);
        console.log("dataset: ", dataset);
        country = sortedCountries.slice(0);
        drawPic(dataset);

        //console.log("before printing: ", sortedCountries);
        return sortedCountries;
    }, 500);
    
}

function getSortBy(sel) {
    var myText = sel.options[sel.selectedIndex].text;
    console.log(myText);
    var res = myText.split(" ");
    if (res[1] == "asc") {
        sortOrd = 1;
    } else {
        sortOrd = -1;
    }
    sortBy = res[0];
    console.log("res: ", res);
    DrawDotMatrix(lastButton, wave);
    //updateVisuals(buttonID, wave);
}

