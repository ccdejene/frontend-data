// Based loosely from this D3 bubble graph https://bl.ocks.org/mbostock/4063269
// And this Forced directed diagram https://bl.ocks.org/mbostock/4062045
// Code edit by Eyob Westerink

import {loadApiData} from "./js/modules/fetch";


// function to render data
function render(data) {


    // var expensesByName  = d3.nest()
    //     .key(function(d) { return d.orgin; })
    //     .entries(data);
    //
    // console.log(expensesByName);

    // make svg element
    let svg = d3.select('body').append('svg')
        .attr('width', '100%')
        .attr('height',  window.innerHeight)
        .attr('text-anchor', 'middle');


    // create a wrapper
    let wrapper = d3.select("svg")
        .append("g")
        .attr('class', 'wrapper')
    // set background color
    svg.style('background-color', '#eee');

    /**
     * Own code for declaring settings
     */
    let width = window.innerWidth; // get width in pixels
    let height = +svg.attr('height'); // set number of height in svg attribute
    let centerX = width * 0.5; // center position of X
    let centerY = height * 0.5; // center position of Y
    let minRadius = 0; // set minRadius of circle
    let paddingObject = 5; // padding between circles
    let magnifyStartPosition = 3000; //multiplier circle start postion
    let scaleColor = d3.scaleOrdinal(d3.schemeSet2); // set colorsheme for the circles


    // calculate radius of the circle with pack
    /**
     * Pack
     * returns a array of nodes associated with the specified root node.
     * The cluster layout is part of D3's family of hierarchical layouts.
     * These layouts follow the same basic structure: the input argument to the layout is the root node of the
     * hierarchy, and the output return value is an array representing the computed positions of all nodes.
     */
    let pack = d3.pack()
        .size([width, height]) // set the scale of the nodes (circles) based on window size
        .padding(paddingObject);

    // to collide the circles to each other
    /**
     * ForceCollide
     * forceCollide is used to stop elements overlapping and is particularly useful when 'clumping' circles together.
     * We must specify the radius of the elements using .radius() : var numNodes = 100 var nodes = d3. range(numNodes).
     */
    // stop elements overlapping and set padding between circles
    let forceCollide = d3.forceCollide(d => d.radius + paddingObject);

    // use the force and simulate
    /**
     *  Simulation
     *  Creates a new simulation with the specified array of nodes and no forces.
     *  If nodes is not specified, it defaults to the empty array.
     *  The simulator starts automatically; use simulation.on to listen for tick events as the simulation runs.
     */

    let simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2))
        // .force('collision', forceCollide)
        .force('collide', d3.forceCollide().radius(function(d) {
            return d.radius

        }))
        // .force('x', d3.forceX(centerX))
        .force('y', d3.forceY(centerY))
        .force('x', d3.forceX(centerX))



    /**
     * Hierarchy
     * is a nested data structure representing a tree: each node has one parent node (node.parent), except for the root; likewise,
     * each node has one or more child nodes (node.children), except for the leaves. ...
     * A d3.hierarchy is purely an abstract data structure. That is: it's for working with hierarchical data
     * A d3.hierarchy object is a data structure that represents a hierarchy.
     * It has a number of functions defined on it for retrieving things like ancestor, descendant and leaf nodes and for computing the path between nodes.
     * It can be created from a nested JavaScript object.
     */
    // creating nested data structure of the data objects
    let root = d3.hierarchy({children: data})
        .sum(d => d.amount);



    // Use pack() to automatically calculate radius conveniently only
    // and get only the leaves
    //
    let circles = pack(root).leaves()
        .map(circle => {
        const data = circle.data;
        return {
            x: centerX + (circle.x - centerX) * magnifyStartPosition, // magnify start position to have transition to center movement
            y: centerY + (circle.y - centerY) * magnifyStartPosition,
            r: minRadius, // for tweening
            radius: circle.r, //original radius
            cat: data.orgin,
            objectType: data.objectType,
            amount: data.amount,
        }
    });




    // select all circles
    let circle = wrapper.selectAll('.node')
        .data(circles)
        .enter()
        .append('g')
        .attr('class', d => d.cat + " node")
        // .classed({
        //     'node': true,
        //     'category':function(d){ return d.cat}}) // add class node to object
        // .attr({'class',  d => d.cat}) // add class node to object

    console.log(circle);

    //console.log(circles.filter(function(d) { return d.cat == "Afrika"; }));


    // add the simulation to the circles
    simulation.nodes(circles).on('tick', ticked);


    circle.append('circle')
        .attr('r', minRadius)
        .style('fill', d => scaleColor(d.cat))
        //.style('fill',"transparent")
        .style('stroke', "rgba(0, 0, 0, 0.05)")
        //.style('stroke-width', "1")
        .transition().duration(2000).ease(d3.easeElasticOut)
        .tween('circleIn', (d) => {
            let i = d3.interpolateNumber(0, d.radius);
            return (t) => {
                d.r = i(t);
                simulation.force('collision', forceCollide)
            }
        });

    /**
     * Own code to automatic resize the text within the circle
     */

    // display orgin in circle
    circle
        .append('text')
        .classed('node-orgin', true)
        .attr("font-size", function (d) {
            return Math.min(2 * d.radius, (2 * d.radius / 15)) + "px";
        })
        .text(d => d.objectType);

    //display amount in the circle
    circle
        .append('text')
        .classed('node-amount', true)
        .attr('y', function (d) {
            return Math.min(2 * d.radius, (2 * d.radius / 10));
        })
        .attr("font-size", function (d) {
            return Math.min(2 * d.radius, (2 * d.radius / 12));
        })
        .text(d => d.amount);


    /**
     * Shows legend in visual based on category and set color scale for each category
     */
    let legendOrdinal = d3.legendColor()
        .scale(scaleColor)
        .shape('circle');

    let legend = svg.append('g')
        .classed('legend-color', true)
        .attr('text-anchor', 'start')
        .attr('transform', 'translate(20,30)')
        .style('font-size', '12px')
        .call(legendOrdinal);

    // sets sizeScale
    let sizeScale = d3.scaleOrdinal()
        .domain(['Minder', 'Meer'])
        .range([5, 10]);

    // sets legendSize between circles
    let legendSize = d3.legendSize()
        .scale(sizeScale)
        .shape('circle')
        .shapePadding(10)
        .labelAlign('end');

    // sets legendSize between circles
    let legendSizeScale = svg.append('g')
        .classed('legend-size', true)
        .attr('text-anchor', 'start')
        .attr('transform', 'translate(150, 25)')
        .style('font-size', '12px')
        .call(legendSize);


    // Set the radius of the circle and changes the position
    function ticked() {
            circle
                .attr('transform', d => `translate(${d.x},${d.y})`)
                .select('circle')
                .attr('r', d => d.r)
                .exit()
                .remove()
    }


    let nodes = d3.selectAll('.node')


    /**
     * filter by origin
     */

    function filterByCategoryMultiple(circles,orginsArray){
        //circles.filter(function(d) { return d.cat == category; })
        //resetFilter()
        wrapper.selectAll(".node")
            .filter(function(d) {
                return! orginsArray.includes(d.cat);
            })
           .transition().duration(500).style("opacity",0.1)
           // .remove();

        wrapper.selectAll(".node")
            .filter(function(d) {
                return orginsArray.includes(d.cat);
            })
            .transition().duration(500).style("opacity",1)

        if(orginsArray.length == 0){
            wrapper.selectAll(".node")
                .transition()
                .duration(500)
                .style("opacity",1)

        }


    }

    function filterByCategory(circles,orgin) {
        console.log(orgin);
        let labelsChecked = svg.select(".legendCells").selectAll('.label').filter(".active").nodes().length
        console.log(labelsChecked)
        if (labelsChecked == 0 ) {
            wrapper.selectAll(".node")
                .filter(function (d) {
                    return d.cat !== orgin;
                })
                .transition().duration(500).style("opacity", 0.1)

            wrapper.selectAll(".node")
                .filter(function (d) {
                    return d.cat == orgin;
                })
                .transition().duration(500).style("opacity", 1)
        }
    }




    function resetFilter(){
        let labelsChecked = svg.select(".legendCells").selectAll('.label').filter(".active").nodes().length
        if(labelsChecked == 0) {
            wrapper.selectAll(".node").transition().duration(500).style("opacity", 1);
        }
    }


    /**
     * filter based on legend
     */

    let label = svg.select(".legendCells").selectAll('.label')
    label.on("click",clickedlabel)
    function clickedlabel(){
        // check if the selected element contains active else remove active
        if(d3.select(this).classed('active')){
            d3.select(this).classed('active',false)
        }else{
            d3.select(this).classed('active',true)
        }
        // push selected orgin in array
        let labelSelected = label.filter(".active").nodes()
        let orginsArray = new Array
        for(let orgin of labelSelected){
            orginsArray.push(orgin.textContent)
        }

        //var keysList = array.push(labelSelected)
        console.log(orginsArray)
        filterByCategoryMultiple(circles,orginsArray)
    }





    /**
     * tooltip
     */
    let tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    nodes.on("mouseover", showTooltip)
    nodes.on("mouseout", hideTooltip)
    nodes.on("mousemove",followMouseTooltip)
    function showTooltip(d){
        d3.select(this).selectAll('circle').style('stroke', "rgba(0, 0, 0, 0.90)")
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(`
                      <span class="objectOrgin">
                        <span class="categoryOrgin" style="background-color:${scaleColor(d.cat)};"></span>
                        <span class="categoryTitle"> ${d.cat}</span>
                      </span>
                      <span class="objectType">${d.objectType}</span>
                      <span class="objectAmount">${d.amount}</span>`)

        console.log(scaleColor(d.cat));
        filterByCategory(circles,d.cat)

    }

    function followMouseTooltip(){
        tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
    }

    function hideTooltip(){
        d3.select(this).selectAll('circle').style('stroke', "rgba(0, 0, 0, 0)")
        tooltip.transition().duration(500).style("opacity", 0);
        resetFilter()
    }




    /**
     * Zoom function
     */
    nodes.on("click", clicked)
    svg.on("click",reset)
    function clicked(d) {
        d3.event.stopPropagation();
        wrapper.transition().duration(750).call(
            zoom.transform,
            // zoom on circle based and scale based on radius
            d3.zoomIdentity.translate(width / 2, height / 2).scale(15 / d.radius * 20).translate(-d.x, -d.y),
            d3.mouse(svg.node())
        );
    }

    function zoomed() {
        wrapper.attr("transform", d3.event.transform);
    }

    let zoom = d3.zoom()
        .scaleExtent([1, 40])
        .on("zoom", zoomed);

    // reset the zoom when clicked on background of svg
    function reset() {
        wrapper.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity,
            d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
        );
    }


}

/**
 * Own code to run the application
 */

// load the api data and render the data
loadApiData().then(data =>render(data));
