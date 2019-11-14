// Based loosely from this D3 bubble graph https://bl.ocks.org/mbostock/4063269
// And this Forced directed diagram https://bl.ocks.org/mbostock/4062045

import {loadApiData} from "./js/modules/fetch";


function render(data) {
// make svg element
    let svg = d3.select('body').append('svg')
        .attr('width', '100%')
        .attr('height',  window.innerHeight)
        .attr('text-anchor', 'middle');

    svg.style('background-color', '#eee'); // set background color

    let width = window.innerWidth; // get width in pixels
    let height = +svg.attr('height'); // set number of height in svg attribute
    let centerX = width * 0.5; // center position of X
    let centerY = height * 0.5; // center position of Y
    let strength = 0.5; // strength of the simulation
    let minRadius = 0;
    let paddingObject = 5;
    let magnifyStartPosition = 3; //multiplier circle start postion

    let scaleColor = d3.scaleOrdinal(d3.schemeSet3); // set colorsheme for the circles

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
    let forceCollide = d3.forceCollide(d => d.radius + paddingObject); // set padding between circles


// use the force and simulate
    /**
     *  Simulation
     *  Creates a new simulation with the specified array of nodes and no forces.
     *  If nodes is not specified, it defaults to the empty array.
     *  The simulator starts automatically; use simulation.on to listen for tick events as the simulation runs.
     */
    let simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody())
        .force('collide', forceCollide)
        // .force('x', d3.forceX(centerX ).strength(strength))
        // .force('y', d3.forceY(centerY ).strength(strength))
        .force('x', d3.forceX(centerX))
        .force('y', d3.forceY(centerY))


    /**
     * Mobile enhancements
     */
// // reduce number of circles on mobile screen due to slow computation
// if ('matchMedia' in window && window.matchMedia('(max-device-width: 767px)').matches) {
//     data = data.filter(el => {
//         return el.value >= 50;
//     });
// }

    /**
     * Hierarchy
     * is a nested data structure representing a tree: each node has one parent node (node.parent), except for the root; likewise,
     * each node has one or more child nodes (node.children), except for the leaves. ...
     * A d3.hierarchy is purely an abstract data structure. That is: it's for working with hierarchical data
     */
    let root = d3.hierarchy({children: data}) // creating nested data structure of the data objects
        .sum(d => d.amount);

// we use pack() to automatically calculate radius conveniently only
// and get only the leaves
    let circles = pack(root).leaves().map(circle => {
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

    simulation.nodes(circles).on('tick', ticked); // add the simulation to the circles


// select all circles
    let circle = svg.selectAll('.node')
        .data(circles)
        .enter().append('g')
        .attr('class', 'node') // add class node to object


    circle.append('circle')
        .attr('r', minRadius)
        .style('fill', d => scaleColor(d.cat))
        .transition().duration(2000).ease(d3.easeElasticOut)
        .tween('circleIn', (d) => {
            let i = d3.interpolateNumber(0, d.radius);
            return (t) => {
                d.r = i(t);
                simulation.force('collide', forceCollide)
            }
        });


    /**
     * Start legend
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

    let sizeScale = d3.scaleOrdinal()
        .domain(['Minder', 'Meer'])
        .range([5, 10]);

    let legendSize = d3.legendSize()
        .scale(sizeScale)
        .shape('circle')
        .shapePadding(10)
        .labelAlign('end');

    let legend2 = svg.append('g')
        .classed('legend-size', true)
        .attr('text-anchor', 'start')
        .attr('transform', 'translate(150, 25)')
        .style('font-size', '12px')
        .call(legendSize);

    /**
     * end legend
     */
    function ticked() {
        circle
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .select('circle')
            //.attr('r', d => d.r);
            .attr('r', function (d) {
                return d.r
            });
    }


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

}

loadApiData().then(data =>render(data));
