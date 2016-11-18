

d3.queue()
  .defer(d3.json, 'data/fam-w-children-tanf-ratio.json')
  .defer(d3.json, 'data/state_tanf_to_poverty_ratio.json')
  .defer(d3.json, 'data/us-states.json')
  .awaitAll(function (error, results) {
    if (error) { throw error; }
    
    scatter = new DirectedScatterPlot(results[0]);
    scatter.update(results[0]);

    map = new rollingChoropleth(results[1], results[2]);
    stateChart = new StateScatter(results[1])

    d3.select('#restart').on('click', function () {
        map.clean()
        scatter.update(results[0]);
    });
  });


var margin = {
	left: 75,
	right: 50,
	top: 50,
	bottom: 75
};

var stg_dur = 800
var stg_delay = 1400
var map_duration = stg_dur * 12

var width = 625 - margin.left - margin.right;
var height = 625 - margin.top - margin.bottom;


function DirectedScatterPlot(data) {
    
    var chart = this;

    chart.SVG = d3.select("#chart1")
    	.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    chart.svg = d3.select("svg")
    	.append("g")
    	.attr("transform", function(){ return "translate(" + margin.left + "," + margin.top + ")" });

    chart.xScale = d3.scaleLinear()
      	.domain([4500000,7500000])
    	.range([0, width])
    	.nice();

    chart.yScale = d3.scaleLinear()
      	.domain([1500000, 4500000])
    	.range([height, 0]);

    chart.xAxis = d3.axisBottom(chart.xScale).ticks(5, "s");
	chart.yAxis = d3.axisLeft(chart.yScale).ticks(5, "s");


};

