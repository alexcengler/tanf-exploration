

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
      	.domain([0, d3.max(data, function (d) { return d.fam_child_pov; })])
    	.range([0, width]);

    chart.yScale = d3.scaleLinear()
      	.domain([d3.max(data, function (d) { return d.fam_child_pov; }), 0])
    	.range([0, height]);

    var xAxis = d3.axisBottom(chart.xScale).ticks(10);
	var yAxis = d3.axisLeft(chart.yScale).ticks(10);

    chart.svg.append("g")
    	.attr("transform", function(){ return "translate(0," + chart.height + ")" })
    	.attr("class", "axis")
    	.call(xAxis);

    chart.svg.append("g")
    	.attr("class", "axis")
    	.call(yAxis);

    chart.svg
    	.selectAll(".circ")
    	.data(data, function(d){ return d.year }).enter()
    	.append("circle")
    	.attr("class", "circ")
    	.attr("cx", function(d){ return chart.xScale(d.fam_child_pov) })
    	.attr("cy", function(d){ return chart.yScale(d.tanf_fam) })
        .style('opacity', 0.75)
    	.attr("r", 5)
    	.attr("fill", "black");

    chart.svg
    	.selectAll("circle")



};	










