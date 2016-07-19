

d3.queue()
  .defer(d3.json, 'data/fam-w-children-tanf-ratio.json')
  .defer(d3.json, 'data/state_tanf_to_poverty_ratio.json')
  .defer(d3.json, 'data/us-states.json')
  .awaitAll(function (error, results) {
    if (error) { throw error; }
    
    scatter = new directedScatterPlot(results[0]);
    scatter.update(results[0]);

    map = new rollingChoropleth(results[1], results[2]);
    map.update();

    d3.select('#restart').on('click', function () {
        scatter.update(results[0]);
        map.update();
    });
  });


var margin = {
	left: 75,
	right: 50,
	top: 50,
	bottom: 75
};

var stg_dur = 800; // 800
var stg_delay = 1400; // 1400

var width = 625 - margin.left - margin.right;
var height = 625 - margin.top - margin.bottom;


function directedScatterPlot(data) {
    
    var chart = this;

    chart.svg = d3.select("#chart1")
    	.append("svg")
    	.attr("width", width + margin.left + margin.right)
    	.attr("height", height + margin.top + margin.bottom)
    	.append("g")
    	.attr("transform", function(){ return "translate(" + margin.left + "," + margin.top + ")" });

    chart.xScale = d3.scaleLinear()
      	.domain([4500000,7500000])
    	.range([0, width])
    	.nice();

    chart.yScale = d3.scaleLinear()
      	.domain([1500000, 4500000])
    	.range([height, 0]);

    var xAxis = d3.axisBottom(chart.xScale).ticks(5, "s");
	var yAxis = d3.axisLeft(chart.yScale).ticks(5, "s");

    chart.svg.append("g")
    	.attr("transform", function(){ return "translate(0," + height + ")" })
    	.attr("class", "axis")
    	.call(xAxis);

    chart.svg.append("g")
    	.attr("class", "axis")
    	.call(yAxis);

	chart.svg
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", -(height / 2))
		.attr("y", -(margin.left * 0.75))
	    .style("text-anchor", "middle")
		.html("Families with Children on TANF");

	chart.svg
		.append("text")
		.attr("x", width / 2)
		.attr("y", height + margin.bottom * 0.75)
		.style("text-anchor", "middle")
		.html("Impoverished Families with Children");

};

directedScatterPlot.prototype.update = function (data) {

    var chart = this;
    var full = data.slice();

    chart.svg.selectAll(".circ").remove();
    chart.svg.selectAll("path").remove();
    chart.svg.selectAll(".year_note").remove();
    chart.svg.selectAll(".annotation").remove();

    chart.svg.selectAll(".circ")
    	.data(full, function(d){ return d.year }).enter()
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
        .data(full).enter()
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

    var line = d3.line()
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
                return line(full.filter(function(d) { return d.year < 2001; })
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
    annot1.append("tspan").attr("x","0").attr("dy","1.2em").html("TANF dropped by over")
    annot1.append("tspan").attr("x","0").attr("dy","1.2em").html("50% after 1996 reform.")
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
                return line(full.filter(function(d) { return d.year >= 2000 && d.year < 2005; })
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
                return line(full.filter(function(d) { return d.year >= 2004 && d.year < 2008; })
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
                return line(full.filter(function(d) { return d.year >= 2007; })
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
    annot4.transition().delay(stg_delay * 8 + stg_dur * 4).duration(stg_dur).attr("opacity", 1)
    .transition().delay(stg_delay * 2 + stg_dur).duration(stg_dur).attr("opacity", 0).remove();
  
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

    var title_text = chart.svg.append("g").attr("transform", "translate(0,0)")

    title_text.append("text")
        .attr("x", width/2)
        .text("State by state TANF-to-Poverty Ratio")
        .attr("text-anchor", "middle")

    title_text.append("text")
        .attr("x", width/2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .html("Percent of Poor Families Receiving TANF")

    var color_range = ["#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4"];
    var data_bins = [0,10,20,30,40,50,60,80,90,100];

    chart.colorScale = d3.scaleLinear()
        .domain(data_bins)
        .range(color_range);

    chart.xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width])

    chart.xAxis = d3.axisTop(chart.xScale).ticks(20)

    chart.svg.append("g")
        .attr("transform", "translate(0,51)")
        .attr("class", "axis")
        .call(chart.xAxis);

    chart.defs = chart.svg.append('defs')

    for (i = 0; i < data_bins.length -1 ; i++) { 
        var gradient = chart.defs
            .append('linearGradient')
            .attr('id', function() { return 'gradient' + i})

        gradient.append('stop')
            .attr('stop-color', function(d) { return color_range[i] }) // colorScale(data_bins[i])
            .attr('offset', '0%')

        gradient.append('stop')
            .attr('stop-color', function(d) { return color_range[i + 1] }) // colorScale(data_bins[i + 1])
            .attr('offset', '100%')

        chart.svg.append("g").attr("transform", "translate(0,20)").append('rect')
            .attr('id', function(){ return'gradient' + i + '-bar'})
            .attr('fill', function(){ return 'url(#gradient' + i + ')'})
            .attr('height', 25)
            .attr('y', 25)
            .attr('x', function(){ return chart.xScale(data_bins[i]) })
            .attr('width', function(){ return chart.xScale(data_bins[i+1] - data_bins[i])});
    };

    var map_tooltip = d3.select("body").append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);

    chart.map = chart.svg.append("g").attr("transform", "translate(0,30)").selectAll("path")
        .data(states.features)
        .enter()
        .append("path")
        .attr("class", "map")
        .attr("d", chart.path);

        chart.map.on("mouseover", function(d) {   

            map_tooltip.transition()        
                .duration(200)      
                .style("opacity", 1)
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");

            map_tooltip.append("p")
                .attr("class", "tooltip_text")
                .html( d.properties.name + ": " + d.properties.value_2013 + "%" )

        })        
        .on("mouseout", function(d) {       
            map_tooltip.html("")
                .transition()        
                .duration(500)      
                .style("opacity", 0)
        })

};

rollingChoropleth.prototype.update = function () {

    var chart = this;

    chart.map
        .style("fill", function(d){
            return chart.colorScale(d.properties.value_1994);
        })
        .transition().duration(stg_delay * 10 + stg_dur * 5)

        .styleTween("fill", function(d,i){

            var interpolator = d3.interpolateNumber(d.properties.value_1994, d.properties.value_2013);
            return function(t){
                var value = interpolator(t)
                return chart.colorScale(value)
            };
        });
};

    // Make tick marks percentages on color scale?

    // Add a rolling ticker of national TANF-to-POVERTY Ratio?


    // Scroll over for the map, so the appropriate place on the color scale appears. Also, importantly, the first and last year for that state.

    // need full data for map soon
    // minimize the directed scatterplot, then pull map up, 

    //selecting a state shows a specific directed scatterplot for that state?

    // options for state by state explanations of policy?

