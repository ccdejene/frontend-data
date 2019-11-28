// Based loosely from this D3 bubble graph https://bl.ocks.org/mbostock/4063269
// And this Forced directed diagram https://bl.ocks.org/mbostock/4062045
// Code edit by Eyob Westerink


// function to render data
export function render(data) {

    // make svg element
    let svg = d3.select('body').append('svg')
        .attr('width', '100%')
        .attr('height', window.innerHeight)
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
        .force('collide', d3.forceCollide().radius(function (d) {
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
                amount: data.amount
            }
        });


    // select all circles
    let circle = wrapper.selectAll('.node')
        .data(circles)
        .enter()
        .append('g')
        .attr('class', d => d.cat + " node")

    // add the simulation to the circles
    simulation.nodes(circles).on('tick', ticked);

    circle.append('circle')
        .attr('r', minRadius)
        .style('fill', d => scaleColor(d.cat))
        .style('stroke', "rgba(0, 0, 0, 0.02)")
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
            return Math.min(2 * d.radius, (2 * d.radius / 20)) + "px";
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

    // Set the radius of the circle and changes the position
    function ticked() {
        circle
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .select('circle')
            .attr('r', d => d.r)
            .exit()
            .remove()
    }

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
        .domain([''])
        .range([0,10]);

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

    let nodes = d3.selectAll('.node')


    /**
     * filter by origin
     */
    //update by category
    function filterByCategoryMultiple(circles, orginsArray) {

        // if category filter doesnt includes category array give  circles opacity
        wrapper.selectAll(".node")
            .filter(function (d) {
                return !orginsArray.includes(d.cat);
            }).classed("disable", true)
            .transition().duration(500).style("opacity", 0.1)

        // if category filter  includes category array give  circles remove opacity
        wrapper.selectAll(".node")
            .filter(function (d) {
                return orginsArray.includes(d.cat);
            }).classed("disable", false)
            .transition().duration(500).style("opacity", 1)

        // if array is empty reset to show all circles
        if (orginsArray.length == 0) {
            wrapper.selectAll(".node")
                .classed("disable", false)
                .transition()
                .duration(500)
                .style("opacity", 1)
        }
    }


    /**
     * Single filter on hover circle
     */
    function filterByCategory(circles, orgin) {
        // select all legends and check amount of labels that contains active class
        let labelsChecked = svg.select(".legendCells").selectAll('.label').filter(".active").nodes().length
        //if there are no items in multiple legend are selected  run this
        if (labelsChecked == 0) {
            // filter the circles who doesnt match the selected  orgin and add style
            wrapper.selectAll(".node")
                .filter(function (d) {
                    return d.cat !== orgin;
                })
                .transition().duration(500).style("opacity", 0.1)
            // filter the circles who  match with the selected orgin and add style
            wrapper.selectAll(".node")
                .filter(function (d) {
                    return d.cat == orgin;
                })
                .transition().duration(500).style("opacity", 1)
        }
    }

    /**
     * reset the filter
     */
    function resetFilter() {
        let labelsChecked = svg.select(".legendCells").selectAll('.label').filter(".active").nodes().length
        if (labelsChecked == 0) {
            wrapper.selectAll(".node").transition().duration(500).style("opacity", 1);
        }
    }


    /**
     * filter based on legend
     */
    let label = svg.select(".legendCells").selectAll('.label')
    label.on("click", clickedlabel)

    function clickedlabel() {
        // check if the selected element contains active else remove active
        if (d3.select(this).classed('active')) {
            d3.select(this).classed('active', false)
        } else {
            d3.select(this).classed('active', true)
        }
        // push selected orgin in array
        let labelSelected = label.filter(".active").nodes()
        let orginsArray = new Array
        for (let orgin of labelSelected) {
            orginsArray.push(orgin.textContent)
        }

        //var keysList = array.push(labelSelected)
        filterByCategoryMultiple(circles, orginsArray)
    }


    /**
     * tooltip
     */
    let tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    nodes.on("mouseover", showTooltip)
    nodes.on("mouseout", hideTooltip)
    nodes.on("mousemove", followMouseTooltip)


    function showTooltip(d) {
        // select the selected circle and add a stroke color
        d3.select(this).selectAll('circle').style('stroke', "rgba(0, 0, 0, 0.4)")
        // give the tooltip a transition
        tooltip.transition().duration(200).style("opacity", .9);
        // add elements inside tooltip
        tooltip.html(`
                      <span class="objectOrgin">
                        <span class="categoryOrgin" style="background-color:${scaleColor(d.cat)};"></span>
                        <span class="categoryTitle"> ${d.cat}</span>
                      </span>
                      <span class="objectType">${d.objectType}</span>
                      <span class="objectAmount">${d.amount}</span>`)

        // call the filterByCategory with the circles data and selected category orgin
        filterByCategory(circles, d.cat)
    }

    function followMouseTooltip() {
        tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
    }

    function hideTooltip() {
        d3.select(this).selectAll('circle').style('stroke', "rgba(0, 0, 0, 0)")
        tooltip.transition().duration(500).style("opacity", 0);
        resetFilter()
    }


    /**
     * Zoom function
     */
    nodes.on("click", clicked)
    svg.on("click", reset)
    function clicked(d) {
        d3.event.stopPropagation();
        wrapper.transition().duration(750).call(
            zoom.transform,
            // zoom on circle based and scale based on radius
            d3.zoomIdentity.translate(width / 2, height / 2).scale(10 / d.radius * 10).translate(-d.x, -d.y),
            d3.mouse(svg.node())
        );


        // set barchart data
        let orgin = d.cat
        let filterData = circles.filter(function (d) {
            return d.cat == orgin;
        });
        let selected = this

        selectionChanged(filterData, selected)

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
        d3.select("#vis-container")
            .classed("showChart", false)
            .transition()
            .duration(800)
            .delay(1500)

        // remove glow effect of all circles
        d3.select('.wrapper').selectAll('circle').classed("glow",false)
    }


    /**
     * bar chart
     *
     */

        /* pattern from
        https://beta.vizhub.com/Razpudding/4a61de4a4034423a98ae79d0135781f7?edit=files&file=index.js
        modified by Eyob Westerink*/
        const svg_bars = d3.select("#vis-container").append('svg')
        const margin = {top: 50, right: 30, bottom: 85, left: 50}
        const bar_height = 320 - margin.top - margin.bottom;
        const bar_width = 460 - margin.left - margin.right
        /* Conventional margins: https://bl.ocks.org/mbostock/3019563. */
        const group = svg_bars
            .attr("height", "320")
            .attr("width", "460")
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        const x = d3.scaleBand().padding(0.2)
        const y = d3.scaleLinear()

    makeVisualization(data)

    function makeVisualization(data) {
        setScales(data)
        setAxes()
        drawBars(data)
    }

    //Draw the initial bars
    function drawBars(data) {
        const bars = group
            .selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.objectType))
            .attr('y', d => y(d.amount))
            .attr('width', x.bandwidth())
            .attr('height', d => bar_height - y(d.amount))
    }


    //This function will change the graph when the user selects another variable
    function selectionChanged(data, selected) {

        // set domain
        y.domain([0, d3.max(data.map(d => d.amount))])
        x.domain(data.map(d => d.objectType))

        //select all bars and remove them
        svg_bars.selectAll(".bar")
            .data(data)
            .exit().remove();

        // set y axis
        svg_bars.select('.axis-y')
            .call(d3.axisLeft(y).ticks(10))

        // set x axis
        svg_bars.select('.axis-x')
            .call(d3.axisBottom(x))

        // set bar height and width
        svg_bars.selectAll('.bar')
            .attr("height", function (d) {
                return bar_height - y(0);
            })
            .attr("y", function (d) {
                return y(0);
            })
            .transition()
            .duration(800)
            .delay(1000)
            .attr('x', d => x(d.objectType))
            .attr('y', d => y(d.amount))
            .attr('width', x.bandwidth())
            .attr('height', d => bar_height - y(d.amount))
            .attr('fill', d => scaleColor(d.cat))



        // remove the label
        svg_bars.selectAll(".bar-label").remove()


        // get data info of selected circle
        let selectedCircle = d3.select(selected).nodes()[0].__data__;

        console.log(selected)

        // remove all animation  circles
        d3.select('.wrapper').selectAll('circle').classed("glow",false)

        //add animation to selected circle glow
        d3.select(selected).selectAll('circle').classed("glow",true)


        // set bar arrow icon to selected bar
        svg_bars.select('g').selectAll('.bar-label')
            .data(data.filter(function (d) {
                return d.index == selectedCircle.index;
            }))
            .enter()
            .append('text')
            .classed('bar-label', true)
            .attr('x', d => x(d.objectType) + x.bandwidth() / 2)
            .attr('dx', 0)
            .attr('y', d => y(d.amount))
            .attr('dy', -6)
            .style("text-anchor", "middle")
            .style('opacity', 0)
            .html('&#9660;')
            .transition()
            .duration(800)
            .delay(1000)
            .style('opacity', 1)

        // show barchart
        d3.select("#vis-container")
            .classed("showChart", true)
            .transition()
            .duration(800)
            .delay(1000)

        // add text to barchart x-axis
        let text = d3.select(".axis-x")
        text.selectAll(".tick").select("text")
            .attr("transform", "rotate(-30)")
            .classed("ytext", true)
            .attr("y", 18)
            .attr("dy", "-.80em")
            .attr("x", "-0.5em")
            .style("text-anchor", "end")


        d3.select('.axis-x')
            .selectAll('.axis-label')
            .text("De "+data.length+" meest voorkomende objecten")

        // setupScales
        setScales(data)

    }

    //Set scales
    function setScales(data) {
        //Set the x domain to the different preferences
        x.domain(data.map(d => d.objectType))
        //The y-domain is set to the min and max of the current y variable
        y.domain([0, d3.max(data.map(d => d.amount))])
        x.rangeRound([0, bar_width]);
        y.rangeRound([bar_height, 0]);
    }

    // add x and y axes to svg
    function setAxes() {
        // add to the group a group which contians a class axis-x and place de bottom axis values
        group
            .append('g')
            .attr('class', 'axis axis-x')
            .call(d3.axisBottom(x)).attr('transform', 'translate(0,' + bar_height + ')')

        // add to the group a class axis-y and place the  y values on the axis
        group
            .append('g')
            .attr('class', 'axis axis-y')
            .call(d3.axisLeft(y).ticks(10))


        // add rotate the x labels in the axis-x
        let text = d3.select(".axis-x")
        text.selectAll(".tick").select("text")
            .attr("transform", "rotate(-30)")
            .classed("ytext", true)
            .attr("y", 18)
            .attr("dy", "-.80em")
            .attr("x", "-0.5em")
            .style("text-anchor", "end")

        // center the x text
        d3.select('.axis-x')
            .append('text')
            .classed("axis-label",true)
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (bar_width/2) +","+(bar_height-(350)-margin.top)+")")  // centre below


        // add label x axis
        // d3.select('.axis-x')
        //     .append('text')
        //     .classed("axis-label",true)
        //     .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        //     .attr("transform", "translate("+ (bar_width/2) +","+(bar_height-(350/3))+")")  // centre below axis
        //     .text("Categorie")




         // add label y axis
        // d3.select('.axis-y')
        //     .append('text')
        //     .classed("axis-label",true)
        //     .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        //     .attr("transform", "translate("+ (-50) +","+(bar_height/2)+")rotate(-90)")  // text is drawn off the screen
        //     // top left, move down and out and rotate
        //     .text("Aantal")

    }

}