

// fam-w-children-tanf-ratio.json
// CBPP Table 2: National Single-Year TANF-to-Poverty Ratios
// http://www.cbpp.org/research/family-income-support/tanf-continues-to-weaken-as-a-safety-net


d3.queue()
  .defer(d3.json, 'data/fam-w-children-tanf-ratio.json')
  .awaitAll(function (error, results) {
    if (error) { throw error; }
    directedScatterPlot(results[0]);
  });


var margin = {
	left: 100,
	right: 50,
	top: 100,
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

    chart.svg
    	.selectAll(".circ")
    	.data(data, function(d){ return d.year }).enter()
    	.append("circle")
    	.attr("class", "circ")
    	.attr("cx", function(d){ return chart.xScale(d.fam_child_pov) })
    	.attr("cy", function(d){ return chart.yScale(d.tanf_fam) })
    	.attr("r", 6)

	chart.line = d3.line()
	    .x(function(d) { return xScale(d.fam_child_pov); })
	    .y(function(d) { return yScale(d.tanf_fam); })
	    .curve(d3.curveCatmullRom.alpha(0.7));

	chart.svg.append("path")
		.datum(data)
		.attr("d", line)
		.attr("class", "line");


};	