DirectedScatterPlot.prototype.update = function (data) {

    var chart = this;
    chart.full = data.slice();

    chart.svg.selectAll("*").interrupt();

    chart.svg.selectAll(".axisLabelMin").remove();
    chart.svg.selectAll(".circ").remove();
    chart.svg.selectAll("path").remove();
    chart.svg.selectAll(".year_note").remove();
    chart.svg.selectAll(".year_note_min").remove();
    chart.svg.selectAll(".annotation").remove();
    chart.svg.selectAll(".followPoint").remove();

    chart.SVG 
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    chart.svg.append("g")
        .attr("transform", function(){ return "translate(0," + height + ")" })
        .attr("class", "axis")
        .call(chart.xAxis);

    chart.svg.append("g")
        .attr("class", "axis")
        .call(chart.yAxis);

    chart.svg
        .append("text")
        .attr("class", "yAxisLabel")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", -(margin.left * 0.75))
        .style("text-anchor", "middle")
        .html("Families with Children on TANF");

    chart.svg
        .append("text")
        .attr("class", "xAxisLabel")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom * 0.75)
        .style("text-anchor", "middle")
        .html("Impoverished Families with Children");

    chart.svg.selectAll(".circ")
    	.data(chart.full, function(d){ return d.year }).enter()
    	.append("circle")
    	.attr("class", "circ")
    	.attr("r", 0)
    	.attr("cx", function(d){ return chart.xScale(d.fam_child_pov) })
    	.attr("cy", function(d){ return chart.yScale(d.tanf_fam) })
    .transition()
    	.delay(function (d,i){ return (i * 50) })
    	.duration(500)
    	.attr("r", 8);

    chart.svg.selectAll(".year_note")
        .data(chart.full).enter()
        .append("text")
        .attr("class", "year_note")
        .attr("opacity", 0)
        .attr("x", function(d){ return chart.xScale(d.fam_child_pov) })
        .attr("y", function(d){ return chart.yScale(d.tanf_fam) })
        .attr("dx", function(d){ 
            if (d.year <= 2000){ return 10 }
            else if (d.year < 2004) { return 2 }
            else if (d.year < 2006) { return 10 }
            else if (d.year < 2008) { return -40 }
            else if (d.year < 2011) { return 2 }
            else if (d.year < 2013) { return 10 }
            else if (d.year == 2013) { return -40 }
            else if (d.year == 2014) { return 10 }
        })
        .attr("dy", function(d){ 
            if (d.year <= 2000){ return 3 }
            else if (d.year < 2004) { return -10 }
            else if (d.year < 2006) { return 5 }
            else if (d.year < 2008) { return 5 }
            else if (d.year < 2011) { return -10 }
            else if (d.year < 2013) { return 3 }
            else if (d.year == 2013) { return 5 }
            else if (d.year == 2014) { return -3 }
        })
        .text(function(d){ return d.year })
    .transition()
        .delay(function (d,i){ return (i * 50) })
        .duration(500)
        .attr("opacity", 1);

    // Directed Line
    chart.interpolate = d3.scaleQuantile()
        .domain([0,1])
        .range(d3.range(1, data.length + 1));   

    chart.line = d3.line()
        .x(function(d) { return chart.xScale(d.fam_child_pov); })
        .y(function(d) { return chart.yScale(d.tanf_fam); })
        .curve(d3.curveCatmullRom.alpha(0.7));

    // Reveal Path - Stage 1
    chart.svg.append("path")
        .attr("class", "line")
        .style("stroke","#ec008b")
        .transition()
        .delay(stg_delay)
        .duration(stg_dur)
        .attrTween('d', function() {
            return function(t) {
                return chart.line(chart.full.filter(function(d) { return d.year < 2001; })
                    .slice(0, chart.interpolate(t) ) );
            }
        })
        .transition()
        .delay(stg_delay * 2)
        .style("stroke","black");;

    // Reveal Annotations - Stage 1
    var annot1 = chart.svg
        .append("g").attr("transform", "translate(40,80)")
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("opacity", 0)
        .attr("class", "annotation");

    annot1.append("tspan").html("Families enrolled in")
    annot1.append("tspan").attr("x","0").attr("dy","1.2em").html("TANF dropped by 50%")
    annot1.append("tspan").attr("x","0").attr("dy","1.2em").html("after 1996 reform.")
    annot1.transition().delay(stg_delay).duration(stg_dur).attr("opacity", 1)
    .transition().delay(stg_delay * 2).duration(stg_dur).attr("opacity", 0).remove();

    // Reveal Path - Stage 2
    chart.svg.append("path")
        .attr("class", "line")
        .style("stroke","#ec008b")
        .transition()
        .delay(stg_delay * 3 + stg_dur*1.5)
        .duration(stg_dur)
        .attrTween('d', function() {
            return function(t) {
                return chart.line(chart.full.filter(function(d) { return d.year >= 2000 && d.year < 2005; })
                    .slice(0, chart.interpolate(t) ) );
            }
        })        
        .transition()
        .delay(stg_delay * 2 + stg_dur)
        .style("stroke","black");

    // Reveal Annotations - Stage 2
    var annot2 = chart.svg
        .append("g").attr("transform", "translate(230,300)")
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("opacity", 0)
        .attr("class", "annotation");

    annot2.append("tspan").html("The 2001 recession")
    annot2.append("tspan").attr("x","0").attr("dy","1.2em").html("pushed more families")
    annot2.append("tspan").attr("x","0").attr("dy","1.2em").html("into poverty.")
    annot2.transition().delay(stg_delay * 4).duration(stg_dur).attr("opacity", 1)
    .transition().delay(stg_delay * 2 + stg_dur).duration(stg_dur).attr("opacity", 0).remove();

    // Reveal Path - Stage 3
    chart.svg.append("path")
        .attr("class", "line")
        .style("stroke","#ec008b")
        .transition()
        .delay(stg_delay * 6 + stg_dur * 2)
        .duration(stg_dur)
        .attrTween('d', function() {
            return function(t) {
                return chart.line(chart.full.filter(function(d) { return d.year >= 2004 && d.year < 2008; })
                    .slice(0, chart.interpolate(t) ) );
            }
        })       
        .transition()
        .delay(stg_delay * 2 + stg_dur)
        .style("stroke","black");

    // Reveal Annotations - Stage 3
    var annot3 = chart.svg
        .append("g").attr("transform", "translate(270,300)")
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("opacity", 0)
        .attr("class", "annotation");

    annot3.append("tspan").html("TANF enrollment drops")
    annot3.append("tspan").attr("x","0").attr("dy","1.2em").html("during the recovery,")
    annot3.append("tspan").attr("x","0").attr("dy","1.2em").html("but poverty doesn't.")
    annot3.transition().delay(stg_delay * 6 + stg_dur * 2 ).duration(stg_dur).attr("opacity", 1)
    .transition().delay(stg_delay * 2 + stg_dur).duration(stg_dur).attr("opacity", 0).remove();

    // Reveal Path - Stage 4
    chart.svg.append("path")
        .attr("class", "line")
        .style("stroke","#ec008b")
        .transition()
        .delay(stg_delay * 8 + stg_dur * 4)
        .duration(stg_dur)
        .attrTween('d', function() {
            return function(t) {
                return chart.line(chart.full.filter(function(d) { return d.year >= 2007; })
                    .slice(0, chart.interpolate(t) ) );
            }
        })   
        .transition()
        .delay(stg_delay * 2 + stg_dur)
        .style("stroke","black");

    // Reveal Annotations - Stage 4
    var annot4 = chart.svg
        .append("g").attr("transform", "translate(310,300)")
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("opacity", 0)
        .attr("class", "annotation");

    annot4.append("tspan").html("The 2008 recession")
    annot4.append("tspan").attr("x","0").attr("dy","1.2em").html("increased the number of")
    annot4.append("tspan").attr("x","0").attr("dy","1.2em").html("impoverished families with ")
    annot4.append("tspan").attr("x","0").attr("dy","1.2em").html("no support from TANF.")
    annot4
        .transition().delay(stg_delay * 8 + stg_dur * 4).duration(stg_dur).attr("opacity", 1)
        .transition().delay(stg_delay * 2 + stg_dur).duration(stg_dur)
            .on("end", function () { chart.minimize() })
            .attr("opacity", 0);

};


