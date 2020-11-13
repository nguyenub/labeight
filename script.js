//setting margins,width, height
const margin = ({top: 20, right: 30, bottom: 30, left: 40}),
width = 750 - margin.left - margin.right,
height = 550 - margin.top - margin.bottom;

//create svg chart
const svg = d3.select('.chart')
    .append('svg')
    .attr('width',width+margin.left+margin.right)
    .attr('height',height+margin.top+margin.bottom)
    .append('g')
    .attr("transform","translate("+margin.left+","+margin.right+")")

//creating x and y axis scales
const xScale = d3.scaleLinear()
    .range([margin.left, width - margin.right])

const yScale = d3.scaleLinear()
    .range([height - margin.bottom, margin.top])

//create path line
const line = d3.line()
    .curve(d3.curveCatmullRom);

//get path length
function length(path) {
    return d3.create("svg:path").attr("d", path).node().getTotalLength();
  }

//create white space for labels
function halo(text) {
    text.select(function() { return this.parentNode.insertBefore(this.cloneNode(true), this); })
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 4)
        .attr("stroke-linejoin", "round");
  }

//update function
function update(data){
    //adjust domains of x and y scale
    yScale.domain([d3.min(data, function (d) {return d.gas}), d3.max(data, function (d) {return d.gas})]).nice()
    xScale.domain([d3.min(data, function (d) {return d.miles}), d3.max(data, function (d) {return d.miles})]).nice()


    //create x and y axis, format ticks, create grids and call axis        
    xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(6,",.0f"))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("y2", -height)
            .attr("stroke-opacity", 0.1))

    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(null,"($.2f"))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width)
            .attr("stroke-opacity", 0.1))

    svg.append('g')
        .call(yAxis)


    svg.append('g')
        .call(xAxis)



    //update axis names
    svg.append("text")
		.attr('x', width-200)
        .attr('y', height-40)
        .attr('font-weight','bold')
        .attr('font-size','10pt')
		// add attrs such as alignment-baseline and text-anchor as necessary
        .text("Miles per person per year")

        svg.append("text")
        .attr('x', 10)
        .attr('y', 5)
        .attr('font-size',13)
        .text("Cost per gallon")
        .attr('font-weight', 'bold')

    //create line path generator
    line
        .x(d => xScale(d.miles))
        .y(d => yScale(d.gas));

    //create path
    const l = length(line(data));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "maroon")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", `0,${l}`)
        .attr("stroke-width", 2.5)
        .attr("d", line)
        .transition()
        .duration(5000)
        .ease(d3.easeLinear)
        .attr("stroke-dasharray", `${l},${l}`)
        ;
    //Add data points to scatter plot
    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx',d=>xScale(d.miles))
        .attr('cy',d=>yScale(d.gas))
        .attr('fill', 'white') 
        .attr('r',3)
        .attr('opacity', 2)
        .attr('stroke', 'black')
        .attr('stroke-width', '1.2')
        
   
    //add text year-label to data points

    const label = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .selectAll("g")
        .data(data)
        .join("g")
        .attr("transform", d => `translate(${xScale(d.miles)},${yScale(d.gas)})`);
    
    label.append("text")
        .text(d => d.year)
        .each(function(d) {
          const t = d3.select(this);
          switch (d.orient) {
            case "top": t.attr("text-anchor", "middle").attr("dy", "-0.7em"); break;
            case "right": t.attr("dx", "0.5em").attr("dy", "0.32em").attr("text-anchor", "start"); break;
            case "bottom": t.attr("text-anchor", "middle").attr("dy", "1.4em"); break;
            case "left": t.attr("dx", "-0.5em").attr("dy", "0.32em").attr("text-anchor", "end"); break;
          }
        })
        .call(halo);

    //remove domain lines & add grid
    

}

d3.csv("driving.csv",d => {
    return {
        ...d,
        year: +d.year,
        miles: +d.miles,
        gas: +d.gas
    }
}).then(data =>{
    update(data);
});