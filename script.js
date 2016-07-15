

d3.queue()
  .defer(d3.json, 'data/fam-w-children-tanf-ratio.json')
  .awaitAll(function (error, results) {
    if (error) { throw error; }
    directedScatterPlot(results[0]);
  });


var margin = {
	left: 100,
	right: 50,
	top: 50,
	bottom: 50
};


function directedScatterPlot(data) {
    
    var chart = this;

    chart.width = 600 - margin.left - margin.right;
    chart.height = 600 - margin.top - margin.bottom;

    chart.svg = d3.select("#chart")
    	.append("svg")
    	.attr("width", chart.width + margin.left + margin.right)
    	.attr("height", chart.height + margin.top + margin.bottom)
    	.append("g")
    	.attr("transform", function(){ return "translate(" + margin.left + "," + margin.top + ")" });

    chart.xScale = d3.scaleLinear()
      	.domain(d3.extent(data, function (d) { return d.fam_child_pov; }))
    	.range([0, width])
    	.nice();

    chart.yScale = d3.scaleLinear()
      	.domain(d3.extent(data, function (d) { return d.tanf_fam }))
    	.range([height, 0]);

    var xAxis = d3.axisBottom(chart.xScale).ticks(5);
	var yAxis = d3.axisLeft(chart.yScale).ticks(5);

	// 45 degree angle scale? since above is impossible (probably, check data?)

    chart.svg.append("g")
    	.attr("transform", function(){ return "translate(0," + chart.height + ")" })
    	.attr("class", "axis")
    	.call(xAxis);

    chart.svg.append("g")
    	.attr("class", "axis")
    	.call(yAxis);

	chart.svg
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", -(chart.height / 2))
		.attr("y", -(margin.left * 0.75))
	    .style("text-anchor", "middle")
		.html("Families with Children on TANF");

	chart.svg
		.append("text")
		.attr("x", chart.width / 2)
		.attr("y", chart.height + margin.bottom * 0.75)
		.style("text-anchor", "middle")
		.html("Impoverished Families with Children");

    var full = data.slice()

    chart.svg
    	.selectAll(".circ")
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

    chart.svg
        .selectAll(".year_note")
        .data(full).enter()
        .append("text")
        .attr("class", "year_note")
        .attr("opacity", 0)
        .attr("fill", "black")
        .text(function(d){ return d.year })
        .attr("x", function(d){ return chart.xScale(d.fam_child_pov) })
        .attr("y", function(d){ return chart.yScale(d.tanf_fam) })
        .transition()
        .delay(function (d,i){ return (i * 50) })
        .duration(500)
        .attr("opacity", 1);


    // Directed Line
    chart.interpolate = d3.scaleQuantile()
        .domain([0,1])
        .range(d3.range(1, data.length + 1));   

    var stg_dur = 800
        stg_delay = 1400


    var line = d3.line()
        .x(function(d) { return xScale(d.fam_child_pov); })
        .y(function(d) { return yScale(d.tanf_fam); })
        .curve(d3.curveCatmullRom.alpha(0.7));

    // Reveal Path - Stage 1
    chart.svg.append("path")
        .attr("class", "line")
        .style("stroke","#ec008b")
        .transition()
        .delay(stg_delay)
        .duration(stg_dur)
        .attrTween('d', pathReveal_stg1)
        .transition()
        .delay(stg_delay * 2)
        .style("stroke","black");;

    // Reveal Annotations - Stage 1
    var annot1 = chart.svg
        .append("g").attr("transform", "translate(20,80)")
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("opacity", 0)
        .attr("class", "annotation");

    annot1.append("tspan").html("Families enrolled in")
    annot1.append("tspan").attr("x","0").attr("dy","1.2em").html("TANF  collapses after")
    annot1.append("tspan").attr("x","0").attr("dy","1.2em").html("1996 reform.")
    annot1.transition().delay(stg_delay).duration(stg_dur).attr("opacity", 1)
    .transition().delay(stg_delay * 2).duration(stg_dur).attr("opacity", 0).remove();

    // Note that families in poverty reduced too. Or maybe this is because of the new qualifications?


    // Reveal Path - Stage 2
    chart.svg.append("path")
        .attr("class", "line")
        .style("stroke","#ec008b")
        .transition()
        .delay(stg_delay * 3 + stg_dur*1.5)
        .duration(stg_dur)
        .attrTween('d', pathReveal_stg2)
        .transition()
        .delay(stg_delay * 2 + stg_dur)
        .style("stroke","black");

    // Reveal Annotations - Stage 2
    var annot2 = chart.svg
        .append("g").attr("transform", "translate(150,350)")
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
        .attrTween('d', pathReveal_stg3)
        .transition()
        .delay(stg_delay * 2 + stg_dur)
        .style("stroke","black");

    // Reveal Annotations - Stage 3
    var annot3 = chart.svg
        .append("g").attr("transform", "translate(200,350)")
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("opacity", 0)
        .attr("class", "annotation");

    annot3.append("tspan").html("The recovery didn't")
    annot3.append("tspan").attr("x","0").attr("dy","1.2em").html("reduce the number")
    annot3.append("tspan").attr("x","0").attr("dy","1.2em").html("of families in poverty.")
    annot3.transition().delay(stg_delay * 6 + stg_dur * 2 ).duration(stg_dur).attr("opacity", 1)
    .transition().delay(stg_delay * 2 + stg_dur).duration(stg_dur).attr("opacity", 0).remove();

    // Reveal Path - Stage 4
    chart.svg.append("path")
        .attr("class", "line")
        .style("stroke","#ec008b")
        .transition()
        .delay(stg_delay * 8 + stg_dur * 4)
        .duration(stg_dur)
        .attrTween('d', pathReveal_stg4)
        .transition()
        .delay(stg_delay * 2 + stg_dur)
        .style("stroke","black");

    // Reveal Annotations - Stage 4
    var annot4 = chart.svg
        .append("g").attr("transform", "translate(250,350)")
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("opacity", 0)
        .attr("class", "annotation");

    annot4.append("tspan").html("And the 2008")
    annot4.append("tspan").attr("x","0").attr("dy","1.2em").html("recession created many")
    annot4.append("tspan").attr("x","0").attr("dy","1.2em").html("new poor families")
    annot4.append("tspan").attr("x","0").attr("dy","1.2em").html("with no TANF.")
    annot4.transition().delay(stg_delay * 8 + stg_dur * 4).duration(stg_dur).attr("opacity", 1)
    .transition().delay(stg_delay * 2 + stg_dur).duration(stg_dur).attr("opacity", 0).remove();



    function pathReveal_stg1() {
        return function(t) {
            return line(data
                .filter(function(d) { return d.year < 2001;})
                .slice(0, chart.interpolate(t)));
        };
    };

    function pathReveal_stg2() {
        return function(t) {
            return line(data
                .filter(function(d) { return d.year >= 2000 && d.year < 2005;})
                .slice(0, chart.interpolate(t)));
        };
    };

    function pathReveal_stg3() {
        return function(t) {
            return line(data
                .filter(function(d) { return d.year >= 2004 && d.year < 2008;})
                .slice(0, chart.interpolate(t)));
        };
    };

    function pathReveal_stg4() {
        return function(t) {
            return line(data
                .filter(function(d) { return d.year >= 2007 ;})
                .slice(0, chart.interpolate(t)));
        };
    };    
    // Year formatting - get rid of first two digits: '99 '00 '01 '02
    // Tick Formatting, should just be millions

};	