DirectedScatterPlot.prototype.minimize = function () {

    var chart = this;

    chart.svg.selectAll("g.axis").remove();

    chart.svg.selectAll(".circ")
        .transition().duration(1000)
        .attr("cx", function(d){ return chart.xScale(d.fam_child_pov) / 3 })
        .attr("cy", function(d){ return chart.yScale(d.tanf_fam) / 3 })
        .attr("r", 2);

    chart.svg.selectAll(".year_note")        
        .transition().duration(1000)
        .attr("class", "year_note_min")
        .attr("x", function(d){ return chart.xScale(d.fam_child_pov)/3 })
        .attr("y", function(d){ return chart.yScale(d.tanf_fam)/3 });    
    chart.svg.selectAll("path")
        .transition().duration(1000)
        .attr("transform", "scale(0.33)");

    chart.svg.selectAll("text.yAxisLabel")
        .attr("class", "axisLabelMin")
        .transition().duration(1000)
        .attr("x", (-height/6))
        .attr("y", 0)
        .style("font-size", "7px");

    chart.svg.selectAll("text.xAxisLabel")
        .attr("class", "axisLabelMin")
        .transition().duration(1000)
        .attr("x", (width / 6))
        .attr("y", (height + margin.bottom )/3)
        .style("font-size", "7px");

    chart.SVG
        .transition().delay(1000)
        .on("end", function(d){
            map.clean();
            map.update();
            scatter.follow();
        })
        .attr("width", (width + margin.left + margin.right)/2)
        .attr("height", (height + margin.top + margin.bottom)/2.3);
};

DirectedScatterPlot.prototype.follow = function () {

    var chart = this;

    var lineMin = d3.line()
        .x(function(d) { return chart.xScale(d.fam_child_pov)/3; })
        .y(function(d) { return chart.yScale(d.tanf_fam)/3; })
        .curve(d3.curveCatmullRom.alpha(0.7));

    var followPath = chart.svg.append("path")
        .attr("id", "followPath")
        .attr("class", "line")
        .attr("stroke-opacity", 0)
        .transition()
        .delay(stg_delay)
        .duration(stg_dur)
        .attr('d', lineMin(chart.full));

    var followCircle = chart.svg.selectAll(".followPoint")
        .data(chart.full.filter(function(d,i) { return i === 0 }))
        .enter()
        .append("circle")
        .attr("transform", function(d){ return "translate(" + chart.xScale(d.fam_child_pov)/3 + "," + chart.yScale(d.tanf_fam) / 3 + ")"})
        .attr("class", "followPoint")
        .attr("fill", "#ec008b")
        .attr("r", 3);

    followCircle.transition()
        .delay(4000)
        .on("end", follow());

    function follow() {
        followCircle
            .transition()
            .duration(map_duration)
            .attrTween("transform", translateAlong(followPath.node()))
            .on("end", follow);
    };

    function translateAlong(path) {
        var l = path.getTotalLength();
        return function(d, i) {
            return function(t) {
                var p = path.getPointAtLength(t * l);
                return "translate(" + p.x + "," + p.y + ")";
            };
        };
    }
};


function rollingChoropleth(data, states){

    var chart = this;

    for (var i = 0; i < data.length; i++) {

        var dataState = data[i].State;
        var value_1994 = data[i].y1994;
        var value_2013 = data[i].y2013;

        // Find the corresponding state inside the GeoJSON
        for (var j = 0; j < states.features.length; j++)  {
            var jsonState = states.features[j].properties.name;

            if (dataState == jsonState) {
            states.features[j].properties.value_1994 = value_1994; 
            states.features[j].properties.value_2013 = value_2013; 

            break;
            }
        }
    };

    chart.states = states;

    chart.projection = d3.geoAlbersUsa()
        .translate([width/2, height/2])
        .scale([width * 1.5]); 

    chart.path = d3.geoPath().projection(chart.projection);

    chart.svg = d3.select("#chart2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", function(){ return "translate(" + margin.left + "," + margin.top + ")" });

    // Title and interpolating year.

    chart.title_text = chart.svg.append("g").attr("transform", "translate(0,0)")

    chart.color_range = ["#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4"];
    chart.data_bins = [0,10,20,30,40,50,60,80,90,100];

    chart.colorScale = d3.scaleLinear()
        .domain(chart.data_bins)
        .range(chart.color_range);

    chart.xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width])

    chart.xAxis = d3.axisTop(chart.xScale).ticks(20)

    chart.defs = chart.svg.append('defs')

    chart.tooltip = d3.select("body").append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);

    chart.tickArea = d3.select("#tickArea")
        .append("svg")
        .attr("id", "yearTicker")
        .attr("width", (0)/2)
        .attr("height", 0);

};


rollingChoropleth.prototype.clean = function () {

    var chart = this;

    chart.svg.selectAll("*").interrupt();

    chart.svg.selectAll("path").remove();
    chart.svg.selectAll("text.title").remove();
    chart.svg.selectAll("text.subtitle").remove();
    chart.svg.selectAll("text.annotation").remove();
    chart.svg.selectAll("rect").remove();
    chart.svg.selectAll("g.axis").remove();
    chart.tickArea.selectAll("text").remove();

};

rollingChoropleth.prototype.update = function () {

    var chart = this;

    chart.tickArea
        .attr("width", 200)
        .attr("height", 50) 

    var tickText1 = chart.tickArea
        .append("text")
        .text("Year: ")
        .attr("class","unique")
        .attr("text-anchor", "middle")
        .attr("x", 75)
        .attr("y", 50)
        .attr("opacity", 1)

    var tickText2 = chart.tickArea
        .append("text")
        .text(1994)
        .attr("class","unique")
        .attr("text-anchor", "middle")
        .attr("x", 125)
        .attr("y", 50)
        .attr("opacity", 1)

    tickText2   
        .transition().delay(4000).duration(map_duration)
        .tween("text", function () {
            var i = d3.interpolateNumber(1994, 2014)
            var text = d3.select(this)

            return function(t) {
                text.text(Math.round(i(t)));
            };
        });

    chart.title_text.append("text")
        .text("State by state TANF-to-Poverty Ratio")
        .attr("class", "title")
        .attr("x", width/2)
        .attr("text-anchor", "middle")
        .attr("opacity", 0)
        .transition().duration(1000)
        .attr("opacity", 1)

    chart.title_text.append("text")
        .text("Percent of Poor Families Receiving TANF")
        .attr("class", "subtitle")
        .attr("x", width/2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("opacity", 0)
        .transition().duration(1000)
        .attr("opacity", 1)

    chart.svg.append("g")
        .attr("transform", "translate(0,51)")
        .attr("class", "axis")
        .transition().duration(1000)
        .call(chart.xAxis);

    for (i = 0; i < chart.data_bins.length -1 ; i++) { 
        var gradient = chart.defs
            .append('linearGradient')
            .attr('id', function() { return 'gradient' + i})

        gradient.append('stop')
            .attr('stop-color', function(d) { return chart.color_range[i] })
            .attr('offset', '0%')

        gradient.append('stop')
            .attr('stop-color', function(d) { return chart.color_range[i + 1] }) 
            .attr('offset', '100%');

        chart.svg.append("g").attr("transform", "translate(0,20)").append('rect')
            .attr('id', function(){ return'gradient' + i + '-bar'})
            .attr('fill', function(){ return 'url(#gradient' + i + ')'})
            .attr('y', 25)
            .attr('x', function(){ return chart.xScale(chart.data_bins[i]) })
            .attr('width', function(){ return 1 + chart.xScale(chart.data_bins[i+1] - chart.data_bins[i])})
            .attr('height', 0)
            .transition().delay(1000).duration(1000)
            .attr('height', 25);
    };

    chart.map = chart.svg.append("g").attr("transform", "translate(0,30)").selectAll("path")
        .data(chart.states.features)
        .enter()
        .append("path")
        .attr("class", "map")
        .attr("d", chart.path)
        .style("stroke","white");
    chart.map
        .transition().delay(1000).duration(1000)
        .style("stroke","black");

    chart.map
        .style("fill","white")
        .transition().delay(2000)
        .style("fill", function(d){
            return chart.colorScale(d.properties.value_1994);
        })
        .transition().delay(2000).duration(map_duration)
        .styleTween("fill", function(d,i){
            var interpolator = d3.interpolateNumber(d.properties.value_1994, d.properties.value_2013);
            return function(t){
                var value = interpolator(t)
                return chart.colorScale(value)
            };
        });

    chart.map
        .on("mouseover", function(d) {   

            // Pull State Name out to Pass to stateChart.update()
            var state = d3.values(d)
            var stateName = state[2].name

            stateChart.update(stateName);

            chart.tooltip.transition()        
                .duration(200)      
                .style("opacity", 1)
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");

            chart.tooltip.append("p")
                .attr("class", "tooltip_text")
                .html( d.properties.name + ": " + d.properties.value_2013 + "%" )

        })        
        .on("mouseout", function(d) {   

            stateChart.kill();

            chart.tooltip.html("")
                .transition()        
                .style("opacity", 0)
        });        
};


function StateScatter(data) {

    var chart = this;

    chart.full = data.slice();

    chart.SVG = d3.select("#chart1").append("svg")
        .attr("id", "stateChart")

}

StateScatter.prototype.update = function(stateName) {

    var chart = this;

    var filteredData = chart.full.filter(function(d) { return d.State === stateName });

    chart.SVG
        .attr("width", (width + margin.left + margin.right)/2)
        .attr("height", (height + margin.top + margin.bottom)/2);

    chart.svg = chart.SVG
        .append("g")
        .attr("transform", function(){ return "translate(" + margin.left/2 + "," + margin.top/2 + ")" });

    chart.svg.append("text")
        .text(stateName + " Trend")
        .attr("x", 20)
        .attr("y", 15);

    chart.xScale = d3.scaleLinear()
        .domain([1995,2014])
        .range([0, width/2])
        .nice();

    chart.yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height/2, 0]);

    chart.xAxis = d3.axisBottom(chart.xScale).ticks(6, "f");
    chart.yAxis = d3.axisLeft(chart.yScale).ticks(5, "s");

    chart.svg.append("g")
        .attr("transform", function(){ return "translate(0," + height/2 + ")" })
        .attr("class", "axis")
        .call(chart.xAxis);

    chart.svg.append("g")
        .attr("class", "axis")
        .call(chart.yAxis);    

    chart.svg
        .append("text")
        .classed("year_note_min_state", true)
        .attr("transform", "rotate(-90)")
        .attr("x", -height/4)
        .attr("y", -margin.left*0.35)
        .style("text-anchor", "middle")
        .html("TANF Ratio");

    chart.svg
        .append("text")
        .classed("year_note_min_state", true)
        .attr("x", width / 4)
        .attr("y", height/2 + (margin.bottom * 0.4))
        .style("text-anchor", "middle")
        .html("Year");

    chart.svg.append("line")
        .data(filteredData)
        .attr("class", "smallLine")
        .attr("x1", function() { return chart.xScale(1994) })
        .attr("x2", function() { return chart.xScale(2014) })
        .attr("y1", function(d) { return chart.yScale(d.y1994) })
        .attr("y2", function(d) { return chart.yScale(d.y2013) });

};

StateScatter.prototype.kill = function () {

    var chart = this;

    chart.svg.selectAll("g").remove();
    chart.svg.selectAll("line").remove();
    chart.svg.selectAll("text").remove();
    
};

    // Oh god. why is the tween for the tick text non-linear? Do I not know how these work?

    // Add a rolling ticker of national TANF-to-POVERTY Ratio?

    // Make tick marks percentages on color scale?
    // Scroll over for the map, so the appropriate place on the color scale appears. Also, importantly, the first and last year for that state.
    // need full data for map soon

    // selecting a state shows a specific directed scatterplot for that state?
    // options for state by state explanations of policy?

